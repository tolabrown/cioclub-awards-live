import { db } from "$lib/db";
import { communityPost, communityReply, communityLike, user } from "$lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const posts = await db.query.communityPost.findMany({
    with: {
      author: true,
      replies: {
        with: {
          author: true
        }
      },
      likes: true
    },
    orderBy: [desc(communityPost.createdAt)],
    limit: 50
  });

  return {
    posts,
    user: locals.user
  };
};

export const actions: Actions = {
  createPost: async ({ request, locals }) => {
    const { session, user } = locals;
    if (!session || !user) return fail(401, { message: "Unauthorized" });

    // Check if user is a paid member
    const paidRoles = ["admin", "editor", "member_individual", "member_corporate", "executive", "sponsor", "partner"];
    if (!paidRoles.includes(user.role || "")) {
      return fail(403, { message: "Only paid members can post in the community." });
    }

    const formData = await request.formData();
    const content = formData.get("content") as string;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;

    if (!content) return fail(400, { message: "Content is required" });

    try {
      await db.insert(communityPost).values({
        userId: user.id,
        content,
        title,
        category: category || "general",
      });
      return { success: true };
    } catch (e) {
      console.error(e);
      return fail(500, { message: "Failed to create post" });
    }
  },

  createReply: async ({ request, locals }) => {
    const { session, user } = locals;
    if (!session || !user) return fail(401, { message: "Unauthorized" });

    const paidRoles = ["admin", "editor", "member_individual", "member_corporate", "executive", "sponsor", "partner"];
    if (!paidRoles.includes(user.role || "")) {
      return fail(403, { message: "Only paid members can interact in the community." });
    }

    const formData = await request.formData();
    const postId = formData.get("postId") as string;
    const content = formData.get("content") as string;

    if (!postId || !content) return fail(400, { message: "Missing required fields" });

    try {
      await db.insert(communityReply).values({
        postId,
        userId: user.id,
        content,
      });
      return { success: true };
    } catch (e) {
      console.error(e);
      return fail(500, { message: "Failed to create reply" });
    }
  },

  toggleLike: async ({ request, locals }) => {
    const { session, user } = locals;
    if (!session || !user) return fail(401, { message: "Unauthorized" });

    const paidRoles = ["admin", "editor", "member_individual", "member_corporate", "executive", "sponsor", "partner"];
    if (!paidRoles.includes(user.role || "")) {
      return fail(403, { message: "Only paid members can interact in the community." });
    }

    const formData = await request.formData();
    const postId = formData.get("postId") as string;
    const replyId = formData.get("replyId") as string;

    try {
      if (postId) {
        const existing = await db.query.communityLike.findFirst({
          where: (likes, { and, eq }) => and(eq(likes.postId, postId), eq(likes.userId, user.id))
        });

        if (existing) {
          await db.delete(communityLike).where(eq(communityLike.id, existing.id));
        } else {
          await db.insert(communityLike).values({
            postId,
            userId: user.id,
          });
        }
      } else if (replyId) {
        const existing = await db.query.communityLike.findFirst({
          where: (likes, { and, eq }) => and(eq(likes.replyId, replyId), eq(likes.userId, user.id))
        });

        if (existing) {
          await db.delete(communityLike).where(eq(communityLike.id, existing.id));
        } else {
          await db.insert(communityLike).values({
            replyId,
            userId: user.id,
          });
        }
      }
      return { success: true };
    } catch (e) {
      console.error(e);
      return fail(500, { message: "Failed to toggle like" });
    }
  }
};
