import { json } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { communityCycle, communityPost, communityMembership, communityPostLike, communityPostComment } from '$lib/db/schema';

export const GET = async () => {
  try {
    console.log('API: Clearing community tables...');
    await db.delete(communityPostComment);
    await db.delete(communityPostLike);
    await db.delete(communityPost);
    await db.delete(communityMembership);
    await db.delete(communityCycle);
    return json({ success: true, message: 'All community data cleared successfully' });
  } catch (error: any) {
    console.error('API Error clearing community data:', error);
    return json({ success: false, message: error.message }, { status: 500 });
  }
};
