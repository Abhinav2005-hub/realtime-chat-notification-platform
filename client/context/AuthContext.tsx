"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/auth";
import { TOKEN_KEY } from "@/lib/constants";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext <AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

  // Restore auth state on refresh
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      try {
        setUser({ id: "temp-user" } as User);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const login = (user: User, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};