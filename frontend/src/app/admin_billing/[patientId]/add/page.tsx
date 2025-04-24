"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createBilling, type BillingUpdateData } from "@/api/billing";
import { getPatientInfo, type PatientInfo } from "@/api/patient";

export default function AddBillingPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [patientDetails, setPatientDetails] = useState<PatientInfo | null>(null);
  const [patientId, setPatientId] = useState<string>("");
  const [formData, setFormData] = useState<BillingUpdateData>({
    patient_id: 0,
    appointment_id: null,
    record_id: null,
    prescription_id: null,
    amount: 0,
    tax: 0,
    date_billed: new Date().toISOString(),
    payment_status: "pending",
    payment_method: null,
    payment_date: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("jwt_token");
    const patientIdParam = params.patientId;

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    if (!patientIdParam) {
      setError("Missing patient ID");
      setIsLoading(false);
      return;
    }

    const currentPatientId = Array.isArray(patientIdParam) ? patientIdParam[0] : patientIdParam;
    setPatientId(currentPatientId);
    
    try {
      const user = JSON.parse(storedUser);
      
      if (user.role !== "admin") {
        router.push("/login");
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        patient_id: parseInt(currentPatientId)
      }));
      
      fetchPatientData(currentPatientId, token);
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("jwt_token");
      router.push("/login");
    }
  }, [params.patientId, router]);

  const fetchPatientData = async (patientId: string, token: string) => {
    setIsLoading(true);
    try {
      const data = await getPatientInfo(parseInt(patientId), token);
      setPatientDetails(data);
    } catch (fetchError) {
      console.error("AddBilling: Error fetching patient data:", fetchError);
      setError(`Failed to load patient data: ${(fetchError as Error).message}`);
      
      if ((fetchError as Error).message.includes("401")) {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value || null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      setError("Authentication token not found");
      setIsSaving(false);
      return;
    }
    
    let updatedFormData = { ...formData };
    
    if (updatedFormData.payment_status === "paid") {
      if (!updatedFormData.payment_date) {
        updatedFormData.payment_date = new Date().toISOString();
      }
    } else {
      updatedFormData.payment_method = null;
      updatedFormData.payment_date = null;
    }
    
    try {
      await createBilling(updatedFormData, token);
      alert("Billing record created successfully");
      
      router.push(`/admin_billing/${patientId}`);
    } catch (createError) {
      console.error("AddBilling: Error creating bill:", createError);
      setError(`Failed to create billing: ${(createError as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading Patient Information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Add Billing</h1>
          <Link 
            href={`/admin_billing/${patientId}`} 
            className="text-blue-500 hover:underline"
          >
            Back to Billing List
          </Link>
        </div>
        <div className="border-2 border-red-500 p-4 rounded-lg bg-red-50 text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Add Billing</h1>
        <Link 
          href={`/admin_billing/${patientId}`} 
          className="text-blue-500 hover:underline"
        >
          Back to Billing List
        </Link>
      </div>
      
      <div className="mt-4 border-2 border-black p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">
          New Billing for Patient: {patientDetails?.[7] || patientId}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="amount" className="block font-medium">Amount</label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="tax" className="block font-medium">Tax</label>
              <input
                id="tax"
                name="tax"
                type="number"
                step="0.01"
                value={formData.tax}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="date_billed" className="block font-medium">Date Billed</label>
              <input
                id="date_billed"
                name="date_billed"
                type="datetime-local"
                value={formData.date_billed ? formData.date_billed.slice(0, 16) : ""}
                onChange={handleDateChange}
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="payment_status" className="block font-medium">Payment Status</label>
              <select
                id="payment_status"
                name="payment_status"
                value={formData.payment_status || ""}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="payment_method" className="block font-medium">Payment Method</label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method || ""}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-black rounded-lg"
                disabled={formData.payment_status !== 'paid'}
              >
                <option value="">Select Method</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Insurance">Insurance</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="payment_date" className="block font-medium">Payment Date</label>
              <input
                id="payment_date"
                name="payment_date"
                type="datetime-local"
                value={formData.payment_date ? formData.payment_date.slice(0, 16) : ""}
                onChange={handleDateChange}
                className="w-full p-2 border-2 border-black rounded-lg"
                disabled={formData.payment_status !== 'paid'}
              />
              <p className="text-sm text-gray-500">
                {formData.payment_status === 'paid' 
                  ? 'Required for paid status' 
                  : 'Only available when status is paid'}
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="appointment_id" className="block font-medium">Appointment ID (Optional)</label>
              <input
                id="appointment_id"
                name="appointment_id"
                type="number"
                value={formData.appointment_id || ""}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-black rounded-lg"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="record_id" className="block font-medium">Medical Record ID (Optional)</label>
              <input
                id="record_id"
                name="record_id"
                type="number"
                value={formData.record_id || ""}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-black rounded-lg"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="prescription_id" className="block font-medium">Prescription ID (Optional)</label>
              <input
                id="prescription_id"
                name="prescription_id"
                type="number"
                value={formData.prescription_id || ""}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-black rounded-lg"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href={`/admin_billing/${patientId}`}
              className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              disabled={isSaving}
            >
              {isSaving ? "Creating..." : "Create Bill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}