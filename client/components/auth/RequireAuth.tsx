"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && !user) {
      const currentPath = window.location.pathname;
  
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthReady, user, router]);

  if (!isAuthReady || loading) {
    return <p className="p-4">Loading...</p>;
  }

  if (!user) return null;

  return <>{children}</>;
}
