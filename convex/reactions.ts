import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleReaction = mutation({   // mutation - toggle reaction on message
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, { messageId, userId, emoji }) => {
    
    const existing = await ctx.db   // Check if reaction exists
      .query("messageReactions")
      .withIndex("by_user_message", (q) =>
        q.eq("userId", userId).eq("messageId", messageId)
      )
      .unique();

    if (existing && existing.emoji === emoji) {   // Remove if already exists
      await ctx.db.delete(existing._id);
      return { action: "removed" };
    }

    if (existing) {
      await ctx.db.patch(existing._id, { emoji });   // Update to new emoji
      return { action: "updated" };
    }

    // Otherwise, insert
    await ctx.db.insert("messageReactions", { messageId, userId, emoji });
    return { action: "added" };
  },
});

export const getMessageReactions = query({   // query - get reactions on a message
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const messages = await ctx.db   // fetch message
      .query("messages")
      .withIndex("by_conversation_createdAt", (q) =>
        q.eq("conversationId", conversationId)
      )
      .collect();

    const result: Record<string, { emoji: string; count: number }[]> = {};   // temp obj

    for (const msg of messages) {
      const reactions = await ctx.db
        .query("messageReactions")
        .withIndex("by_message", (q) => q.eq("messageId", msg._id))
        .collect();

      // Group by emoji and count them
      const grouped: Record<string, number> = {};
      reactions.forEach((r) => {
        grouped[r.emoji] = (grouped[r.emoji] || 0) + 1;
      });

      result[msg._id] = Object.entries(grouped).map(([emoji, count]) => ({
        emoji,
        count,
      }));
    }

    return result;
  },
});
