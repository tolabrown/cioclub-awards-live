import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authGuard } from '$lib/server';
import { deleteUser } from '$lib/db/user';

export const DELETE: RequestHandler = async ({ locals, params }) => {
  // 1. Security Check: Only Admins can delete users
  const guard = await authGuard(locals);
  if (!guard.authorized) {
    return json({ status: 'error', message: guard.message }, { status: 403 });
  }

  const userId = params.id;
  if (!userId) {
    return json({ status: 'error', message: 'User ID is required' }, { status: 400 });
  }

  // 2. Prevent self-deletion if needed (optional but recommended)
  if (locals.user && locals.user.id === userId) {
    return json({ status: 'error', message: 'You cannot delete your own account from this menu.' }, { status: 400 });
  }

  // 3. Perform Deletion
  const result = await deleteUser(userId);
  
  if (result.status === 'error') {
    return json(result, { status: 400 });
  }

  return json(result);
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
  // 1. Security Check: Only Admins can update users
  const guard = await authGuard(locals);
  if (!guard.authorized) {
    return json({ status: 'error', message: guard.message }, { status: 403 });
  }

  const userId = params.id;
  if (!userId) {
    return json({ status: 'error', message: 'User ID is required' }, { status: 400 });
  }

  // 2. Parse Body
  const data = await request.json();

  // 3. Perform Update
  const { updateUser } = await import('$lib/db/user');
  const result = await updateUser(userId, data);
  
  if (result.status === 'error') {
    return json(result, { status: 400 });
  }

  return json(result);
};
