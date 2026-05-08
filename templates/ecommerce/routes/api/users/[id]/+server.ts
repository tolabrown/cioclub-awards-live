import { db } from '$lib/db/drizzle';
import { user } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminRoles, Role } from '$lib/constants';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const me = locals.user;
  if (!me || !adminRoles.includes(me.role as Role)) {
    return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  const { data } = await request.json();
  const userId = params.id;

  try {
    const updateData: any = {};
    if (data.role) updateData.role = data.role;
    if (data.name) updateData.name = data.name;

    await db.update(user).set(updateData).where(eq(user.id, userId));
    const updatedUser = await db.query.user.findFirst({ where: eq(user.id, userId) });

    return json({ status: 'success', message: 'User updated', data: updatedUser });
  } catch (error: any) {
    return json({ status: 'error', message: error.message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const me = locals.user;
  if (!me || !adminRoles.includes(me.role as Role)) {
    return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  const userId = params.id;
  if (me.id === userId) {
    return json({ status: 'error', message: 'Cannot delete yourself' }, { status: 400 });
  }

  try {
    await db.delete(user).where(eq(user.id, userId));
    return json({ status: 'success', message: 'User deleted' });
  } catch (error: any) {
    return json({ status: 'error', message: error.message }, { status: 500 });
  }
};
