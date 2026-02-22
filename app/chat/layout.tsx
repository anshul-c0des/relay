"use client";

import { SidebarContent } from "@/components/chat/SidebarContent";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user } = useUser();

const currentUser = useQuery(
  api.users.getCurrentUser,
  user ? { clerkId: user.id } : "skip"
);

const updateLastSeen = useMutation(api.users.updateLastSeen);

useEffect(() => {
  if (!currentUser?._id) return;

  let isMounted = true;

  const sendHeartbeat = () => {
    if (!isMounted) return;
    updateLastSeen({ userId: currentUser._id });
  };

  // initial
  sendHeartbeat();

  const interval = setInterval(sendHeartbeat, 2000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, [currentUser?._id, updateLastSeen]);


  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-80 md:border-r md:flex-col">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full flex flex-col">
        {children}
      </main>
    </div>
  );
}