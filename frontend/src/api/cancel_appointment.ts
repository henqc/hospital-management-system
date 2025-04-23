interface CancelResponse {
  message: string;
  appointment_id: number | string;
}

export async function cancelAppointment(
  appointmentId: number | string,
  token: string
): Promise<CancelResponse> {
  if (!appointmentId || !token) {
    throw new Error("Appointment ID and token are required.");
  }

  const apiUrl = `http://127.0.0.1:8000/cancel_appointment/${appointmentId}`;

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CancelResponse = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
