"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

export interface Conversation {
  id: string;
  name?: string;
  isGroup: boolean;
  members: any[];
  messages?: any[];
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, refetch: fetchConversations };
};
