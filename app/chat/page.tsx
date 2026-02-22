"use client";

import { SidebarContent } from "@/components/chat/SidebarContent";

export default function ChatPage() {
  return (
    <div className="h-full flex">
      {/* Mobile: show sidebar */}
      <div className="md:hidden w-full">
        <SidebarContent />
      </div>

      {/* Desktop: show empty state */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-muted/30">
        <div className="text-center space-y-3">
          <div className="text-4xl">💬</div>
          <h2 className="text-xl font-semibold">
            Select a conversation
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose a user from the sidebar to start chatting.
          </p>
        </div>
      </div>
    </div>
  );
}