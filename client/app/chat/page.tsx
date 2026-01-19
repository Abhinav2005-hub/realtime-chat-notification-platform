"use client";

import { useState, useRef, useEffect } from "react";
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

  /* socket lifecycle */
  useJoinConversation(activeConversationId);
  useSeen(activeConversationId);

  /* messages = SINGLE SOURCE OF TRUTH */
  const { messages, sendMessage } = useMessages(activeConversationId);

  /* typing */
  const { typingUser, sendTyping } = useTyping(activeConversationId);

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* auto-scroll on new message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartChat = async (userId: string) => {
    try {
      const conversation = await createOneToOneConversation(userId);

      if (!conversation?.id) {
        console.error("Invalid conversation response", conversation);
        return;
      }

      await refetch();
      setActiveConversationId(conversation.id);
    } catch (err) {
      console.error("Failed to start chat", err);
    }
  };

  const handleSend = () => {
    if (!activeConversationId || !text.trim()) return;
    sendMessage(text.trim());
    setText("");
  };

  return (
    <RequireAuth>
      <div className="flex h-screen">
        {/* LEFT SIDEBAR */}
        <div className="w-64 border-r flex flex-col">
          <UserList onSelect={handleStartChat} />
          <ConversationList
            conversations={conversations}
            onSelect={setActiveConversationId}
          />
        </div>

        {/* RIGHT CHAT */}
        <div className="flex-1 p-4 flex flex-col">
          {!activeConversationId && (
            <p className="text-gray-500">Select a conversation</p>
          )}

          {/* MESSAGE LIST (FIXED) */}
          {activeConversationId && (
            <div className="flex-1 border p-3 overflow-y-auto mb-2">
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages yet</p>
              ) : (
                messages.map((m) => (
                  <p key={m.id} className="mb-1">
                    {m.content}
                  </p>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* TYPING INDICATOR */}
          {typingUser && (
            <p className="text-sm text-gray-400 mb-1">
              Someone is typing...
            </p>
          )}

          {/* INPUT + SEND */}
          {activeConversationId && (
            <div className="border-t pt-2">
              <input
                className="border p-3 w-full mb-2 rounded"
                value={text}
                placeholder="Type a message"
                autoFocus
                onChange={(e) => {
                  setText(e.target.value);
                  sendTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className={`w-full py-3 text-white font-medium rounded-lg
                  ${
                    text.trim()
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-300 cursor-not-allowed"
                  }
                `}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
