export interface ScheduleAppointmentRequest {
  patient_id: number;
  doctor_id: number;
  date: string;
  time: string;
  duration: number;
  status: string;
  reason: string;
}

export async function scheduleAppointment(data: ScheduleAppointmentRequest) {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/patients/schedule_appointment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to schedule appointment");
    }

    return true;
  } catch (error) {
    console.error("Error scheduling appointment:", error);
    throw error;
  }
}
