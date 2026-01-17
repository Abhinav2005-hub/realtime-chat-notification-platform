"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";

/* TYPES */
export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  status?: "sent" | "delivered" | "seen";
}

/* HOOK */
export const useMessages = (conversationId: string | null) => {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const data = await api(`/api/messages/${conversationId}`);
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load messages", err);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleReceiveMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, conversationId]);

  const sendMessage = (content: string) => {
    if (!socket || !conversationId || !content.trim()) return;

    const tempMessage: Message = {
      id: crypto.randomUUID(),
      content,
      senderId: "me",
      conversationId,
      createdAt: new Date().toISOString(),
      status: "sent",
    };

    setMessages((prev) => [...prev, tempMessage]);

    socket.emit("send_message", {
      conversationId,
      content,
    });
  };

  return {
    messages,
    sendMessage,
  };
};
