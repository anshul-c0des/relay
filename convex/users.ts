import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
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

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", args);
  },
});

export const getCurrentUser = query({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const getUsers = query({
  args: {
    clerkId: v.string(),
    search: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!currentUser) return [];

    const users = await ctx.db.query("users").collect();

    return users
      .filter((u) => u._id !== currentUser._id)
      .filter((u) =>
        args.search
          ? u.name.toLowerCase().includes(args.search.toLowerCase())
          : true
      );
  },
});