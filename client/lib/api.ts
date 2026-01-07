"use client";

import { TOKEN_KEY } from "./constants";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const api = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw error || new Error("API request failed");
  }

  return res.json();
};
