import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import axios from "axios";
import { API_URL, TOKEN_KEY } from "@/lib/constants";

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  status?: "sent" | "delivered" | "seen";
  isDeleted?: boolean;

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

  /* Incoming messages + delete updates */
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const deleteHandler = ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: "Message deleted", isDeleted: true }
            : m
        )
      );
    };

    socket.on("receive_message", messageHandler);
    socket.on("message_deleted", deleteHandler);

    return () => {
      socket.off("receive_message", messageHandler);
      socket.off("message_deleted", deleteHandler);
    };
  }, [socket, conversationId]);

  /* Seen updates */
  useEffect(() => {
    if (!socket) return;

    const seenHandler = ({
      conversationId: seenConversationId,
    }: MessagesSeenPayload) => {
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

    const handler = ({
      messageId,
      userId,
      emoji,
    }: {
      messageId: string;
      userId: string;
      emoji: string;
    }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;

          const existing = m.reactions?.find((r) => r.userId === userId);

          if (existing) {
            return {
              ...m,
              reactions: m.reactions?.map((r) =>
                r.userId === userId ? { ...r, emoji } : r
              ),
            };
          }

          return {
            ...m,
            reactions: [
              ...(m.reactions || []),
              { id: crypto.randomUUID(), userId, emoji },
            ],
          };
        })
      );
    };

    socket.on("message_reacted", handler);

    return () => {
      socket.off("message_reacted", handler);
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

  /* Delete message */
  const deleteMessage = (messageId: string) => {
    socket?.emit("delete_message", { messageId });

    // Instant UI update 
    socket?.emit("delete_message", { messageId });
  };

  /* React message */
  const reactMessage = (messageId: string, emoji: string) => {
    socket?.emit("react_message", { messageId, emoji });
  };

  return { messages, sendMessage, deleteMessage, reactMessage };
};
