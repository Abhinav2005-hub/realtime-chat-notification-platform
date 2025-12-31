"use client";

import { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useJoinConversation } from "@/hooks/useJoinConversation";
import { useTyping } from "@/hooks/useTyping";
import RequireAuth from "@/components/auth/RequireAuth";
import ConversationList from "@/components/chat/ConversationList";

export default function ChatPage() {
  const { conversations } = useConversations();
  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

  // Join socket room safely
  useJoinConversation(activeConversationId);

  // Messages scoped to active conversation
  const { messages, sendMessage } = useMessages(activeConversationId);

  // Typing indicator
  const { typingUser, sendTyping } = useTyping(activeConversationId);

  const [text, setText] = useState("");

  const handleSend = () => {
    if (!activeConversationId) return;
    if (!text.trim()) return;

    sendMessage(activeConversationId, text);
    setText("");
  };

  return (
    <RequireAuth>
      <div className="flex h-screen">
        {/* LEFT: Conversations */}
        <ConversationList
          conversations={conversations}
          onSelect={setActiveConversationId}
        />

        {/* RIGHT: Chat */}
        <div className="flex-1 p-4 flex flex-col">
          {!activeConversationId && (
            <p className="text-gray-500">Select a conversation</p>
          )}

          {/* Messages */}
          <div className="flex-1 border p-3 overflow-y-auto mb-2">
            {messages.map((m) => (
              <p key={m.id} className="mb-1">
                {m.content}
              </p>
            ))}
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
