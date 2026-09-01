import { db } from '$lib/db';
import { membershipPayment } from '$lib/db/schema';
import { desc, count, eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const payments = await db
      .select()
      .from(membershipPayment)
      .orderBy(desc(membershipPayment.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(membershipPayment);

    return {
      payments: payments.map(p => ({
        ...p,
        metadata: p.metadata ? JSON.parse(p.metadata) : null
      })),
      pagination: {
        total: Number(totalCount),
        page,
        limit,
        hasMore: offset + limit < Number(totalCount)
      }
    };
  } catch (e) {
    console.error('Error loading payments:', e);
    throw error(500, 'Failed to load membership payments');
  }
};

export const actions: Actions = {
  verify: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const reference = formData.get('reference') as string;

    if (!id || !reference) {
      return fail(400, { message: 'ID and reference are required' });
    }

    try {
      const { env } = await import('$env/dynamic/private');
      const { user, membershipInquiry } = await import('$lib/db/schema');
      const { calculateSubscriptionYearsFromKobo, calculateExtendedExpiry } = await import('$lib/utils/subscription');
      const { logActivity } = await import('$lib/server/activity-log');
      const { sql } = await import('drizzle-orm');

      // 1. Check Paystack
      let gatewayStatus = 'unknown';
      let isSuccess = false;
      let gatewayMessage = '';

      const psRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${env.PS_SECRET_KEY}` }
      });
      const psData = await psRes.json();

      if (psData.status && psData.data) {
        gatewayStatus = psData.data.status;
        gatewayMessage = psData.data.gateway_response || psData.message || '';
        isSuccess = psData.data.status === 'success';
      } else {
        // 2. Check Flutterwave
        const secretKey = env.FLUTTERWAVE_SECRET_KEY || env.FW_SECRET_KEY;
        const flwRes = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`, {
          headers: { Authorization: `Bearer ${secretKey}` }
        });
        const flwData = await flwRes.json();
        if (flwData.status === 'success' && flwData.data) {
          gatewayStatus = flwData.data.status;
          gatewayMessage = flwData.message || '';
          isSuccess = flwData.data.status === 'successful';
        }
      }

      if (isSuccess) {
        const [payment] = await db.select().from(membershipPayment).where(eq(membershipPayment.id, id));
        if (payment) {
          await db.update(membershipPayment).set({ status: 'success', updatedAt: new Date() }).where(eq(membershipPayment.id, id));

          if (payment.userId) {
            const [currentUser] = await db.select().from(user).where(eq(user.id, payment.userId));
            const yearsPaid = calculateSubscriptionYearsFromKobo(payment.tier, payment.amount);
            const newExpiry = calculateExtendedExpiry(currentUser?.subscriptionEndsAt, yearsPaid);
            const isCorporate = payment.tier.toLowerCase().includes('corporate');
            const targetRole = isCorporate ? 'member_corporate' : 'member_individual';

            await db.update(user).set({
              role: targetRole,
              subscriptionEndsAt: newExpiry,
              updatedAt: new Date()
            }).where(eq(user.id, payment.userId));

            await db.update(membershipInquiry).set({ status: 'approved' }).where(eq(sql`lower(${membershipInquiry.email})`, payment.email.toLowerCase()));

            try {
              const { EmailService } = await import('$lib/server/emailservice');
              await EmailService.sendMembershipConfirmation(
                payment.email,
                payment.fullName,
                payment.tier,
                `₦${(payment.amount / 100).toLocaleString()}`
              );
            } catch (emailErr) {
              console.error('Email error:', emailErr);
            }

            await logActivity(null, {
              userId: payment.userId,
              action: `Membership payment verified manually by admin (${payment.tier})`,
              operation: "UPDATE",
              entityType: "membership_payment",
              entityId: payment.id,
              metadata: { reference, amount: payment.amount, tier: payment.tier }
            });
          }
        }
        return { success: true, message: `Payment verified as SUCCESS and membership activated!` };
      } else {
        return fail(400, { message: `Gateway status is "${gatewayStatus}": ${gatewayMessage}` });
      }
    } catch (e: any) {
      console.error('Error verifying payment:', e);
      return fail(500, { message: e.message || 'Failed to verify payment with gateway' });
    }
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return fail(400, { message: 'ID is required' });
    }

    try {
      await db.delete(membershipPayment).where(eq(membershipPayment.id, id));
      return { success: true };
    } catch (e) {
      console.error('Error deleting payment:', e);
      return fail(500, { message: 'Failed to delete payment record' });
    }
  }
};
