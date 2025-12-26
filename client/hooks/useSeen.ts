import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";

export const useSeen = (conversationId: string) => {
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.emit("mark_seen", { conversationId });
    }, [socket, conversationId]);
};
