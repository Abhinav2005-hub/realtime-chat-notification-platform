import { useEffect, useState, useCallback } from "react";
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

  // shared fetch logic
  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    // not logged in
    if (!token) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

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
  }, []);

  // initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    refetch: fetchConversations, 
  };
};
