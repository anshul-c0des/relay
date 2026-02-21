import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    lastSeen: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_name", ["name"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    conversationKey: v.string(), 
  }).index("by_conversationKey", ["conversationKey"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"])
    .index("by_conversation_createdAt", ["conversationId", "createdAt"]),

  typing: defineTable({
      conversationId: v.id("conversations"),
      userId: v.id("users"),
      lastTyped: v.number(),
  }).index("by_conversation", ["conversationId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  messageReads: defineTable({
    userId: v.id("users"),
    conversationId: v.id("conversations"),
    lastReadMessage: v.id("messages"),
  })
    .index("by_user_conversation", ["userId", "conversationId"])
    .index("by_conversation", ["conversationId"]),

  messageReactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_user_message", ["userId", "messageId"])
});