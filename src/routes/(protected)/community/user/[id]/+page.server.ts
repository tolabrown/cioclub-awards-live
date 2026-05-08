import { db } from '$lib/db';
import { user, communityPost, communityReply, communityLike } from '$lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const session = await locals.auth();
  if (!session?.user) {
    throw error(401, 'Unauthorized');
  }

  const targetUser = await db.query.user.findFirst({
    where: eq(user.id, params.id),
    with: {
      posts: {
        with: {
          likes: true,
          replies: true
        },
        orderBy: [desc(communityPost.createdAt)]
      },
      replies: {
        with: {
          post: true
        },
        orderBy: [desc(communityReply.createdAt)]
      },
      likes: {
        with: {
          post: true
        },
        orderBy: [desc(communityLike.createdAt)]
      }
    }
  });

  if (!targetUser) {
    throw error(404, 'User not found');
  }

  return {
    targetUser,
    currentUser: session.user
  };
};
