import { db } from '$lib/db/drizzle';
import { labResult } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
  const user = locals.user;
  if (!user) throw error(401, 'Unauthorized');

  const results = await db.query.labResult.findMany({
    with: {
      order: true
    },
    orderBy: [desc(labResult.createdAt)]
  });

  // Filter results to only show those belonging to the current user
  const userResults = results.filter((r) => r.order.userId === user.id);

  return {
    results: userResults
  };
}) satisfies PageServerLoad;
