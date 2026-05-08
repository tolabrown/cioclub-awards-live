import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPrescriptions, addPrescription } from '$lib/db/pharmacy';

export const GET: RequestHandler = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const prescriptions = await getPrescriptions(user.id);

    return json({ success: true, data: prescriptions });
  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};
