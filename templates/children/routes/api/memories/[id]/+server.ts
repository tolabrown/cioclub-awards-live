import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMemory, updateMemory, deleteMemory } from '$lib/db/memory';
import { authGuard } from '$lib/server';
import { adminRoles } from '$lib/constants';
import type { User } from '$lib/auth';

export const GET: RequestHandler = async ({ params }: { params: { id: string } }) => {
  const memory = await getMemory(params.id);
  if (!memory) {
    return json({ status: 'error', message: 'Memory not found' }, { status: 404 });
  }
  return json({ status: 'success', data: memory });
};

export const PATCH: RequestHandler = async ({ params, request, locals }: { params: { id: string }, request: Request, locals: App.Locals }) => {
  const auth = await authGuard(locals, adminRoles);
  if (!auth.authorized) {
    return json({ status: 'error', message: auth.message }, { status: 403 });
  }

  const body = await request.json();
  const result = await updateMemory(params.id, body, locals.user as User);
  if (result.status === 'error') {
    return json(result, { status: 400 });
  }
  return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals }: { params: { id: string }, locals: App.Locals }) => {
  const auth = await authGuard(locals, adminRoles);
  if (!auth.authorized) {
    return json({ status: 'error', message: auth.message }, { status: 403 });
  }

  const result = await deleteMemory(params.id, locals.user as User);
  if (result.status === 'error') {
    return json(result, { status: 400 });
  }
  return json(result);
};
