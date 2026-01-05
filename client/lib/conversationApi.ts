"use client"

import { api } from "./api";
import { TOKEN_KEY } from "./constants";

// fetch all conversatiomn of logged in user 
export const fetchConversations = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if(!token) {
        throw new Error("Not authenticated");
    }

    return api("/api/conversations", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// create 1-to-1 conversation
export const createConversation = async (userId: string) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if(!token) {
        throw new Error("Not authenticated");
    }

    return api("/api/conversations", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
    });
};

export const createOneToOneConversation = async (otherUserId: string) => {
    return api("/api/conversations/one-to-one", {
        method: "POST",
        body: JSON.stringify({ otherUserId })
    });
};