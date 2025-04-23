"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDoctorAppointments,
  type DoctorAppointment,
  getDoctorInfo,
  type DoctorInfo,
  getDoctorPatients,
  type DoctorPatient,
} from "@/api/doctors";

export default function DoctorDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);

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

      if (user.role !== "doctor") {
        router.push("/login");
        return;
      }

      if (!user.role_id || typeof user.role_id !== "number") {
        router.push("/login");
        return;
      }

      console.log(`Workspaceing data for Doctor ID: ${user.role_id}`);
      fetchDoctorData(user.role_id, token);
    } catch (error) {
      console.error("Error processing user data:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("jwt_token");
      router.push("/login");
    }
  }, [router]);

  const fetchDoctorData = async (doctorId: number, token: string) => {
    setLoading(true);
    try {
      const [fetchedAppointments, fetchedInfo, fetchedPatients] =
        await Promise.all([
          getDoctorAppointments(doctorId, token),
          getDoctorInfo(doctorId, token),
          getDoctorPatients(doctorId, token),
        ]);

      setAppointments(fetchedAppointments);
      setDoctorInfo(fetchedInfo);
      setPatients(fetchedPatients);
    } catch (error) {
      if (
        (error as Error).message.includes("401") ||
        (error as Error).message.includes("Unauthorized")
      ) {
        router.push("/login");
      } else {
        setAppointments([]);
        setDoctorInfo(null);
        setPatients([]);
      }
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

  const handleUpdateAppointment = (appointment: DoctorAppointment) => {
    console.log("Update button clicked for appointment:", appointment);
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">Verifying doctor access...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-black p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Doctor Information</h2>
          <div className="mt-4">
            <p>
              <strong>Name:</strong>{" "}
              {doctorInfo?.[0] || userData?.name || "Doctor"}
            </p>
            <p>
              <strong>Email:</strong> {doctorInfo?.[1] ?? "N/A"}
            </p>
            <p>
              <strong>Specialization:</strong> {doctorInfo?.[2] ?? "N/A"}
            </p>
            <p>
              <strong>Department:</strong> {doctorInfo?.[3] ?? "N/A"}
            </p>
            <p>
              <strong>License Number:</strong> {doctorInfo?.[4] ?? "N/A"}
            </p>
          </div>
        </div>

        <div className="border-2 border-black p-4 rounded-lg h-[300px] flex flex-col">
          <h2 className="text-xl font-bold mb-4">My Patients</h2>
          <div className="overflow-y-auto flex-grow">
            {patients.length === 0 && !loading ? (
              <div className="text-center py-4">
                <p>No patients found.</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b-2 border-black">
                    <th className="p-2 text-left">Patient</th>
                    <th className="p-2 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient[0]} className="border-b border-black">
                      <td className="p-2">{patient[1] || ""}</td>
                      <td className="p-2">{patient[2] || ""}</td>
                      <td className="p-2 text-center">
                        <button className="border-2 border-black p-1 rounded-lg hover:bg-gray-100 text-sm">
                          History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 border-2 border-black p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upcoming Appointments</h2>
        </div>

        {appointments.length === 0 && !loading ? (
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
                  <th className="p-2 text-left">Duration (min)</th>
                  <th className="p-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr key={index} className="border-b border-black">
                    <td className="p-2">{appointment[0] || "N/A"}</td>
                    <td className="p-2">{appointment[1] || "N/A"}</td>
                    <td className="p-2">{formatDate(appointment[2] || "")}</td>
                    <td className="p-2">{formatTime(appointment[2] || "")}</td>
                    <td className="p-2">{appointment[3] ?? "N/A"}</td>
                    <td className="p-2">{appointment[4] || "N/A"}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleUpdateAppointment(appointment)}
                        className="border-2 border-black p-1 rounded-lg hover:bg-gray-100 text-sm"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
