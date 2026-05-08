import { json } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { consultation, doctor } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

export const POST = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { consultationId } = await request.json();

    // 1. Fetch consultation and doctor details
    const session = await db.query.consultation.findFirst({
      where: eq(consultation.id, consultationId),
      with: {
        doctor: true
      }
    });

    if (!session) return json({ success: false, message: 'Consultation not found' }, { status: 404 });
    if (session.status !== 'completed') return json({ success: false, message: 'Consultation is not completed' }, { status: 400 });
    if (session.payoutStatus !== 'none') return json({ success: false, message: 'Payout already initiated' }, { status: 400 });

    const dr = session.doctor;
    if (!dr || !dr.paystackRecipientCode) {
      return json({ success: false, message: 'Doctor payout details not configured' }, { status: 400 });
    }

    // 2. Calculate Payout Amount
    // Assuming totalFee includes service charge, we pay the doctor their base price
    // Or if totalFee is what we payout, use that. 
    // Usually, totalFee = (doctor.price) + serviceCharge.
    // So we pay the dr.price.
    const amountToPay = dr.price; // in kobo

    // 3. Initiate Paystack Transfer
    const transferRes = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: 'balance',
        amount: amountToPay,
        recipient: dr.paystackRecipientCode,
        reason: `Consultation Payout: ${session.id.slice(0, 8)}`
      })
    });

    const transferData = await transferRes.json();
    if (!transferData.status) {
      return json({ success: false, message: transferData.message || 'Paystack transfer failed' }, { status: 400 });
    }

    // 4. Update Database
    await db.update(consultation)
      .set({ payoutStatus: 'pending' })
      .where(eq(consultation.id, consultationId));

    return json({ success: true, message: 'Payout initiated successfully' });
  } catch (error: any) {
    console.error('Payout error:', error);
    return json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
