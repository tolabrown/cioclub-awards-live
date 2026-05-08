import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Fields, adminRoles } from '$lib/constants';
import { getSearchFilterList, authGuard } from '$lib/server';
import { addMemory } from '$lib/db/memory';
import type { User } from '$lib/auth';

export const GET: RequestHandler = async ({ locals, url }: { locals: App.Locals, url: URL }) => {
  return await getSearchFilterList(locals, url, Fields.MEMORY)
};

export const POST: RequestHandler = async ({ request, locals }: { request: Request, locals: App.Locals }) => {
  const auth = await authGuard(locals, adminRoles);
  if (!auth.authorized) {
    return json({ status: 'error', message: auth.message }, { status: 403 });
  }

  const body = await request.json();

  const {
    coverImage,
    files,
    name,
    date,
    location,
    description
  } = body;

  const newMemory = await addMemory({
    name,
    date,
    location,
    description,
    coverImage,
    files
  }, locals.user as User);

  return json({ status: 'success', data: newMemory });
};
