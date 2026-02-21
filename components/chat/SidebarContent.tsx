"use client";

import { useState } from "react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarContent() {
  const { user } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const users = useQuery(
    api.users.getUsers,
    user ? { clerkId: user.id, search } : "skip"
  );

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const createConversation = useMutation(
    api.conversations.createOrGetConversation
  );

  if (!users || !currentUser) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4">
        <h1 className="text-lg font-semibold">Chats</h1>
        <SignOutButton>
          <button className="text-gray-600 bg-red-300 underline">
            Log out
          </button>
        </SignOutButton>
      </div>

      {/* Search */}
      <div className="p-4">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {users.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center mt-10">
            No users found.
          </div>
        ) : (
          users.map((u) => (
            <button
              key={u._id}
              onClick={async () => {
                const conversationId = await createConversation({
                  userId1: currentUser._id,
                  userId2: u._id,
                });

                router.push(`/chat/${conversationId}`);
              }}
              className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted transition"
            >
              <img
                src={u.imageUrl}
                className="h-10 w-10 rounded-full"
                alt={u.name}
              />
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">
                  {u.email}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}