import Link from "next/link";

export function Landing() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div>Home</div>
      <Link href="/login">Login</Link>
    </div>
  );
}
