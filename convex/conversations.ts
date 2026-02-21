import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrGetConversation = mutation({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  async handler(ctx, {userId1, userId2}) {
    const sorted = [userId1, userId2].sort();
    const conversationKey = `${sorted[0]}_${sorted[1]}`;

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_conversationKey", (q) =>
        q.eq("conversationKey", conversationKey)
      )
      .unique();

      if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      participants: sorted,
      isGroup: false,
      conversationKey,
    });
  },
});

export const getUserConversations = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const conversations = await ctx.db.query("conversations").collect();

    return conversations.filter((conv) =>
      conv.participants.includes(args.userId)
    );
  },
});
