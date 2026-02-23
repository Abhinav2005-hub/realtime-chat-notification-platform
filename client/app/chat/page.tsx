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
import { api } from "@/lib/api";

export default function ChatPage() {
  const { conversations, refetch } = useConversations();

  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

  /* GROUP STATE */

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const activeConversation = conversations?.find(
    (c) => c.id === activeConversationId) || null;

  /* GROUP ACTIONS */

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
  
    if (selectedUsers.length < 2) {
      alert("Select at least 2 users");
      return;
    }
    try {
      const newGroup = await api("/conversations/group", {
        method: "POST",
        body: JSON.stringify({
          name: groupName,
          memberIds: selectedUsers,
        }),
      });
      console.log("Selected Users:", selectedUsers);
  
      setShowGroupModal(false);
      setGroupName("");
      setSelectedUsers([]);
      setActiveConversationId(newGroup.id);
      refetch();
    } catch (err) {
      console.error("Failed to create group", err);
    }
  };

  const handleRename = async () => {
    if (!activeConversationId) return;

    const newName = prompt("Enter new group name");
    if (!newName) return;

    try {
      await api(`/conversations/${activeConversationId}/rename`, {
        method: "PUT",
        body: JSON.stringify({ newName }),
      });

      refetch();
    } catch (err) {
      console.error("Rename failed", err);
    }
  };

  const handleLeave = async () => {
    if (!activeConversationId) return;

    try {
      await api(`/conversations/${activeConversationId}/leave`, {
        method: "POST",
      });

      setActiveConversationId(null);
      refetch();
    } catch (err) {
      console.error("Leave failed", err);
    }
  };

  /*MESSAGE STATE */

  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [text, setText] = useState("");

  useJoinConversation(activeConversationId);
  useSeen(activeConversationId);

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

  const { typingUser, sendTyping } = useTyping(activeConversationId);

  useEffect(() => {
    setReplyToMessage(null);
    setEditingId(null);
    setEditText("");
    setText("");
  }, [activeConversationId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasMore && !loading) {
      fetchMore();
    }
  };

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
    if (!activeConversationId || !text.trim()) return;

    sendMessage(text, replyToMessage?.id || null);
    setText("");
    setReplyToMessage(null);
  };

  /* UI */

  return (
    <RequireAuth>
      <div className="flex h-screen">

        {/* LEFT PANEL */}
        <div className="w-64 border-r flex flex-col">

          <button
            onClick={() => setShowGroupModal(true)}
            className="bg-green-600 text-white p-2 m-2 rounded"
          >
            + Create Group
          </button>

          <UserList onSelect={handleStartChat} />

          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={setActiveConversationId}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-4 flex flex-col">

          {!activeConversationId && (
            <p className="text-gray-500">Select a conversation</p>
          )}

          {/* GROUP CONTROLS */}
          {activeConversation?.isGroup && (
            <div className="border p-2 mb-2 bg-gray-50">
              <button
                onClick={handleRename}
                className="mr-4 text-blue-500"
              >
                Rename
              </button>

              <button
                onClick={handleLeave}
                className="text-red-500"
              >
                Leave
              </button>
            </div>
          )}

          {/* MESSAGE CONTAINER */}
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
                  {m.replyTo && (
                    <div className="text-xs text-gray-500 border-l-4 pl-2 mb-2">
                      Replying to: {m.replyTo.content}
                    </div>
                  )}

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

                  <div className="flex gap-2 mt-2 text-sm">
                    <button onClick={() => reactMessage(m.id, "❤️")}>❤️</button>
                    <button onClick={() => reactMessage(m.id, "👍")}>👍</button>
                    <button onClick={() => reactMessage(m.id, "😂")}>😂</button>
                    <button onClick={() => reactMessage(m.id, "😡")}>😡</button>
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

          {typingUser && (
            <p className="text-sm text-gray-400 mb-1">
              Someone is typing...
            </p>
          )}

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

      {/* GROUP MODAL */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96">
            <h2 className="font-bold mb-3">Create Group</h2>

            <input
              placeholder="Group Name"
              className="border p-2 w-full mb-3"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            <UserList
              multiSelect
              selectedUsers={selectedUsers}
              onSelect={(userId) => {
                setSelectedUsers((prev) =>
                  prev.includes(userId)
                    ? prev.filter((id) => id !== userId)
                    : [...prev, userId]
                );
              }}
            />

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setSelectedUsers([]);
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleCreateGroup}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </RequireAuth>
  );
}