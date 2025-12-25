"use client"

import { useAuth } from "@/context/AuthContext";

export default function ChatPage() {
    const { user, logout } = useAuth();

    if(!user) return <p>Unauthorized</p>

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold">
                Welcome, {user.email}
            </h1>

            <button
              onClick = {logout}
              className="mt-4 bg-red-600 text-white px-4 py-2"
            >
                Logout
            </button>
        </div>
    );
}