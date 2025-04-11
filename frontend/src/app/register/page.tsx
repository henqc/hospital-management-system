"use client";

import { HandleRegistration } from "@/api/register";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const form = e.currentTarget;
    const userData = {
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      date_of_birth: (form.elements.namedItem("date_of_birth") as HTMLInputElement).value,
      blood_type: (form.elements.namedItem("blood_type") as HTMLInputElement).value,
      insurance_id: (form.elements.namedItem("insurance_id") as HTMLInputElement).value,
      emergency_contact: (form.elements.namedItem("emergency_contact") as HTMLInputElement).value,
      emergency_contact_phone: (form.elements.namedItem("emergency_contact_phone") as HTMLInputElement).value,
    };

    try {
      await HandleRegistration(userData);
      alert("Registration successful!");
      router.push("/login");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl border-2 border-black rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Patient Registration</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Information */}
            <div className="space-y-2">
              <label htmlFor="email" className="block font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="block font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block font-medium">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            {/* Medical Information */}
            <div className="space-y-2">
              <label htmlFor="date_of_birth" className="block font-medium">
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="blood_type" className="block font-medium">
                Blood Type
              </label>
              <select
                id="blood_type"
                name="blood_type"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="insurance_id" className="block font-medium">
                Insurance ID
              </label>
              <input
                id="insurance_id"
                name="insurance_id"
                type="text"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            {/* Emergency Contact Information */}
            <div className="space-y-2 md:col-span-2">
              <h2 className="font-semibold">Emergency Contact</h2>
            </div>

            <div className="space-y-2">
              <label htmlFor="emergency_contact" className="block font-medium">
                Emergency Contact Name
              </label>
              <input
                id="emergency_contact"
                name="emergency_contact"
                type="text"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="emergency_contact_phone" className="block font-medium">
                Emergency Contact Phone
              </label>
              <input
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                type="tel"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-2 bg-black text-white rounded-lg"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
          
          <div className="text-center mt-4">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}