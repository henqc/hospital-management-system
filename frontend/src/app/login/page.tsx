"use client";

import { HandleLogin } from "@/api/login";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    try {
      await HandleLogin(email, password);
      router.push("/patient_dash");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md border-2 border-black rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="block font-medium">
              Email
            </label>
            <input
              id="email"
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
              type="password"
              className="w-full p-2 border-2 border-black rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-black text-white rounded-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
