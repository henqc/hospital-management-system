"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface BillingInfo {
  bill_id: number;
  patient_id: number;
  appointment_id: number;
  record_id: number;
  prescription_id: number;
  amount: number;
  tax: number;
  date_billed: string;
  payment_status: string;
  payment_method: string;
  payment_date: string;
  created_at: string;
  updated_at: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [patientInfo, setPatientInfo] = useState<any[]>([]);
  const [billingInfo, setBillingInfo] = useState<BillingInfo[]>([]);
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

      const billingResponse = await fetch(
        `http://127.0.0.1:8000/patients/get_billing/${patientId}`,
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

      if (billingResponse.ok) {
        const billingData = await billingResponse.json();
        console.log("Billing data:", billingData);
        setBillingInfo(Array.isArray(billingData) ? billingData : []);
      } else {
        console.error(
          "Failed to fetch billing info:",
          await billingResponse.text()
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getPaymentStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full";
      case "pending":
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full";
      case "canceled":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full";
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
              href="/patient_dash"
              className="border-2 border-black p-2 text-center rounded-lg hover:bg-gray-100"
            >
              Appointments
            </Link>
            <Link
              href="/patient_medical_history"
              className="border-2 border-black p-2 text-center rounded-lg hover:bg-gray-100"
            >
              Medical History
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 border-2 border-black p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Billing Information</h2>
        </div>

        {billingInfo.length === 0 ? (
          <div className="text-center py-4">
            <p>No billing information available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Tax</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Payment Method</th>
                  <th className="p-2 text-left">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {billingInfo.map((bill) => (
                  <tr key={bill.bill_id} className="border-b border-black">
                    <td className="p-2">{formatDate(bill.date_billed)}</td>
                    <td className="p-2">{formatCurrency(bill.amount)}</td>
                    <td className="p-2">{formatCurrency(bill.tax)}</td>
                    <td className="p-2">
                      {formatCurrency(bill.amount + bill.tax)}
                    </td>
                    <td className="p-2">
                      <span
                        className={getPaymentStatusClass(bill.payment_status)}
                      >
                        {bill.payment_status}
                      </span>
                    </td>
                    <td className="p-2">{bill.payment_method || "-"}</td>
                    <td className="p-2">
                      {bill.payment_date ? formatDate(bill.payment_date) : "-"}
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
