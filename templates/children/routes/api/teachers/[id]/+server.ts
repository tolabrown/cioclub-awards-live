import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateTeacher, deleteTeacher, getTeacher } from '$lib/db/teacher';

export const GET: RequestHandler = async ({ params }) => {
  const teacher = await getTeacher(params.id);

  if (!teacher) {
    return json({ status: 'error', message: 'Teacher not found' }, { status: 404 });
  }

  return json({ status: 'success', data: teacher });
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const { id } = params;
  const body = await request.json();
  const {
    image, // New avatar file ID
    files, // New additional media file IDs
    ...teacherData
  } = body;

  // 1. Handle avatar update (delete old if changed)
  if (image !== undefined) {
    const currentTeacher = await getTeacher(id);
    if (currentTeacher && currentTeacher.image) {
      const currentImageId = typeof currentTeacher.image === 'string'
        ? currentTeacher.image
        : currentTeacher.image.id;

      if (currentImageId !== image) {
        const { deleteFileFromMinioAndFileTable } = await import('$lib/server');
        await deleteFileFromMinioAndFileTable(currentImageId);
      }
    }
    teacherData.image = image;
  }

  // 2. Update Teacher
  const result = await updateTeacher(id, teacherData, locals.user);

  if (result.status === 'error') {
    return json(result, { status: 404 });
  }

  // 3. Handle additional media files (replace all existing relationships)
  if (files !== undefined) {
    const { addTeacherFile, deleteFilesByTeacherId } = await import('$lib/db/teacherfile');

    // First, delete all existing file relationships for this teacher
    await deleteFilesByTeacherId(id, locals.user);

    // Then add the new relationships
    if (files && files.length > 0) {
      for (const fileId of files) {
        if (fileId) {
          await addTeacherFile({
            teacherId: id,
            fileId: fileId
          }, locals.user);
        }
      }
    }
  }

  return json(result);
};

export const DELETE: RequestHandler = async ({ params, request, locals }) => {
  const { id } = params;

  // 1. Get teacher data to access avatar and files (if passed in body, otherwise fetch)
  let teacherData;
  try {
    const body = await request.json();
    teacherData = body.teacher;
  } catch (e) {
    // If no body, fetch from DB
    teacherData = await getTeacher(id);
  }

  if (!teacherData) {
    return json({ status: 'error', message: 'Teacher not found' }, { status: 404 });
  }

  // 2. Delete avatar from MinIO if exists
  if (teacherData.image) {
    const { deleteFileFromMinioAndFileTable } = await import('$lib/server');
    await updateTeacher(id, { image: null }, locals.user);
    const imageId = typeof teacherData.image === 'string'
      ? teacherData.image
      : teacherData.image.id;
    await deleteFileFromMinioAndFileTable(imageId);
  }

  // 3. Delete all associated media files from MinIO
  // Note: We need to fetch files if they aren't in the teacher object
  if (!teacherData.files) {
    const { getFilesByTeacherId } = await import('$lib/db/teacherfile');
    const filesResult = await getFilesByTeacherId(id);
    if (filesResult.status === 'success') {
      teacherData.files = filesResult.data;
    }
  }

  if (teacherData.files && teacherData.files.length > 0) {
    const { deleteFileFromMinioAndFileTable } = await import('$lib/server');
    for (const file of teacherData.files) {
      if (file.id) {
        await deleteFileFromMinioAndFileTable(file.id);
      }
    }
  }

  // 4. Delete teacher
  const result = await deleteTeacher(id, locals.user);

  if (result.status === 'error') {
    return json(result, { status: 404 });
  }

  return json(result);
};
