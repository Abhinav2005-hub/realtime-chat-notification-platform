"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

export interface User {
  id: string;
  name: string;
  email: string;
}

export const useUsers = () => {
  const { user, token, isAuthReady } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthReady || !user || !token) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(res.data ?? []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthReady, user, token]);

  return { users, loading };
};
