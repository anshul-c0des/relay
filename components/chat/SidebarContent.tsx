"use client";

import { useState } from "react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimestamp } from "@/lib/timeStamps";

export function SidebarContent() {
  const { user } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Fetch all other users
  const users = useQuery(
    api.users.getUsers,
    user ? { clerkId: user.id, search } : "skip"
  ) ?? [];

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  // Create or get conversation
  const createConversation = useMutation(
    api.conversations.createOrGetConversation
  );

  // Fetch unread counts (returns { [conversationId]: number })
  const unreadCounts = useQuery(
    api.messages.getUnreadCounts,
    currentUser ? { userId: currentUser._id } : "skip"
  ) ?? {};

  if (!users || !currentUser) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  // Simple online check
  const isOnline = (u: typeof users[number]) =>
    u.lastSeen ? Date.now() - u.lastSeen < 2000 : false; 

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
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
          users.map((u) => {
            // get the conversation ID for this user
            const convId = currentUser ? `${[currentUser._id, u._id].sort().join("_")}` : null;
            const unreadCount = convId ? unreadCounts[convId] ?? 0 : 0;
            // Get conversation ID dynamically on click
            const handleClick = async () => {
              const conversationId = await createConversation({
                userId1: currentUser._id,
                userId2: u._id,
              });
              router.push(`/chat/${conversationId}`);
            };

            return (
              <button
                key={u._id}
                onClick={handleClick}
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted transition relative"
              >
                <img
                  src={u.imageUrl}
                  className="h-10 w-10 rounded-full"
                  alt={u.name}
                />
                <div className="flex-1">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>

                {/* Online indicator */}
                {isOnline(u) && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                )}

                {/* Last seen */}
                {!isOnline(u) && (
                  <p className="text-xs text-muted-foreground">
                    Last seen {formatTimestamp(u.lastSeen)}
                  </p>
                )}

                {/* Unread badge */}
                {unreadCount > 0 && (
  <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white">
    {unreadCount}
  </span>
)}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}