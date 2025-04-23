"use client"

import Link from "next/link"
import { useEffect, useState, use } from "react"
import { useRouter, useParams } from "next/navigation"

interface Prescription {
  prescription_id: number
  record_id: number
  medication: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string
  notes: string
  created_at: string
  updated_at: string
}

export default function PrescriptionDetailsPage() {
    const router = useRouter()
    const params = useParams();
    const recordId = params.recordId as string;

  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      console.log("No token found")
      router.push("/login")
      return
    }

    fetchPrescriptionData(recordId, token)
  }, [recordId, router])

  const fetchPrescriptionData = async (recordId: string, token: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/get_prescriptions/${recordId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Prescription data:", data)

        // The API returns an array with one item
        if (Array.isArray(data) && data.length > 0) {
          setPrescription(data[0])
        } else {
          setPrescription(data)
        }
      } else {
        console.error("Failed to fetch prescription:", await response.text())
        setError("Failed to load prescription details. Please try again later.")
      }
    } catch (error) {
      console.error("Error fetching prescription data:", error)
      setError("An error occurred while loading prescription details.")
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
        <p className="text-xl">Loading prescription details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 flex flex-col justify-center items-center min-h-screen">
        <p className="text-xl text-red-600">{error}</p>
        <Link href="/patient_medical_history" className="mt-4 border-2 border-black px-4 py-2 rounded-lg hover:bg-gray-100">
          Back to Medical Records
        </Link>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="p-4 flex flex-col justify-center items-center min-h-screen">
        <p className="text-xl">No prescription found for this record.</p>
        <Link href="/patient_medical_history" className="mt-4 border-2 border-black px-4 py-2 rounded-lg hover:bg-gray-100">
          Back to Medical Records
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prescription Details</h1>
        <Link href="/patient_medical_history" className="border-2 border-black px-4 py-2 rounded-lg hover:bg-gray-100">
          Back to Medical Records
        </Link>
      </div>

      <div className="border-2 border-black rounded-lg p-6">
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-2">{prescription.medication}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Dosage:</strong> {prescription.dosage}
              </p>
              <p>
                <strong>Frequency:</strong> {prescription.frequency}
              </p>
            </div>
            <div>
              <p>
                <strong>Start Date:</strong> {formatDate(prescription.start_date)}
              </p>
              <p>
                <strong>End Date:</strong> {formatDate(prescription.end_date)}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Instructions</h3>
          <p className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">{prescription.notes}</p>
        </div>

        <div className="text-sm text-gray-500">
          <p>Prescribed on: {formatDate(prescription.created_at)}</p>
        </div>
      </div>
    </div>
  )
}
