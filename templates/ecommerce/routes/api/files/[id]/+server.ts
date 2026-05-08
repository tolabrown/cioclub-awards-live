import { json, type RequestHandler } from '@sveltejs/kit';
import { FileCRUD } from '$lib/db/file';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return json({ error: 'ID required' }, { status: 400 });
    }

    const result = await FileCRUD.getById(id);

    if (!result.success || !result.data) {
      return json({ error: result.error || 'File not found' }, { status: 404 });
    }

    return json({
      success: true,
      file: result.data
    });
  } catch (error) {
    console.error('[API/Files/GetById] Error:', error);
    return json({ error: 'Failed to fetch file' }, { status: 500 });
  }
};
