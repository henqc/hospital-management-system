"use client";

export interface BillingInfo {
  bill_id: number;
  patient_id: number;
  appointment_id: number | null;
  record_id: number | null;
  prescription_id: number | null;
  amount: number;
  tax: number;
  date_billed: string;
  payment_status: string;
  payment_method: string | null;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingUpdateData {
  patient_id: number;
  appointment_id: number | null;
  record_id: number | null;
  prescription_id: number | null;
  amount: number;
  tax: number;
  date_billed: string | null;
  payment_status: string | null;
  payment_method: string | null;
  payment_date: string | null;
}

export async function getPatientBillingInfo(patientId: string, token: string): Promise<BillingInfo[]> {
  const res = await fetch(`http://127.0.0.1:8000/patients/get_billing/${patientId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch patient billing info: ${res.status}`);
  }

  return res.json();
}

export async function getBillingDetails(billId: string, token: string): Promise<BillingInfo> {
  const res = await fetch(`http://127.0.0.1:8000/get_billing_details/${billId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch billing details: ${res.status}`);
  }

  return res.json();
}

export async function updateBilling(billId: string, data: BillingUpdateData, token: string): Promise<boolean> {
  const res = await fetch(`http://127.0.0.1:8000/update_billing/${billId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Failed to update billing: ${res.status}`);
  }

  return true;
}

export async function createBilling(data: BillingUpdateData, token: string): Promise<boolean> {
  const res = await fetch(`http://127.0.0.1:8000/create_billing/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Failed to create billing: ${res.status}`);
  }

  return true;
}