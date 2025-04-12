"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PatientDashboard() {
  const router = useRouter();
  const [patientInfo, setPatientInfo] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("jwt_token");

    if (!storedUser || !token) {
      console.log("No user data or token found");
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUserData(user);

      if (user.role !== "patient") {
        console.log("User is not a patient");
        router.push("/login");
        return;
      }

      fetchPatientData(user.role_id, token);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, [router]);

  const fetchPatientData = async (patientId: number, token: string) => {
    console.log("Fetching data for patient ID:", patientId);

    try {
      const infoResponse = await fetch(
        `http://127.0.0.1:8000/patients/${patientId}/info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const appointmentsResponse = await fetch(
        `http://127.0.0.1:8000/patients/${patientId}/appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (infoResponse.ok) {
        const infoData = await infoResponse.json();
        console.log("Patient info data:", infoData);
        setPatientInfo(Array.isArray(infoData) ? infoData : []);
      } else {
        console.error(
          "Failed to fetch patient info:",
          await infoResponse.text()
        );
      }

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        console.log("Appointments data:", appointmentsData);
        setAppointments(
          Array.isArray(appointmentsData) ? appointmentsData : []
        );
      } else {
        console.error(
          "Failed to fetch appointments:",
          await appointmentsResponse.text()
        );
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
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
        <p className="text-xl">Loading patient data...</p>
      </div>
    );
  }

  const email = patientInfo[0] || "";
  const phone = patientInfo[1] || "";
  const dateOfBirth = patientInfo[2] || "";
  const bloodType = patientInfo[3] || "";
  const insuranceId = patientInfo[4] || "";
  const emergencyContact = patientInfo[5] || "";
  const emergencyContactPhone = patientInfo[6] || "";

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
                  <tr key={index} className="border-b border-black">
                    <td className="p-2">{appointment[0] || ""}</td>
                    <td className="p-2">{appointment[1] || ""}</td>
                    <td className="p-2">{formatDate(appointment[2] || "")}</td>
                    <td className="p-2">{formatTime(appointment[2] || "")}</td>
                    <td className="p-2">{appointment[3] || ""} min</td>
                    <td className="p-2">{appointment[4] || ""}</td>
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
