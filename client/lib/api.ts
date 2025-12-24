const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const api = async (
  endpoint: string,
  options?: RequestInit
) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  return res.json();
};
