"use client";

import type React from "react";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAllDoctors } from "@/api/doctors";
import { scheduleAppointment } from "@/api/schedule_appointment";
import { useEffect } from "react";

interface Doctor {
  name: string;
  doctor_id: number;
}

interface ScheduleAppointmentRequest {
  patient_id: number;
  doctor_id: number;
  date: string;
  time: string;
  duration: number;
  status: string;
  reason: string;
}

export default function AppointmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  useState(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsList = await getAllDoctors();
        setDoctors(doctorsList);
      } catch (error) {
        alert("Failed to load doctors. Please try again.");
      }
    };

    fetchDoctors();
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;

    const userJson = localStorage.getItem("user");
    if (!userJson) {
      alert("User not found. Please login again.");
      router.push("/login");
      return;
    }
    const user = JSON.parse(userJson);
    const patientId = user.role_id;

    const appointmentData: ScheduleAppointmentRequest = {
      patient_id: patientId,
      doctor_id: Number.parseInt(
        (form.elements.namedItem("doctor_id") as HTMLSelectElement).value
      ),
      date: (form.elements.namedItem("date") as HTMLInputElement).value,
      time: (form.elements.namedItem("time") as HTMLInputElement).value,
      duration: Number.parseInt(
        (form.elements.namedItem("duration") as HTMLInputElement).value
      ),
      status: "scheduled",
      reason: (form.elements.namedItem("reason") as HTMLTextAreaElement).value,
    };

    try {
      const response = await scheduleAppointment(appointmentData);
      alert(`Appointment scheduled successfully!`);
      router.push("/patient_dash");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl border-2 border-black rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Schedule Appointment
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="doctor_id" className="block font-medium">
                Doctor
              </label>
              <select
                id="doctor_id"
                name="doctor_id"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.doctor_id} value={doctor.doctor_id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="block font-medium">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="time" className="block font-medium">
                Time
              </label>
              <input
                id="time"
                name="time"
                type="time"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="duration" className="block font-medium">
                Duration (minutes)
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                min="15"
                step="15"
                defaultValue="30"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="reason" className="block font-medium">
                Reason for Visit
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                className="w-full p-2 border-2 border-black rounded-lg"
                placeholder="Please describe the reason for your appointment"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-2 bg-black text-white rounded-lg"
            disabled={loading}
          >
            {loading ? "Scheduling..." : "Schedule Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
}
