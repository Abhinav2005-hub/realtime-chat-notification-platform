import { api } from "./api";
import { AuthResponse } from "@/types/auth";

export const loginUser = async (email: string, password: string) => {
    return api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password})
    }) as Promise<AuthResponse>;
};

export const registerUser = async (
    name: string,
    email: string,
    password: string
) => {
    return api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
    }) as Promise<AuthResponse>;
};