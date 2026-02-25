import { api } from "./api";

export const loginUser = (email: string, password: string) =>
  api("/auth/login", {
    method: "POST",
    data: { email, password },
  });

export const registerUser = (name: string, email: string, password: string) =>
  api("/auth/register", {
    method: "POST",
    data: { name, email, password },
  });
