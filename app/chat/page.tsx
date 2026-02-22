"use client";

import { SidebarContent } from "@/components/chat/SidebarContent";
import { MessageSquarePlus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatPage() {
  return (
    <div className="h-full flex bg-background">
      {/* Mobile: Full-width Sidebar */}
      <div className="md:hidden w-full">
        <SidebarContent />
      </div>

      {/* Desktop: Premium Empty State */}
      <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_15%)] opacity-[0.03]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center max-w-sm px-6"
        >
          {/* Icon Composition */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-card border border-white/5 p-6 rounded-3xl shadow-2xl">
              <MessageSquarePlus className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </div>
            <motion.div 
              animate={{ 
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5] 
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-2 -right-2 text-primary"
            >
              <Sparkles size={20} />
            </motion.div>
          </div>

          {/* Text Content */}
          <h2 className="text-2xl font-bold tracking-tight text-primary mb-2">
            Your Inbox
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select a conversation from the sidebar to start messaging, 
            or search for a new contact to initiate a relay.
          </p>

          {/* Quick Action Suggestion (Optional) */}
          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold">
              Secure • Encrypted • Instant
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}