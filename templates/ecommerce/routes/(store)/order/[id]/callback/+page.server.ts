import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { verifyTransaction } from '$lib/server/paystack.server';
import { OrderCRUD } from '$lib/db/order';
import { emailService } from '$lib/server/emailservice';
import { formatPrice } from '$lib/fxns';

export const load = (async ({ params, url }) => {
  const { id } = params;
  const reference = url.searchParams.get('reference');

  if (!reference) {
    throw redirect(303, `/order/${id}/confirmed?error=missing_reference`);
  }

  // Verify with Paystack
  const verification = await verifyTransaction(reference);

  if (verification.success && verification.data?.status === 'success') {
    // Update order status
    await OrderCRUD.updatePaymentStatus(id, 'paid', reference);
    await OrderCRUD.updateStatus(id, 'processing');

    const orderResult = await OrderCRUD.getById(id);
    if (orderResult.success && orderResult.data) {
      await emailService.sendTransactionNotification(
        orderResult.data.user?.email || verification.data.customer.email,
        {
          id: id,
          orderNumber: orderResult.data.orderNumber,
          total: formatPrice(orderResult.data.total),
          deliveryMethod: orderResult.data.deliveryMethod as 'shipping' | 'pickup' | undefined,
          pickupDetails: orderResult.data.pickupDetails,
          shippingAddress: orderResult.data.shippingAddress as any,
        }
      );
    }

    throw redirect(303, `/order/${id}/confirmed?status=success`);
  } else {
    // Payment failed or abandoned
    await OrderCRUD.updatePaymentStatus(id, 'failed', reference);
    throw redirect(303, `/order/${id}/confirmed?status=failed&message=${verification.error || 'Payment verification failed'}`);
  }
}) satisfies PageServerLoad;
