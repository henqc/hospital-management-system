from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import date, datetime, timedelta, time
from jose import JWTError, jwt
from pytz import timezone
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi.middleware.cors import CORSMiddleware
import os

# To run: uvicorn server:app --reload

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
JWT_SECRET = os.getenv("JWT_SECRET")

# Launch server and connect to postgres server
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conn = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    user=DB_USER,
    password=DB_PASS,
    dbname=DB_NAME
)

# Sign Up Datatype (Needs to match as JSON) @ Frontend people
class user_sign_up_data(BaseModel):
    email: str
    password: str
    name: str
    phone: str
    date_of_birth: date
    blood_type: str
    insurance_id: str
    emergency_contact: str
    emergency_contact_phone: str
    
    
class login_request(BaseModel):
    email: str
    password: str

class appointment_details(BaseModel):
    patient_id: int
    doctor_id: int
    duration: int
    date: date
    time: time
    reason: str
    
class reschedule_details(BaseModel):
    appointment_id: int
    patient_id: int
    doctor_id: int
    duration: int
    date: date
    time: time
    reason: str
    
class billing_details(BaseModel):
    patient_id: int
    appointment_id: int | None = None
    record_id: int | None = None
    prescription_id: int | None = None
    amount: float
    tax: float
    date_billed: str | None = None
    payment_status: str | None = None
    payment_method: str | None = None
    payment_date: str | None = None
    
class medical_details(BaseModel):
    # medical record stuff
    patient_id: int
    doctor_id: int
    appointment_id: int
    record_date: datetime
    diagnosis: str
    symptoms: str
    notes: str
    
    # prescription stuff
    medication: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    prescription_notes: str | None = None

class update_patient(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    
    date_of_birth: str | None = None
    blood_type: str | None = None
    insurance_id: str | None = None
    emergency_contact: str | None = None
    emergency_contact_phone: str | None = None
    
class update_doctor(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    
    specialization: str | None = None
    department: str | None = None
    license_number: str | None = None
    available_from: str | None = None
    available_to: str | None = None
    
# JWT Helper
def generate_JWT(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone('US/Eastern')) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    
# Ensure connection closes on server shutdown
@app.on_event("shutdown")
def shutdown_event():
    print("Closing DB connection.")
    conn.close()

@app.get("/status")
def status():
    return {"Server running."}

@app.get("/db_status")
def db_status():
    with conn.cursor() as cur:
        cur.execute("SELECT 1;")
        result = cur.fetchone()
    return {"status": "connected", "result": result}

# Admin / General Functionality

@app.post("/sign_up")
def sign_up(data: user_sign_up_data):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            
            # Upload into user database first
            cur.execute(
                """
                INSERT INTO users (email, password, name, phone, role)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING user_id;
                """,
                (data.email, data.password, data.name, data.phone, 'patient')
            )
            
            # Extract foreign key for patient table
            # Fix: access by column name instead of index since we're using RealDictCursor
            result = cur.fetchone()
            user_id = result["user_id"]
            
            # Upload into patients database
            cur.execute(
                """
                INSERT INTO patients (
                    user_id, date_of_birth, blood_type, insurance_id,
                    emergency_contact, emergency_contact_phone
                )
                VALUES (%s, %s, %s, %s, %s, %s);
                """,
                (
                    user_id,
                    data.date_of_birth,
                    data.blood_type,
                    data.insurance_id,
                    data.emergency_contact,
                    data.emergency_contact_phone
                )
            )
            
            # Make sure to commit the transaction
            conn.commit()
            
            return {"message": "Registration successful"}
            
    except Exception as e:
        # Roll back the transaction in case of error
        conn.rollback()
        return JSONResponse(
            status_code=500,
            content={"message": f"Registration failed: {str(e)}"}
        )

@app.post("/login")
def login(data: login_request):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT user_id, email, password, role, name
            FROM users
            WHERE email = %s
            """,
            (data.email,)
        )
        user = cur.fetchone()

        if user is None or user["password"] != data.password:
            return JSONResponse(
                status_code=401,
                content={"message": "Invalid email or password."}
            )
        
        role_id = None
        if user["role"] == "patient":
            cur.execute(
                """
                SELECT patient_id FROM patients WHERE user_id = %s
                """, 
                (user["user_id"],)
            )
            row = cur.fetchone()
            role_id = row["patient_id"]
        elif user["role"] == "doctor":
            cur.execute(
                """
                SELECT doctor_id FROM doctors WHERE user_id = %s
                """, 
                (user["user_id"],)
            )
            row = cur.fetchone()
            role_id = row["doctor_id"]
        elif user["role"] == "admin":
            role_id = None

    token = generate_JWT({ "user_id": user["user_id"], "role": user["role"], "role_id": role_id })

    response = JSONResponse(content = {
        "message": "Login successful.",
        "jwt_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "role": user["role"],
            "role_id": role_id,
            "name": user["name"],
            "email": user["email"]
        }
    })

    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800,
        path="/"
    )

    return response

@app.get("/me")
def me(req: Request):
    auth = req.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
         return JSONResponse(
            status_code=401,
            content={"message": "Invalid or missing header."}
        )

    token = auth.split(" ")[1]

    try:
        user_data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        return JSONResponse(
            status_code=401,
            content={"message": "Invalid or expired token."}
        )
    return {
        "user_id": user_data["user_id"],
        "role": user_data["role"],
        "role_id": user_data["role_id"]
    }
    
@app.put("/doctors/update/{doctor_id}")
def update_doctor_info(data: update_doctor, doctor_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        try:
            cur.execute(
                        """
                        SELECT user_id 
                        FROM doctors 
                        WHERE doctor_id = %s
                        """, 
                        (doctor_id,)
                        )
            result = cur.fetchone()
            if not result:
                return JSONResponse(status_code=404, content={"message": "Doctor not found"})
            user_id = result["user_id"]
            time = datetime.now(timezone('US/Eastern'))

            cur.execute(
                """
                UPDATE users
                SET
                    name = COALESCE(%s, name),
                    email = COALESCE(%s, email),
                    phone = COALESCE(%s, phone),
                    updated_at = %s
                WHERE user_id = %s;
                """,
                (
                    data.name, 
                    data.email, 
                    data.phone, 
                    time, 
                    user_id
                )
            )

            cur.execute(
                """
                UPDATE doctors
                SET
                    specialization = COALESCE(%s, specialization),
                    department = COALESCE(%s, department),
                    license_number = COALESCE(%s, license_number),
                    available_from = COALESCE(%s, available_from),
                    available_to = COALESCE(%s, available_to),
                    updated_at = %s
                WHERE doctor_id = %s;
                """,
                (
                    data.specialization, 
                    data.department, 
                    data.license_number,
                    data.available_from, 
                    data.available_to, 
                    time, 
                    doctor_id
                )
            )

            conn.commit()
            return {"message": "Doctor info updated", "doctor_id": doctor_id}
        except Exception as e:
            conn.rollback()
            return JSONResponse(status_code=500, content={"message": f"Update failed: {str(e)}"})    
    
@app.put("/patients/update/{patient_id}")
def update_patient_info(data: update_patient, patient_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        try:
            cur.execute("""
                        SELECT user_id 
                        FROM patients 
                        WHERE patient_id = %s
                        """, 
                        (patient_id,)
                        )
            result = cur.fetchone()
            if not result:
                return JSONResponse(status_code=404, content={"message": "Patient not found"})
            user_id = result["user_id"]
            time = datetime.now(timezone('US/Eastern'))

            cur.execute(
                """
                UPDATE users
                SET
                    name = COALESCE(%s, name),
                    email = COALESCE(%s, email),
                    phone = COALESCE(%s, phone),
                    updated_at = %s
                WHERE user_id = %s;
                """,
                (data.name, data.email, data.phone, time, user_id)
            )

            cur.execute(
                """
                UPDATE patients
                SET
                    date_of_birth = COALESCE(%s, date_of_birth),
                    blood_type = COALESCE(%s, blood_type),
                    insurance_id = COALESCE(%s, insurance_id),
                    emergency_contact = COALESCE(%s, emergency_contact),
                    emergency_contact_phone = COALESCE(%s, emergency_contact_phone),
                    updated_at = %s
                WHERE patient_id = %s;
                """,
                (
                    data.date_of_birth, 
                    data.blood_type, 
                    data.insurance_id,
                    data.emergency_contact, 
                    data.emergency_contact_phone,
                    time, 
                    patient_id
                )
            )

            conn.commit()
            return {"message": "Patient info sucessfully updated.", "patient_id": patient_id}
        except Exception as e:
            conn.rollback()
            return JSONResponse(status_code=500, content={"message": f"Update failed: {str(e)}"})

@app.get("/admin/get_all_doctors")
def get_all_doctors():
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT u.name, u.email, d.specialization, d.department, d.license_number, d.doctor_id
            FROM doctors d 
            JOIN users u ON d.user_id = u.user_id
            """
        )
        results = cur.fetchall()
    return results

@app.get("/admin/get_all_patients")
def get_all_doctors():
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT u.name, u.email, u.phone, p.date_of_birth, p.blood_type, p.insurance_id, p.emergency_contact, p.emergency_contact_phone, p.patient_id
            FROM patients p 
            JOIN users u ON p.user_id = u.user_id
            """
        )
        results = cur.fetchall()
    return results

# takes in same json as scheduling appointment
@app.put("/reschedule_appointment/{appointment_id}")
def reschedule_appointment(data: appointment_details, appointment_id: str):
    appointment_datetime = datetime.combine(data.date, data.time)
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        try:
            cur.execute(
                """
                    UPDATE appointments 
                    SET
                        patient_id = %s,
                        doctor_id = %s,
                        appointment_date = %s,
                        duration = %s,
                        status = %s,
                        reason = %s
                    WHERE appointment_id = %s
                    RETURNING appointment_id
                """,
                (
                    data.patient_id,
                    data.doctor_id,
                    appointment_datetime,
                    data.duration,
                    "scheduled",
                    data.reason,
                    appointment_id
                )
            )
            conn.commit()
            appointment_id = cur.fetchone()["appointment_id"]
            return {"message": "Appointment successfully updated.", "appointment_id": appointment_id}
        except Exception as e:
            # Roll back the transaction in case of error
            conn.rollback()
            return JSONResponse(
                status_code=500,
                content={"message": f"Appointment update failed: {str(e)}"}
            )

@app.delete("/cancel_appointment/{appointment_id}")
def cancel_appointment(appointment_id: str):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        try:
            cur.execute(
                """
                    DELETE FROM appointments 
                    WHERE appointment_id = %s
                    RETURNING appointment_id
                """,
                (appointment_id,)
            )
            conn.commit()
            return {"message": "Appointment successfully cancelled.", "appointment_id": appointment_id}
        except Exception as e:
            # Roll back the transaction in case of error
            conn.rollback()
            return JSONResponse(
                status_code=500,
                content={"message": f"Appointment cancellation failed: {str(e)}"}
            )
         
@app.get("/get_billing/")
def get_all_billing():
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
                SELECT * 
                FROM billing_records b
                ORDER BY b.bill_id ASC
            """
        )
        results = cur.fetchall()
    return results
         
@app.put("/update_billing/{bill_id}")
def update_billing(data: billing_details, bill_id: str):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        try:
            updated_at = datetime.now(timezone('US/Eastern'))
            cur.execute(
                """
                UPDATE billing_records
                SET
                    patient_id = %s,
                    appointment_id = %s,
                    record_id = %s,
                    prescription_id = %s,
                    amount = %s,
                    tax = %s,
                    date_billed = %s,
                    payment_status = %s,
                    payment_method = %s,
                    payment_date = %s,
                    updated_at = %s
                WHERE bill_id = %s
                RETURNING bill_id
                """,
                (
                    data.patient_id,
                    data.appointment_id,
                    data.record_id,
                    data.prescription_id,
                    data.amount,
                    data.tax,
                    data.date_billed,
                    data.payment_status,
                    data.payment_method,
                    data.payment_date,
                    updated_at,
                    bill_id
                )
            )
            conn.commit()
            return {"message": "Bill successfully updated.", "bill_id": bill_id}
        except Exception as e:
            conn.rollback()
            return JSONResponse(
                status_code=500,
                content={"message": f"Bill update failed: {str(e)}"}
            )

@app.get("/get_prescriptions/{record_id}")
def patient_get_medical_records(record_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
                SELECT * 
                FROM prescriptions p
                WHERE record_id = %s
            """,
            (record_id,)
        )
        results = cur.fetchall()
    return results

@app.get("/get_appointment/{appointment_id}")
def get_appointment(appointment_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT 
                a.appointment_id,
                a.patient_id,
                a.doctor_id,
                u2.name AS doctor_name,
                a.appointment_date,
                a.duration,
                a.reason
            FROM appointments a
            JOIN doctors d ON d.doctor_id = a.doctor_id
            JOIN users u2 ON u2.user_id = d.user_id
            WHERE a.appointment_id = %s;
            """,
            (appointment_id,)
        )
        result = cur.fetchone()

        if result is None:
            return JSONResponse(status_code=404, content={"message": "Appointment not found"})
        
        return result


@app.get("/get_appointment/{appointment_id}")
def get_appointment(appointment_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT 
                a.appointment_id,
                a.patient_id,
                a.doctor_id,
                u2.name AS doctor_name,
                a.appointment_date,
                a.duration,
                a.reason
            FROM appointments a
            JOIN doctors d ON d.doctor_id = a.doctor_id
            JOIN users u2 ON u2.user_id = d.user_id
            WHERE a.appointment_id = %s;
            """,
            (appointment_id,)
        )
        result = cur.fetchone()

        if result is None:
            return JSONResponse(status_code=404, content={"message": "Appointment not found"})
        
        return result


# Patient Functionality
@app.get("/patients/{patient_id}/info")
def get_patient_info(patient_id: int):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                u.email,
                u.phone,
                p.date_of_birth,
                p.blood_type,
                p.insurance_id,
                p.emergency_contact,
                p.emergency_contact_phone,
                u.name
            FROM patients p
            JOIN users u ON u.user_id = p.user_id
            WHERE p.patient_id = %s;
            """,
            (patient_id,)
        )
        results = cur.fetchone()
    return results

@app.get("/patients/{patient_id}/appointments")
def get_patient_appointments(patient_id: int):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT 
                u.name AS patient_name,
                u2.name AS doctor_name,
                a.appointment_date,
                a.duration,
                a.reason,
                a.appointment_id AS appointment_id
            FROM appointments a
            JOIN patients p ON p.patient_id = a.patient_id
            JOIN users u ON u.user_id = p.user_id
            JOIN doctors d ON d.doctor_id = a.doctor_id
            JOIN users u2 ON u2.user_id = d.user_id
            WHERE a.patient_id = %s
            ORDER BY a.appointment_date ASC;
            """,
            (patient_id,)
        )
        results = cur.fetchall()
    return results

@app.post("/patients/schedule_appointment/")
def schedule_appointment(data: appointment_details):
    appointment_datetime = datetime.combine(data.date, data.time)
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        try:
            cur.execute(
                """
                    INSERT INTO appointments (
                        patient_id,
                        doctor_id,
                        appointment_date,
                        duration,
                        status,
                        reason
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING appointment_id
                """,
                (
                    data.patient_id,
                    data.doctor_id,
                    appointment_datetime,
                    data.duration,
                    "scheduled",
                    data.reason
                )
            )
            conn.commit()
            appointment_id = cur.fetchone()["appointment_id"]
            return {"message": "Appointment successfully scheduled.", "appointment_id": appointment_id}
        except Exception as e:
            # Roll back the transaction in case of error
            conn.rollback()
            return JSONResponse(
                status_code=500,
                content={"message": f"Appointment scheduling failed: {str(e)}"}
            )
    
@app.get("/patients/get_billing/{patient_id}")
def patient_get_all_billing(patient_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
                SELECT * 
                FROM billing_records b
                WHERE patient_id = %s
                ORDER BY b.bill_id ASC
            """,
            (patient_id,)
        )
        results = cur.fetchall()
    return results

@app.get("/patients/get_medical_records/{patient_id}")
def patient_get_medical_records(patient_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
                SELECT * 
                FROM medical_records m
                WHERE patient_id = %s
                ORDER BY m.record_id ASC
            """,
            (patient_id,)
        )
        results = cur.fetchall()
    return results

# Doctor Functionality

@app.get("/doctors/{doctor_id}/info")
def get_doctor_info(doctor_id: int):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                u.name,
                u.email,
                d.specialization,
                d.department,
                d.license_number
            FROM doctors d
            JOIN users u ON u.user_id = d.user_id
            WHERE d.doctor_id = %s;
            """,
            (doctor_id,)
        )
        results = cur.fetchone()
    return results

@app.get("/doctors/get_all")
def get_all_doctors():
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT u.name, d.doctor_id
            FROM doctors d 
            JOIN users u ON d.user_id = u.user_id
            """
        )
        results = cur.fetchall()
    return results

# takes in doctor id and returns all doctor appointments
@app.get("/doctors/{doctor_id}/appointments")
def get_doctor_appointments(doctor_id: int):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT 
                u.name AS patient_name,
                u2.name AS doctor_name,
                a.appointment_date,
                a.duration,
                a.reason,
                a.appointment_id
            FROM appointments a
            JOIN patients p ON p.patient_id = a.patient_id
            JOIN users u ON u.user_id = p.user_id
            JOIN doctors d ON d.doctor_id = a.doctor_id
            JOIN users u2 ON u2.user_id = d.user_id
            WHERE a.doctor_id = %s
            ORDER BY a.appointment_date ASC;
            """,
            (doctor_id,)
        )
        results = cur.fetchall()
    return results

@app.get("/doctors/patients/{doctor_id}")
def get_doctor_appointments(doctor_id: int):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT DISTINCT
                p.patient_id,
                u.name AS patient_name,
                u.email AS patient_email
            FROM appointments a
            JOIN patients p ON p.patient_id = a.patient_id
            JOIN users u ON u.user_id = p.user_id
            WHERE a.doctor_id = %s
            ORDER BY p.patient_id ASC;
            """,
            (doctor_id,)
        )
        results = cur.fetchall()
    return results

@app.get("/doctors/get_medical_records/{doctor_id}")
def patient_get_medical_records(doctor_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
                SELECT * 
                FROM medical_records m
                WHERE doctor_id = %s
                ORDER BY m.record_id ASC
            """,
            (doctor_id,)
        )
        results = cur.fetchall()
    return results

@app.post("/doctors/add_medical_record/")
def add_medical_record(data: medical_details):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        try:
            time = datetime.now(timezone('US/Eastern'))

            # Insert into medical_records
            cur.execute(
                """
                INSERT INTO medical_records (
                    patient_id, 
                    doctor_id, 
                    appointment_id, 
                    record_date,
                    diagnosis, 
                    symptoms, 
                    notes, 
                    created_at, 
                    updated_at
                ) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING record_id;
                """,
                (
                    data.patient_id, 
                    data.doctor_id, 
                    data.appointment_id,
                    data.record_date, 
                    data.diagnosis, 
                    data.symptoms,
                    data.notes, 
                    time, 
                    time
                )
            )
            record_id = cur.fetchone()["record_id"]

            # Insert into prescriptions if all prescription fields are present
            if data.medication and data.dosage and data.frequency and data.start_date and data.end_date:
                cur.execute(
                    """
                    INSERT INTO prescriptions (
                        record_id, 
                        medication, 
                        dosage, 
                        frequency,
                        start_date,
                        end_date, 
                        notes, 
                        created_at, 
                        updated_at
                    ) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                    """,
                    (
                        record_id, 
                        data.medication, 
                        data.dosage, 
                        data.frequency,
                        data.start_date, 
                        data.end_date, 
                        data.prescription_notes,
                        time, 
                        time
                    )
                )
            conn.commit()
            return {"message": "Medical record/Prescription successfully added.", "record_id": record_id}
        except Exception as e:
            conn.rollback()
            return JSONResponse(status_code=500, content={"message": f"Medical record/Prescription insertion failed: {str(e)}"})

@app.put("/doctors/update_medical_records/{appointment_id}")
def update_medical_records(data:medical_details, appointment_id: int):
    with conn.cursor() as cur:
        try:
            cur.execute(
                        """
                        SELECT record_id 
                        FROM medical_records 
                        WHERE appointment_id = %s
                        """, 
                        (appointment_id,)
                        )
            result = cur.fetchone()
            if not result:
                return JSONResponse(status_code=404, content={"message": "No medical record found for this appointment."})

            record_id = result[0]
            time = datetime.now(timezone('US/Eastern'))

            cur.execute(
                """
                UPDATE medical_records
                SET 
                    patient_id = %s,
                    doctor_id = %s,
                    appointment_id = %s,
                    record_date = %s,
                    diagnosis = %s,
                    symptoms = %s,
                    notes = %s,
                    updated_at = %s
                WHERE record_id = %s;
                """,
                (
                    data.patient_id, 
                    data.doctor_id, 
                    data.appointment_id,
                    data.record_date,
                    data.diagnosis, 
                    data.symptoms,
                    data.notes, 
                    time, 
                    record_id
                )
            )

            if data.medication and data.dosage and data.frequency and data.start_date and data.end_date:
                cur.execute("SELECT prescription_id FROM prescriptions WHERE record_id = %s", (record_id,))
                exists = cur.fetchone()

                if exists:
                    cur.execute(
                        """
                        UPDATE prescriptions
                        SET 
                            medication = %s, 
                            dosage = %s, 
                            frequency = %s,
                            start_date = %s, 
                            end_date = %s, 
                            notes = %s,
                            updated_at = %s
                        WHERE record_id = %s;
                        """,
                        (
                            data.medication, 
                            data.dosage, 
                            data.frequency,
                            data.start_date, 
                            data.end_date, 
                            data.prescription_notes,
                            time, 
                            record_id
                        )
                    )
                else:
                    cur.execute(
                        """
                        INSERT INTO prescriptions (
                            record_id, 
                            medication, 
                            dosage, 
                            frequency,
                            start_date, 
                            end_date, 
                            notes, 
                            created_at, 
                            updated_at
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                        """,
                        (
                            record_id, 
                            data.medication, 
                            data.dosage,
                            data.frequency, 
                            data.start_date, 
                            data.end_date,
                            data.prescription_notes, 
                            time, 
                            time
                        )
                    )

            conn.commit()
            return {"message": "Medical record and prescription updated successfully.", "appointment_id": appointment_id}

        except Exception as e:
            conn.rollback()
            return JSONResponse(status_code=500, content={"message": f"Update failed: {str(e)}"})
        
@app.get("/doctors/get_prescriptions/{appointment_id}")
def get_prescriptions_by_appointment(appointment_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT p.*
            FROM prescriptions p
            JOIN medical_records m ON p.record_id = m.record_id
            WHERE m.appointment_id = %s
            """,
            (appointment_id,)
        )
        results = cur.fetchall()

    if not results:
        return JSONResponse(
            status_code=404,
            content={"message": "No prescriptions from this appointment."}
        )

    return results

@app.get("/doctors/get_medical_history/{appointment_id}")
def get_prescriptions_by_appointment(appointment_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT m.*
            FROM medical_records m
            WHERE m.appointment_id = %s
            """,
            (appointment_id,)
        )
        results = cur.fetchall()

    if not results:
        return JSONResponse(
            status_code=404,
            content={"message": "No medical records from this appointment."}
        )

    return results