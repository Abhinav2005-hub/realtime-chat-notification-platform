import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import axios from "axios";
import { API_URL, TOKEN_KEY } from "@/lib/constants";

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  messageId: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  status?: "sent" | "delivered" | "seen";

  replyTo?: Message | null;
  reactions?: Reaction[];
}

interface MessagesSeenPayload {
  conversationId: string;
}

export const useMessages = (conversationId: string | null) => {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  /* Fetch old messages */
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return;

        const res = await axios.get(`${API_URL}/messages/${conversationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load messages", err);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [conversationId]);

  /* Incoming messages */
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

  /* Seen updates */
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

  /* Reaction updates */
  useEffect(() => {
    if (!socket) return;

    const reactionHandler = ({ messageId, reactions }: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, reactions } : m
        )
      );
    };

    socket.on("reaction_updated", reactionHandler);

    return () => {
      socket.off("reaction_updated", reactionHandler);
    };
  }, [socket]);

  /* Send message */
  const sendMessage = (content: string, replyToId?: string | null) => {
    if (!conversationId || !content.trim()) return;

    socket?.emit("send_message", {
      conversationId,
      content,
      replyToId: replyToId || null,
    });
  };

  /* Add reaction */
  const addReaction = (messageId: string, emoji: string) => {
    socket?.emit("add_reaction", { messageId, emoji });
  };

  return { messages, sendMessage, addReaction };
};
