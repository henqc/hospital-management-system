import Link from "next/link";

export function Nav() {
  return (
    <div className="h-12 w-full flex flex-row justify-between bg-black items-end p-4">
      <Link href="/" className="text-white">
        Home
      </Link>
      <Link href="/login" className="text-white">
        Login
      </Link>
    </div>
  );
}
