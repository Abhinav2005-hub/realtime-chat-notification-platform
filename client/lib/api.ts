"use client";

import { TOKEN_KEY } from "./constants";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const api = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_KEY)
      : null;

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    let data: any = null;

    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      console.error("API ERROR RESPONSE:", data);
      throw new Error(data?.message || "API request failed");
    }

    return data;
  } catch (error: any) {
    console.error("Network/API error:", error);
    throw new Error(
      "Unable to connect to server. Is backend running?"
    );
  }
};