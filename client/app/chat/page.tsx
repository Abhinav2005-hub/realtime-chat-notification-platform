"use client"

import { useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useTyping } from "@/hooks/useTyping";
import { useJoinConversation } from "@/hooks/useJoinConversation";

const CONVERSATION_ID = "test-conversation-id";

export default function ChatPage() {
    useJoinConversation(CONVERSATION_ID);

    const { messages, sendMessage } = useMessages();
    const { typingUser, sendTyping } = useTyping(CONVERSATION_ID);

    const [text, setText] = useState("");

    return (
        <div className="p-4">
            <div className="border h-80 overflow-y-auto mb-2">
                {messages.map((m) => (
                    <p key={m.id}>{m.content}</p>
                ))}
            </div>

            {typingUser && <p>Someone is typing...</p>}

            <input 
              className="border p-2 w-full"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                sendTyping();
              }}
            />

            <button 
              onClick={() => {
                sendMessage(CONVERSATION_ID, text);
                setText("");
              }}
              className="bg-blue-600 text-white px-4 py-2 mt-2"
            >
                Send
            </button>
        </div>
    );
}