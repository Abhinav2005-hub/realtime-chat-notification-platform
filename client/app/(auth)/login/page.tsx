"use client";

import { useState } from "react";
import { loginUser } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { TOKEN_KEY } from "@/lib/constants";
import { connectSocket } from "@/lib/socket";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    const data = await loginUser(email, password);

    // Save Token
    localStorage.setItem(TOKEN_KEY, data.token);
  
    // CONNECT SOCKET WITH TOKEN
    connectSocket(data.token);
  
    // update auth context
    login(data.user, data.token);
  
    router.push("/chat");
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          className="w-full border p-2 mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2"
        >
          Login
        </button>
      </div>
    </div>
  );
}
