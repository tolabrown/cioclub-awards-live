import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { ladiesInTechRegistrations, ladiesInTechEvents } from '$lib/db/schema';
import { desc, eq, ilike, or, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { Role } from '$lib/constants';

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user || locals.user.role !== Role.ADMIN) {
    throw error(403, 'Unauthorized');
  }

  const search = url.searchParams.get('search') || '';
  const eventId = url.searchParams.get('eventId') || '';

  try {
    let query = db.select({
      id: ladiesInTechRegistrations.id,
      firstName: ladiesInTechRegistrations.firstName,
      lastName: ladiesInTechRegistrations.lastName,
      email: ladiesInTechRegistrations.email,
      phone: ladiesInTechRegistrations.phone,
      country: ladiesInTechRegistrations.country,
      organization: ladiesInTechRegistrations.organization,
      designation: ladiesInTechRegistrations.designation,
      category: ladiesInTechRegistrations.category,
      amount: ladiesInTechRegistrations.amount,
      status: ladiesInTechRegistrations.status,
      paymentRef: ladiesInTechRegistrations.paymentRef,
      createdAt: ladiesInTechRegistrations.createdAt,
      eventName: ladiesInTechEvents.title
    })
      .from(ladiesInTechRegistrations)
      .leftJoin(ladiesInTechEvents, eq(ladiesInTechRegistrations.eventId, ladiesInTechEvents.id))
      .$dynamic();

    const conditions = [];
    if (search) {
      conditions.push(or(
        ilike(ladiesInTechRegistrations.firstName, `%${search}%`),
        ilike(ladiesInTechRegistrations.lastName, `%${search}%`),
        ilike(ladiesInTechRegistrations.email, `%${search}%`),
        ilike(ladiesInTechRegistrations.organization, `%${search}%`)
      ));
    }
    if (eventId) {
      conditions.push(eq(ladiesInTechRegistrations.eventId, eventId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const registrations = await query.orderBy(desc(ladiesInTechRegistrations.createdAt));
    return json(registrations);
  } catch (e) {
    console.error('Failed to fetch registrations:', e);
    throw error(500, 'Internal Server Error');
  }
};
