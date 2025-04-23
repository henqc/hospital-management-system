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

export async function getPatientBillingInfo(
  patientId: number | string,
  token: string
): Promise<BillingInfo[]> {
  if (!patientId || !token) {
    throw new Error("Patient ID and authentication token are required.");
  }
  const apiUrl = `http://127.0.0.1:8000/patients/get_billing/${patientId}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BillingInfo[] = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
