# Hospital Management System

A hospital database management system built with PostgreSQL, featuring relational data modeling, role-based access control, and workflows for patient care, medical records, appointments, prescriptions, and billing management.

## Overview

This system manages a hospital database with multiple interconnected entities. The PostgreSQL database handles:

- **User management** (Patients, Doctors, Administrators) with role-based authentication
- **Appointment scheduling** with rescheduling capabilities
- **Medical records** linking diagnoses, symptoms, and treatment notes to appointments
- **Prescription tracking** integrated with medical records and billing
- **Billing system** that can reference appointments, medical records, or prescriptions
- **Patient history tracking** across multiple visits and doctors
- **Doctor availability management** with scheduling constraints

## Tech Stack

- **Backend:** FastAPI (Python) with PostgreSQL
- **Frontend:** Next.js (TypeScript/React)
- **Authentication:** JWT (JSON Web Tokens)
- **Database:** PostgreSQL with relational schema

## Setup

### Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. (Optional) Create and activate a virtual environment:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `backend/` directory with the following:

   ```env
   DB_HOST=bastion.cs.virginia.edu
   DB_PORT=5432
   DB_NAME=group15
   DB_USER=group15
   DB_PASS=your_password_here
   JWT_SECRET=your_secret_key_here
   ```

5. Start the backend server:
   ```bash
   uvicorn server:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Repository Structure

```
HospitalDB/
├── backend/
│   ├── server.py              # FastAPI server with all endpoints and database logic
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/               # API client functions
│   │   │   ├── admin.ts
│   │   │   ├── billing.ts
│   │   │   ├── doctors.ts
│   │   │   ├── login.ts
│   │   │   ├── patient.ts
│   │   │   ├── register.ts
│   │   │   ├── schedule_appointment.ts
│   │   │   └── cancel_appointment.ts
│   │   │
│   │   ├── app/               # Next.js app router pages
│   │   │   ├── admin_dash/           # Admin dashboard
│   │   │   ├── admin_billing/        # Admin billing management
│   │   │   ├── doctor_dash/          # Doctor dashboard
│   │   │   ├── doctor_patient_history/ # Doctor view of patient history
│   │   │   ├── doctor_prescriptions/  # Prescription management
│   │   │   ├── doctor_register/      # Doctor registration (admin only)
│   │   │   ├── patient_dash/          # Patient dashboard
│   │   │   ├── patient_billing/       # Patient billing view
│   │   │   ├── patient_medical_history/ # Patient medical records
│   │   │   ├── schedule_appointment/  # Appointment scheduling
│   │   │   ├── edit_appointment/      # Appointment editing
│   │   │   ├── appointment_update/    # Appointment updates
│   │   │   ├── prescriptions/         # Prescription details
│   │   │   ├── login/                 # Authentication
│   │   │   └── register/              # User registration
│   │   │
│   │   └── components/        # React components
│   │       ├── landing.tsx
│   │       ├── nav.tsx
│   │       ├── logged_nav.tsx
│   │       └── unlogged_nav.tsx
│   │
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## Database Schema

The PostgreSQL database consists of the following core tables:

- **`users`** - Base user authentication and profile information

  - Primary key: `user_id`
  - Columns: `email` (unique), `password`, `name`, `phone`, `role` (patient/doctor/admin), `created_at`, `updated_at`

- **`doctors`** - Doctor professional information

  - Primary key: `doctor_id`
  - Foreign key: `user_id` → `users.user_id`
  - Columns: `specialization`, `department`, `license_number` (unique), `available_from`, `available_to`, `created_at`, `updated_at`

- **`patients`** - Patient-specific medical information

  - Primary key: `patient_id`
  - Foreign key: `user_id` → `users.user_id`
  - Columns: `date_of_birth`, `blood_type`, `insurance_id`, `emergency_contact`, `emergency_contact_phone`, `age` (calculated), `created_at`, `updated_at`

- **`appointments`** - Appointment scheduling and management

  - Primary key: `appointment_id`
  - Foreign keys: `patient_id` → `patients.patient_id`, `doctor_id` → `doctors.doctor_id`
  - Columns: `appointment_date`, `duration` (default: 30 minutes), `status` (scheduled/completed/cancelled/no-show), `reason`, `created_at`, `updated_at`
  - Constraint: Prevents double-booking (unique `doctor_id` + `appointment_date`)

- **`medical_records`** - Patient medical history and diagnoses

  - Primary key: `record_id`
  - Foreign keys: `patient_id` → `patients.patient_id`, `doctor_id` → `doctors.doctor_id`, `appointment_id` → `appointments.appointment_id` (optional)
  - Columns: `record_date`, `diagnosis`, `symptoms`, `notes`, `created_at`, `updated_at`

- **`prescriptions`** - Medication prescriptions linked to medical records

  - Primary key: `prescription_id`
  - Foreign key: `record_id` → `medical_records.record_id`
  - Columns: `medication`, `dosage`, `frequency`, `start_date`, `end_date`, `notes`, `created_at`, `updated_at`
  - Constraint: `end_date` must be >= `start_date`

- **`billing_records`** - Financial transactions and billing
  - Primary key: `bill_id`
  - Foreign keys: `patient_id` → `patients.patient_id`, `appointment_id` (optional), `record_id` (optional), `prescription_id` (optional)
  - Columns: `amount`, `tax`, `total_amount` (calculated), `date_billed`, `payment_status` (pending/paid/overdue/cancelled), `payment_method`, `payment_date`, `created_at`, `updated_at`

## Usage Notes

- To register a new user, navigate to **Login → Register**
- Doctors can only be registered through the admin dashboard
- Appointments can be scheduled, rescheduled, or cancelled by patients
- Doctors can add medical records and prescriptions after appointments
- Billing records can be created for appointments, medical records, or prescriptions
