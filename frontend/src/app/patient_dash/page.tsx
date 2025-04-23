"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointment } from "@/api/cancel_appointment";
import {
  getPatientInfo,
  getPatientAppointments,
  type PatientInfo,
  type PatientAppointment,
} from "@/api/patient";

export default function PatientDashboard() {
  const router = useRouter();
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("jwt_token");

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUserData(user);

      if (user.role !== "patient") {
        router.push("/login");
        return;
      }

      if (!user.role_id || typeof user.role_id !== "number") {
        router.push("/login");
        return;
      }
      fetchPatientData(user.role_id, token, true);
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("jwt_token");
      router.push("/login");
    }
  }, [router]);

  const fetchPatientData = async (
    patientId: number,
    token: string,
    initialLoad: boolean = false
  ) => {
    if (initialLoad) setLoading(true);

    try {
      const [infoData, appointmentsData] = await Promise.all([
        getPatientInfo(patientId, token),
        getPatientAppointments(patientId, token),
      ]);
      setPatientInfo(infoData);
      setAppointments(appointmentsData);
    } catch (fetchError) {
      setPatientInfo(null);
      setAppointments([]);
      if ((fetchError as Error).message.includes("401")) {
        router.push("/login");
      }
    } finally {
      if (initialLoad) setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    const token = localStorage.getItem("jwt_token");
    if (!userData || !token) {
      router.push("/login");
      return;
    }

    setCancellingId(appointmentId);

    await cancelAppointment(appointmentId, token);
    await fetchPatientData(userData.role_id, token, false);

    setCancellingId(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return dateString;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">Verifying patient access...</p>
      </div>
    );
  }

  const email = patientInfo?.[0] ?? "N/A";
  const phone = patientInfo?.[1] ?? "N/A";
  const dateOfBirth = patientInfo?.[2] ?? "N/A";
  const bloodType = patientInfo?.[3] ?? "N/A";
  const insuranceId = patientInfo?.[4] ?? "N/A";
  const emergencyContact = patientInfo?.[5] ?? "N/A";
  const emergencyContactPhone = patientInfo?.[6] ?? "N/A";

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 border-2 border-black p-4 rounded-lg">
          <div className="flex items-center">
            <div>
              <h2 className="text-xl font-bold">
                {getGreeting()}, {userData?.name || "Patient"}
              </h2>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Email:</strong> {email}
              </p>
              <p>
                <strong>Phone:</strong> {phone}
              </p>
              <p>
                <strong>Date of Birth:</strong> {dateOfBirth}
              </p>
              <p>
                <strong>Blood Type:</strong> {bloodType}
              </p>
            </div>
            <div>
              <p>
                <strong>Insurance ID:</strong> {insuranceId}
              </p>
              <p>
                <strong>Emergency Contact:</strong> {emergencyContact}
              </p>
              <p>
                <strong>Emergency Contact Phone:</strong>{" "}
                {emergencyContactPhone}
              </p>
            </div>
          </div>
        </div>

        <div className="border-2 border-black p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <div className="flex flex-col gap-2">
            <Link
              href="#"
              className="border-2 border-black p-2 text-center rounded-lg hover:bg-gray-100"
            >
              Billing
            </Link>
            <Link
              href="#"
              className="border-2 border-black p-2 text-center rounded-lg hover:bg-gray-100"
            >
              Medical History
            </Link>
            <Link
              href="#"
              className="border-2 border-black p-2 text-center rounded-lg hover:bg-gray-100"
            >
              Prescriptions
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 border-2 border-black p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Appointments</h2>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-4">
            <p>No appointments scheduled.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="p-2 text-left">Patient</th>
                  <th className="p-2 text-left">Doctor</th>
                  <th className="p-2 text-left">Appointment Date</th>
                  <th className="p-2 text-left">Appointment Time</th>
                  <th className="p-2 text-left">Duration</th>
                  <th className="p-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr key={appointment[5]} className="border-b border-black">
                    <td className="p-2">{appointment[0] || ""}</td>
                    <td className="p-2">{appointment[1] || ""}</td>
                    <td className="p-2">{formatDate(appointment[2] || "")}</td>
                    <td className="p-2">{formatTime(appointment[2] || "")}</td>
                    <td className="p-2">{appointment[3] || ""} min</td>
                    <td className="p-2">{appointment[4] || ""}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleCancelAppointment(appointment[5])}
                        disabled={cancellingId === appointment[5]}
                        className={`border px-3 py-1 rounded-md text-xs font-medium transition duration-150 shadow-sm ${
                          cancellingId === appointment[5]
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
                            : "border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50" // Active style
                        }`}
                      >
                        {cancellingId === appointment[5]
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Link
            href="/schedule_appointment"
            className="border-2 border-black p-2 text-center rounded-lg hover:bg-gray-100"
          >
            Schedule New Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
