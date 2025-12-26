import ChatHeader from "@/components/chat/ChatHeader";
import { useSeen } from "@/hooks/useSeen";

const CONVERSATION_ID = "test-conversation-id";

export default function ChatPage() {
    useSeen(CONVERSATION_ID);

    return (
        <div>
            <ChatHeader />
        </div>
    );
}