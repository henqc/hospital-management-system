"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface MedicalRecord {
  record_id: number
  patient_id: number
  doctor_id: number
  appointment_id: number
  record_date: string
  diagnosis: string
  symptoms: string
  notes: string
  created_at: string
  updated_at: string
}

interface PatientInfo {
  patient_id: number
  name: string
  email: string
  phone?: string
  date_of_birth?: string
  blood_type?: string
  insurance_id?: string
  emergency_contact?: string
  emergency_contact_phone?: string
}

export default function PatientMedicalHistory() {
  const router = useRouter()
  const params = useParams()
  const patientId = params.patientId as string

  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

      fetchPatientData(Number.parseInt(patientId), token)
    } catch (error) {
      console.error("Error processing user data:", error)
      router.push("/login")
    }
  }, [patientId, router])

  const fetchPatientData = async (patientId: number, token: string) => {
    setLoading(true)
    setError(null)

    try {
      // Fetch patient info
      const patientInfoResponse = await fetch(`http://127.0.0.1:8000/patients/${patientId}/info`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Fetch medical records
      const recordsResponse = await fetch(`http://127.0.0.1:8000/patients/get_medical_records/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Get patient name (assuming it's stored separately)
      const patientNameResponse = await fetch(`http://127.0.0.1:8000/patients/${patientId}/info`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!patientInfoResponse.ok) {
        throw new Error(`Failed to fetch patient info: ${patientInfoResponse.status}`)
      }

      if (!recordsResponse.ok) {
        throw new Error(`Failed to fetch medical records: ${recordsResponse.status}`)
      }

      const infoData = await patientInfoResponse.json()
      const recordsData = await recordsResponse.json()

      let patientName = "Patient"
      if (patientNameResponse.ok) {
        const nameData = await patientNameResponse.json()
        patientName = nameData[7] || "Patient"
      }

      // Create patient info object
      const patientInfoObj: PatientInfo = {
        patient_id: patientId,
        name: patientName,
        email: Array.isArray(infoData) && infoData.length > 0 ? infoData[0] : "",
        phone: Array.isArray(infoData) && infoData.length > 1 ? infoData[1] : "",
        date_of_birth: Array.isArray(infoData) && infoData.length > 2 ? infoData[2] : "",
        blood_type: Array.isArray(infoData) && infoData.length > 3 ? infoData[3] : "",
        insurance_id: Array.isArray(infoData) && infoData.length > 4 ? infoData[4] : "",
        emergency_contact: Array.isArray(infoData) && infoData.length > 5 ? infoData[5] : "",
        emergency_contact_phone: Array.isArray(infoData) && infoData.length > 6 ? infoData[6] : "",
      }

      setPatientInfo(patientInfoObj)
      setMedicalRecords(Array.isArray(recordsData) ? recordsData : [])
    } catch (error) {
      console.error("Error fetching patient data:", error)
      setError(error instanceof Error ? error.message : "Failed to load patient data")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (e) {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading patient medical history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Link href="/doctor_dash" className="flex items-center text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
        <div className="border-2 border-red-500 p-4 rounded-lg bg-red-50 text-red-700">
          <h2 className="text-xl font-bold mb-2 flex items-center">
            Error Loading Data
          </h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center mb-4">
        <Link href="/doctor_dash" className="flex items-center text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Patient Medical History</h1>

      {patientInfo && (
        <div className="border-2 border-black p-6 rounded-lg mb-6 bg-white shadow">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold mb-4">
                {patientInfo.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Email:</strong> {patientInfo.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {patientInfo.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong> {patientInfo.date_of_birth || "N/A"}
                  </p>
                  <p>
                    <strong>Blood Type:</strong> {patientInfo.blood_type || "N/A"}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Insurance ID:</strong> {patientInfo.insurance_id || "N/A"}
                  </p>
                  <p>
                    <strong>Emergency Contact:</strong> {patientInfo.emergency_contact || "N/A"}
                  </p>
                  <p>
                    <strong>Emergency Contact Phone:</strong> {patientInfo.emergency_contact_phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-2 border-black p-6 rounded-lg bg-white shadow">
        <h2 className="text-xl font-bold mb-4">
          Medical Records
        </h2>

        {medicalRecords.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No medical records available for this patient.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {medicalRecords.map((record) => (
              <div
                key={record.record_id}
                className="border border-gray-300 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 pb-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-blue-700">{record.diagnosis}</h3>
                  <div className="text-gray-600">
                    <p>Date: {formatDate(record.record_date)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Symptoms:</p>
                    <p className="bg-gray-50 p-3 rounded-md">{record.symptoms || "No symptoms recorded"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Notes:</p>
                    <p className="bg-gray-50 p-3 rounded-md">{record.notes || "No notes recorded"}</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/doctor_prescriptions/${record.record_id}`}
                    className="border-2 border-black px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    View Prescription
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
