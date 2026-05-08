import { db } from '$lib/db';
import { newsletterSubscriber } from '$lib/db/schema';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email } = await request.json();
    if (!email) {
      return json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    await db.insert(newsletterSubscriber).values({ email }).onConflictDoNothing();

    return json({ success: true, message: 'Successfully subscribed!' });
  } catch (error: any) {
    console.error('Newsletter error:', error);
    return json({ success: false, message: 'Failed to subscribe' }, { status: 500 });
  }
};
