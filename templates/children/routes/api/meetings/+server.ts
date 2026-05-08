import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Fields } from '$lib/constants';
import { getSearchFilterList } from '$lib/server';
import { addMeeting } from '$lib/db/meeting';

export const GET: RequestHandler = async ({ locals, url }) => {
  return await getSearchFilterList(locals, url, Fields.MEETING)
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  const {
    image, // Image file ID
    ...meetingData
  } = body;

  const newMeeting = await addMeeting({
    ...meetingData,
    image: image || null
  }, locals.user);

  if (!newMeeting) {
    return json({ status: 'error', message: 'Failed to create meeting' }, { status: 500 });
  }

  return json({ status: 'success', data: newMeeting });
};
