"use client";

import { useEffect, useRef, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useJoinConversation } from "@/hooks/useJoinConversation";
import { useTyping } from "@/hooks/useTyping";
import { useSeen } from "@/hooks/useSeen";
import RequireAuth from "@/components/auth/RequireAuth";
import ConversationList from "@/components/chat/ConversationList";
import UserList from "@/components/chat/UserList";
import { createOneToOneConversation } from "@/lib/conversationApi";
import { useAuth } from "@/context/AuthContext";
import { formatTime } from "@/lib/time";

export default function ChatPage() {
  const { conversations, refetch } = useConversations();
  const { user } = useAuth();

  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

  /* Socket lifecycle */
  useJoinConversation(activeConversationId);
  useSeen(activeConversationId);

  /* Messages */
  const { messages, sendMessage } = useMessages(activeConversationId);

  /* Typing */
  const { typingUser, sendTyping } = useTyping(activeConversationId);

  const [text, setText] = useState("");

  // scroll ref
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // auto scroll when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // start 1-to-1 chat
  const handleStartChat = async (userId: string) => {
    try {
      const conversation = await createOneToOneConversation(userId);
      setActiveConversationId(conversation.id);
      refetch();
    } catch (err) {
      console.error("Failed to start chat", err);
    }
  };

  const handleSend = () => {
    if (!activeConversationId) return;
    if (!text.trim()) return;

    sendMessage(text);
    setText("");
  };

  return (
    <RequireAuth>
      <div className="flex h-screen">
        {/* LEFT */}
        <div className="w-64 border-r flex flex-col">
          <UserList onSelect={handleStartChat} />

          <ConversationList
            conversations={conversations}
            onSelect={setActiveConversationId}
            activeConversationId={activeConversationId}
          />
        </div>

        {/* RIGHT */}
        <div className="flex-1 p-4 flex flex-col">
          {!activeConversationId && (
            <p className="text-gray-500">Select a conversation</p>
          )}

          {/* Messages */}
          <div className="flex-1 border p-3 overflow-y-auto mb-2 flex flex-col gap-2">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet</p>
            ) : (
              messages.map((m) => {
                const isMine = m.senderId === user?.id;

                return (
                  <div
                    key={m.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg max-w-xs ${
                        isMine
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      <p>{m.content}</p>

                      {/* time + status */}
                      <div className="text-[10px] mt-1 flex justify-end gap-2 opacity-70">
                        <span>{formatTime(m.createdAt)}</span>

                        {isMine && (
                          <span>
                            {m.status === "seen"
                              ? "✔✔ Seen"
                              : m.status === "delivered"
                              ? "✔✔"
                              : "✔"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Auto scroll target */}
            <div ref={bottomRef}></div>
          </div>

          {/* Typing indicator */}
          {typingUser && (
            <p className="text-sm text-gray-400 mb-1">
              Someone is typing...
            </p>
          )}

          {/* Input */}
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
                placeholder="Type a message"
              />

              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 py-2 mt-2"
              >
                Send
              </button>
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
