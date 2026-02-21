"use client";

import { useState } from "react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function ChatPage() {
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
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-4">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SignOutButton>
      <button className="text-gray-600 underline">
        Click here to log out
      </button>
    </SignOutButton>
      </div>

      <div className="space-y-2">
        {users.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No users found.
          </p>
        )}

        {users.map((u) => (
          <button
            key={u._id}
            onClick={async () => {
              const conversationId = await createConversation({
                userId1: currentUser._id,
                userId2: u._id,
              });

              router.push(`/chat/${conversationId}`);
            }}
            className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted"
          >
            <img
              src={u.imageUrl}
              className="h-10 w-10 rounded-full"
            />
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-muted-foreground">
                {u.email}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}