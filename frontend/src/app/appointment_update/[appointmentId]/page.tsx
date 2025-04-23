"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

// Combined interface for both medical record and prescription data
interface MedicalRecordData {
  record_id?: number
  patient_id: number
  doctor_id: number
  appointment_id: number
  record_date: string
  diagnosis: string
  symptoms: string
  notes: string
  // Prescription fields
  medication?: string
  dosage?: string
  frequency?: string
  start_date?: string
  end_date?: string
  prescription_notes?: string
  created_at?: string
  updated_at?: string
}

interface AppointmentDetails {
  patient_id: number
  patient_name: string
  doctor_id: number
  doctor_name: string
  appointment_date: string
  duration: number
  reason: string
}

const today = new Date()
const defaultDate = today.toLocaleDateString("en-CA")

export default function AppointmentUpdate() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.appointmentId as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [existingRecordId, setExistingRecordId] = useState<number | null>(null)
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null)

  // Combined form state for both medical record and prescription data
  const [formData, setFormData] = useState<Partial<MedicalRecordData>>({
    diagnosis: "",
    symptoms: "",
    notes: "",
    record_date: defaultDate,
    medication: "",
    dosage: "",
    frequency: "",
    start_date: defaultDate,
    end_date: "",
    prescription_notes: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("jwt_token")
    const storedUser = localStorage.getItem("user")

    if (!token || !storedUser) {
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(storedUser)
      if (user.role !== "doctor") {
        router.push("/login")
        return
      }

      fetchAppointmentDetails(Number.parseInt(appointmentId), token, user.role_id)
    } catch (error) {
      console.error("Error processing user data:", error)
      router.push("/login")
    }
  }, [appointmentId, router])

  const fetchAppointmentDetails = async (appointmentId: number, token: string, doctorId: number) => {
    setLoading(true)
    setError(null)

    try {
      // Fetch appointment details
      const appointmentResponse = await fetch(`http://127.0.0.1:8000/get_appointment/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!appointmentResponse.ok) {
        throw new Error(`Failed to fetch appointment details: ${appointmentResponse.status}`)
      }

      const appointmentData = await appointmentResponse.json()

      // Fetch patient name since it's not included in the appointment data
      const patientResponse = await fetch(`http://127.0.0.1:8000/patients/${appointmentData.patient_id}/info`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      let patientName = "Patient"
      if (patientResponse.ok) {
        const patientData = await patientResponse.json()
        patientName = patientData[7] || "Patient"
      }

      // Create appointment details object
      const details: AppointmentDetails = {
        patient_id: appointmentData.patient_id,
        patient_name: patientName,
        doctor_id: appointmentData.doctor_id,
        doctor_name: appointmentData.doctor_name,
        appointment_date: appointmentData.appointment_date,
        duration: appointmentData.duration,
        reason: appointmentData.reason,
      }

      setAppointmentDetails(details)

      // Update form data with appointment details
      setFormData((prev) => ({
        ...prev,
        patient_id: details.patient_id,
        doctor_id: details.doctor_id,
        appointment_id: appointmentId,
        record_date:
          details.appointment_date && !isNaN(new Date(details.appointment_date).getTime())
            ? new Date(details.appointment_date).toISOString().split("T")[0]
            : defaultDate,
      }))

      // Check if medical record already exists for this appointment
      const recordResponse = await fetch(`http://127.0.0.1:8000/doctors/get_medical_records/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (recordResponse.ok) {
        const recordsData = await recordResponse.json()

        // Check if we have records and handle the array format
        if (recordsData && Array.isArray(recordsData) && recordsData.length > 0) {
          const recordData = recordsData[0] // Get the first record from the array

          setExistingRecordId(recordData.record_id)

          // Pre-populate form with medical record data
          setFormData((prev) => ({
            ...prev,
            record_id: recordData.record_id,
            patient_id: recordData.patient_id,
            doctor_id: recordData.doctor_id,
            appointment_id: appointmentId,
            record_date: recordData.record_date
              ? new Date(recordData.record_date).toISOString().split("T")[0]
              : defaultDate,
            diagnosis: recordData.diagnosis || "",
            symptoms: recordData.symptoms || "",
            notes: recordData.notes || "",
            // If prescription data is included in the medical record
            medication: recordData.medication || "",
            dosage: recordData.dosage || "",
            frequency: recordData.frequency || "",
            start_date: recordData.start_date ? new Date(recordData.start_date).toISOString().split("T")[0] : "",
            end_date: recordData.end_date ? new Date(recordData.end_date).toISOString().split("T")[0] : "",
            prescription_notes: recordData.prescription_notes || "",
          }))

          // If prescription data is not included in the medical record, check for it separately
          if (!recordData.medication) {
            const prescriptionResponse = await fetch(
              `http://127.0.0.1:8000/get_prescriptions/${recordData.record_id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            )

            if (prescriptionResponse.ok) {
              const prescriptionsData = await prescriptionResponse.json()

              // Check if we have prescriptions and handle the array format
              if (prescriptionsData && Array.isArray(prescriptionsData) && prescriptionsData.length > 0) {
                const prescriptionData = prescriptionsData[0] // Get the first prescription from the array

                // Pre-populate prescription fields
                setFormData((prev) => ({
                  ...prev,
                  medication: prescriptionData.medication || "",
                  dosage: prescriptionData.dosage || "",
                  frequency: prescriptionData.frequency || "",
                  start_date: prescriptionData.start_date
                    ? new Date(prescriptionData.start_date).toISOString().split("T")[0]
                    : "",
                  end_date: prescriptionData.end_date
                    ? new Date(prescriptionData.end_date).toISOString().split("T")[0]
                    : "",
                  prescription_notes: prescriptionData.prescription_notes || prescriptionData.notes || "",
                }))
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error instanceof Error ? error.message : "Failed to load appointment data")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    const token = localStorage.getItem("jwt_token")
    if (!token) {
      setError("Authentication token not found. Please log in again.")
      setSubmitting(false)
      return
    }

    try {
      // Validate required fields
      if (!formData.diagnosis || !formData.symptoms) {
        setError("Please fill in all required fields in the medical record section.")
        setSubmitting(false)
        return
      }

      // If prescription fields are partially filled, validate them
      if (formData.medication || formData.dosage || formData.frequency) {
        if (!formData.medication || !formData.dosage || !formData.frequency || !formData.start_date) {
          setError("Please fill in all required fields in the prescription section.")
          setSubmitting(false)
          return
        }
      }

      // Determine if we're adding or updating a medical record
      const url = existingRecordId
        ? `http://127.0.0.1:8000/doctors/update_medical_records/${appointmentId}`
        : `http://127.0.0.1:8000/doctors/add_medical_record/`

      const method = existingRecordId ? "PUT" : "POST"

      // Prepare the combined data
      const submitData = {
        ...formData,
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        appointment_id: Number.parseInt(appointmentId),
      }

      // Submit the combined data
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${existingRecordId ? "update" : "add"} medical record: ${response.status}`)
      }

      setSuccess(`Medical record ${existingRecordId ? "updated" : "added"} successfully! Redirecting...`)

      setTimeout(() => {
        router.push("/doctor_dash")
      }, 1000)
    } catch (error) {
      console.error("Error submitting data:", error)
      setError(error instanceof Error ? error.message : "Failed to submit data")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading appointment data...</p>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center mb-4">
        <Link href="/doctor_dash" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">{existingRecordId ? "Update Medical Record" : "Add Medical Record"}</h1>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

      {appointmentDetails && (
        <div className="mb-6 p-4 border-2 border-black rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Appointment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Patient:</strong> {appointmentDetails.patient_name}
              </p>
              <p>
                <strong>Doctor:</strong> {appointmentDetails.doctor_name}
              </p>
            </div>
            <div>
              <p>
                <strong>Date:</strong>{" "}
                {appointmentDetails.appointment_date && !isNaN(new Date(appointmentDetails.appointment_date).getTime())
                  ? new Date(appointmentDetails.appointment_date).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                <strong>Reason:</strong> {appointmentDetails.reason}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-black p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Medical Record</h2>

          <div className="mb-4">
            <label htmlFor="diagnosis" className="block font-medium mb-1">
              Diagnosis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="symptoms" className="block font-medium mb-1">
              Symptoms <span className="text-red-500">*</span>
            </label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-gray-300 rounded h-24"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block font-medium mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-gray-300 rounded h-24"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="record_date" className="block font-medium mb-1">
              Record Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="record_date"
              name="record_date"
              value={formData.record_date}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-gray-300 rounded"
              required
            />
          </div>
        </div>

        <div className="border-2 border-black p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Prescription (Optional)</h2>

          <div className="mb-4">
            <label htmlFor="medication" className="block font-medium mb-1">
              Medication
            </label>
            <input
              type="text"
              id="medication"
              name="medication"
              value={formData.medication}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-gray-300 rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="dosage" className="block font-medium mb-1">
                Dosage
              </label>
              <input
                type="text"
                id="dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-gray-300 rounded"
              />
            </div>

            <div>
              <label htmlFor="frequency" className="block font-medium mb-1">
                Frequency
              </label>
              <input
                type="text"
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="start_date" className="block font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-gray-300 rounded"
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block font-medium mb-1">
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="prescription_notes" className="block font-medium mb-1">
              Prescription Notes
            </label>
            <textarea
              id="prescription_notes"
              name="prescription_notes"
              value={formData.prescription_notes}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-gray-300 rounded h-24"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link href="/doctor_dash" className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100">
            Cancel
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            disabled={submitting}
          >
            {submitting ? "Saving..." : existingRecordId ? "Update Record" : "Add Record"}
          </button>
        </div>
      </form>
    </div>
  )
}
