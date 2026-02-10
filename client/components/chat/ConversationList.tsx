"use client";

import { useAuth } from "@/context/AuthContext";

interface Props {
  conversations: any[];
  onSelect: (id: string) => void;
  activeConversationId?: string | null;
}

export default function ConversationList({
  conversations = [],
  onSelect,
  activeConversationId,
}: Props) {
  const { user } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto border-t">
      <p className="p-2 font-semibold bg-gray-100">Chats</p>

      {conversations.length === 0 && (
        <p className="p-3 text-gray-500 text-sm">No conversations yet</p>
      )}

      {conversations.map((c) => {
        // find other user in 1-to-1 chat
        const otherMember = c.members?.find(
          (m: any) => m.userId !== user?.id
        );

        const chatName = c.isGroup
          ? c.name || "Group Chat"
          : otherMember?.user?.email || "Unknown User";

        const lastMessage = c.messages?.[0]?.content || "No messages yet";

        const isActive = activeConversationId === c.id;

        return (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
              isActive ? "bg-blue-100" : ""
            }`}
          >
            <p className="font-semibold text-sm">{chatName}</p>
            <p className="text-xs text-gray-500 truncate">{lastMessage}</p>
          </div>
        );
      })}
    </div>
  );
}
