"use client";

import { useState } from "react";
import { registerUser } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    const data = await registerUser(name, email, password);
    login(data.user, data.token);
    router.push("/chat");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Register</h2>

        <input className="w-full border p-2 mb-3" placeholder="Name" onChange={e => setName(e.target.value)} />
        <input className="w-full border p-2 mb-3" placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input className="w-full border p-2 mb-3" placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />

        <button onClick={handleRegister} className="w-full bg-blue-600 text-white py-2">
          Register
        </button>
      </div>
    </div>
  );
}

