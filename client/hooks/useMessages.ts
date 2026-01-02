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
}

export const useMessages = (conversationId: string | null) => {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch old messages when conversation changes
  useEffect(() => {
    if(!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return;

        const res = await axios.get(
          `${API_URL}/messages/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages", err);
        setMessages([]);
      }
    };

    fetchMessages();
  }), [conversationId];

  // Realtime messages
  useEffect(() => {
    if (!socket) return;

    const handler = (message: Message) => {
      if(message.conversationId == conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handler);

    return () => {
      socket.off("receive_message", handler);
    };
  }, [socket, conversationId])

  const sendMessage = (content: string) => {
    if (!conversationId) return;

    socket?.emit("send_message", {
      conversationId,
      content,
    });
  };

  return { messages, sendMessage };
};
