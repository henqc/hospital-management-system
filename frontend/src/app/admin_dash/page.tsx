"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

      if (user.role !== "admin") {
        router.push("/login");
        return;
      }
      setLoading(false);
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("jwt_token");
      router.push("/login");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">Verifying admin access...</p>
      </div>
    );
  }

  const patients = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "(555) 123-4567",
      dob: "05/12/1985",
      bloodType: "O+",
      insuranceId: "INS12345678",
      emergencyContact: "Mary Smith",
      emergencyPhone: "(555) 987-6543",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 234-5678",
      dob: "11/23/1990",
      bloodType: "A-",
      insuranceId: "INS87654321",
      emergencyContact: "Mike Johnson",
      emergencyPhone: "(555) 876-5432",
    },
    {
      id: 3,
      name: "Robert Williams",
      email: "rwilliams@example.com",
      phone: "(555) 345-6789",
      dob: "07/18/1978",
      bloodType: "B+",
      insuranceId: "INS23456789",
      emergencyContact: "Lisa Williams",
      emergencyPhone: "(555) 765-4321",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.d@example.com",
      phone: "(555) 456-7890",
      dob: "02/09/1995",
      bloodType: "AB+",
      insuranceId: "INS34567890",
      emergencyContact: "James Davis",
      emergencyPhone: "(555) 654-3210",
    },
    {
      id: 5,
      name: "Michael Brown",
      email: "mbrown@example.com",
      phone: "(555) 567-8901",
      dob: "09/30/1982",
      bloodType: "O-",
      insuranceId: "INS45678901",
      emergencyContact: "Jennifer Brown",
      emergencyPhone: "(555) 543-2109",
    },
  ];

  // Static doctor data
  const doctors = [
    {
      id: 1,
      name: "Dr. Elizabeth Chen",
      email: "dr.chen@example.com",
      specialization: "Cardiology",
      department: "Heart Center",
      licenseNumber: "MD12345",
    },
    {
      id: 2,
      name: "Dr. James Wilson",
      email: "dr.wilson@example.com",
      specialization: "Neurology",
      department: "Neuroscience",
      licenseNumber: "MD23456",
    },
    {
      id: 3,
      name: "Dr. Maria Rodriguez",
      email: "dr.rodriguez@example.com",
      specialization: "Pediatrics",
      department: "Children's Health",
      licenseNumber: "MD34567",
    },
    {
      id: 4,
      name: "Dr. David Kim",
      email: "dr.kim@example.com",
      specialization: "Orthopedics",
      department: "Musculoskeletal",
      licenseNumber: "MD45678",
    },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="border-2 border-black rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">All Patients</h2>
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
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-black">
                  <td className="p-2">{patient.name}</td>
                  <td className="p-2">{patient.email}</td>
                  <td className="p-2">{patient.phone}</td>
                  <td className="p-2">{patient.dob}</td>
                  <td className="p-2">{patient.bloodType}</td>
                  <td className="p-2">{patient.insuranceId}</td>
                  <td className="p-2">{patient.emergencyContact}</td>
                  <td className="p-2">{patient.emergencyPhone}</td>
                  <td className="p-2">
                    <button className="border-2 border-black p-1 px-3 rounded-lg hover:bg-gray-100">
                      Billing
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="border-2 border-black rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">All Doctors</h2>
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
                <tr key={doctor.id} className="border-b border-black">
                  <td className="p-2">{doctor.name}</td>
                  <td className="p-2">{doctor.email}</td>
                  <td className="p-2">{doctor.specialization}</td>
                  <td className="p-2">{doctor.department}</td>
                  <td className="p-2">{doctor.licenseNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button className="border-2 border-black p-2 px-4 rounded-lg hover:bg-gray-100">
            Register New Doctor
          </button>
        </div>
      </div>
    </div>
  );
}
