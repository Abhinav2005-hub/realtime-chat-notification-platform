import { api } from "./api";

export const loginUser = async (email: string, password: string) => {
  return api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  return api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
};
