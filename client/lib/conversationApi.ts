import { api } from "./api";

export const fetchConversations = async () => {
    return api("/api/conversations");
};

export const createConversation = async (userId: string) => {
    return api("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ userId })
    });
};