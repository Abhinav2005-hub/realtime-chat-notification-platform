import NotificationBadge from "../ui/NotificationBadge";
import { useNotifications } from "@/hooks/useNotifications";

export default function ChatHeader() {
    const { count } = useNotifications();

    return (
        <div className="flex justify-between items-center p-3 border-b">
            <h2 className="font-bold">Chat</h2>
            <NotificationBadge count = {count} />
        </div>
    );
}