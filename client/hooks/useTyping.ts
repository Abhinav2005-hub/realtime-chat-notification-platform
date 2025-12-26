import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";

export const useTyping = (conversationId: string) => {
    const socket = useSocket();
    const [typingUser, setTypingUser] = useState<string | null>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on("user_typing", (userId: string) => {
            setTypingUser(userId);

            setTimeout(() => {
                setTypingUser(null);
            }, 1500);
        }); 

        return () => {
            socket.off("user_typing");
        };
    }, [socket]);

    const sendTyping = () => {
        socket?.emit("typing", conversationId);
    };

    return{ typingUser, sendTyping };
}