import Link from "next/link";

export function Nav() {
  return (
    <header className="bg-white px-6 py-2 flex justify-between items-center w-full">
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 rounded-md transition text-blue-600 hover:bg-blue-100"
      >
        <span className="font-medium">Home</span>
      </Link>

      <Link href="/login">
        <button className="flex items-center gap-2 px-4 py-2 rounded-md transition text-white bg-blue-300 hover:bg-blue-400">
          Log In
        </button>
      </Link>
    </header>
  );
}
