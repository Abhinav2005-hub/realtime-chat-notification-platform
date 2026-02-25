import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";
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
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  /* PAGINATION FETCH */

  const fetchMessages = async (isInitial = false) => {
    if (!conversationId || loading || (!hasMore && !isInitial)) return;
  
    try {
      setLoading(true);
  
      const res = await api(`/messages/${conversationId}`, {
        params: {
          cursor: isInitial ? null : cursor,
          limit: 20,
        },
      });
  
      const newMessages: Message[] = res.messages;
  
      if (isInitial) {
        setMessages(newMessages);
      } else {
        setMessages((prev) => [...newMessages, ...prev]);
      }
  
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
    } catch (err) {
      console.error("Pagination error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* Reset on conversation change */
  useEffect(() => {
    if (!conversationId) return;
  
    setMessages([]);
    setCursor(null);
    setHasMore(true);
  
    fetchMessages(true);
  }, [conversationId]);

  /* REALTIME NEW MESSAGE */

  useEffect(() => {
    if (!socket || !conversationId) return;
  
    const handleReceiveMessage = (message: Message) => {
      if (message.conversationId !== conversationId) return;
  
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    };
  
    socket.off("receive_message", handleReceiveMessage);
    socket.on("receive_message", handleReceiveMessage);
  
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, conversationId]);

  /* SEEN UPDATES */

  useEffect(() => {
    if (!socket || !conversationId) return;
  
    const handleMessagesSeen = ({
      conversationId: seenId,
    }: {
      conversationId: string;
    }) => {
      if (seenId !== conversationId) return;
  
      setMessages((prev) =>
        prev.map((m) => ({ ...m, status: "seen" }))
      );
    };
  
    socket.off("messages_seen", handleMessagesSeen);
    socket.on("messages_seen", handleMessagesSeen);
  
    return () => {
      socket.off("messages_seen", handleMessagesSeen);
    };
  }, [socket, conversationId]);

  /* REACTION UPDATES */

  useEffect(() => {
    if (!socket) return;
  
    const handleReactionUpdate = (payload: ReactionUpdatedPayload) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId
            ? { ...m, reactions: payload.reactions }
            : m
        )
      );
    };
  
    socket.off("message_reaction_updated", handleReactionUpdate);
    socket.on("message_reaction_updated", handleReactionUpdate);
  
    return () => {
      socket.off("message_reaction_updated", handleReactionUpdate);
    };
  }, [socket]);

  /* EDIT UPDATES */

  useEffect(() => {
    if (!socket) return;
  
    const handleEdit = (payload: {
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
  
    socket.off("message_edited", handleEdit);
    socket.on("message_edited", handleEdit);
  
    return () => {
      socket.off("message_edited", handleEdit);
    };
  }, [socket]);

  /* DELETE UPDATES */

  useEffect(() => {
    if (!socket) return;
  
    const handleDelete = ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: "Message deleted", isDeleted: true }
            : m
        )
      );
    };
  
    socket.off("message_deleted", handleDelete);
    socket.on("message_deleted", handleDelete);
  
    return () => {
      socket.off("message_deleted", handleDelete);
    };
  }, [socket]);

  /* EMIT FUNCTIONS */

  const sendMessage = (content: string, replyToId?: string | null) => {
    if (!conversationId || !content.trim()) return;

    socket?.emit("send_message", {
      conversationId,
      content,
      replyToId: replyToId || null,
    });
  };

  const deleteMessage = (messageId: string) => {
    socket?.emit("delete_message", { messageId });
  };

  const editMessage = (messageId: string, content: string) => {
    socket?.emit("edit_message", { messageId, content });
  };

  const reactMessage = (messageId: string, emoji: string) => {
    socket?.emit("react_message", { messageId, emoji });
  };

  return {
    messages,
    sendMessage,
    deleteMessage,
    editMessage,
    reactMessage,
    fetchMore: () => fetchMessages(false),
    hasMore,
    loading,
  };
};

