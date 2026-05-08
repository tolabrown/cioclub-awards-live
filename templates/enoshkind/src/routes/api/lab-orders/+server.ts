import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addLabOrder, getLabOrders, updateLabOrder } from '$lib/db/lab';
import { env } from '$env/dynamic/private';

const LAB_PRICES: Record<string, number> = {
  essential: 25000,
  comprehensive: 55000,
  diabetes: 18000,
  hormonal: 42000,
  dna_full: 120000,
  dna_predisposition: 85000,
  hba1c: 8500,
  lipid: 12000,
  kidney: 15500
};

export const GET: RequestHandler = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orders = await getLabOrders(user.id);
    return json({ success: true, data: orders });
  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals, url }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { testType, scheduledCollection } = data;
    const price = LAB_PRICES[testType] || 25000;

    // 1. Create a pending lab order
    const order = await addLabOrder({
      userId: user.id,
      testType,
      status: 'order_placed',
      technicianName: 'Adamu Yahaya',
      technicianPhone: '+234 803 XXX XXXX',
      scheduledCollection: scheduledCollection ? new Date(scheduledCollection) : null,
      paid: false
    });

    // 2. Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: price * 100, // in kobo
        currency: 'NGN',
        callback_url: `${url.origin}/telemedicine/verify?type=lab`,
        metadata: {
          orderId: order.id,
          userId: user.id,
          type: 'lab',
          testType
        },
        reference: `LAB_${order.id}_${Date.now()}`
      })
    });

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json();
      return json({ success: false, message: 'Payment initialization failed', error: errorData }, { status: 500 });
    }

    const paystackData = await paystackResponse.json();

    return json({
      success: true,
      payment_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      orderId: order.id
    });

  } catch (error: any) {
    console.error('Lab order error:', error);
    return json({ success: false, message: error.message }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { reference } = await request.json();

    // Verify payment with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      }
    });

    if (!verifyResponse.ok) {
      return json({ success: false, message: 'Payment verification failed' }, { status: 400 });
    }

    const verifyData = await verifyResponse.json();

    if (verifyData.data.status === 'success') {
      const orderId = verifyData.data.metadata.orderId;

      await updateLabOrder(orderId, {
        paid: true,
        status: 'kit_prepared'
      });

      return json({ success: true, message: 'Payment verified', orderId });
    } else {
      return json({ success: false, message: 'Payment not successful' }, { status: 400 });
    }

  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};
