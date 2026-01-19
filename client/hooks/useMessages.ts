"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import axios from "axios";
import { API_URL, TOKEN_KEY } from "@/lib/constants";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  status?: "sent" | "delivered" | "seen";
}

export const useMessages = (conversationId: string | null) => {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch messages from DB
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      try {
        const res = await axios.get(
          `${API_URL}/api/messages/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load messages", err);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Receive realtime messages
  useEffect(() => {
    if (!socket) return;

    const handler = (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handler);

    return () => {
      socket.off("receive_message", handler);
    };
  }, [socket, conversationId]);

  // Send message
  const sendMessage = (content: string) => {
    if (!socket || !conversationId || !content.trim()) return;

    socket.emit("send_message", {
      conversationId,
      content,
    });
  };

  return { messages, sendMessage };
};
