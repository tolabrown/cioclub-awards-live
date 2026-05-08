import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminRoles } from '$lib/constants';
import { authGuard } from '$lib/server';
import { attachFileToMemory, detachFileFromMemory } from '$lib/db/memory';

export const POST: RequestHandler = async ({ params, request, locals }: { params: { id: string }, request: Request, locals: App.Locals }) => {
  const auth = await authGuard(locals, adminRoles);
  if (!auth.authorized) {
    return json({ status: 'error', message: auth.message }, { status: 403 });
  }

  const { fileId } = await request.json();
  if (!fileId) {
    return json({ status: 'error', message: 'File ID is required' }, { status: 400 });
  }

  const result = await attachFileToMemory(params.id, fileId);
  if (result.status === 'error') {
    return json(result, { status: 400 });
  }

  return json(result);
};

export const DELETE: RequestHandler = async ({ params, request, locals }: { params: { id: string }, request: Request, locals: App.Locals }) => {
  const auth = await authGuard(locals, adminRoles);
  if (!auth.authorized) {
    return json({ status: 'error', message: auth.message }, { status: 403 });
  }

  const { fileId } = await request.json();
  if (!fileId) {
    return json({ status: 'error', message: 'File ID is required' }, { status: 400 });
  }

  const result = await detachFileFromMemory(params.id, fileId);
  if (result.status === 'error') {
    return json(result, { status: 400 });
  }

  return json(result);
};
