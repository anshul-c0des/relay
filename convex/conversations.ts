import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrGetConversation = mutation({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  async handler(ctx, args) {
    const existing = await ctx.db
      .query("conversations")
      .collect();

    const found = existing.find((conv) =>
      conv.participants.length === 2 &&
      conv.participants.includes(args.userId1) &&
      conv.participants.includes(args.userId2)
    );

    if (found) return found._id;

    return await ctx.db.insert("conversations", {
      participants: [args.userId1, args.userId2],
      isGroup: false,
    });
  },
});

export const getUserConversations = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const conversations = await ctx.db
      .query("conversations")
      .collect();

    return conversations.filter((conv) =>
      conv.participants.includes(args.userId)
    );
  },
});