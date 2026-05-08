import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { ladiesInTechArchives } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { Role } from '$lib/constants';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user || (locals.user.role !== Role.ADMIN && locals.user.role !== Role.EDITOR)) {
    throw error(403, 'Forbidden');
  }

  try {
    const archives = await db
      .select()
      .from(ladiesInTechArchives)
      .orderBy(desc(ladiesInTechArchives.year), desc(ladiesInTechArchives.createdAt));

    return json({ success: true, results: archives });
  } catch (e) {
    console.error('Error fetching archives:', e);
    return json({ success: false, error: 'Failed to fetch archives' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || (locals.user.role !== Role.ADMIN && locals.user.role !== Role.EDITOR)) {
    throw error(403, 'Forbidden');
  }

  try {
    const data = await request.json();
    const { id, createdAt, updatedAt, ...values } = data;

    if (id) {
      const updateData: Record<string, any> = {};
      if (values.title !== undefined) updateData.title = values.title;
      if (values.location !== undefined) updateData.location = values.location;
      if (values.description !== undefined) updateData.description = values.description;
      if (values.year !== undefined) updateData.year = values.year;
      if (values.date !== undefined) updateData.date = values.date;
      if (values.coverImageUrl !== undefined) updateData.coverImageUrl = values.coverImageUrl;
      if (values.coverImageId !== undefined) updateData.coverImageId = values.coverImageId;
      if (values.media !== undefined) updateData.media = typeof values.media === 'string' ? values.media : JSON.stringify(values.media);

      await db.update(ladiesInTechArchives).set(updateData).where(eq(ladiesInTechArchives.id, id));
      return json({ success: true, message: 'Archive updated' });
    } else {
      if (values.media && typeof values.media !== 'string') {
        values.media = JSON.stringify(values.media);
      }
      const [created] = await db.insert(ladiesInTechArchives).values(values).returning();
      return json({ success: true, message: 'Archive created', result: created });
    }
  } catch (e) {
    console.error('Error saving archive:', e);
    return json({ success: false, error: 'Failed to save archive' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || (locals.user.role !== Role.ADMIN && locals.user.role !== Role.EDITOR)) {
    throw error(403, 'Forbidden');
  }

  try {
    const { id } = await request.json();
    if (!id) throw error(400, 'ID required');

    await db.delete(ladiesInTechArchives).where(eq(ladiesInTechArchives.id, id));
    return json({ success: true, message: 'Archive deleted' });
  } catch (e) {
    console.error('Error deleting archive:', e);
    return json({ success: false, error: 'Failed to delete archive' }, { status: 500 });
  }
};
