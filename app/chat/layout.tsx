"use client";

import { SidebarContent } from "@/components/chat/SidebarContent";
import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const updateLastSeen = useMutation(api.users.updateLastSeen);

  useEffect(() => {
    const handleViewportChange = () => {
      if (!window.visualViewport || !containerRef.current) return;

      const vvHeight = window.visualViewport.height;
      containerRef.current.style.height = `${vvHeight}px`;

      window.scrollTo(0, 0);
    };

    const v = window.visualViewport;
    if (v) {
      v.addEventListener("resize", handleViewportChange);
      v.addEventListener("scroll", handleViewportChange);
      handleViewportChange();
    }

    return () => {
      if (v) {
        v.removeEventListener("resize", handleViewportChange);
        v.removeEventListener("scroll", handleViewportChange);
      }
    };
  }, []);

  // --- Presence Heartbeat ---
  useEffect(() => {
    if (!currentUser?._id) return;
    let isMounted = true;
    const sendHeartbeat = () => {
      if (!isMounted) return;
      updateLastSeen({ userId: currentUser._id });
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser?._id, updateLastSeen]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col md:flex-row bg-background overflow-hidden"
    >
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-80 md:border-r md:flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {children}
      </main>
    </div>
  );
}