"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  getAllAdminDoctors,
  getAllAdminPatients,
  type AdminDoctor,
  type AdminPatient,
} from "@/api/admin";

export default function AdminDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("jwt_token");

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    let user;
    try {
      user = JSON.parse(storedUser);
      setUserData(user);
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("jwt_token");
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/login");
      return;
    }

    fetchAdminData(token);
  }, [router]);

  const fetchAdminData = async (token: string) => {
    setError(null);
    try {
      const [fetchedDoctors, fetchedPatients] = await Promise.all([
        getAllAdminDoctors(token),
        getAllAdminPatients(token),
      ]);

      setDoctors(fetchedDoctors);
      setPatients(fetchedPatients);
      console.log("Fetched doctors:", fetchedDoctors);
      console.log("Fetched patients:", fetchedPatients);
    } catch (fetchError) {
      const errorMessage = `Failed to load data: ${
        (fetchError as Error).message
      }`;
      setError(errorMessage);
      setDoctors([]);
      setPatients([]);
      if ((fetchError as Error).message.includes("401")) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const handleRegisterDoctorClick = () => {
    router.push("/doctor_register");
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">Verifying admin access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          Error Loading Dashboard
        </h1>
        <p className="text-center mb-4 text-red-600">{error}</p>
        <button
          onClick={() => {
            const token = localStorage.getItem("jwt_token");
            if (token) {
              fetchAdminData(token);
            } else {
              router.push("/login");
            }
          }}
          className="mt-4 px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-lg">Welcome, {userData?.name || "Admin"}!</p>
      <div className="border-2 border-black rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">All Patients</h2>
        {patients.length === 0 ? (
          <p>No patients found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2 text-left">Date of Birth</th>
                  <th className="p-2 text-left">Blood Type</th>
                  <th className="p-2 text-left">Insurance ID</th>
                  <th className="p-2 text-left">Emergency Contact</th>
                  <th className="p-2 text-left">Emergency Contact Phone</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.email} className="border-b border-black">
                    <td className="p-2">{patient.name}</td>
                    <td className="p-2">{patient.email}</td>
                    <td className="p-2">{patient.phone ?? "N/A"}</td>
                    <td className="p-2">{formatDate(patient.date_of_birth)}</td>
                    <td className="p-2">{patient.blood_type ?? "N/A"}</td>
                    <td className="p-2">{patient.insurance_id ?? "N/A"}</td>
                    <td className="p-2">
                      {patient.emergency_contact ?? "N/A"}
                    </td>
                    <td className="p-2">
                      {patient.emergency_contact_phone ?? "N/A"}
                    </td>
                    <td className="p-2 text-center">
                      <Link
                        href={`/admin_billing/${patient.patient_id}`}
                        className="border-2 border-black p-1 px-3 rounded-lg hover:bg-gray-100 text-sm"
                      >
                        Billing
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border-2 border-black rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">All Doctors</h2>
        {doctors.length === 0 ? (
          <p>No doctors found.</p>
        ) : (
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Specialization</th>
                  <th className="p-2 text-left">Department</th>
                  <th className="p-2 text-left">License Number</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.email} className="border-b border-black">
                    <td className="p-2">{doctor.name}</td>
                    <td className="p-2">{doctor.email}</td>
                    <td className="p-2">{doctor.specialization}</td>
                    <td className="p-2">{doctor.department}</td>
                    <td className="p-2">{doctor.license_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleRegisterDoctorClick}
            className="border-2 border-black p-2 px-4 rounded-lg hover:bg-gray-100"
          >
            Register New Doctor
          </button>
        </div>
      </div>
    </div>
  );
}
