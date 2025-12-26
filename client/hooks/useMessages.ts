import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";

export interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
}

export const useMessages = () => {
    const socket = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (!socket) return;

        socket.on("receive_message", (message: Message) =>{
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off("receive_message");
        };
    }, [socket]);

    const sendMessage = (conversationId: string, content: string) => {
        socket?.emit("send_message", { conversationId, content });
    };

    return { messages, sendMessage };
}