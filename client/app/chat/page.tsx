"use client";

import { useEffect, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useMessages, Message } from "@/hooks/useMessages";
import { useJoinConversation } from "@/hooks/useJoinConversation";
import { useTyping } from "@/hooks/useTyping";
import { useSeen } from "@/hooks/useSeen";
import { useUsers } from "@/hooks/useUsers";
import RequireAuth from "@/components/auth/RequireAuth";
import { createOneToOneConversation } from "@/lib/conversationApi";
import { api } from "@/lib/api";

export default function ChatPage() {
  const { conversations, refetch } = useConversations();
  const { users } = useUsers();

  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

  /* CURRENT USER */

  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;

  const currentUserId = currentUser?.id;

  const activeConversation = conversations?.find(
    (c) => c.id === activeConversationId
  );

  /* GROUP STATE */

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) {
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

      setShowGroupModal(false);
      setGroupName("");
      setSelectedUsers([]);
      setActiveConversationId(newGroup.id);
      refetch();
    } catch (err) {
      console.error("Create group failed", err);
    }
  };

  const handleRename = async () => {
    if (!activeConversationId) return;

    const newName = prompt("Enter new group name");
    if (!newName) return;

    await api(`/conversations/${activeConversationId}/rename`, {
      method: "PATCH",
      body: JSON.stringify({ newName }),
    });

    refetch();
  };

  const handleLeave = async () => {
    if (!activeConversationId) return;

    await api(`/conversations/${activeConversationId}/leave`, {
      method: "DELETE",
    });

    setActiveConversationId(null);
    refetch();
  };

  /* MESSAGE STATE */

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

  const handleSend = () => {
    if (!activeConversationId || !text.trim()) return;
    sendMessage(text, replyToMessage?.id || null);
    setText("");
    setReplyToMessage(null);
  };

  const handleStartChat = async (userId: string) => {
    const conversation = await createOneToOneConversation(userId);
    setActiveConversationId(conversation.id);
    refetch();
  };

  /* UI */

  return (
    <RequireAuth>
      <div className="flex h-screen">

        {/* LEFT SIDEBAR */}

        <div className="w-72 border-r flex flex-col">

          <button
            onClick={() => setShowGroupModal(true)}
            className="bg-green-600 text-white p-2 m-3 rounded"
          >
            + Create Group
          </button>

          <div className="overflow-y-auto">
            {conversations.map((c) => {
              const isGroup = c.isGroup;

              const displayName = isGroup
                ? c.name
                : c.members.find(
                    (m: any) => m.user.id !== currentUserId
                  )?.user.email || "Unknown";

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`border-b p-3 cursor-pointer hover:bg-gray-100 ${
                    activeConversationId === c.id ? "bg-gray-200" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">
                      {displayName}
                    </p>

                    {isGroup && (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">
                        Group
                      </span>
                    )}
                  </div>

                  {isGroup && (
                    <p className="text-xs text-gray-500">
                      {c.members.length} members
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className="flex-1 flex flex-col">

          {!activeConversationId && (
            <p className="text-gray-500 p-4">
              Select a conversation
            </p>
          )}

          {/* HEADER */}
          {activeConversation && (
            <div className="border-b p-4 bg-gray-50">
              <h2 className="font-semibold text-lg">
                {activeConversation.isGroup
                  ? activeConversation.name
                  : activeConversation.members.find(
                      (m: any) => m.user.id !== currentUserId
                    )?.user.email}
              </h2>

              {activeConversation.isGroup && (
                <p className="text-sm text-gray-500">
                  {activeConversation.members.length} participants
                </p>
              )}
            </div>
          )}

          {/* GROUP CONTROLS */}
          {activeConversation?.isGroup && (
            <div className="border-b p-2 bg-gray-50">
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

          {/* MESSAGES */}
          <div
            className="flex-1 p-4 overflow-y-auto"
            onScroll={handleScroll}
          >
            {loading && (
              <p className="text-center text-gray-400">
                Loading...
              </p>
            )}

            {messages.map((m: Message) => (
              <div key={m.id} className="mb-3">

                {m.replyTo && (
                  <div className="text-xs text-gray-500 mb-1">
                    Replying to: {m.replyTo.content}
                  </div>
                )}

                <div className="p-3 border rounded bg-white">
                  {editingId === m.id ? (
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          editMessage(m.id, editText);
                          setEditingId(null);
                        }
                      }}
                      className="border p-1 w-full"
                    />
                  ) : (
                    <p>
                      {m.content}
                      {m.isEdited && (
                        <span className="text-xs text-gray-400">
                          (edited)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 text-sm mt-1">
                  <button onClick={() => setReplyToMessage(m)}>
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(m.id);
                      setEditText(m.content);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteMessage(m.id)}>
                    Delete
                  </button>
                </div>

                <div className="flex gap-2 mt-1">
                  <button onClick={() => reactMessage(m.id, "❤️")}>❤️</button>
                  <button onClick={() => reactMessage(m.id, "👍")}>👍</button>
                </div>
              </div>
            ))}
          </div>

          {/* INPUT */}
          {activeConversationId && (
            <div className="p-4 border-t">
              <input
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  sendTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder="Type a message"
                className="border p-2 w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* GROUP MODAL */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96">
            <h2 className="font-bold mb-2">Create Group</h2>

            <input
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="border p-2 w-full mb-2"
            />

            <div className="max-h-40 overflow-y-auto border p-2">
              {users.map((u) => (
                <label key={u.id} className="block text-sm">
                  <input
                    type="checkbox"
                    value={u.id}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers((prev) => [...prev, u.id]);
                      } else {
                        setSelectedUsers((prev) =>
                          prev.filter((id) => id !== u.id)
                        );
                      }
                    }}
                  />
                  {" "} {u.email}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setShowGroupModal(false)}>
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