"use client";

import { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useJoinConversation } from "@/hooks/useJoinConversation";
import { useTyping } from "@/hooks/useTyping";
import { useSeen } from "@/hooks/useSeen";
import RequireAuth from "@/components/auth/RequireAuth";
import ConversationList from "@/components/chat/ConversationList";
import UserList from "@/components/chat/UserList";
import { createOneToOneConversation } from "@/lib/conversationApi";

export default function ChatPage() {
  const { conversations, refetch } = useConversations();
  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

  useJoinConversation(activeConversationId);
  useSeen(activeConversationId);

  const { messages, sendMessage } = useMessages(activeConversationId);
  const { typingUser, sendTyping } = useTyping(activeConversationId);

  const [text, setText] = useState("");

  const handleStartChat = async (userId: string) => {
    const conversation = await createOneToOneConversation(userId);
    await refetch();
    setActiveConversationId(conversation.id);
  };

  return (
    <RequireAuth>
      <div className="flex h-screen">
        <div className="w-64 border-r flex flex-col">
          <UserList onSelect={handleStartChat} />
          <ConversationList
            conversations={conversations}
            onSelect={setActiveConversationId}
          />
        </div>

        <div className="flex-1 p-4 flex flex-col">
          {!activeConversationId && (
            <p className="text-gray-500">Select a conversation</p>
          )}

          <div className="flex-1 border p-3 overflow-y-auto mb-2">
            {messages.map((m) => (
              <p key={m.id}>{m.content}</p>
            ))}
          </div>

          {typingUser && (
            <p className="text-sm text-gray-400">Someone is typing...</p>
          )}

          {activeConversationId && (
            <>
              <input
                className="border p-2 w-full"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  sendTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  );

  function handleSend() {
    if (!activeConversationId || !text.trim()) return;
    sendMessage(text.trim());
    setText("");
  }
}
