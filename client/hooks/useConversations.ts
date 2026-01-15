"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { TOKEN_KEY, API_URL } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

export interface Conversation {
  id: string;
  members: any[];
  messages?: {
    id: string;
    content: string;
  }[];
}

interface UseConversationsResult {
  conversations: Conversation[];
  loading: boolean;
  refetch: () => Promise<void>;
}

export const useConversations = (): UseConversationsResult => {
  const { user, isAuthReady } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!isAuthReady || !user) return;

    try {
      setLoading(true);

      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      const res = await axios.get(`${API_URL}/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthReady, user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    refetch: fetchConversations, 
  };
};
