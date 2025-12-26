import { useEffect, useState } from "react";
import { useSocket } from"@/context/SocketContext";

export const usePresence = () => {
    const socket = useSocket();
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());


    useEffect(() => {
        if (!socket) return;

        socket.on("user_online", (userId: string) => {
            setOnlineUsers((prev) => new Set(prev).add(userId));
        });

        socket.on("user_offline", (userId: string) => {
            setOnlineUsers((prev) => {
                const updated = new Set(prev);
                updated.delete(userId);
                return updated;
            });
        });

        return () => {
            socket.off("user_online");
            socket.off("user_offline");
        };
    }, [socket]);

    return { onlineUsers };
};