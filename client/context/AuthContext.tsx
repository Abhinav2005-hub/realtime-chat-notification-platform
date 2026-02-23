"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { TOKEN_KEY } from "@/lib/constants";
import { api } from "@/lib/api";
import { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthReady: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const restoreAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setLoading(false);
        setIsAuthReady(true);
        return;
      }

      try {
        const data = await api("/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        setUser(data.user);
        setToken(storedToken);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
        setIsAuthReady(true);
      }
    };

    restoreAuth();
  }, []);

  const login = (user: User, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    setToken(token);
    setIsAuthReady(true);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
    setIsAuthReady(true);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthReady, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
