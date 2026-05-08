import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { ladiesInTechEvents } from '$lib/db/schema';
import { eq, desc, ilike, or, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { Role } from '$lib/constants';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user || (locals.user.role !== Role.ADMIN && locals.user.role !== Role.EDITOR)) {
    throw error(403, 'Forbidden');
  }

  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || '';

  try {
    let query = db.select().from(ladiesInTechEvents).$dynamic();

    const conditions = [];
    if (search) {
      conditions.push(or(
        ilike(ladiesInTechEvents.title, `%${search}%`),
        ilike(ladiesInTechEvents.description, `%${search}%`),
        ilike(ladiesInTechEvents.location, `%${search}%`)
      ));
    }
    if (status) {
      conditions.push(eq(ladiesInTechEvents.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(ladiesInTechEvents.date));

    return json({ success: true, results });
  } catch (e) {
    console.error('Error fetching events:', e);
    return json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || (locals.user.role !== Role.ADMIN && locals.user.role !== Role.EDITOR)) {
    throw error(403, 'Forbidden');
  }

  try {
    const data = await request.json();
    const { id, createdAt, updatedAt, ...values } = data;

    // Convert date string back to Date object
    if (values.date) {
      values.date = new Date(values.date);
    }

    if (id) {
      // Only update fields that exist in the schema to avoid Drizzle errors
      const updateData: any = {};
      if (values.title !== undefined) updateData.title = values.title;
      if (values.description !== undefined) updateData.description = values.description;
      if (values.date !== undefined) updateData.date = values.date;
      if (values.location !== undefined) updateData.location = values.location;
      if (values.registrationUrl !== undefined) updateData.registrationUrl = values.registrationUrl;
      if (values.paymentUrl !== undefined) updateData.paymentUrl = values.paymentUrl;
      if (values.imageUrl !== undefined) updateData.imageUrl = values.imageUrl;
      if (values.imageId !== undefined) updateData.imageId = values.imageId;
      if (values.category !== undefined) updateData.category = values.category;
      if (values.status !== undefined) updateData.status = values.status;

      await db.update(ladiesInTechEvents).set(updateData).where(eq(ladiesInTechEvents.id, id));
      return json({ success: true, message: 'Event updated' });
    } else {
      await db.insert(ladiesInTechEvents).values(values);
      return json({ success: true, message: 'Event created' });
    }
  } catch (e) {
    console.error('Error saving event:', e);
    return json({ success: false, error: 'Failed to save event' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || (locals.user.role !== Role.ADMIN && locals.user.role !== Role.EDITOR)) {
    throw error(403, 'Forbidden');
  }

  try {
    const { id } = await request.json();
    if (!id) throw error(400, 'ID required');

    await db.delete(ladiesInTechEvents).where(eq(ladiesInTechEvents.id, id));
    return json({ success: true, message: 'Event deleted' });
  } catch (e) {
    console.error('Error deleting event:', e);
    return json({ success: false, error: 'Failed to delete event' }, { status: 500 });
  }
};
