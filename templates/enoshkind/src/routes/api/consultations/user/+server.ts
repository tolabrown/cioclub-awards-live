import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getConsultations } from '$lib/db/consultation';

export const GET: RequestHandler = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const consultations = await getConsultations(user.id);
    return json({ success: true, data: consultations });
  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};
