import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getApprovalsList } from '$lib/db/doctor';

export const GET: RequestHandler = async ({ locals, url }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const search = url.searchParams.get('search') || '';
    const limit = Number(url.searchParams.get('limit')) || 28;
    const offset = Number(url.searchParams.get('offset')) || 0;

    const { data, total } = await getApprovalsList(search, limit, offset);

    return json({
      success: true,
      data,
      total,
      meta: {
        more: offset + data.length < total
      }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/doctors/pending:', error);
    return json({ success: false, message: 'Failed to fetch pending approvals' }, { status: 500 });
  }
};
