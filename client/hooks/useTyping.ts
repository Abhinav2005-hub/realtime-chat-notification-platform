import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/SocketContext";

export const useTyping = (conversationId: string | null) => {
  const socket = useSocket();
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleTyping = ({
      userId,
      conversationId: incomingId,
    }: {
      userId: string;
      conversationId: string;
    }) => {
      if (incomingId !== conversationId) return;

      setTypingUser(userId);

      /* clear previous timer */
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 2000);
    };

    socket.off("user_typing", handleTyping);
    socket.on("user_typing", handleTyping);

    return () => {
      socket.off("user_typing", handleTyping);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [socket, conversationId]);

  const sendTyping = () => {
    if (!socket || !conversationId) return;

    socket.emit("typing", { conversationId });
  };

  return { typingUser, sendTyping };
};