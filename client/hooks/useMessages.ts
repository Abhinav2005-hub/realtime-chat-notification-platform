import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  status?: "sent" | "delivered" | "seen";
}

export const useMessages = () => {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Receive new message
    socket.on("receive_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Handle seen status update
    socket.on(
      "messages_seen",
      ({ conversationId }: { conversationId: string }) => {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            status: "seen"
          }))
        );
      }
    );

    return () => {
      socket.off("receive_message");
      socket.off("messages_seen");
    };
  }, [socket]);

  const sendMessage = (conversationId: string, content: string) => {
    socket?.emit("send_message", { conversationId, content });
  };

  return { messages, sendMessage };
};
