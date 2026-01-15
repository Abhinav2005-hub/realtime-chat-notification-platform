import { api } from "./api";

export const loginUser = (email: string, password: string) =>
  api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const registerUser = (name: string, email: string, password: string) =>
  api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
