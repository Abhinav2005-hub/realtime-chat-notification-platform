import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";

export const useSeen = (conversationId: string | null) => {
    const socket = useSocket();

    useEffect(() => {
        if (!socket || !conversationId) return;

        socket.emit("mark_seen", { conversationId });
    }, [socket, conversationId]);
};
