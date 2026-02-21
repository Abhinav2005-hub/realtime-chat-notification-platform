"use client";

import { useUsers } from "@/hooks/useUsers";

interface UserListProps {
  onSelect: (userId: string) => void;
  multiSelect?: boolean;
  selectedUsers?: string[];
}

export default function UserList({
  onSelect,
  multiSelect = false,
  selectedUsers = [],
}: UserListProps) {
  const { users, loading } = useUsers();

  return (
    <div className="border-b">
      <p className="p-2 font-semibold bg-gray-100">Users</p>

      {loading && (
        <p className="p-2 text-sm text-gray-500">Loading...</p>
      )}

      {!loading && users.length === 0 && (
        <p className="p-2 text-sm text-gray-500">No users found</p>
      )}

      <div className="max-h-48 overflow-y-auto">
        {users.map((u) => {
          const isSelected = selectedUsers.includes(u.id);

          return (
            <div
              key={u.id}
              onClick={() => onSelect(u.id)}
              className={`p-3 border-t cursor-pointer flex justify-between items-center
                ${isSelected ? "bg-blue-100" : "hover:bg-gray-100"}
              `}
            >
              <div>
                <p className="font-medium text-sm">
                  {u.name || "No Name"}
                </p>
                <p className="text-xs text-gray-500">
                  {u.email}
                </p>
              </div>

              {multiSelect && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}