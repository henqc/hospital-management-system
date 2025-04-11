"use client";

interface RegistrationData {
  email: string;
  password: string;
  name: string;
  phone: string;
  date_of_birth: string;
  blood_type: string;
  insurance_id: string;
  emergency_contact: string;
  emergency_contact_phone: string;
}

export async function HandleRegistration(userData: RegistrationData) {
  const res = await fetch("http://127.0.0.1:8000/sign_up", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Registration failed");
  }

  return true;
}