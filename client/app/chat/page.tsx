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

  /* Reply state */
  const [replyToMessage, setReplyToMessage] = useState<any>(null);

  /* Socket lifecycle */
  useJoinConversation(activeConversationId);
  useSeen(activeConversationId);

  /* Messages */
  const { messages, sendMessage, addReaction } =
    useMessages(activeConversationId);

  /* Typing */
  const { typingUser, sendTyping } = useTyping(activeConversationId);

  const [text, setText] = useState("");

  // start 1-to-1 chat
  const handleStartChat = async (userId: string) => {
    try {
      const conversation = await createOneToOneConversation(userId);
      setActiveConversationId(conversation.id);

      refetch(); // refresh sidebar conversations
    } catch (err) {
      console.error("Failed to start chat", err);
    }
  };

  const handleSend = () => {
    if (!activeConversationId) return;
    if (!text.trim()) return;

    sendMessage(text, replyToMessage?.id || null);

    setText("");
    setReplyToMessage(null);
  };

  return (
    <RequireAuth>
      <div className="flex h-screen">
        {/* LEFT: Users + Conversations */}
        <div className="w-64 border-r flex flex-col">
          <UserList onSelect={handleStartChat} />

          <ConversationList
            conversations={conversations}
            onSelect={setActiveConversationId}
          />
        </div>

        {/* RIGHT: Chat */}
        <div className="flex-1 p-4 flex flex-col">
          {!activeConversationId && (
            <p className="text-gray-500">Select a conversation</p>
          )}

          {/* Messages */}
          <div className="flex-1 border p-3 overflow-y-auto mb-2">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet</p>
            ) : (
              messages.map((m: any) => (
                <div
                  key={m.id}
                  className="mb-2 p-2 border rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => setReplyToMessage(m)}
                >
                  {/* Reply preview inside message */}
                  {m.replyTo && (
                    <div className="text-xs text-gray-500 border-l-4 pl-2 mb-1">
                      Replying to: {m.replyTo.content}
                    </div>
                  )}

                  <p>{m.content}</p>

                  {/* Reaction Buttons */}
                  <div className="flex gap-2 mt-1 text-sm">
                    {["❤️", "😂", "👍", "🔥"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={(e) => {
                          e.stopPropagation();
                          addReaction(m.id, emoji);
                        }}
                        className="px-2 border rounded hover:bg-gray-200"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Show reactions */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div className="flex gap-2 mt-1 text-xs text-gray-600">
                      {m.reactions.map((r: any) => (
                        <span key={r.id} className="border px-2 rounded">
                          {r.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Typing indicator */}
          {typingUser && (
            <p className="text-sm text-gray-400 mb-1">Someone is typing...</p>
          )}

          {/* Reply preview above input */}
          {replyToMessage && (
            <div className="border p-2 mb-2 bg-gray-100 rounded">
              <p className="text-sm text-gray-600">
                Replying to:{" "}
                <span className="font-semibold">{replyToMessage.content}</span>
              </p>

              <button
                className="text-xs text-red-500 mt-1"
                onClick={() => setReplyToMessage(null)}
              >
                Cancel Reply
              </button>
            </div>
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
