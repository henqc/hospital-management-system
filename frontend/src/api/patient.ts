"use client";

export interface Appointment {
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  duration: string;
  reason: string;
}

export type PatientAppointment = [
  string,
  string,
  string,
  number,
  string,
  number
];
export type PatientInfo = [
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

export function getUserFromStorage() {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error("Error parsing user data from localStorage", e);
    return null;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jwt_token");
}

export async function getPatientInfo(
  patientId: number,
  token: string
): Promise<PatientInfo | null> {
  const res = await fetch(`http://127.0.0.1:8000/patients/${patientId}/info`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    console.error(`Info fetch failed: ${res.statusText}`);
    return null;
  }
  const data = await res.json();
  return Array.isArray(data) && data.length >= 7 ? (data as PatientInfo) : null;
}

export async function getPatientAppointments(
  patientId: number,
  token: string
): Promise<PatientAppointment[]> {
  const res = await fetch(
    `http://127.0.0.1:8000/patients/${patientId}/appointments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) {
    console.error(`Appt fetch failed: ${res.statusText}`);
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? (data as PatientAppointment[]) : [];
}
