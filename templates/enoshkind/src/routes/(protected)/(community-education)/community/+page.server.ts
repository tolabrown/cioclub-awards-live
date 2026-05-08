import { db } from '$lib/db/drizzle';
import { communityCycle, communityPost, communityMembership, user, doctor, communityPostLike, communityPostComment } from '$lib/db/schema';
import { eq, count, and, inArray } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
  const currentUser = locals.user;
  if (!currentUser) return { cycles: [], memberships: [], stats: { members: 0, cycles: 0, doctors: 0 } };

  // Use core select to avoid relational query API issues
  const cyclesData = await db.select().from(communityCycle);

  const cycles = await Promise.all(cyclesData.map(async (cycle) => {
    // Get all posts for this cycle
    const posts = await db.select({ id: communityPost.id }).from(communityPost).where(eq(communityPost.cycleId, cycle.id));
    const postIds = posts.map(p => p.id);

    let totalLikes = 0;
    let totalComments = 0;

    if (postIds.length > 0) {
      const [likesCount] = await db.select({ value: count() })
        .from(communityPostLike)
        .where(inArray(communityPostLike.postId, postIds));

      const [commentsCount] = await db.select({ value: count() })
        .from(communityPostComment)
        .where(inArray(communityPostComment.postId, postIds));

      totalLikes = likesCount.value;
      totalComments = commentsCount.value;
    }

    return {
      ...cycle,
      totalLikes,
      totalComments
    };
  }));

  const memberships = await db.select().from(communityMembership)
    .where(eq(communityMembership.userId, currentUser.id));

  // Calculate real stats
  const [memberCount] = await db.select({ value: count() }).from(user);
  const [cycleCount] = await db.select({ value: count() }).from(communityCycle);
  const [doctorCount] = await db.select({ value: count() }).from(doctor).where(and(eq(doctor.verified, true), eq(doctor.approved, true)));

  return {
    cycles,
    memberships,
    stats: {
      members: memberCount.value,
      cycles: cycleCount.value,
      doctors: doctorCount.value
    }
  };
}) satisfies PageServerLoad;

export const actions = {
  joinCycle: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);

    const formData = await request.formData();
    const cycleId = formData.get('cycleId') as string;

    const existing = await db.query.communityMembership.findFirst({
      where: and(eq(communityMembership.userId, user.id), eq(communityMembership.cycleId, cycleId))
    });

    if (existing) return { success: true };

    await db.insert(communityMembership).values({
      userId: user.id,
      cycleId
    });

    // Increment member count
    const cycle = await db.query.communityCycle.findFirst({ where: eq(communityCycle.id, cycleId) });
    if (cycle) {
      await db.update(communityCycle)
        .set({ members: (cycle.members || 0) + 1 })
        .where(eq(communityCycle.id, cycleId));
    }

    return { success: true };
  },

  createPost: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);

    const formData = await request.formData();
    const cycleId = formData.get('cycleId') as string;
    const content = formData.get('content') as string;

    const [post] = await db.insert(communityPost).values({
      userId: user.id,
      cycleId,
      content
    }).returning();

    return { success: true, post };
  },

  createCycle: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const activity = formData.get('activity') as string;
    const image = formData.get('image') as string;

    const [cycle] = await db.insert(communityCycle).values({
      name,
      description,
      activity,
      image,
      userId: user.id
    }).returning();

    return { success: true, cycle };
  },

  deleteCycle: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);

    const formData = await request.formData();
    const id = formData.get('id') as string;

    const [cycle] = await db.select().from(communityCycle).where(eq(communityCycle.id, id));
    if (!cycle) return fail(404);

    if (cycle.userId !== user.id && user.role !== 'admin') {
      return fail(403);
    }

    try {
      await db.delete(communityCycle).where(eq(communityCycle.id, id));
      return { success: true };
    } catch (e: any) {
      return fail(500, { message: e.message });
    }
  }
} satisfies Actions;
