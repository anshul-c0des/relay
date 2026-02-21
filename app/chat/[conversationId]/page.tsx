"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { formatTimestamp } from "@/lib/timeStamps";

export default function ConversationPage() {
  const { user } = useUser();
  const params = useParams();
  const conversationId = params.conversationId as Id<"conversations">;
  const router = useRouter();

  const [message, setMessage] = useState("");

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  );

  const sendMessage = useMutation(api.messages.sendMessage);

  if (!currentUser || !messages) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Mobile Header */}
      <div className="md:hidden border-b p-4 flex items-center gap-2">
        <button
          onClick={() => router.push("/chat")}
          className="text-sm font-medium"
        >
          ← Back
        </button>
        <span className="font-semibold">Conversation</span>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUser._id;

          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                  isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {msg.content}
              </div>

              <span className="mt-1 text-xs text-muted-foreground">
                {formatTimestamp(msg._creationTime)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button
          onClick={async () => {
            if (!message.trim()) return;

            await sendMessage({
              conversationId,
              senderId: currentUser._id,
              content: message,
            });

            setMessage("");
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
