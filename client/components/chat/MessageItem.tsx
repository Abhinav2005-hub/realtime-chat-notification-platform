import { Message } from "@/hooks/useMessages";

export default function MessageItem({ message }: { message: Message }) {
    return (
        <div className="flex justify-between">
            <span>{message.content}</span>
            <span className="text-xs text-gray-400">
                {message.status === "seen" && "✓✓"}
                {message.status === "delivered" && "✓"}
            </span>
        </div>
    );
}
