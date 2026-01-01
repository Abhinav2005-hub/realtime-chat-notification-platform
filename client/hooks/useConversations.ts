import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { API_URL, TOKEN_KEY } from "@/lib/constants";

export interface Conversation {
  id: string;
  messages?: {
    id: string;
    content: string;
  }[];
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);

        // user not logged in
        if (!token) {
          if (isMounted) {
            setConversations([]);
            setLoading(false);
          }
          return;
        }

        const data = await api("/api/conversations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (isMounted) {
          setConversations(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        if (isMounted) {
          setConversations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchConversations();

    return () => {
      isMounted = false;
    };
  }, []);

  return { conversations, loading };
};
