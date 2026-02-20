"use client";

import { useEffect, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useMessages, Message } from "@/hooks/useMessages";
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
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  /* Edit state */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  /* Message input */
  const [text, setText] = useState("");

  /* Socket lifecycle */
  useJoinConversation(activeConversationId);
  useSeen(activeConversationId);

  /* ✅ UPDATED: Pagination enabled */
  const {
    messages,
    sendMessage,
    deleteMessage,
    reactMessage,
    editMessage,
    fetchMore,
    hasMore,
    loading,
  } = useMessages(activeConversationId);

  /* Typing */
  const { typingUser, sendTyping } = useTyping(activeConversationId);

  /* Reset states when switching conversation */
  useEffect(() => {
    setReplyToMessage(null);
    setEditingId(null);
    setEditText("");
    setText("");
  }, [activeConversationId]);

  /* Scroll handler for infinite scroll */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasMore && !loading) {
      fetchMore();
    }
  };

  /* Start new 1-to-1 conversation */
  const handleStartChat = async (userId: string) => {
    try {
      const conversation = await createOneToOneConversation(userId);
      setActiveConversationId(conversation.id);
      refetch();
    } catch (err) {
      console.error("Failed to start chat", err);
    }
  };

  /* Send message */
  const handleSend = () => {
    if (!activeConversationId || !text.trim()) return;

    sendMessage(text, replyToMessage?.id || null);

    setText("");
    setReplyToMessage(null);
  };

  return (
    <RequireAuth>
      <div className="flex h-screen">
        {/* LEFT PANEL */}
        <div className="w-64 border-r flex flex-col">
          <UserList onSelect={handleStartChat} />
          <ConversationList
            conversations={conversations}
            onSelect={setActiveConversationId}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-4 flex flex-col">
          {!activeConversationId && (
            <p className="text-gray-500">Select a conversation</p>
          )}

          {/* ✅ UPDATED MESSAGE CONTAINER */}
          <div
            className="flex-1 border p-3 overflow-y-auto mb-2"
            onScroll={handleScroll}
          >
            {loading && (
              <p className="text-center text-gray-400">Loading...</p>
            )}

            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet</p>
            ) : (
              messages.map((m: Message) => (
                <div
                  key={m.id}
                  className="mb-3 p-3 border rounded hover:bg-gray-50"
                >
                  {/* Reply Preview */}
                  {m.replyTo && (
                    <div className="text-xs text-gray-500 border-l-4 pl-2 mb-2">
                      Replying to: {m.replyTo.content}
                    </div>
                  )}

                  {/* Edit Mode */}
                  {editingId === m.id ? (
                    <input
                      className="border p-1 w-full mb-2"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editText.trim()) {
                          editMessage(m.id, editText);
                          setEditingId(null);
                          setEditText("");
                        }
                      }}
                    />
                  ) : (
                    <p>
                      {m.content}{" "}
                      {m.isEdited && (
                        <span className="text-xs text-gray-400">
                          (edited)
                        </span>
                      )}
                    </p>
                  )}

                  {/* Action Buttons */}
                  {!m.isDeleted && (
                    <div className="flex gap-3 mt-2 text-sm">
                      <button
                        onClick={() => setReplyToMessage(m)}
                        className="text-green-600"
                      >
                        Reply
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(m.id);
                          setEditText(m.content);
                        }}
                        className="text-blue-500"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteMessage(m.id)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="flex gap-2 mt-2 text-sm">
                    <button onClick={() => reactMessage(m.id, "❤️")}>
                      ❤️
                    </button>
                    <button onClick={() => reactMessage(m.id, "👍")}>
                      👍
                    </button>
                    <button onClick={() => reactMessage(m.id, "😂")}>
                      😂
                    </button>
                    <button onClick={() => reactMessage(m.id, "😡")}>
                      😡
                    </button>
                  </div>

                  {m.reactions && m.reactions.length > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      {m.reactions.map((r) => (
                        <span key={r.id} className="mr-1">
                          {r.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Typing Indicator */}
          {typingUser && (
            <p className="text-sm text-gray-400 mb-1">
              Someone is typing...
            </p>
          )}

          {/* Reply Preview Above Input */}
          {replyToMessage && (
            <div className="border p-2 mb-2 bg-gray-100 rounded">
              <p className="text-sm text-gray-600">
                Replying to:{" "}
                <span className="font-semibold">
                  {replyToMessage.content}
                </span>
              </p>
              <button
                className="text-xs text-red-500 mt-1"
                onClick={() => setReplyToMessage(null)}
              >
                Cancel Reply
              </button>
            </div>
          )}

          {/* Input Section */}
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