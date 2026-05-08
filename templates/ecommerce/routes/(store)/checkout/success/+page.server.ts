import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { verifyTransaction } from '$lib/server/paystack.server';
import { OrderCRUD } from '$lib/db/order';
import { emailService } from '$lib/server/emailservice';
import { formatPrice } from '$lib/fxns';

export const load = (async ({ url }) => {
  const orderId = url.searchParams.get('orderId');
  const reference = url.searchParams.get('reference');

  if (!orderId || !reference) {
    // If no orderId/reference, just show a generic success/error message or redirect
    return { status: 'unknown' };
  }

  // Verify with Paystack
  const verification = await verifyTransaction(reference);

  if (verification.success && verification.data?.status === 'success') {
    // Update order status
    await OrderCRUD.updatePaymentStatus(orderId, 'paid', reference);
    await OrderCRUD.updateStatus(orderId, 'processing');

    const orderResult = await OrderCRUD.getById(orderId);

    if (orderResult.success && orderResult.data) {
      // Send email notifications
      await emailService.sendTransactionNotification(
        orderResult.data.user?.email || verification.data.customer.email,
        {
          id: orderId,
          orderNumber: orderResult.data.orderNumber,
          total: formatPrice(orderResult.data.total),
          deliveryMethod: orderResult.data.deliveryMethod as 'shipping' | 'pickup' | undefined,
          pickupDetails: orderResult.data.pickupDetails,
          shippingAddress: orderResult.data.shippingAddress as any,
        }
      );
    }

    return {
      status: 'success',
      order: orderResult.success ? orderResult.data : null
    };
  } else {
    // Payment failed
    await OrderCRUD.updatePaymentStatus(orderId, 'failed', reference);
    return {
      status: 'failed',
      message: verification.error || 'Payment verification failed'
    };
  }
}) satisfies PageServerLoad;
