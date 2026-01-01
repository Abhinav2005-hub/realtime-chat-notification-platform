"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { User } from "@/types/auth";
import { TOKEN_KEY } from "@/lib/constants";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Restore auth on refresh (REAL WAY)
  useEffect(() => {
    const restoreAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(data.user);
      } catch (err) {
        // token invalid or expired
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
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
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }
  return ctx;
};
