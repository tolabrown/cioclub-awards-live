import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Fields } from '$lib/constants';
import { getSearchFilterList } from '$lib/server';
import { addTeacher } from '$lib/db/teacher';

export const GET: RequestHandler = async ({ locals, url }) => {
  return await getSearchFilterList(locals, url, Fields.TEACHER)
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  const {
    image, // Avatar file ID
    files = [], // Additional media file IDs
    ...teacherData
  } = body;

  // Create Teacher with avatar
  const newTeacher = await addTeacher({
    ...teacherData,
    image: image || null
  }, locals.user);

  if (!newTeacher) {
    return json({ status: 'error', message: 'Failed to create teacher' }, { status: 500 });
  }

  // Handle additional media files
  if (files && files.length > 0) {
    const { addTeacherFile } = await import('$lib/db/teacherfile');

    for (const fileId of files) {
      if (fileId) {
        await addTeacherFile({
          teacherId: newTeacher.id,
          fileId: fileId
        }, locals.user);
      }
    }
  }

  return json({ status: 'success', data: newTeacher });
};
