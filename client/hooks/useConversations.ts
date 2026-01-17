"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export interface Conversation {
  id: string;
  isGroup: boolean;
  members: any[];
  messages?: {
    id: string;
    content: string;
    createdAt: string;
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
    if (!isAuthReady) return;

    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await api("/conversations");

      setConversations(Array.isArray(data) ? data : []);
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

  return { conversations, loading, refetch: fetchConversations };
};
