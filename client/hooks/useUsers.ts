import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, TOKEN_KEY } from "@/lib/constants";

export interface User {
  id: string;
  name: string;
  email: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          setUsers([]);
          return;
        }

        const res = await axios.get(`${API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const usersArray = Array.isArray(res.data)
          ? res.data
          : res.data?.users;

        setUsers(Array.isArray(usersArray) ? usersArray : []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading };
};
