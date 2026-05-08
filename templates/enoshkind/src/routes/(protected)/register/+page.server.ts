import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/db/drizzle';
import { patient } from '$lib/db/schema';

export const actions = {
  default: async ({ request, locals }) => {
    const session = locals.session;
    if (!session) {
      throw redirect(302, '/auth/login');
    }

    const formData = await request.formData();
    const location = formData.get('location');
    const culturalBackground = formData.get('culturalBackground');

    if (!location || typeof location !== 'string') {
      return fail(400, { missing: true, field: 'location' });
    }

    if (!culturalBackground || typeof culturalBackground !== 'string') {
      return fail(400, { missing: true, field: 'culturalBackground' });
    }

    await db.insert(patient).values({
      user: session.userId,
      location,
      culturalBackground
    });

    throw redirect(303, '/dashboard');
  }
} satisfies Actions;