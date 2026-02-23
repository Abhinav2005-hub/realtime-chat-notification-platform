"use client";

import { useState } from "react";
import { registerUser } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { TOKEN_KEY } from "@/lib/constants";
import { connectSocket } from "@/lib/socket";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    try {
      setError("");

      // Basic frontend validation
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("All fields are required");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setLoading(true);

      const data = await registerUser(name, email, password);

      // Save token
      localStorage.setItem(TOKEN_KEY, data.token);

      // Connect socket
      connectSocket(data.token);

      // Update auth context
      login(data.user, data.token);

      router.push("/chat");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Create Account
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          value={name}
          placeholder="Name"
          className="w-full mb-3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          value={email}
          placeholder="Email"
          className="w-full mb-3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          value={password}
          placeholder="Password"
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
}