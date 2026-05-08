import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDoctors, addDoctor } from '$lib/db/doctor';
import { db } from '$lib/db/drizzle';

export const GET: RequestHandler = async ({ locals, url }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }


  try {
    const search = url.searchParams.get('search') || '';
    const limit = Number(url.searchParams.get('limit')) || 28;
    const offset = Number(url.searchParams.get('offset')) || 0;
    const specialty = url.searchParams.get('specialty') || undefined;

    const { data, total } = await getDoctors(search, limit, offset, specialty);

    return json({
      success: true,
      data,
      total,
      meta: {
        more: offset + data.length < total
      }
    });
  } catch (error) {
    console.error('Error in GET /api/doctors:', error);
    return json({ success: false, message: 'Failed to fetch doctors' }, { status: 500 });
  }
};


export const POST: RequestHandler = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await request.json();
    const result = await addDoctor(data);
    return json({ success: true, data: result });
  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};
