"use client";

import { SidebarContent } from "@/components/chat/SidebarContent";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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