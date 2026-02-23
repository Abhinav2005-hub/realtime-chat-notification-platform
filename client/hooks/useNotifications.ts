import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const useNotifications = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            const data = await api("/notifications/unread");
            setCount(data.count);
        };

        fetchCount();
    }, []);

    return { count, setCount };
};