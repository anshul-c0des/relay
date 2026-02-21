import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrGetConversation = mutation({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  async handler(ctx, args) {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_participants", (q) =>
        q.eq("participants", [args.userId1, args.userId2])
      )
      .collect();

    if (conversations.length > 0) {
      return conversations[0]._id;
    }

    const participants = [args.userId1, args.userId2].sort();

    return await ctx.db.insert("conversations", {
      participants,
      isGroup: false,
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
