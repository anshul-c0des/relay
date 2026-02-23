import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({   // user schema - indexed by clerkId, name, and email for searching
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    lastSeen: v.number(),   // online/offline presence
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_name", ["name"]),

  conversations: defineTable({   // conversations schema - indexed by conversation key to track
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),   // is group conversation
    conversationKey: v.string(),
    lastMessageAt: v.number(),
    lastMessagePreview: v.optional(v.string()),   // track last message for preview in sidebar
    lastMessageSenderId: v.optional(v.id("users")),
  }).index("by_conversationKey", ["conversationKey"]),

  messages: defineTable({   // message schema - indexed by conversation and timestamp
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    isDeleted: v.boolean(),   // flag to track delete message (soft delete)
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_createdAt", ["conversationId", "createdAt"]),

  typing: defineTable({   // typing schema - indexed by conversation and typing user
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastTyped: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  messageReads: defineTable({   // message schema - indexed by conversation and user
    userId: v.id("users"),
    conversationId: v.id("conversations"),
    lastReadMessage: v.id("messages"),
  })
    .index("by_user_conversation", ["userId", "conversationId"])
    .index("by_conversation", ["conversationId"]),

  messageReactions: defineTable({   // reactions schema - indexed by message and user's message
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_user_message", ["userId", "messageId"]),
});
