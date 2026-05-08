import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMeeting, updateMeeting, deleteMeeting } from '$lib/db/meeting';

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;
  const meeting = await getMeeting(id);

  if (!meeting) {
    return json({ status: 'error', message: 'Meeting not found' }, { status: 404 });
  }

  return json({ status: 'success', data: meeting });
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const { id } = params;
  const body = await request.json();

  const result = await updateMeeting(id, body, locals.user);

  if (result.status === 'error') {
    return json(result, { status: 404 });
  }

  return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const { id } = params;
  const result = await deleteMeeting(id, locals.user);

  if (result.status === 'error') {
    return json(result, { status: 404 });
  }

  return json(result);
};
