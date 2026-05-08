import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveFileToMinioAndFileTable } from '$lib/server';
import { onError, onSuccess } from '$lib/fxns';
import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from '$lib/constants';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Auth check
    if (!locals.user) {
      return json(onError('Unauthorized'), { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return json(onError('No file provided'), { status: 400 });
    }

    // Validate file type first
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return json(onError('Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed'), { status: 400 });
    }

    // Validate file size based on type
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    const sizeLabel = isImage ? '5MB' : '250MB';

    if (file.size > maxSize) {
      return json(onError(`File size exceeds ${sizeLabel} limit for ${isImage ? 'images' : 'videos'}`), { status: 400 });
    }

    // Upload to MinIO and save to database
    const result = await saveFileToMinioAndFileTable(file);

    if (result.status === 'error') {
      return json(result, { status: 500 });
    }

    return json(onSuccess({
      file: result.data,
      message: 'File uploaded successfully'
    }));

  } catch (error: any) {
    console.error('Upload error:', error);
    return json(onError(error.message || 'Failed to upload file'), { status: 500 });
  }
};
