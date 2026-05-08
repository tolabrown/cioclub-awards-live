import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCommunityCycles, addCommunityCycle, deleteCommunityCycle } from '$lib/db/community';

export const GET: RequestHandler = async () => {
  try {
    const cycles = await getCommunityCycles();
    return json({ success: true, data: cycles });
  } catch (e: any) {
    return json({ success: false, message: e.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (locals.user?.role !== 'admin') {
    return json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const cycle = await addCommunityCycle(body);
    return json({ success: true, data: cycle });
  } catch (e: any) {
    return json({ success: false, message: e.message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
  if (locals.user?.role !== 'admin') {
    return json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const id = url.searchParams.get('id');
    if (!id) return json({ success: false, message: 'Missing ID' }, { status: 400 });

    await deleteCommunityCycle(id);
    return json({ success: true });
  } catch (e: any) {
    return json({ success: false, message: e.message }, { status: 500 });
  }
};
