interface Props {
    conversations: {
      id: string;
      messages: {
        content: string;
      }[];
    }[];
    onSelect: (id: string) => void;
  }
  
  export default function ConversationList({
    conversations,
    onSelect,
  }: Props) {
    return (
      <div className="w-64 border-r">
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="p-3 border-b cursor-pointer hover:bg-gray-100"
          >
            <p className="font-semibold">Conversation</p>
            <p className="text-sm text-gray-500">
              {c.messages?.[0]?.content ?? "No messages yet"}
            </p>
          </div>
        ))}
      </div>
    );
  }
  