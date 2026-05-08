import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUsers, updateUserRole, deleteUser } from '$lib/db/users';

export const GET: RequestHandler = async ({ locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await getUsers();
    return json({ success: true, data: users });
  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id, role } = await request.json();
    const result = await updateUserRole(id, role);
    return json({ success: true, data: result });
  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    const result = await deleteUser(id);
    return json({ success: true, data: result });
  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};
