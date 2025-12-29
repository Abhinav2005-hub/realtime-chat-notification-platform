"use client";

import { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useJoinConversation } from "@/hooks/useJoinConversation";
import RequireAuth from "@/components/auth/RequireAuth";
import ConversationList from "@/components/chat/ConversationList";

export default function ChatPage() {
  const { conversations } = useConversations();
  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

  // join room safely
  useJoinConversation(activeConversationId);

  const { messages, sendMessage } = useMessages();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!activeConversationId) return;
    if(!text.trim()) return;

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
        <div className="flex-1 p-4">
          {!activeConversationId && (
            <p>Select a conversation</p>
          )}

          {messages.map((m) => (
            <p key={m.id}>{m.content}</p>
          ))}

          {activeConversationId && (
            <>
              <input
                className="border p-2 w-full mt-2"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message"
              />

              <button
                onClick={() => {
                  sendMessage(activeConversationId, text);
                  setText("");
                }}
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
