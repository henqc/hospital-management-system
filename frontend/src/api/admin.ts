export interface AdminDoctor {
  doctor_id: number;
  name: string;
  email: string;
  specialization: string;
  department: string;
  license_number: string;
}

export interface AdminPatient {
  patient_id: number;
  name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  blood_type: string | null;
  insurance_id: string | null;
  emergency_contact: string | null;
  emergency_contact_phone: string | null;
}

export async function getAllAdminDoctors(
  token: string
): Promise<AdminDoctor[]> {
  if (!token) {
    throw new Error("Authentication token is required.");
  }
  const apiUrl = "http://127.0.0.1:8000/admin/get_all_doctors";

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

    const data: AdminDoctor[] = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw error;
  }
}

export async function getAllAdminPatients(
  token: string
): Promise<AdminPatient[]> {
  if (!token) {
    throw new Error("Authentication token is required.");
  }
  const apiUrl = "http://127.0.0.1:8000/admin/get_all_patients";

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

    const data: AdminPatient[] = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw error;
  }
}
