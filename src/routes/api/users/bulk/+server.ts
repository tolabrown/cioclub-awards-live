import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authGuard } from '$lib/server';
import { deleteUser } from '$lib/db/user';
import { admin } from '$lib/auth-client';

export const POST: RequestHandler = async ({ locals, request }) => {
  // 1. Security Check: Only Admins can perform bulk actions
  const guard = await authGuard(locals);
  if (!guard.authorized) {
    return json({ status: 'error', message: guard.message }, { status: 403 });
  }

  const { action, ids, role } = await request.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return json({ status: 'error', message: 'No user IDs provided' }, { status: 400 });
  }

  try {
    if (action === 'delete') {
      // Prevent self-deletion in bulk
      const filteredIds = ids.filter(id => id !== locals.user?.id);
      if (filteredIds.length === 0) {
        return json({ status: 'error', message: 'You cannot delete your own account.' }, { status: 400 });
      }

      const results = await Promise.all(filteredIds.map(id => deleteUser(id)));
      const errors = results.filter(r => r.status === 'error');

      if (errors.length > 0) {
        return json({ 
          status: 'partial_success', 
          message: `${filteredIds.length - errors.length} users deleted, but ${errors.length} failed.`,
          errors 
        });
      }

      return json({ status: 'success', message: `Successfully deleted ${filteredIds.length} users.` });
    } 
    
    else if (action === 'updateRole') {
      if (!role) {
        return json({ status: 'error', message: 'Role is required for role update' }, { status: 400 });
      }

      await Promise.all(ids.map(id => admin.setRole({ userId: id, role: role as any })));

      return json({ status: 'success', message: `Successfully updated roles for ${ids.length} users.` });
    }

    return json({ status: 'error', message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Bulk action failed:', error);
    return json({ status: 'error', message: error.message || 'Internal server error during bulk action' }, { status: 500 });
  }
};
