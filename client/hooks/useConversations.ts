import { useEffect, useState } from "react";
import { fetchConversations } from "@/lib/conversationApi";

export const useConversations = () => {
    const [conversations, setConversations] = useState<any[]>([]);

    useEffect(() => {
        fetchConversations().then(setConversations);
    }, []);
    return { conversations };
}