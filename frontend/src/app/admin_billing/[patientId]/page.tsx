"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getPatientBillingInfo, type BillingInfo } from "@/api/billing";
import { getPatientInfo, type PatientInfo } from "@/api/patient";

export default function AdminPatientBillingPage() {
  const router = useRouter();
  const params = useParams();
  const [patientDetails, setPatientDetails] = useState<PatientInfo | null>(
    null
  );
  const [billingInfo, setBillingInfo] = useState<BillingInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUserData, setAdminUserData] = useState<any>(null);
  const [patientIdForDisplay, setPatientIdForDisplay] = useState<string | null>(
    null
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("jwt_token");
    const patientIdParam = params.patientId;

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    if (!patientIdParam) {
      setIsLoading(false);
      return;
    }

    const currentPatientId = Array.isArray(patientIdParam)
      ? patientIdParam[0]
      : patientIdParam;
    setPatientIdForDisplay(currentPatientId);

    try {
      const user = JSON.parse(storedUser);
      setAdminUserData(user);

      if (user.role !== "admin") {
        router.push("/login");
        return;
      }
      fetchPageData(currentPatientId, token);
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("jwt_token");
      router.push("/login");
    }
  }, [params.patientId, router]);

  const fetchPageData = async (patientId: string, token: string) => {
    setIsLoading(true);
    setPatientDetails(null);
    setBillingInfo([]);

    try {
      const [fetchedBillingData, fetchedPatientInfo] = await Promise.all([
        getPatientBillingInfo(patientId, token),
        getPatientInfo(parseInt(patientId), token),
      ]);

      setBillingInfo(fetchedBillingData);
      setPatientDetails(fetchedPatientInfo);
    } catch (fetchError) {
      console.error("AdminBilling: Error fetching page data:", fetchError);
      setBillingInfo([]);
      setPatientDetails(null);
      if ((fetchError as Error).message.includes("401")) {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getPaymentStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs";
      case "pending":
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs";
      case "canceled":
      case "cancelled":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs";
      case "overdue":
        return "bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs";
    }
  };

  const handleEditBill = (billId: number) => {
    router.push(`/admin_billing/${patientIdForDisplay}/edit/${billId}`);
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading Billing Information...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Patient Billing</h1>
        <Link href="/admin_dash" className="text-blue-500 hover:underline">
          Back to Admin Dashboard
        </Link>
      </div>
      <div className="mt-4 border-2 border-black p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Billing Information for Patient ID:{" "}
            {patientDetails?.[7] || patientIdForDisplay}
          </h2>
          <button
            onClick={() => router.push(`/admin_billing/${patientIdForDisplay}/add`)}
            className="border-2 border-black p-2 px-4 rounded-lg hover:bg-gray-100"
          >
            Add Bill
          </button>
        </div>

        {billingInfo.length === 0 ? (
          <div className="text-center py-4">
            <p>No billing information available for this patient.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="p-2 text-left">Bill ID</th>
                  <th className="p-2 text-left">Date Billed</th>
                  <th className="p-2 text-right">Amount</th>
                  <th className="p-2 text-right">Tax</th>
                  <th className="p-2 text-right">Total</th>
                  <th className="p-2 text-center">Status</th>
                  <th className="p-2 text-left">Payment Method</th>
                  <th className="p-2 text-left">Payment Date</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {billingInfo.map((bill) => (
                  <tr key={bill.bill_id} className="border-b border-black">
                    <td className="p-2">{bill.bill_id}</td>
                    <td className="p-2">{formatDate(bill.date_billed)}</td>
                    <td className="p-2 text-right">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="p-2 text-right">
                      {formatCurrency(bill.tax)}
                    </td>
                    <td className="p-2 text-right">
                      {formatCurrency(bill.amount + bill.tax)}
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={getPaymentStatusClass(bill.payment_status)}
                      >
                        {bill.payment_status}
                      </span>
                    </td>
                    <td className="p-2">{bill.payment_method || "-"}</td>
                    <td className="p-2">{formatDate(bill.payment_date)}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleEditBill(bill.bill_id)}
                        className="border-2 border-black p-1 px-3 rounded-lg hover:bg-gray-100 text-sm"
                      >
                        Edit
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