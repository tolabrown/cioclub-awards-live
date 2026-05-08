import { json } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { user } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request, locals }) => {
  const currentUser = locals.user;

  if (!currentUser) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, bio, image } = data;

    if (!name) {
      return json({ success: false, message: 'Name is required' }, { status: 400 });
    }

    await db.update(user)
      .set({
        name,
        bio,
        image,
        updatedAt: new Date()
      })
      .where(eq(user.id, currentUser.id));

    return json({ success: true, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
