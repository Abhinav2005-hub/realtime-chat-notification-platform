import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TOKEN_KEY } from "@/lib/constants";

export interface Conversation {
  id: string;
  messages?: {
    id: string;
    content: string;
  }[];
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      // Not logged in → no conversations
      if (!token) {
        setConversations([]);
        setLoading(false);
        return;
      }

      try {
        const data = await api("/api/conversations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setConversations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return { conversations, loading };
};
