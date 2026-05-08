import { fail, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { testimonial } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { uploadAndSaveFile, deleteAndRemoveFile } from '$lib/server/minio';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  if (id === 'new') {
    return {
      testimonial: null
    };
  }

  const existing = await db.query.testimonial.findFirst({
    where: eq(testimonial.id, id),
    with: {
      image: true
    }
  });

  if (!existing) {
    throw error(404, 'Testimonial not found');
  }

  return {
    testimonial: existing
  };
};

export const actions: Actions = {
  save: async ({ request, params }) => {
    const { id } = params;
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const country = formData.get('country') as string;
    const organization = formData.get('organization') as string;
    const testimonialContent = formData.get('testimonial') as string;
    const imageId = formData.get('imageId') as string;

    if (!name || !testimonialContent) {
      return fail(400, { error: 'Name and testimonial are required' });
    }

    try {
      const values = {
        name,
        country,
        organization,
        testimonial: testimonialContent,
        imageId: imageId || null,
        updatedAt: new Date()
      };

      if (id === 'new') {
        const [newTestimonial] = await db.insert(testimonial).values(values).returning();
        return { success: true, id: newTestimonial.id, message: "Testimonial created successfully" };
      } else {
        await db.update(testimonial).set(values).where(eq(testimonial.id, id));
        return { success: true, message: "Testimonial updated successfully" };
      }
    } catch (err) {
      console.error('Save error:', err);
      return fail(500, { error: 'Failed to save testimonial' });
    }
  },

  uploadImage: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return fail(400, { error: 'No image provided' });
    }

    try {
      const result = await uploadAndSaveFile(file);
      return { success: true, image: { ...result, id: result.dbId } };
    } catch (err) {
      console.error('Upload error:', err);
      return fail(500, { error: 'Upload failed' });
    }
  },

  deleteFile: async ({ request, params }) => {
    const { id } = params;
    const formData = await request.formData();
    const fileId = formData.get('fileId') as string;

    if (!fileId) return fail(400, { error: 'No file ID' });

    try {
      await deleteAndRemoveFile(fileId);
      
      // Nullify the reference in the testimonial table if it exists
      if (id !== 'new') {
        await db.update(testimonial)
          .set({ imageId: null })
          .where(eq(testimonial.id, id));
      }
      
      return { success: true };
    } catch (err) {
      console.error('Delete error:', err);
      return fail(500, { error: 'Delete failed' });
    }
  }
};
