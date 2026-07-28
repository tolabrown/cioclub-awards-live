import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';
import { ticketBooking, event } from '$lib/db/schema';
import { and, ilike, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  const currentYear = new Date().getFullYear();
  let awardsEvent = null;

  try {
    // Try to find the CIO Awards event for the current year
    awardsEvent = await db.query.event.findFirst({
      where: and(
        ilike(event.title, '%CIO%Awards%'),
        sql`EXTRACT(YEAR FROM ${event.date}) = ${currentYear}`
      )
    });
  } catch (err) {
    console.error("Tickets Page DB Error:", err);
  }

  return {
    user: locals.user,
    eventDetails: awardsEvent ? {
      name: awardsEvent.title,
      date: awardsEvent.date,
      time: awardsEvent.date,
      venue: awardsEvent.location || "Balmoral Convention Center, Victoria Island, Lagos",
    } : {
      name: `The CIO & C-Suite Awards Africa ${currentYear}`,
      date: new Date(currentYear, 9, 27, 14, 0).toISOString(),
      time: new Date(currentYear, 9, 27, 14, 0).toISOString(),
      venue: "Balmoral Convention Center, Victoria Island, Lagos",
    },
    ticketTypes: [
      {
        id: 'regular',
        name: 'Regular',
        price: 5000000, // 50,000 NGN in kobo
        priceDisplay: '₦50,000',
        unit: '/ person',
        description: 'General admission ticket',
        features: [
          'Access to the Conference and Awards Ceremony',
          'Participate in the Exhibition Experience',
          'Networking',
          'Access to Breakout Sessions',
        ],
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 10000000, // 100,000 NGN in kobo
        priceDisplay: '₦100,000',
        unit: '/ person',
        description: 'Premium experience with VIP benefits',
        features: [
          'Access to the Conference and Awards Ceremony',
          'Participate in the Exhibition Experience',
          'Networking',
          'Access to Breakout Sessions',
          'VIP Lounge',
          'Priority Seating',
          'Certificate of Participation',
        ],
        recommended: true,
      },
      {
        id: 'regular_bundle_3',
        name: 'Regular Bundle for 3',
        price: 10000000, // 100,000 NGN in kobo
        priceDisplay: '₦100,000',
        unit: '/ 3 attendees',
        description: 'Group pass for 3 attendees',
        features: [
          'Group entry for 3 attendees',
          'Access to the Conference and Awards Ceremony',
          'Participate in the Exhibition Experience',
          'Networking',
          'Access to Breakout Sessions',
        ],
      },
      {
        id: 'vip_bundle_3',
        name: 'VIP Bundle for 3',
        price: 20000000, // 200,000 NGN in kobo
        priceDisplay: '₦200,000',
        unit: '/ 3 VIP attendees',
        description: 'Group VIP pass for 3 attendees',
        features: [
          'Group VIP entry for 3 attendees',
          'Access to the Conference and Awards Ceremony',
          'Participate in the Exhibition Experience',
          'Networking',
          'Access to Breakout Sessions',
          'VIP Lounge',
          'Priority Seating',
          'Certificate of Participation',
        ],
      },
    ],
  };
};

export const actions: Actions = {
  book: async ({ request, locals }) => {
    const formData = await request.formData();

    const ticketType = formData.get('ticketType') as string;
    const quantity = parseInt(formData.get('quantity') as string) || 1;
    const attendeeName = formData.get('attendeeName') as string;
    const attendeeEmail = formData.get('attendeeEmail') as string;
    const attendeeCompany = formData.get('attendeeCompany') as string;
    const attendeePhone = formData.get('attendeePhone') as string;

    // Validation
    if (!ticketType || !attendeeName || !attendeeEmail) {
      return fail(400, { message: 'Please fill in all required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(attendeeEmail)) {
      return fail(400, { message: 'Please enter a valid email address' });
    }

    // Calculate total based on ticket type
    const prices: Record<string, number> = {
      regular: 5000000,
      vip: 10000000,
      regular_bundle_3: 10000000,
      vip_bundle_3: 20000000,
      standard: 5000000,
      corporate_table: 20000000,
    };

    const totalAmount = (prices[ticketType] || 10000000) * quantity;

    try {
      const [booking] = await db.insert(ticketBooking).values({
        userId: locals.user?.id || null,
        ticketType,
        quantity,
        totalAmount,
        attendeeName,
        attendeeEmail,
        attendeeCompany: attendeeCompany || null,
        attendeePhone: attendeePhone || null,
        paymentStatus: 'pending',
      }).returning();

      return {
        success: true,
        bookingId: booking.id,
        totalAmount,
      };
    } catch (e) {
      console.error('Ticket booking error:', e);
      return fail(500, { message: 'Failed to create booking. Please try again.' });
    }
  },
};
