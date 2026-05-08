import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateParent, deleteParent, getParent } from '$lib/db/parent';

export const GET: RequestHandler = async ({ params }) => {
  const parent = await getParent(params.id);

  if (!parent) {
    return json({ status: 'error', message: 'Parent not found' }, { status: 404 });
  }

  return json({ status: 'success', data: parent });
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const { id } = params;
  const body = await request.json();

  const result = await updateParent(id, body, locals.user);

  if (result.status === 'error') {
    return json(result, { status: 404 });
  }

  return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const { id } = params;

  const result = await deleteParent(id, locals.user);

  if (result.status === 'error') {
    return json(result, { status: 404 });
  }

  return json(result);
};
