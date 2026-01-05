"use client";

import { useUsers } from "@/hooks/useUsers";

export default function UserList({
    onSelect
}: {
    onSelect: (userId: string) => void;
}) {
    const { users } = useUsers();

    if (!Array.isArray(users)) {
        return <p className="p-3">Loading users...</p>
    }

    return (
        <div className="w-64 border-r">
            <p className="p-2 font-semibold">Users</p>

            {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => onSelect(u.id)}
                  className="p-3 cursor-pointer hover:bg-gray-100"
                >
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
            ))}
        </div>
    );
}