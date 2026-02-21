import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setTyping = mutation({
  args: { conversationId: v.id("conversations"), userId: v.id("users") },
  handler: async (ctx, { conversationId, userId }) => {
    // Upsert or insert a typing record
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversation_user", (q) => q.eq("conversationId", conversationId).eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastTyped: Date.now() });
      return;
    }

    await ctx.db.insert("typing", { conversationId, userId, lastTyped: Date.now() });
  },
});

export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, { conversationId, currentUserId }) => {
    const all = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .collect();

    // Only return users typing in the last 2s
    const now = Date.now();
    const recent =  all.filter((t) => now - t.lastTyped < 2000 &&
    t.userId !== currentUserId);

    const userIds = recent.map((t) => t.userId);
    const users = await Promise.all(
      userIds.map((id) => ctx.db.get(id))
    );

    return users.filter(Boolean).map((u) => ({ _id: u?._id, name: u?.name }));
  },
});