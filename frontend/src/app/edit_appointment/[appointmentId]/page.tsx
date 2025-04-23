"use client"

import type React from "react"

import { useEffect, useState, use } from "react"
import { useRouter, useParams } from "next/navigation"
import { getAllDoctors } from "@/api/doctors";
import Link from "next/link"

interface AppointmentData {
  patient_id: number
  doctor_id: number
  duration: number
  date: string
  time: string
  reason: string
}

export default function EditAppointmentPage() {
  const router = useRouter()
  const params = useParams();
  const appointmentId = params.appointmentId as string;

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    patient_id: 0,
    doctor_id: 0,
    duration: 30,
    date: "",
    time: "",
    reason: "",
  })
  const [doctors, setDoctors] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem("jwt_token")
    const storedUser = localStorage.getItem("user")

    if (!token || !storedUser) {
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(storedUser)

      // Fetch appointment details
      fetchAppointmentDetails(appointmentId, token)

      // Fetch available doctors
      fetchDoctors()

      // Set patient ID from user data
      setAppointmentData((prev) => ({
        ...prev,
        patient_id: user.role_id,
      }))
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    }
  }, [appointmentId, router])

  const fetchAppointmentDetails = async (id: string, token: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/get_appointment/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Appointment data:", data)

        // Parse the datetime to separate date and time
        const rawDate = data.appointment_date;
      if (!rawDate) {
        setError("Invalid appointment date format.");
        return;
      }

      const appointmentDate = new Date(rawDate);
      if (isNaN(appointmentDate.getTime())) {
        setError("Failed to parse appointment date.");
        return;
      }

      const formattedDate = appointmentDate.toISOString().split("T")[0];
      const formattedTime = appointmentDate.toTimeString().slice(0, 5);



        setAppointmentData({
          patient_id: data.patient_id,
          doctor_id: data.doctor_id,
          duration: data.duration,
          date: formattedDate,
          time: formattedTime,
          reason: data.reason,
        })
      } else {
        console.error("Failed to fetch appointment details:", await response.text())
        setError("Failed to load appointment details. Please try again later.")
      }
    } catch (error) {
      console.error("Error fetching appointment details:", error)
      setError("An error occurred while loading appointment details.")
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const doctorList = await getAllDoctors();
      setDoctors(doctorList);
    } catch (error) {
      console.error("Failed to fetch doctors", error);
      setError("Unable to load doctors.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAppointmentData({
      ...appointmentData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const token = localStorage.getItem("jwt_token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/reschedule_appointment/${appointmentId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      })

      if (response.ok) {
        alert("Appointment rescheduled successfully!")
        router.push("/patient_dash")
      } else {
        const errorText = await response.text()
        console.error("Failed to reschedule appointment:", errorText)
        setError("Failed to reschedule appointment. Please check your inputs and try again.")
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      setError("An error occurred while rescheduling the appointment.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading appointment details...</p>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reschedule Appointment</h1>
        <Link href="/patient_dash" className="border-2 border-black px-4 py-2 rounded-lg hover:bg-gray-100">
          Back to Dashboard
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="border-2 border-black rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="doctor_id" className="block text-sm font-medium mb-1">
              Doctor
            </label>
            <select
              id="doctor_id"
              name="doctor_id"
              value={appointmentData.doctor_id}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctor_id} value={doctor.doctor_id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={appointmentData.duration}
              onChange={handleInputChange}
              min="15"
              step="15"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={appointmentData.date}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium mb-1">
              Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={appointmentData.time}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="reason" className="block text-sm font-medium mb-1">
              Reason for Visit
            </label>
            <textarea
              id="reason"
              name="reason"
              value={appointmentData.reason}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => router.push("/patient_dash")}
            className="border-2 border-black px-4 py-2 rounded-lg hover:bg-gray-100 mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
