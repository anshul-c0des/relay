import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
  },
  async handler(ctx, args) {
    return await ctx.db.insert("messages", {
      ...args,
      createdAt: Date.now(),
      isDeleted: false
    });
  },
});

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const markRead = mutation({
  args: { conversationId: v.id("conversations"), userId: v.id("users") },
  handler: async (ctx, { conversationId, userId }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", (q) =>
        q.eq("conversationId", conversationId)
      )
      .order("asc")
      .collect();

    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    const existing = await ctx.db
      .query("messageReads")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", conversationId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastReadMessage: lastMessage._id });
    } else {
      await ctx.db.insert("messageReads", {
        userId,
        conversationId,
        lastReadMessage: lastMessage._id,
      });
    }
  },
});

export const getUnreadCounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const reads = await ctx.db
      .query("messageReads")
      .withIndex("by_user_conversation", (q) => q.eq("userId", userId))
      .collect();

    const conversations = await ctx.db.query("conversations").collect();

    const result: Record<string, number> = {};

    for (const conv of conversations) {
      const lastRead = reads.find(
        (r) => r.conversationId === conv._id
      )?.lastReadMessage;
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation_createdAt", (q) =>
          q.eq("conversationId", conv._id)
        )
        .order("asc")
        .collect();

      const unreadCount = messages.filter(
        (m) =>
          m.senderId !== userId &&
          (!lastRead ||
            m.createdAt >
              messages.find((msg) => msg._id === lastRead)?.createdAt!)
      ).length;

      result[conv.conversationKey] = unreadCount;
    }

    return result;
  },
});

export const softDeleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async ({ db }, { messageId }) => {
    await db.patch(messageId, { isDeleted: true });
  },
});