import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteFileWithChildCleanup } from '$lib/db/file';
import type { iChild, iFile } from '$lib/interface';

export const DELETE: RequestHandler = async ({ params }) => {
  const { id } = params;

  try {
    // Delete file with automatic cleanup of child references
    const result = await deleteFileWithChildCleanup(id);

    if (result.status === 'error') {
      return json(result, { status: 500 });
    }

    return json({ status: 'success', message: 'File deleted successfully', data: result.data });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return json(
      { status: 'error', message: error.message || 'Failed to delete file' },
      { status: 500 }
    );
  }
};
