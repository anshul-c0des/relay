import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({   // mutation - creates a new message
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
  },
  async handler(ctx, args) {
    const messageId = await ctx.db.insert("messages", {
      ...args,
      createdAt: Date.now(),
      isDeleted: false,
    });

    await ctx.db.patch(args.conversationId, {   // adds last message details in conversation
      lastMessageAt: Date.now(),
      lastMessagePreview:
        args.content.length > 60
          ? args.content.slice(0, 60) + "..."
          : args.content,
      lastMessageSenderId: args.senderId,
    });

    return messageId;
  },
});

export const getMessages = query({   // query - get messages
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

export const markRead = mutation({   // mutation - marks messages as read
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

    const lastMessage = messages[messages.length - 1];   // extracts last message

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

export const getUnreadCounts = query({   // query - gets unread messages count
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const reads = await ctx.db   // fetches last read message for each user
      .query("messageReads")
      .withIndex("by_user_conversation", (q) => q.eq("userId", userId))
      .collect();

    const conversations = await ctx.db.query("conversations").collect();   // fetches conversations

    const result: Record<string, number> = {};

    for (const conv of conversations) {   // iterate conversation
      const lastRead = reads.find(   // find last read pointer from reads
        (r) => r.conversationId === conv._id
      )?.lastReadMessage;
      const messages = await ctx.db   // fetches message history
        .query("messages")
        .withIndex("by_conversation_createdAt", (q) =>
          q.eq("conversationId", conv._id)
        )
        .order("asc")
        .collect();

      const unreadCount = messages.filter(   // counts new messages
        (m) =>
          m.senderId !== userId &&   // only count messages sent by other users
          (!lastRead ||   // if chat is not opened, then unread OR last message is created after my last read
            m.createdAt >
              messages.find((msg) => msg._id === lastRead)?.createdAt!)
      ).length;

      result[conv.conversationKey] = unreadCount;
    }

    return result;
  },
});

export const softDeleteMessage = mutation({   // mutation - soft deletes the message
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, { messageId }) => {
    const message = await ctx.db.get(messageId);   // fetches the message
    if (!message) return;

    await ctx.db.patch(messageId, { isDeleted: true });   // set isDeleted flag

    const conversation = await ctx.db.get(message.conversationId);   // finds the related conversation

    if (conversation && message.createdAt === conversation.lastMessageAt) {   // if it is last message
      await ctx.db.patch(message.conversationId, {
        lastMessagePreview: "del_mes",   // set preview to del_mes
      });
    }
  },
});
