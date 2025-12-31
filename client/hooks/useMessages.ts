import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";

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

  useEffect(() => {
    if (!socket || !conversationId) return;

    // reset messages when conversation changes
    setMessages([]);

    socket.on("receive_message", (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket, conversationId]);

  const sendMessage = (conversationId: string, content: string) => {
    socket?.emit("send_message", { conversationId, content });
  };

  return { messages, sendMessage };
};
