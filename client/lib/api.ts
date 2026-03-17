import axios from "axios";
import { API_URL, TOKEN_KEY } from "./constants";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",

    // prevent caching
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

/* REQUEST INTERCEPTOR */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // disable cache per request
  config.headers["Cache-Control"] = "no-cache";
  config.headers["Pragma"] = "no-cache";

  return config;
});

/* RESPONSE INTERCEPTOR */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error.response?.data);

    // Auto logout if token expired
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }

    return Promise.reject(error);
  }
);

/* GENERIC API FUNCTION */
export const api = async (
  url: string,
  options?: any
) => {
  const res = await apiClient({
    url,
    ...options,
  });

  return res.data;
};