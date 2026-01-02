import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import axios from "axios";
import { API_URL, TOKEN_KEY } from "@/lib/constants";

/*TYPES*/

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  status?: "sent" | "delivered" | "seen";
}

interface MessagesSeenPayload {
  conversationId: string;
}

/*HOOK*/

export const useMessages = (conversationId: string | null) => {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  /* Fetch old messages when conversation changes */
  useEffect(() => {
    if (!conversationId) {
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
  }, [conversationId]);

  /* Realtime incoming messages */
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", messageHandler);

    return () => {
      socket.off("receive_message", messageHandler);
    };
  }, [socket, conversationId]);

  /* Realtime seen updates */
  useEffect(() => {
    if (!socket) return;

    const seenHandler = ({ conversationId: seenConversationId }: MessagesSeenPayload) => {
      if (seenConversationId !== conversationId) return;

      setMessages((prev) =>
        prev.map((m) => ({
          ...m,
          status: "seen",
        }))
      );
    };

    socket.on("messages_seen", seenHandler);

    return () => {
      socket.off("messages_seen", seenHandler);
    };
  }, [socket, conversationId]);

  /* Send message */
  const sendMessage = (content: string) => {
    if (!conversationId || !content.trim()) return;

    socket?.emit("send_message", {
      conversationId,
      content,
    });
  };

  return { messages, sendMessage };
};
