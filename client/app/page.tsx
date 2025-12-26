import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Realtime Chat App</h1>

      <div className="flex gap-4">
        <Link 
          href="/register" 
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
           Sign Up
        </Link>

        <Link 
          href="/login"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
           Login
        </Link>
      </div>
    </div>
  );
}