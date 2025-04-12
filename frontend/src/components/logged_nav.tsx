"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface LoggedNavProps {
  setIsSignedIn: (state: boolean) => void;
}

export function LoggedNav({ setIsSignedIn }: LoggedNavProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("jwt_token");
    setIsSignedIn(false);
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  return (
    <header className="bg-white px-6 py-4 flex justify-between items-center w-full">
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 rounded-md transition text-blue-600 hover:bg-blue-100"
      >
        <span className="font-medium">Home</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/patient_dash"
          className="text-blue-600 mr-4 hover:bg-blue-100 px-4 py-2 rounded-md"
        >
          Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-md transition text-white bg-blue-300 hover:bg-blue-400"
        >
          Log Out
        </button>
      </div>
    </header>
  );
}
