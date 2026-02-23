"use client";

import { useState, useEffect, useMemo } from "react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimestamp } from "@/lib/timeStamps";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LogOut, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Doc } from "@/convex/_generated/dataModel";
import { DarkModeToggle } from "../DarkModeToggle";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export function SidebarContent() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);

  // Use local state for instant highlighting, fallback to pathname on mount
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    pathname.split("/")[2]
  );

  // Convex Queries
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );
  const users = useQuery(
    api.users.getUsers,
    user ? { clerkId: user.id, search: debouncedSearch } : "skip"
  );
  const conversations = useQuery(
    api.conversations.getUserConversations,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const unreadCounts =
    useQuery(
      api.messages.getUnreadCounts,
      currentUser ? { userId: currentUser._id } : "skip"
    ) ?? {};

  const createConversation = useMutation(
    api.conversations.createOrGetConversation
  );

  const sortedUsers = useMemo(() => {
    if (!users || !conversations || !currentUser) return [];

    const activeChatUserIds = conversations.map((conv) =>
      conv.participants.find((id) => id !== currentUser._id)
    );

    const activeUsers = activeChatUserIds
      .map((id) => users.find((u) => u._id === id))
      .filter((u): u is Doc<"users"> => !!u)
      .sort((a, b) => {
        const convIdA = `${[currentUser._id, a._id].sort().join("_")}`;
        const convIdB = `${[currentUser._id, b._id].sort().join("_")}`;

        const unreadA = unreadCounts[convIdA] ?? 0;
        const unreadB = unreadCounts[convIdB] ?? 0;
        if (unreadA > 0 && unreadB === 0) return -1;
        if (unreadB > 0 && unreadA === 0) return 1;

        return 0;
      });

    // 3. Everyone else (filter out self and active chats)
    const otherUsers = users.filter(
      (u) => !activeChatUserIds.includes(u._id) && u._id !== currentUser._id
    );

    return [...activeUsers, ...otherUsers];
  }, [users, conversations, currentUser, unreadCounts]); // Added unreadCounts as dependency

  const isLoading = !clerkLoaded || currentUser === undefined;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-card/50 p-6 space-y-6 border-r border-border/50">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-24 bg-primary/10" />
          <Skeleton className="h-10 w-10 rounded-full bg-primary/5" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl bg-primary/5" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              className="h-20 w-full rounded-2xl bg-primary/5"
            />
          ))}
        </div>
      </div>
    );
  }

  const isOnline = (u: Doc<"users">) =>
    u.lastSeen ? Date.now() - u.lastSeen < 2000 : false;
  const isSearching = search !== debouncedSearch;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full bg-card/50 backdrop-blur-xl border-r border-border/50"
    >
      {/* --- HEADER --- */}
      <header className="p-6 flex justify-between items-center bg-background/20">
        <h1 className="text-3xl font-bold tracking-tight text-primary text-heading">
          Relay
        </h1>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative outline-none group">
            <div className="h-10 w-10 rounded-full border-2 border-primary/20 p-0.5 group-hover:border-primary/50 transition-all">
              <img
                src={user?.imageUrl}
                alt="Profile"
                className="h-full w-full rounded-full object-cover cursor-pointer"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 mt-2 border-border/50 bg-card/95 backdrop-blur-lg"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-heading">
                  Hi, {user?.firstName} 👋
                </p>
                <p className="text-xs text-subheading truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />

            <DropdownMenuItem asChild>
              <div className="flex items-center w-full px-3 justify-between">
                <p>Theme:</p>
                <DarkModeToggle />
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border/50" />

            <SignOutButton>
              <DropdownMenuItem className="gap-2 text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer font-medium">
                <LogOut className="h-4 w-4" /> Log out from Relay
              </DropdownMenuItem>
            </SignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* --- SEARCH --- */}
      <div className="px-6 pb-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subheading group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-background/40 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary/50 rounded-xl transition-all"
          />
          {search.trim() &&
          <Button className="h-8 w-8 absolute right-1 top-1/2 -translate-y-1/2 bg-transparent hover:bg-primary/10 rounded-full" onClick={()=>setSearch("")}><X className="w-3 h-3 text-primary" /></Button>
          }
        </div>
      </div>

      {/* --- USER LIST --- */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {isSearching ? (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-medium text-center py-10 text-primary animate-pulse"
            >
              Searching the relay...
            </motion.div>
          ) : users?.length === 0 ? (
            <motion.div
              key="searched"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-18 text-center px-4"
            >
              <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-subheading/50" />
              </div>
              <p className="text-sm font-medium text-subheading">
                No users found
              </p>
              <p className="text-xs text-subheading/60">
                Try a different name or email
              </p>
            </motion.div>
          ) : (
            sortedUsers?.map((u, index) => {
              const convId = currentUser
                ? `${[currentUser._id, u._id].sort().join("_")}`
                : null;
              const unreadCount = convId ? (unreadCounts[convId] ?? 0) : 0;
              const online = isOnline(u);

              const conversation = conversations?.find((conv) =>
                conv.participants.includes(u._id)
              );

              const isSelected =
                conversation && conversation?._id === selectedConvId;

              return (
                <motion.button
                  layout
                  key={u._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={async () => {
                    if (!currentUser) {
                      console.error("No current user found");
                      return;
                    }

                    try {
                      const id = await createConversation({
                        userId1: currentUser._id,
                        userId2: u._id,
                      });

                      setSelectedConvId(id);
                      router.push(`/chat/${id}`);
                    } catch (error) {
                      console.error("Error creating conversation:", error);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all relative border border-transparent group cursor-pointer",
                    isSelected
                      ? "bg-primary/15 border-primary/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                      : "hover:bg-primary/5 hover:border-primary/10"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={u.imageUrl}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                      alt={u.name}
                    />
                    {online && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-card shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.25">
                      <p
                        className={cn(
                          "font-semibold truncate transition-colors",
                          isSelected
                            ? "text-primary"
                            : "text-heading group-hover:text-primary"
                        )}
                      >
                        {u.name}
                      </p>

                      {online && (
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                          Online
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-xs truncate transition-all",
                        unreadCount > 0
                          ? "font-semibold text-heading"
                          : "text-subheading"
                      )}
                    >
                      {conversation?.lastMessageSenderId === currentUser?._id
                        ? "You: "
                        : ""}
                      {conversation?.lastMessagePreview ??
                        "Start a conversation"}
                    </p>
                    {!online && (
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {u.lastSeen
                          ? "Last seen " + formatTimestamp(u.lastSeen)
                          : "Offline"}
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <div className="flex-shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <span className="text-[10px] font-bold text-white leading-none">
                        {unreadCount}
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
