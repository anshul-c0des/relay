import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setTyping = mutation({   // mutation - toggles typing
  args: { conversationId: v.id("conversations"), userId: v.id("users") },
  handler: async (ctx, { conversationId, userId }) => {
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversation_user", (q) =>   // looks up for specific conversation
        q.eq("conversationId", conversationId).eq("userId", userId)
      )
      .unique();

    if (existing) {   // if convo exists, update lastTyped
      await ctx.db.patch(existing._id, { lastTyped: Date.now() });
      return;
    }

    await ctx.db.insert("typing", {   // create new conversation
      conversationId,
      userId,
      lastTyped: Date.now(),
    });
  },
});

export const getTypingUsers = query({   // query - fetches users currently typing
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, { conversationId, currentUserId }) => {
    const all = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversationId)
      )
      .collect();

    const now = Date.now();   // Only return users typing in the last 2s
    const recent = all.filter(   // filter out current user
      (t) => now - t.lastTyped < 2000 && t.userId !== currentUserId
    );

    const userIds = recent.map((t) => t.userId);
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));

    return users.filter(Boolean).map((u) => ({ _id: u?._id, name: u?.name }));
  },
});
