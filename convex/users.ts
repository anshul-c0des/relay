import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({   // mutation to verify user
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
  },
  async handler(ctx, args) {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {   // check whether user exists
      return existing._id;
    }

    return await ctx.db.insert("users", { ...args, lastSeen: Date.now() });   // create if new user
  },
});

export const getCurrentUser = query({   // query - fetch user document
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const getUsers = query({   // query - fetch all users or search users
  args: {
    clerkId: v.string(),
    search: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!currentUser) return [];   // validate current user

    const users = await ctx.db.query("users").collect();   // fetch all users

    return users
      .filter((u) => u._id !== currentUser._id)   // filter out current user
      .filter((u) =>   // serach by name or email
        args.search
          ? u.name.toLowerCase().includes(args.search.toLowerCase()) ||
            u.email.toLowerCase().includes(args.search.toLowerCase())
          : true
      );
  },
});

export const updateLastSeen = mutation({   // updates last seen of user
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, {
      lastSeen: Date.now(),
    });
  },
});
