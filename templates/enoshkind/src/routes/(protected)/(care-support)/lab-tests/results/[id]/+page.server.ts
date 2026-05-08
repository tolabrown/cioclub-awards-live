import { db } from '$lib/db/drizzle';
import { labResult } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
  const user = locals.user;
  if (!user) throw error(401, 'Unauthorized');

  const result = await db.query.labResult.findFirst({
    where: eq(labResult.id, params.id),
    with: {
      order: true
    }
  });

  if (!result) {
    throw error(404, 'Report analysis not found');
  }

  // Double check ownership
  if (result.order.userId !== user.id) {
    throw error(403, 'Forbidden');
  }

  return {
    result
  };
}) satisfies PageServerLoad;
