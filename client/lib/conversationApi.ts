"use client";

import { api } from "./api";

export const fetchConversations = () => {
  return api("/conversations");
};

export const createOneToOneConversation = (
  targetUserId: string
) => {
  return api("/conversations/one-to-one", {
    method: "POST",
    data: { targetUserId },
  });
};