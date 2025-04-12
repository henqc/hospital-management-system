export interface Doctor {
  name: string;
  doctor_id: number;
}

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
