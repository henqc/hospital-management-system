"use client";

import { HandleDoctorRegistration } from "@/api/register";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DoctorRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("jwt_token");

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    let user;
    try {
      user = JSON.parse(storedUser);
      setUserData(user);
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("jwt_token");
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/login");
      return;
    }
    
    setLoading(false);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const userData = {
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      specialization: (form.elements.namedItem("specialization") as HTMLInputElement).value,
      department: (form.elements.namedItem("department") as HTMLInputElement).value,
      license_number: (form.elements.namedItem("license_number") as HTMLInputElement).value,
      available_from: (form.elements.namedItem("available_from") as HTMLInputElement).value,
      available_to: (form.elements.namedItem("available_to") as HTMLInputElement).value,
    };

    try {
      await HandleDoctorRegistration(userData);
      alert("Doctor registration successful!");
      router.push("/admin_dash");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">Verifying admin access...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl border-2 border-black rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Doctor Registration
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="space-y-2">
              <label htmlFor="specialization" className="block font-medium">
                Specialization
              </label>
              <input
                id="specialization"
                name="specialization"
                type="text"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="department" className="block font-medium">
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="license_number" className="block font-medium">
                License Number
              </label>
              <input
                id="license_number"
                name="license_number"
                type="text"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <h2 className="font-semibold">Availability</h2>
            </div>

            <div className="space-y-2">
              <label htmlFor="available_from" className="block font-medium">
                Available From
              </label>
              <input
                id="available_from"
                name="available_from"
                type="time"
                className="w-full p-2 border-2 border-black rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="available_to" className="block font-medium">
                Available To
              </label>
              <input
                id="available_to"
                name="available_to"
                type="time"
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
              <Link href="/admin_dash" className="text-blue-600 hover:underline">
                Back to Admin Dashboard
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}