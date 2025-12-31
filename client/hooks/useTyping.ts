import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";

export const useTyping = (conversationId: string | null) => {
    const socket = useSocket();
    const [typingUser, setTypingUser] = useState<string | null>(null);

    useEffect(() => {
        if (!socket || !conversationId) return;

        socket.on("user_typing", ({ userId}) => {
            setTypingUser(userId);

            setTimeout(() => {
                setTypingUser(null);
            }, 2000);
        }); 

        return () => {
            socket.off("user_typing");
        };
    }, [socket, conversationId]);

    const sendTyping = () => {
        if (!socket || !conversationId) return;
        socket.emit("typing", { conversationId });
    };

    return{ typingUser, sendTyping };
};