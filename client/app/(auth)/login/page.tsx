"use client";

import { useState } from "react";
import { loginUser } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { TOKEN_KEY } from "@/lib/constants";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, user, logout, loading: authLoading, isAuthReady } = useAuth();

  const searchParams = useSearchParams();
  const router = useRouter();

  const redirect = searchParams.get("redirect") || "/chat";

  const handleLogin = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(email, password);

      localStorage.setItem(TOKEN_KEY, data.token);
      login(data.user, data.token);

      router.replace(redirect);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
      alert(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAndStay = () => {
    logout();
    setError("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Login</h2>

        {!isAuthReady || authLoading ? (
          <p>Loading...</p>
        ) : user ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              You are already logged in as <span className="font-medium">{user.email}</span>.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => router.replace(redirect)}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Go to chat
              </button>
              <button
                onClick={handleLogoutAndStay}
                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <>
        {error && (
          <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
            {error}
          </div>
        )}

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
          disabled={loading}
          onClick={handleLogin}
          className={`w-full py-2 text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
          </>
        )}
      </div>
    </div>
  );
}