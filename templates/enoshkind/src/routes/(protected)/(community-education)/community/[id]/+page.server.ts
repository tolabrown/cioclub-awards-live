import { db } from '$lib/db/drizzle';
import { communityCycle, communityPost, communityMembership, user, communityPostLike, communityPostComment } from '$lib/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load = (async ({ locals, params }) => {
  const currentUser = locals.user;
  if (!currentUser) throw redirect(302, '/auth/login');

  const [cycle] = await db.select().from(communityCycle)
    .where(eq(communityCycle.id, params.id));

  if (!cycle) throw redirect(302, '/community');

  const [membership] = await db.select().from(communityMembership)
    .where(and(eq(communityMembership.userId, currentUser.id), eq(communityMembership.cycleId, params.id)));

  // Manual fetch to avoid 500 error from complex lateral joins
  const postsData = await db.select().from(communityPost)
    .where(eq(communityPost.cycleId, params.id))
    .orderBy(desc(communityPost.createdAt));

  const posts = await Promise.all(postsData.map(async (post) => {
    const [author] = await db.select().from(user).where(eq(user.id, post.userId));
    const likes = await db.select().from(communityPostLike).where(eq(communityPostLike.postId, post.id));
    const commentsCount = await db.select({ value: count() }).from(communityPostComment).where(eq(communityPostComment.postId, post.id));

    // Fetch comments and their authors
    const commentsData = await db.select().from(communityPostComment)
      .where(eq(communityPostComment.postId, post.id))
      .orderBy(desc(communityPostComment.createdAt));

    const comments = await Promise.all(commentsData.map(async (comment) => {
      const [commentAuthor] = await db.select().from(user).where(eq(user.id, comment.userId));
      return {
        ...comment,
        user: commentAuthor
      };
    }));

    return {
      ...post,
      author,
      likes,
      comments,
      commentsCount: commentsCount[0].value,
      likedByMe: likes.some(l => l.userId === currentUser.id)
    };
  }));

  const recentMembersData = await db.select().from(communityMembership)
    .where(eq(communityMembership.cycleId, params.id))
    .limit(6)
    .orderBy(desc(communityMembership.joinedAt));

  const recentMembers = await Promise.all(recentMembersData.map(async (membership) => {
    const [u] = await db.select().from(user).where(eq(user.id, membership.userId));
    return {
      ...membership,
      user: u
    };
  }));

  return {
    cycle,
    isMember: !!membership,
    membership,
    posts,
    recentMembers,
    user: currentUser
  };
}) satisfies PageServerLoad;

export const actions = {
  createPost: async ({ locals, params, request }) => {
    const currentUser = locals.user;
    if (!currentUser) return fail(401);

    const formData = await request.formData();
    const content = formData.get('content') as string;

    const [post] = await db.insert(communityPost).values({
      userId: currentUser.id,
      cycleId: params.id,
      content
    }).returning();

    return { success: true, post };
  },

  likePost: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);

    const formData = await request.formData();
    const postId = formData.get('postId') as string;

    const existing = await db.query.communityPostLike.findFirst({
      where: and(eq(communityPostLike.postId, postId), eq(communityPostLike.userId, user.id))
    });

    if (existing) {
      await db.delete(communityPostLike)
        .where(and(eq(communityPostLike.postId, postId), eq(communityPostLike.userId, user.id)));
      return { success: true, liked: false };
    } else {
      await db.insert(communityPostLike).values({
        postId,
        userId: user.id
      });
      return { success: true, liked: true };
    }
  },

  addComment: async ({ locals, request }) => {
    const currentUser = locals.user;
    if (!currentUser) return fail(401);

    const formData = await request.formData();
    const postId = formData.get('postId') as string;
    const content = formData.get('content') as string;

    if (!content) return fail(400, { message: 'Comment cannot be empty' });

    await db.insert(communityPostComment).values({
      postId,
      userId: currentUser.id,
      content
    });

    return { success: true };
  },

  deleteCycle: async ({ locals, params }) => {
    const user = locals.user;
    if (!user) return fail(401);

    const cycle = await db.query.communityCycle.findFirst({
      where: eq(communityCycle.id, params.id)
    });

    if (!cycle) return fail(404);

    if (cycle.userId !== user.id && user.role !== 'admin') {
      return fail(403);
    }

    try {
      await db.delete(communityCycle).where(eq(communityCycle.id, params.id));
    } catch (e: any) {
      return fail(500, { message: e.message });
    }

    throw redirect(303, '/community');
  }
} satisfies Actions;
