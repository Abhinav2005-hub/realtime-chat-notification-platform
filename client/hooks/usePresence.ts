import { useEffect, useState } from "react";
import { useSocket } from"@/context/SocketContext";

export const usePresence = () => {
    const socket = useSocket();
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
    useEffect(() => {
      if (!socket) return;
  
      const handleOnline = (userId: string) => {
        setOnlineUsers((prev) =>
          prev.includes(userId) ? prev : [...prev, userId]
        );
      };
  
      const handleOffline = (userId: string) => {
        setOnlineUsers((prev) =>
          prev.filter((id) => id !== userId)
        );
      };
      
      socket.off("user_online", handleOnline);
      socket.off("user_offline", handleOffline);
  
      socket.on("user_online", handleOnline);
      socket.on("user_offline", handleOffline);
  
      return () => {
        socket.off("user_online", handleOnline);
        socket.off("user_offline", handleOffline);
      };
    }, [socket]);
  
    return { onlineUsers };
  };