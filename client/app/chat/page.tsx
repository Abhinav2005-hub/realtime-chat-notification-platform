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
  const {
    conversations,
    refetch,
    loading: conversationsLoading,
  } = useConversations();

  const { onlineUsers } = usePresence();
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

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
        data: {
          name: groupName,
          memberIds: selectedUsers,
        },
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
      data: { newName },
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
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useJoinConversation(activeConversationId);
  useSeen(activeConversationId);

  const {
    messages,
    sendMessage,
    reactMessage,
    loading,
  } = useMessages(activeConversationId);

  const { typingUser, sendTyping } = useTyping(activeConversationId);

  useEffect(() => {
    setReplyToMessage(null);
    setText("");
  }, [activeConversationId]);

  /* PREVENT DUPLICATE SEND */

  const handleSend = async () => {
    if (!activeConversationId || !text.trim() || sending) return;

    try {
      setSending(true);

      sendMessage(text, replyToMessage?.id || null);

      setText("");
      setReplyToMessage(null);
    } finally {
      setSending(false);
    }
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

          <UserList
            onSelect={async (userId) => {
              const convo = await createOneToOneConversation(userId);
              setActiveConversationId(convo.id);
              refetch();
            }}
          />

          <div className="overflow-y-auto flex-1">

            {conversationsLoading ? (
              <div className="p-2 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-200 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-center text-gray-400 mt-4">
                No conversations yet
              </p>
            ) : (
              conversations.map((c) => {
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
                    className={`border-b p-2 cursor-pointer hover:bg-gray-100 transition ${
                      activeConversationId === c.id
                        ? "bg-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">

                      {!isGroup && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOnline
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                      )}

                      <p className="font-medium truncate">
                        {isGroup
                          ? c.name
                          : otherUser?.user.email}
                      </p>

                      {isGroup && (
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">
                          Group
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-4 flex flex-col">

          {!activeConversationId && (
            <p className="text-gray-500">
              Select a conversation
            </p>
          )}

          {activeConversation && (
            <div className="border-b p-3 bg-gray-50 mb-2">
              {activeConversation?.isGroup && (
                <div className="flex justify-between items-center bg-gray-100 border rounded px-4 py-2 mb-3">
              
                  <span className="text-sm text-gray-600">
                    Group controls
                  </span>
              
                  <div className="flex gap-3">
                    <button
                      onClick={handleRename}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      Rename
                    </button>
              
                    <button
                      onClick={handleLeave}
                      className="text-red-600 text-sm font-medium hover:underline"
                    >
                      Leave
                    </button>
                  </div>
              
                </div>
              )}
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
                      (m) =>
                        m.user.id !== currentUserId
                    )?.user.id || ""
                  )
                    ? "Online"
                    : "Offline"}
                </p>
              )}
            </div>
          )}

          {/* MESSAGE LIST */}
          <div className="flex-1 bg-gray-50 p-4 overflow-y-auto mb-2 rounded">
          
            {loading ? (
              <p className="text-center text-gray-400 mt-4">
                Loading messages...
              </p>
            ) : messages.length === 0 ? (
              <p className="text-gray-500 text-center mt-4">
                No messages yet
              </p>
            ) : (
              messages.map((m: Message) => {
                const isOwn = m.senderId === currentUserId;
          
                return (
                  <div
                    key={m.id}
                    className={`flex mb-3 ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-lg max-w-xs shadow-sm ${
                        isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      {m.replyTo && (
                        <div className="text-xs opacity-70 mb-2 border-l-2 pl-2">
                          Replying to: {m.replyTo.content}
                        </div>
                      )}
          
                      <p>
                        {m.content}
                        {m.isEdited && (
                          <span className="ml-2 text-xs opacity-70">
                            (edited)
                          </span>
                        )}
                      </p>
          
                      <div className="flex gap-2 mt-2 text-sm">
                        <button onClick={() => reactMessage(m.id, "❤️")}>❤️</button>
                        <button onClick={() => reactMessage(m.id, "👍")}>👍</button>
                        <button onClick={() => reactMessage(m.id, "😂")}>😂</button>
                        <button onClick={() => reactMessage(m.id, "😡")}>😡</button>
                      </div>
          
                      {m.reactions && m.reactions.length > 0 && (
                        <div className="text-xs mt-1 opacity-80">
                          {m.reactions.map((r) => (
                            <span key={r.id} className="mr-1">
                              {r.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          
          </div>

          {typingUser && (
            <p className="text-sm text-gray-400 mb-1">
              Someone is typing...
            </p>
          )}

          {activeConversationId && (
            <>
              <input
                disabled={sending}
                className="border p-2 w-full disabled:bg-gray-100"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  sendTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !sending) {
                    handleSend();
                  }
                }}
                placeholder="Type a message"
              />

              <button
                disabled={sending}
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 py-2 mt-2 disabled:bg-gray-400"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </>
          )}

        </div>
      </div>

      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96 shadow-lg">
      
            <h2 className="font-bold text-lg mb-4">
              Create Group
            </h2>
      
            <input
              placeholder="Group Name"
              className="border p-2 w-full mb-4"
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
      
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setSelectedUsers([]);
                }}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
      
              <button
                onClick={handleCreateGroup}
                className="bg-green-600 text-white px-4 py-1 rounded"
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