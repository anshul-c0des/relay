"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { formatTimestamp } from "@/lib/timeStamps";
import { useDebouncedCallback } from "use-debounce";

export default function ConversationPage() {
  const { user } = useUser();
  const params = useParams();
  const conversationId = params.conversationId as Id<"conversations">;
  const router = useRouter();
  const markRead = useMutation(api.messages.markRead);

  const [message, setMessage] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  );

  const reactions =
    useQuery(
      api.reactions.getMessageReactions,
      conversationId ? { conversationId } : "skip"
    ) ?? {};

  const toggleReaction = useMutation(api.reactions.toggleReaction);

  const sendMessage = useMutation(api.messages.sendMessage);
  const sendTyping = useMutation(api.typing.setTyping);

  const debouncedTyping = useDebouncedCallback(() => {
    if (!currentUser) return;
    sendTyping({ conversationId, userId: currentUser._id });
  }, 300);

  const typingUsers =
    useQuery(
      api.typing.getTypingUsers,
      currentUser && conversationId
        ? {
            conversationId,
            currentUserId: currentUser._id,
          }
        : "skip"
    ) ?? [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
    setHasNewMessages(false);
  };

  // Track scroll position
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 50); // 50px tolerance
  };

  useEffect(() => {
    if (!messages || !messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;
    setIsAtBottom(atBottom);

    if (atBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasNewMessages(false);
    } else {
      setHasNewMessages(true);
    }
  }, [messages]);

  useEffect(() => {
    if (!currentUser || !messages) return;

    // Only mark read the latest messages when viewing
    markRead({ conversationId, userId: currentUser._id });
  }, [messages, currentUser, conversationId, markRead]);

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
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 relative"
      >
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUser._id;

          // Get reactions for this message
          const msgReactions = reactions[msg._id.toString()] ?? [];

          return (
            <div
              key={msg._id}
              className={`flex flex-col relative ${isOwn ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[75%] group rounded-lg px-4 py-2 text-sm relative ${
                  isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {msg.content}

                {/* Reactions (hover) */}
                <div
                  className={`absolute top-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 ${
                    isOwn ? "right-full mr-2" : "left-full ml-2"
                  }`}
                >
                  {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => {
                    const hasReacted = msgReactions.find(
                      (r) => r.emoji === emoji
                    );
                    return (
                      <button
                        key={emoji}
                        className={`text-sm px-1 rounded ${
                          hasReacted ? "bg-gray-300" : "bg-white"
                        }`}
                        onClick={() =>
                          toggleReaction({
                            messageId: msg._id,
                            userId: currentUser._id,
                            emoji,
                          })
                        }
                      >
                        {emoji} {hasReacted?.count || ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Existing reactions */}
              {msgReactions.length > 0 && (
                <div
                  className={`flex space-x-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  {msgReactions.map((r) => (
                    <span
                      key={r.emoji}
                      className="text-xs px-1 rounded bg-gray-200"
                    >
                      {r.emoji} {r.count}
                    </span>
                  ))}
                </div>
              )}

              <span className="mt-1 text-xs text-muted-foreground">
                {formatTimestamp(msg._creationTime)}
              </span>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* New messages button */}
      {!isAtBottom &&
        (hasNewMessages ? (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-md z-10"
          >
            ↓ New messages
          </button>
        ) : (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-gray-200 text-white px-4 py-2 rounded-full shadow-md z-10"
          >
            ↓
          </button>
        ))}

      {typingUsers.length > 0 && (
        <p className="text-xs text-muted-foreground px-4">
          {typingUsers.map((u) => u.name).join(", ")} is typing…
        </p>
      )}

      {/* Input */}
      <div className="border-t p-4 flex gap-2">
        <Input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            debouncedTyping();
          }}
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
