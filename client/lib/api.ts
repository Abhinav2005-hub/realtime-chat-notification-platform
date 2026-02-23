"use client";

import { TOKEN_KEY } from "./constants";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  export const api = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(TOKEN_KEY)
        : null;
  
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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
  
      // Preserve real backend message
      throw new Error(data?.message || `HTTP ${res.status}`);
    }
  
    return data;
  };