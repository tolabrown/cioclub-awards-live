import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllDoctorsList, updateDoctorPrice } from '$lib/db/doctor';

export const GET: RequestHandler = async ({ locals, url }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const search = url.searchParams.get('search') || '';
    const limit = Number(url.searchParams.get('limit')) || 28;
    const offset = Number(url.searchParams.get('offset')) || 0;

    const { data, total } = await getAllDoctorsList(search, limit, offset);

    return json({
      success: true,
      data,
      total,
      meta: {
        more: offset + data.length < total
      }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/doctors:', error);
    return json({ success: false, message: 'Failed to fetch doctors' }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id, price } = await request.json();
    if (!id || price === undefined) {
      return json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const updatedDoctor = await updateDoctorPrice(id, price);

    return json({
      success: true,
      message: 'Doctor price updated successfully',
      data: updatedDoctor
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/doctors:', error);
    return json({ success: false, message: 'Failed to update doctor price' }, { status: 500 });
  }
};
