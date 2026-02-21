"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ChatPage() {
  const { user } = useUser();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <UserButton />
      <h1 className="text-xl font-semibold">
        Welcome {currentUser?.name}
      </h1>
    </main>
  );
}