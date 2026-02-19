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
  updatedAt?: string;
  status?: "sent" | "delivered" | "seen";

  isEdited?: boolean;
  isDeleted?: boolean;

  replyTo?: Message | null;
  reactions?: Reaction[];
}

interface ReactionUpdatedPayload {
  messageId: string;
  reactions: Reaction[];
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
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load messages", err);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [conversationId]);

  /* Receive new message */
  useEffect(() => {
    if (!socket) return;

    const handler = (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("receive_message", handler);

    return () => {
      socket.off("receive_message", handler);
    };
  }, [socket, conversationId]);

  /* Seen updates */
  useEffect(() => {
    if (!socket) return;

    const handler = ({ conversationId: seenId }: { conversationId: string }) => {
      if (seenId !== conversationId) return;

      setMessages((prev) =>
        prev.map((m) => ({ ...m, status: "seen" }))
      );
    };

    socket.on("messages_seen", handler);

    return () => {
      socket.off("messages_seen", handler);
    };
  }, [socket, conversationId]);

  /* Reaction updates */
  useEffect(() => {
    if (!socket) return;

    const handler = (payload: ReactionUpdatedPayload) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId
            ? { ...m, reactions: payload.reactions }
            : m
        )
      );
    };

    socket.on("message_reaction_updated", handler);

    return () => {
      socket.off("message_reaction_updated", handler);
    };
  }, [socket]);

  /* Edit updates */
  useEffect(() => {
    if (!socket) return;

    const handler = (payload: {
      messageId: string;
      content: string;
      isEdited: boolean;
      updatedAt?: string;
    }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId
            ? {
                ...m,
                content: payload.content,
                isEdited: payload.isEdited,
                updatedAt: payload.updatedAt,
              }
            : m
        )
      );
    };

    socket.on("message_edited", handler);

    return () => {
      socket.off("message_edited", handler);
    };
  }, [socket]);

  /* Delete updates */
  useEffect(() => {
    if (!socket) return;

    const handler = ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: "Message deleted", isDeleted: true }
            : m
        )
      );
    };

    socket.on("message_deleted", handler);

    return () => {
      socket.off("message_deleted", handler);
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
  };

  /* Edit message (optimistic update) */
  const editMessage = (messageId: string, content: string) => {
    socket?.emit("edit_message", { messageId, content });

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, content, isEdited: true }
          : m
      )
    );
  };

  /* React message */
  const reactMessage = (messageId: string, emoji: string) => {
    socket?.emit("react_message", { messageId, emoji });
  };

  return { messages, sendMessage, deleteMessage, reactMessage, editMessage };
};
