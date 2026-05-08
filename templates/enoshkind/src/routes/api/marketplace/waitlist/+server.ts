import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addToWaitlist } from '$lib/db/marketplace';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return json({ success: false, message: 'Invalid email' }, { status: 400 });
    }
    await addToWaitlist(email);
    return json({ success: true });
  } catch (error: any) {
    // Drizzle/Postgres unique constraint violation code is usually '23505'
    if (error.code === '23505' || error.message?.includes('unique constraint')) {
      return json({ success: true, message: 'Already on waitlist' });
    }
    return json({ success: false, message: error.message }, { status: 500 });
  }
};
