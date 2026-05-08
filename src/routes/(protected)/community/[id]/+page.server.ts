import { db } from '$lib/db';
import { communityPost, communityReply, communityLike, user } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user
  if (!user) {
    throw error(401, 'Unauthorized');
  }

  const post = await db.query.communityPost.findFirst({
    where: eq(communityPost.id, params.id),
    with: {
      author: true,
      likes: true,
      replies: {
        with: {
          author: true,
          likes: true
        },
        orderBy: [desc(communityReply.createdAt)]
      }
    }
  });

  if (!post) {
    throw error(404, 'Post not found');
  }

  return {
    post,
    user
  };
};

export const actions = {
  createReply: async ({ request, locals, params }) => {
    const user =  locals.user
    if (!user) throw error(401, 'Unauthorized');

    const formData = await request.formData();
    const content = formData.get('content') as string;

    if (!content) return { success: false, error: 'Content is required' };

    await db.insert(communityReply).values({
      postId: params.id,
      userId: user.id,
      content
    });

    return { success: true };
  },

  toggleLike: async ({ request, locals }) => {
    const user = locals.user
    if (!user) throw error(401, 'Unauthorized');

    const formData = await request.formData();
    const postId = formData.get('postId') as string;
    const replyId = formData.get('replyId') as string;

    if (postId) {
      const existing = await db.query.communityLike.findFirst({
        where: (l, { and, eq }) => and(eq(l.postId, postId), eq(l.userId, user.id))
      });

      if (existing) {
        await db.delete(communityLike).where(eq(communityLike.id, existing.id));
      } else {
        await db.insert(communityLike).values({ postId, userId:  user.id });
      }
    } else if (replyId) {
      const existing = await db.query.communityLike.findFirst({
        where: (l, { and, eq }) => and(eq(l.replyId, replyId), eq(l.userId, user.id))
      });

      if (existing) {
        await db.delete(communityLike).where(eq(communityLike.id, existing.id));
      } else {
        await db.insert(communityLike).values({ replyId, userId: user.id });
      }
    }

    return { success: true };
  }
};
