import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { CategoryCRUD } from '$lib/db/category';
import { FileCRUD } from '$lib/db/file';
import { deleteFileById } from '$lib/server/minio';

export const load = (async () => {
  const result = await CategoryCRUD.getAll();
  return {
    categories: result.data || [],
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  uploadImage: async ({ request, locals }) => {
    console.log('--- [Category Upload] Step 1: Action Started ---');
    try {
      const formData = await request.formData();
      const imageFile = formData.get('image') as File;

      if (!imageFile || imageFile.size === 0) {
        console.error('[Category Upload] Error: No file provided');
        return fail(400, { error: 'No image file provided' });
      }

      console.log(`[Category Upload] Step 2: Received file "${imageFile.name}" (${imageFile.size} bytes)`);

      const uploadResult = await FileCRUD.upload(imageFile, 'categories', locals.user?.id);

      if (uploadResult.success && uploadResult.data) {
        console.log(`[Category Upload] Step 3: Successfully saved to File table. ID: ${uploadResult.data.id}`);
        console.log('--- [Category Upload] Step 4: Process Complete ---');
        return { success: true, file: uploadResult.data };
      } else {
        console.error('[Category Upload] Error: Upload failed -', uploadResult.error);
        return fail(500, { error: uploadResult.error || 'Upload failed' });
      }
    } catch (error) {
      console.error('[Category Upload] Critical Error:', error);
      return fail(500, { error: 'Internal server error during upload' });
    }
  },
  create: async ({ request }) => {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const parentId = (formData.get('parentId') as string) || null;
    const isActive = formData.get('isActive') === 'on' || formData.get('isActive') === 'true';
    const imageId = formData.get('imageId') as string | null;

    if (!name) {
      return fail(400, { error: 'Name is required' });
    }

    const result = await CategoryCRUD.create({
      name,
      description: description || null,
      parentId,
      isActive,
      image: imageId || null,
      sortOrder: 0,
    });

    if (!result.success) {
      return fail(500, { error: result.error });
    }

    throw redirect(303, '/admin/categories');
  },
  deleteImage: async ({ request }) => {
    console.log('--- [Category Delete] Step 1: Action Started ---');
    try {
      const formData = await request.formData();
      const imageId = formData.get('imageId') as string | null;

      if (!imageId) {
        return fail(400, { error: 'No image ID provided' });
      }

      const fileResult = await FileCRUD.getById(imageId);
      if (!fileResult.success || !fileResult.data) {
        return fail(404, { error: 'File record not found' });
      }

      const fileRecord = fileResult.data;
      const remoteId = fileRecord.remoteId || fileRecord.filename;

      console.log(`[Category Delete] Step 2: Deleting from MinIO. Object: ${remoteId}`);
      try {
        await deleteFileById('categories', remoteId as string);
      } catch (minioError) {
        console.error('[Category Delete] MinIO Delete Warning:', minioError);
      }

      console.log(`[Category Delete] Step 3: Deleting record from File table. ID: ${fileRecord.id}`);
      await FileCRUD.delete(fileRecord.id);

      console.log('--- [Category Delete] Step 4: Process Complete ---');
      return { success: true };
    } catch (error) {
      console.error('[Category Delete] Critical Error:', error);
      return fail(500, { error: 'Failed to delete image' });
    }
  },
};
