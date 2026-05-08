import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { EducationCRUD } from '$lib/db/education';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const search = url.searchParams.get('search') || undefined;
    const category = url.searchParams.get('category') || undefined;
    const type = url.searchParams.get('type') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const result = await EducationCRUD.list({ search, category, type }, { page, limit });
    return json({ success: true, ...result });
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
    const item = await EducationCRUD.create(body);
    return json({ success: true, data: item });
  } catch (e: any) {
    return json({ success: false, message: e.message }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (locals.user?.role !== 'admin') {
    return json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id, ...data } = await request.json();
    const item = await EducationCRUD.update(id, data);
    return json({ success: true, data: item });
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

    const success = await EducationCRUD.delete(id);
    return json({ success });
  } catch (e: any) {
    return json({ success: false, message: e.message }, { status: 500 });
  }
};
