"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("jwt_token");

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUserData(user);

      if (user.role !== "admin") {
        router.push("/login");
        return;
      }
      setLoading(false);
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("jwt_token");
      router.push("/login");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p className="text-xl">Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-lg">Welcome, {userData?.name || "Admin"}!</p>
      <p className="text-lg text-center">
        Manage your application settings and users here.
      </p>
    </div>
  );
}
