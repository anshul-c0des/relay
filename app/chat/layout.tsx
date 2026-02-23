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
  const { user } = useUser();   // fetch user from clerk
  const containerRef = useRef<HTMLDivElement>(null);   // refrence to the main wrapper

  // Convex

  const currentUser = useQuery(   // fetch current user from convex
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );
  const updateLastSeen = useMutation(api.users.updateLastSeen);   // update last seen of current user

  // Side effects

  useEffect(() => {   // handles keyboard layout behavior for smalll devices
    const handleViewportChange = () => {
      if (!window.visualViewport || !containerRef.current) return;

      const vvHeight = window.visualViewport.height;   // calculate actual visible height
      containerRef.current.style.height = `${vvHeight}px`;

      window.scrollTo(0, 0);   // forces to bottom, prevent layout shift
    };

    const v = window.visualViewport;
    if (v) {   // listens to keyboard opening or scrolling
      v.addEventListener("resize", handleViewportChange);
      v.addEventListener("scroll", handleViewportChange);
      handleViewportChange();   // runs on mount to set initial height
    }

    return () => {   // cleanup listeners
      if (v) {
        v.removeEventListener("resize", handleViewportChange);
        v.removeEventListener("scroll", handleViewportChange);
      }
    };
  }, []);

  // --- Presence Heartbeat ---
  useEffect(() => {   // sends a ping every 5sec to update last seen
    if (!currentUser?._id) return;
    let isMounted = true;
    const sendHeartbeat = () => {   // updates last seen
      if (!isMounted) return;
      updateLastSeen({ userId: currentUser._id });
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 5000);   // 5sec interval
    return () => {   // cleanup
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
      <main className="flex-1 flex flex-col min-h-0 relative">{children}</main>
    </div>
  );
}
