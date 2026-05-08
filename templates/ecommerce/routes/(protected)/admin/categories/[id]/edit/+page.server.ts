import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { CategoryCRUD } from '$lib/db/category';
import { FileCRUD } from '$lib/db/file';
import { deleteFileById } from '$lib/server/minio';

export const load = (async ({ params }) => {
  // We need to ensure CategoryCRUD.getById fetches the image relation
  const result = await CategoryCRUD.getById(params.id);
  const allCategories = await CategoryCRUD.getAll();

  if (!result.success || !result.data) {
    throw redirect(303, '/admin/categories');
  }

  return {
    category: result.data,
    categories: allCategories.data.filter(c => c.id !== params.id) || [],
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  uploadImage: async ({ request, locals, params }) => {
    console.log('--- [Category Update Upload] Step 1: Action Started ---');
    try {
      const formData = await request.formData();
      const imageFile = formData.get('image') as File;

      if (!imageFile || imageFile.size === 0) {
        console.error('[Category Update Upload] Error: No file provided');
        return fail(400, { error: 'No image file provided' });
      }

      console.log(`[Category Update Upload] Step 2: Received file "${imageFile.name}" (${imageFile.size} bytes)`);

      const uploadResult = await FileCRUD.upload(imageFile, 'categories', locals.user?.id);

      if (uploadResult.success && uploadResult.data) {
        const fileData = uploadResult.data;
        console.log(`[Category Update Upload] Step 3: Successfully saved to File table. ID: ${fileData.id}`);

        console.log(`[Category Update Upload] Step 4: Persisting reference to Category table. Category ID: ${params.id}`);
        await CategoryCRUD.update(params.id, { image: fileData.id });

        console.log('--- [Category Update Upload] Step 5: Process Complete ---');
        return { success: true, file: fileData };
      } else {
        console.error('[Category Update Upload] Error: Upload failed -', uploadResult.error);
        return fail(500, { error: uploadResult.error || 'Upload failed' });
      }
    } catch (error) {
      console.error('[Category Update Upload] Critical Error:', error);
      return fail(500, { error: 'Internal server error during upload' });
    }
  },
  update: async ({ request, params }) => {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const parentId = (formData.get('parentId') as string) || null;
    const isActive = formData.get('isActive') === 'on' || formData.get('isActive') === 'true';
    const imageId = formData.get('imageId') as string | null;

    if (!name) {
      return fail(400, { error: 'Name is required' });
    }

    const updateData: any = {
      name,
      description: description || null,
      parentId,
      isActive,
    };

    if (imageId) {
      updateData.image = imageId;
    }

    const result = await CategoryCRUD.update(params.id, updateData);

    if (!result.success) {
      return fail(500, { error: result.error });
    }

    throw redirect(303, '/admin/categories');
  },
  deleteImage: async ({ params, request }) => {
    console.log('--- [Category Delete] Step 1: Action Started ---');
    try {
      const formData = await request.formData();
      const explicitImageId = formData.get('imageId') as string | null;

      let fileRecord: any = null;

      const categoryResult = await CategoryCRUD.getById(params.id);
      const category = categoryResult.data;

      if (category?.imageFile && typeof category.imageFile !== 'string') {
        fileRecord = category.imageFile;
      } else if (explicitImageId) {
        console.log(`[Category Delete] No linked image, but explicit ID found: ${explicitImageId}`);
        const fileResult = await FileCRUD.getById(explicitImageId);
        if (fileResult.success) {
          fileRecord = fileResult.data;
        }
      }

      if (!fileRecord) {
        console.error('[Category Delete] Error: No file record found');
        return fail(400, { error: 'No associated image found' });
      }

      const remoteId = fileRecord.remoteId || fileRecord.filename;

      console.log(`[Category Delete] Step 2: Deleting from MinIO. Object: ${remoteId}`);
      try {
        await deleteFileById('categories', remoteId);
      } catch (minioError) {
        console.error('[Category Delete] MinIO Delete Warning:', minioError);
        // Continue even if MinIO fails, as we want to clean up DB
      }

      console.log('[Category Delete] Step 3: Removing reference from Category table (if exists)');
      if (category?.image === fileRecord.id) {
        await CategoryCRUD.update(params.id, { image: null });
      }

      console.log(`[Category Delete] Step 4: Deleting record from File table. ID: ${fileRecord.id}`);
      await FileCRUD.delete(fileRecord.id);

      console.log('--- [Category Delete] Step 5: Process Complete ---');
      return { success: true };
    } catch (error) {
      console.error('[Category Delete] Critical Error:', error);
      return fail(500, { error: 'Failed to delete image' });
    }
  },
};
