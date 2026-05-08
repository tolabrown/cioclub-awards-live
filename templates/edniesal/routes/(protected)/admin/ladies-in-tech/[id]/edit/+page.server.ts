import { db } from '$lib/db/drizzle';
import { ladiesInTechEvents } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  if (id === 'new') {
    return {
      event: {
        title: '',
        description: '',
        date: new Date().toISOString().slice(0, 16),
        location: '',
        registrationUrl: '',
        paymentUrl: '',
        imageId: '',
        imageUrl: '',
        category: 'ladies-in-tech',
        status: 'upcoming'
      }
    };
  }

  const event = await db.query.ladiesInTechEvents.findFirst({
    where: eq(ladiesInTechEvents.id, id)
  });

  if (!event) {
    throw error(404, 'Event not found');
  }

  // Format date for datetime-local input
  const dateObj = new Date(event.date);
  const tzOffset = dateObj.getTimezoneOffset() * 60000;
  const localISOTime = new Date(dateObj.getTime() - tzOffset)
    .toISOString()
    .slice(0, 16);

  return {
    event: {
      ...event,
      date: localISOTime
    }
  };
};
