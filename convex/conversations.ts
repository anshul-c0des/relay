import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrGetConversation = mutation({   // mutation - creates or gets conversaion
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  async handler(ctx, { userId1, userId2 }) {
    const sorted = [userId1, userId2].sort();   // sorted userId array
    const conversationKey = `${sorted[0]}_${sorted[1]}`;   // conversation key for unique identification

    const existing = await ctx.db   // return if exists
      .query("conversations")
      .withIndex("by_conversationKey", (q) =>
        q.eq("conversationKey", conversationKey)
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {   // esle create new
      participants: sorted,
      isGroup: false,
      conversationKey,
      lastMessageAt: Date.now(),
    });
  },
});

export const getUserConversations = query({   // query - fetches conversations of a user
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const conversations = await ctx.db.query("conversations").collect();

    return conversations
      .filter((conv) => conv.participants.includes(args.userId))
      .sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
  },
});

export const getConversationById = query({   // query - fetches a specific conversation by Id
  args: { conversationId: v.id("conversations") },
  async handler(ctx, { conversationId }) {
    return await ctx.db.get(conversationId);
  },
});
