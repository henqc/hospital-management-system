"use client";

export interface PatientInfo {
  email: string;
  phone: string;
  date_of_birth: string;
  blood_type: string;
  insurance_id: string;
  emergency_contact: string;
  emergency_contact_phone: string;
}

export interface Appointment {
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  duration: string;
  reason: string;
}

export async function getPatientInfo(patientId: number, token: string): Promise<PatientInfo> {
  const res = await fetch(`http://127.0.0.1:8000/patients/${patientId}/info`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch patient information");
  }

  return await res.json();
}

export async function getPatientAppointments(patientId: number, token: string): Promise<Appointment[]> {
  const res = await fetch(`http://127.0.0.1:8000/patients/${patientId}/appointments`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch appointments");
  }

  return await res.json();
}

export function getUserFromStorage() {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error("Error parsing user data from localStorage", e);
    return null;
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt_token');
}