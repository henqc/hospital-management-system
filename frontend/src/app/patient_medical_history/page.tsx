"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

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

export default function MedicalRecords() {
  const router = useRouter()
  const [patientInfo, setPatientInfo] = useState<any[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("jwt_token")

    if (!storedUser || !token) {
      console.log("No user data or token found")
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(storedUser)
      setUserData(user)

      if (user.role !== "patient") {
        console.log("User is not a patient")
        router.push("/login")
        return
      }

      fetchPatientData(user.role_id, token)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    }
  }, [router])

  const fetchPatientData = async (patientId: number, token: string) => {
    console.log("Fetching data for patient ID:", patientId)

    try {
      const infoResponse = await fetch(`http://127.0.0.1:8000/patients/${patientId}/info`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const recordsResponse = await fetch(`http://127.0.0.1:8000/patients/get_medical_records/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (infoResponse.ok) {
        const infoData = await infoResponse.json()
        console.log("Patient info data:", infoData)
        setPatientInfo(Array.isArray(infoData) ? infoData : [])
      } else {
        console.error("Failed to fetch patient info:", await infoResponse.text())
      }

      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json()
        console.log("Medical records data:", recordsData)
        setMedicalRecords(Array.isArray(recordsData) ? recordsData : [])
      } else {
        console.error("Failed to fetch medical records:", await recordsResponse.text())
      }
    } catch (error) {
      console.error("Error fetching patient data:", error)
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading patient data...</p>
      </div>
    )
  }

  const email = patientInfo[0] || ""
  const phone = patientInfo[1] || ""
  const dateOfBirth = patientInfo[2] || ""
  const bloodType = patientInfo[3] || ""
  const insuranceId = patientInfo[4] || ""
  const emergencyContact = patientInfo[5] || ""
  const emergencyContactPhone = patientInfo[6] || ""

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
                <strong>Emergency Contact Phone:</strong> {emergencyContactPhone}
              </p>
            </div>
          </div>
        </div>

        <div className="border-2 border-black p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <div className="flex flex-col gap-2">
            <Link href="/patient_dash" className="border-2 border-black p-2 text-center rounded-lg hover:bg-gray-100">
              Appointments
            </Link>
            <Link
              href="/patient_billing"
              className="border-2 border-black p-2 text-center rounded-lg hover:bg-gray-100"
            >
              Billing
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 border-2 border-black p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Medical Records</h2>
        </div>

        {medicalRecords.length === 0 ? (
          <div className="text-center py-4">
            <p>No medical records available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medicalRecords.map((record) => (
              <div key={record.record_id} className="border border-black rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                  <h3 className="text-lg font-semibold">{record.diagnosis}</h3>
                  <p className="text-sm text-gray-600">Date: {formatDate(record.record_date)}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Symptoms:</p>
                    <p className="text-gray-700">{record.symptoms}</p>
                  </div>
                  <div>
                    <p className="font-medium">Notes:</p>
                    <p className="text-gray-700">{record.notes}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/prescriptions/${record.record_id}`}
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
