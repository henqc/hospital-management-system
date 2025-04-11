import Link from "next/link";

export function LoggedNav() {
  return (
    <div className="h-12 w-full flex flex-row justify-between bg-black items-end p-4">
      <Link href="/" className="text-white">
        Home
      </Link>
      <Link href="/login" className="text-white">
        Logout
      </Link>
    </div>
  );
}
