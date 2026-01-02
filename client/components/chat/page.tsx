"use client";

import { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useJoinConversation } from "@/hooks/useJoinConversation";
import ConversationList from "./ConversationList";

export default function ChatPage() {
  const { conversations } = useConversations();
  const [activeConversation, setActiveConversation] =
    useState<string | null>(null);

  //pass conversationId to hooks
  const { messages, sendMessage } = useMessages(activeConversation);
  useJoinConversation(activeConversation);

  return (
    <div className="flex h-screen">
      <ConversationList
        conversations={conversations}
        onSelect={setActiveConversation}
      />

      <div className="flex-1 p-4">
        {messages.map((m) => (
          <p key={m.id}>{m.content}</p>
        ))}

        {activeConversation && (
          <input
            className="border p-2 w-full mt-2"
            placeholder="Type message"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage(e.currentTarget.value); 
                e.currentTarget.value = "";
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
