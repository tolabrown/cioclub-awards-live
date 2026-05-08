import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { ladiesInTechRegistrations, ladiesInTechEvents } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url }) => {
  const status = url.searchParams.get('status');
  const tx_ref = url.searchParams.get('tx_ref');
  const transaction_id = url.searchParams.get('transaction_id');

  if (!tx_ref || !transaction_id) {
    throw redirect(303, '/ladies-in-tech?error=invalid_parameters');
  }

  if (status === 'successful' || status === 'completed') {
    try {
      // Verify via Flutterwave REST API
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.FW_SECRET_KEY}`
        }
      });

      const verification = await response.json();

      if (
        verification?.status === 'success' &&
        verification?.data?.status === 'successful' &&
        verification?.data?.tx_ref === tx_ref
      ) {
        const [reg] = await db
          .update(ladiesInTechRegistrations)
          .set({ status: 'success' })
          .where(eq(ladiesInTechRegistrations.paymentRef, tx_ref))
          .returning();

        if (reg) {
          const event = await db.query.ladiesInTechEvents.findFirst({
            where: eq(ladiesInTechEvents.id, reg.eventId)
          });

          try {
            const { EmailService } = await import('$lib/server/emailservice');
            await EmailService.sendPaymentConfirmation(reg.email, {
              name: `${reg.firstName} ${reg.lastName}`,
              eventTitle: event?.title || 'Ladies in Tech & Leadership',
              amount: Number(reg.amount),
              paymentRef: reg.paymentRef || tx_ref,
              date: new Date().toLocaleDateString()
            });
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
          }

          throw redirect(303, `/ladies-in-tech/registration/success?id=${reg.id}`);
        }
      }
    } catch (e: any) {
      if (e?.status === 303) throw e;
      console.error('Payment verification error:', e);
    }
  }

  throw redirect(303, '/ladies-in-tech?error=payment_failed');
};
