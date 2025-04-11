import { Landing } from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Landing />
      </main>
    </div>
  );
}
