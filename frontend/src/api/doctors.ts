export interface Doctor {
  name: string;
  doctor_id: number;
}
export type DoctorAppointment = [string, string, string, number, string, number];
export type DoctorInfo = [string, string, string, string, string];
export type DoctorPatient = [number, string, string];

export async function getAllDoctors(): Promise<Doctor[]> {
  try {
    const response = await fetch("http://127.0.0.1:8000/doctors/get_all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Doctor[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
}

export async function getDoctorAppointments(
  doctorId: number,
  token: string
): Promise<DoctorAppointment[]> {
  if (!doctorId || !token) {
    throw new Error("Doctor ID and token are required.");
  }

  const apiUrl = `http://127.0.0.1:8000/doctors/${doctorId}/appointments`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`Response Status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DoctorAppointment[] = await response.json();

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    throw error;
  }
}

export async function getDoctorInfo(
  doctorId: number,
  token: string
): Promise<DoctorInfo> {
  if (!doctorId || !token) {
    throw new Error("Doctor ID and token are required.");
  }

  const apiUrl = `http://127.0.0.1:8000/doctors/${doctorId}/info`;

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

    const data: DoctorInfo = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getDoctorPatients(
  doctorId: number,
  token: string
): Promise<DoctorPatient[]> {
  if (!doctorId || !token) {
    throw new Error("Doctor ID and token are required.");
  }

  const apiUrl = `http://127.0.0.1:8000/doctors/patients/${doctorId}`;

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

    const data: DoctorPatient[] = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
