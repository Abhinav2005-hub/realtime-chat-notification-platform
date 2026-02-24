"use client";

import { useEffect, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useMessages, Message } from "@/hooks/useMessages";
import { useJoinConversation } from "@/hooks/useJoinConversation";
import { useTyping } from "@/hooks/useTyping";
import { useSeen } from "@/hooks/useSeen";
import { usePresence } from "@/hooks/usePresence";
import { useAuth } from "@/context/AuthContext";
import RequireAuth from "@/components/auth/RequireAuth";
import UserList from "@/components/chat/UserList";
import { createOneToOneConversation } from "@/lib/conversationApi";
import { api } from "@/lib/api";

export default function ChatPage() {
  const { conversations, refetch } = useConversations();
  const { onlineUsers } = usePresence();
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

  /* GROUP STATE */

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const activeConversation =
    conversations?.find((c) => c.id === activeConversationId) || null;

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
      method: "PUT",
      body: JSON.stringify({ newName }),
    });

    refetch();
  };

  const handleLeave = async () => {
    if (!activeConversationId) return;

    await api(`/conversations/${activeConversationId}/leave`, {
      method: "POST",
    });

    setActiveConversationId(null);
    refetch();
  };

  /* MESSAGE STATE */

  const [replyToMessage, setReplyToMessage] =
    useState<Message | null>(null);
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

          <UserList onSelect={async (userId) => {
            const convo = await createOneToOneConversation(userId);
            setActiveConversationId(convo.id);
            refetch();
          }} />

          <div className="overflow-y-auto flex-1">
            {conversations.map((c) => {
              const isGroup = c.isGroup;
              const otherUser = c.members.find(
                (m) => m.user.id !== currentUserId
              );

              const isOnline = otherUser
                ? onlineUsers.includes(otherUser.user.id)
                : false;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`border-b p-2 cursor-pointer hover:bg-gray-100 ${
                    activeConversationId === c.id ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {!isGroup && (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    )}

                    <p className="font-medium">
                      {isGroup ? c.name : otherUser?.user.email}
                    </p>

                    {isGroup && (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">
                        Group
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-4 flex flex-col">

          {!activeConversationId && (
            <p className="text-gray-500">Select a conversation</p>
          )}

          {activeConversation && (
            <div className="border-b p-3 bg-gray-50 mb-2">
              <h2 className="font-semibold text-lg">
                {activeConversation.isGroup
                  ? activeConversation.name
                  : activeConversation.members.find(
                      (m) => m.user.id !== currentUserId
                    )?.user.email}
              </h2>

              {!activeConversation.isGroup && (
                <p className="text-sm text-gray-500">
                  {onlineUsers.includes(
                    activeConversation.members.find(
                      (m) => m.user.id !== currentUserId
                    )?.user.id || ""
                  )
                    ? "Online"
                    : "Offline"}
                </p>
              )}
            </div>
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

          {/* MESSAGE LIST */}
          <div className="flex-1 border p-3 overflow-y-auto mb-2">
            {loading && (
              <p className="text-center text-gray-400">Loading...</p>
            )}

            {messages.map((m: Message) => (
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
                    {m.content}
                    {m.isEdited && (
                      <span className="text-xs text-gray-400 ml-2">
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

                {/* REACTIONS */}
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
            ))}
          </div>

          {typingUser && (
            <p className="text-sm text-gray-400 mb-1">
              Someone is typing...
            </p>
          )}

          {replyToMessage && (
            <div className="border p-2 mb-2 bg-gray-100 rounded">
              Replying to: {replyToMessage.content}
              <button
                className="ml-2 text-red-500 text-xs"
                onClick={() => setReplyToMessage(null)}
              >
                Cancel
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