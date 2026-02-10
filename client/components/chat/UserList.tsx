"use client";

import { useUsers } from "@/hooks/useUsers";

export default function UserList({
  onSelect,
}: {
  onSelect: (userId: string) => void;
}) {
  const { users, loading } = useUsers();

  return (
    <div className="border-b">
      <p className="p-2 font-semibold bg-gray-100">Users</p>

      {loading && <p className="p-2 text-sm text-gray-500">Loading...</p>}

      {!loading && users.length === 0 && (
        <p className="p-2 text-sm text-gray-500">No users found</p>
      )}

      <div className="max-h-48 overflow-y-auto">
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => onSelect(u.id)}
            className="p-3 border-t cursor-pointer hover:bg-gray-100"
          >
            <p className="font-medium text-sm">{u.name || "No Name"}</p>
            <p className="text-xs text-gray-500">{u.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
