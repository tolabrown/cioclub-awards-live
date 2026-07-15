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
      time: awardsEvent.date, // The same timestamp, frontend will format
      venue: awardsEvent.location || "To be announced",
    } : {
      name: `CIO & C-Suite Awards Africa ${currentYear}`,
      date: new Date(currentYear, 10, 28, 18, 0).toISOString(), // Fallback to Nov 28, 6 PM
      time: new Date(currentYear, 10, 28, 18, 0).toISOString(),
      venue: "Eko Hotels & Suites",
    },
    ticketTypes: [
      {
        id: 'standard',
        name: 'Standard',
        price: 10000000, // 100,000 NGN in kobo
        priceDisplay: '₦100,000',
        description: 'General admission to the awards ceremony',
        features: [
          'Access to awards ceremony',
          'Networking cocktails',
          'Dinner included',
          'Awards ceremony program',
        ],
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 20000000, // 200,000 NGN in kobo
        priceDisplay: '₦200,000',
        description: 'Premium experience with exclusive benefits',
        features: [
          'Priority seating',
          'VIP lounge access',
          'Premium dinner & drinks',
          'Exclusive networking session',
          'Gift bag & memorabilia',
          'Photo opportunity with winners',
        ],
        recommended: true,
      },
      {
        id: 'corporate_table',
        name: 'Corporate Table',
        price: 250000000, // 2,500,000 NGN in kobo
        priceDisplay: '₦2,500,000',
        description: 'Table of 10 for corporate groups',
        features: [
          'Premium table for 10 guests',
          'Prime location seating',
          'Corporate branding at table',
          'VIP service throughout',
          'Premium dinner & open bar',
          'Executive networking access',
          'Professional group photo',
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
      standard: 10000000,
      vip: 20000000,
      corporate_table: 250000000,
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
