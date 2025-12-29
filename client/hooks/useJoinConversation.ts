import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";

export const useJoinConversation = (
  conversationId: string | null
) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("join_conversation", conversationId);

    return () => {
      socket.emit("leave_conversation", conversationId);
    };
  }, [socket, conversationId]);
};
