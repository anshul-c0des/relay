"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { formatTimestamp } from "@/lib/timeStamps";
import { useDebouncedCallback } from "use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, SendHorizontal, Trash2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export default function ConversationPage() {
  const { user } = useUser();   // fetches user from clerk
  const params = useParams();
  const conversationId = params.conversationId as Id<"conversations">;   // extracts conversationId from params
  const router = useRouter();

  const [message, setMessage] = useState("");   // message state
  const [isAtBottom, setIsAtBottom] = useState(true);   // tracks whether at bottom for scroll
  const [hasNewMessages, setHasNewMessages] = useState(false);   // tracks whether new message arrived
  const [activeMessageId, setActiveMessageId] = useState<Id<"messages"> | null>(null);   // tracks active conversation

  const messagesEndRef = useRef<HTMLDivElement>(null);   // refrence to message ending
  const messagesContainerRef = useRef<HTMLDivElement>(null);   // refrence to message container

  // Convex Queries

  const currentUser = useQuery(   // fetches current user form convex
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );
  const messages = useQuery(   // fetches conversation messages
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  );
  const reactions = useQuery(   // fetches message reaction
    api.reactions.getMessageReactions,
    conversationId ? { conversationId } : "skip"
  ) ?? {};
  const conversation = useQuery(   // fetches specific conversation
    api.conversations.getConversationById,
    conversationId ? { conversationId } : "skip"
  );
  const usersResult = useQuery(   // fetches all users
    api.users.getUsers,
    currentUser
      ? { clerkId: currentUser.clerkId, search: undefined }
      : { clerkId: "" }
  ) ?? [];

  

  const otherUser = useMemo(() => {   // identifies other user from all users
    if (!conversation || !currentUser) return null;
    return usersResult.find(
      (u) =>
        conversation.participants.includes(u._id) && u._id !== currentUser._id
    );
  }, [conversation, currentUser, usersResult]);

  const isOnline = (lastSeen?: number) => lastSeen ? Date.now() - lastSeen < 3000 : false;   // online satus - 3sec interval

  const online = otherUser ? isOnline(otherUser.lastSeen) : false;   // calculates online status by lastSeen

  // Convex Mutations
  
  const markRead = useMutation(api.messages.markRead);   // marks messages as read
  const sendMessage = useMutation(api.messages.sendMessage);   // sends a new message
  const sendTyping = useMutation(api.typing.setTyping);   // typing status
  const toggleReaction = useMutation(api.reactions.toggleReaction);   // toggle reaction on a messsage
  const softDeleteMessage = useMutation(api.messages.softDeleteMessage);   // deletes a message

  const debouncedTyping = useDebouncedCallback(() => {   // debounced status for typing - 3ms
    if (!currentUser) return;
    sendTyping({ conversationId, userId: currentUser._id });
  }, 300);

  const typingUsers =   // fetches users who are typing
    useQuery(
      api.typing.getTypingUsers,
      currentUser && conversationId
        ? { conversationId, currentUserId: currentUser._id }
        : "skip"
    ) ?? [];

  const scrollToBottom = () => {   // scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
    setHasNewMessages(false);   // sets message as read
  };

  const handleScroll = () => {   // handles scroll operation
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 50);
  };

  useEffect(() => {   // scroll to bottom on opening a conversation
    if (!messages) return;
    if (isAtBottom) scrollToBottom();
    else setHasNewMessages(true);
  }, [messages]);

  useEffect(() => {   // marks all messages as read on opening a conversation
    if (!currentUser || !messages) return;
    markRead({ conversationId, userId: currentUser._id });
  }, [messages, currentUser, conversationId, markRead]);

  // LOADING STATE (Skeletons)
  if (!currentUser || !messages || !conversation) {
    return (
      <div className="flex flex-col h-full bg-card/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3 bg-background/80">
          <Skeleton className="h-10 w-10 rounded-full bg-primary/10 animate-pulse" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md bg-primary/5" />
            <Skeleton className="h-3 w-16 rounded-md bg-primary/5 opacity-80" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col gap-2",
                i % 2 === 0 ? "items-end" : "items-start"
              )}
            >
              <Skeleton
                className={cn(
                  "h-10 rounded-2xl bg-primary/5 animate-pulse",
                  i % 2 === 0
                    ? "w-[40%] rounded-tr-none"
                    : "w-[30%] rounded-tl-none"
                )}
              />
              <Skeleton className="h-2 w-12 rounded bg-primary/5 opacity-30" />
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-12 flex-1 rounded-2xl bg-primary/5" />
            <Skeleton className="h-12 w-12 rounded-2xl bg-muted/20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="z-10 flex items-center justify-between border-b shadow-sm border-white/5 bg-background/80 px-4 py-2 sm:py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/chat")}
            className="md:hidden h-6 w-6 text-muted-foreground bg-primary/10 rounded-full"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Button>
          <div className="relative">
            <img
              src={otherUser?.imageUrl}
              alt=""
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-primary/20"
            />
            {online && (
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
            )}{" "}
          </div>
          <div>
            <h2 className="text-sm sm:text-md mt-1 font-semibold text-primary leading-tight">
              {otherUser?.name ?? "Anonymous"}
            </h2>
            <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground mt-1">
              {typingUsers.length > 0 ? (
                <span className="text-primary animate-pulse italic">
                  typing...
                </span>
              ) : online ? (
                <span className="text-emerald-500 font-medium">Online</span>
              ) : otherUser?.lastSeen ? (
                <>Last seen {formatTimestamp(otherUser.lastSeen)}</>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>
      </header>

      {/* Message Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isOwn = msg.senderId === currentUser._id;
            const msgReactions = reactions[msg._id.toString()] ?? [];

            return (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={msg._id}
                onClick={() =>
                  setActiveMessageId((prev) =>
                    prev === msg._id ? null : msg._id
                  )
                }
                className={cn(
                  "group flex flex-col relative max-w-[85%] md:max-w-[70%] pb-6",
                  isOwn ? "ml-auto items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "relative flex items-center gap-2",
                    isOwn ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "relative rounded-2xl px-3 py-2.5 text-sm shadow-md transition-all duration-200",
                      isOwn
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-card border border-white/5 text-heading rounded-tl-none",
                      msg.isDeleted && "opacity-50 italic"
                    )}
                  >
                    {msg.isDeleted ? "This message was deleted" : msg.content}

                    {/* Reaction Display */}
                    {msgReactions.length > 0 && (
                      <div
                        className={cn(
                          "absolute -bottom-3 flex gap-1 rounded-full bg-muted border border-white/10 p-0.5 px-1.5 shadow-md",
                          isOwn ? "right-2" : "left-2"
                        )}
                      >
                        {msgReactions.map((r) => (
                          <span
                            key={r.emoji}
                            className="text-[10px] text-muted-foreground flex items-center gap-0.5"
                          >
                            {r.emoji}{" "}
                            <span className="font-bold">{r.count}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  {!msg.isDeleted && activeMessageId === msg._id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 bg-background/80 backdrop-blur-md border border-white/10 rounded-full px-2 p-1 shadow-xl"
                    >
                      {["👍", "👎", "❤️", "😂", "😢", "😯"].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReaction({
                              messageId: msg._id,
                              userId: currentUser._id,
                              emoji,
                            });
                            setActiveMessageId(null);
                          }}
                          className="p-0.5 rounded-full transition-colors cursor-pointer text-md hover:bg-muted/30"
                        >
                          {emoji}
                        </button>
                      ))}
                      {isOwn && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            softDeleteMessage({ messageId: msg._id });
                          }}
                          variant="ghost"
                          className="text-red-500 h-6 w-6 cursor-pointer hover:bg-red-100 rounded-full"
                        >
                          <Trash2 size={15} />
                        </Button>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Timestamp */}
                <span
                  className={cn(
                    "absolute bottom-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 px-1",
                    isOwn ? "right-0" : "left-0"
                  )}
                >
                  {formatTimestamp(msg._creationTime)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll Down Button */}
      <AnimatePresence>
        {!isAtBottom && hasNewMessages && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-primary px-4 py-2 rounded-full shadow-2xl z-20 text-white text-xs font-bold"
          >
            <ChevronDown size={16} strokeWidth={3} />
            NEW MESSAGES
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Section */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
        <div className="relative flex items-end gap-3 rounded-2xl border border-border/50 bg-background/70 backdrop-blur-md p-2 shadow-sm transition-all duration-300 focus-within:border-primary/40 focus-within:shadow-md">
          {/* Input */}
          <Textarea
            value={message}
            rows={1}
            onChange={(e) => {
              setMessage(e.target.value);
              debouncedTyping();
            }}
            onInput={(e) => {
              const target = e.currentTarget;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";
            }}
            placeholder="Relay a message..."
            className="flex-1 resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-32 text-sm leading-relaxed custom-scrollbar"
          />

          {/* Send Button */}
          <Button
            size="icon"
            disabled={!message.trim()}
            onClick={async () => {
              if (!message.trim()) return;

              const content = message;
              setMessage("");

              await sendMessage({
                conversationId,
                senderId: currentUser._id,
                content,
              });

              scrollToBottom();
            }}
            className={cn(
              "h-10 w-10 rounded-xl transition-all duration-300 shrink-0",
              message.trim()
                ? "bg-primary hover:scale-110 active:scale-105 shadow-md"
                : "bg-muted opacity-50"
            )}
          >
            <SendHorizontal size={18} strokeWidth={2.2} />
          </Button>
        </div>
      </div>
    </div>
  );
}
