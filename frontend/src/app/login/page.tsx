"use client";

import { HandleLogin } from "@/api/login";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface User {
  user_id: number;
  role: "admin" | "doctor" | "patient" | string;
  role_id: number;
  name: string;
  email: string;
}

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      const user: User = await HandleLogin(email, password);

      if (!user || !user.role) {
        setError("Login failed: Invalid user data received.");
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user");
        return;
      }

      window.dispatchEvent(new Event("storage"));
      if (user.role === "admin") {
        router.push("/admin_dash");
      } else if (user.role === "doctor") {
        router.push("/doctor_dash");
      } else if (user.role === "patient") {
        router.push("/patient_dash");
      } else {
        setError(
          `Login successful, but role '${user.role}' has no assigned dashboard.`
        );
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="bg-white shadow-lg rounded-xl p-8 sm:p-10 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-800 text-center">
            Login to MedixCare
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-base font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center p-2 bg-red-100 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-md text-lg hover:bg-blue-600 transition"
            >
              Sign In
            </button>
          </form>
          <div className="text-center mt-4">
            <p>
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
