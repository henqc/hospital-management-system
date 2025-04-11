from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import date, datetime, timedelta
from jose import JWTError, jwt
from pytz import timezone
import psycopg2
from psycopg2.extras import RealDictCursor
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

@app.post("/sign_up")
def sign_up(data: user_sign_up_data):
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
        user_id = cur.fetchone()[0]
        
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

    return {
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
    }

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
                a.reason
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
                p.emergency_contact_phone
            FROM patients p
            JOIN users u ON u.user_id = p.user_id
            WHERE p.patient_id = %s;
            """,
            (patient_id,)
        )
        results = cur.fetchone()
    return results