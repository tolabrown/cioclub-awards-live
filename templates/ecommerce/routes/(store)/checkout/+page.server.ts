import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { CartCRUD } from '$lib/db/cart';
import { OrderCRUD } from '$lib/db/order';
import { initializeTransaction, generatePaymentReference } from '$lib/server/paystack.server';
import { jumiaShipping } from '$lib/server/shipping';

export const load = (async ({ request, cookies, url }) => {
  const session = await auth.api.getSession({ headers: request.headers });

  let cart = null;

  if (session?.user) {
    const result = await CartCRUD.getOrCreateForUser(session.user.id);
    cart = result.data;
  } else {
    const sessionId = cookies.get('cart_session');
    if (sessionId) {
      const result = await CartCRUD.getOrCreateForSession(sessionId);
      cart = result.data;
    }
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    throw redirect(303, '/cart');
  }

  return {
    user: session?.user || null,
    cart,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const session = await auth.api.getSession({ headers: request.headers });

    // Get cart
    let cart;
    if (session?.user) {
      const result = await CartCRUD.getOrCreateForUser(session.user.id);
      cart = result.data;
    } else {
      const sessionId = cookies.get('cart_session');
      if (sessionId) {
        const result = await CartCRUD.getOrCreateForSession(sessionId);
        cart = result.data;
      }
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      return fail(400, { error: 'Cart is empty' });
    }

    // Extract form data
    const email = formData.get('email') as string;
    const deliveryMethod = (formData.get('deliveryMethod') as string) || 'shipping';
    const pickupDetails = (formData.get('pickupDetails') as string) || '';

    const shippingAddress = {
      fullName: formData.get('shippingFullName') as string,
      addressLine1: formData.get('shippingAddressLine1') as string,
      addressLine2: (formData.get('shippingAddressLine2') as string) || undefined,
      city: formData.get('shippingCity') as string,
      state: formData.get('shippingState') as string,
      postalCode: formData.get('shippingPostalCode') as string,
      country: 'NG',
      phone: formData.get('shippingPhone') as string,
    };

    // Validate based on delivery method
    if (!email || !shippingAddress.fullName || !shippingAddress.phone) {
      return fail(400, { error: 'Missing required fields' });
    }

    if (deliveryMethod === 'shipping') {
      if (!shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state) {
        return fail(400, { error: 'Missing shipping address fields' });
      }
    } else if (deliveryMethod === 'pickup') {
      if (!pickupDetails.trim()) {
        return fail(400, { error: 'Please provide pickup details' });
      }
    }

    // Calculate totals - shipping is free for pickup
    const subtotal = cart.subtotal || 0;
    const tax = 0;

    let shippingCost = 0;
    if (deliveryMethod === 'shipping') {
      const formShippingCost = formData.get('shippingCost') as string;
      if (formShippingCost) {
        shippingCost = parseFloat(formShippingCost);
      } else {
        const zone = await jumiaShipping.getZoneForCity(shippingAddress.city);
        if (zone) {
          shippingCost = await jumiaShipping.calculateShipping(zone.zone);
        }
      }
    }

    const total = subtotal + tax + shippingCost;

    // Create order
    const orderItems = cart.items.map((item: any) => ({
      productId: item.productId,
      productSizeId: item.productSizeId,
      productName: item.product?.name || 'Product',
      productSku: item.product?.sku || 'SKU',
      sizeName: item.productSize?.size?.name,
      quantity: item.quantity,
      unitPrice: item.priceAtAdd,
      totalPrice: (parseFloat(item.priceAtAdd) * item.quantity).toFixed(2),
    }));

    const orderResult = await OrderCRUD.createWithItems(
      {
        userId: session?.user?.id || null,
        guestEmail: session?.user ? null : email,
        status: 'pending',
        paymentStatus: 'pending',
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        total: total.toFixed(2),
        shippingAddress,
        billingAddress: shippingAddress,
        deliveryMethod: deliveryMethod as 'shipping' | 'pickup',
        pickupDetails: deliveryMethod === 'pickup' ? pickupDetails : null,
      },
      orderItems
    );

    if (!orderResult.success || !orderResult.data) {
      return fail(500, { error: 'Failed to create order' });
    }

    const order = orderResult.data;

    // Initialize Paystack payment
    const paymentRef = generatePaymentReference();
    const callbackUrl = `${url.origin}/order/${order.id}/callback`;

    const paymentResult = await initializeTransaction({
      email,
      amount: Math.round(total * 100), // Convert to kobo
      reference: paymentRef,
      callback_url: callbackUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    if (!paymentResult.success || !paymentResult.data) {
      return fail(500, { error: paymentResult.error || 'Failed to initialize payment' });
    }

    // Update order with payment reference
    await OrderCRUD.update(order.id, { paymentReference: paymentRef } as any);

    // Clear cart
    await CartCRUD.clearCart(cart.id);

    // Redirect to Paystack
    throw redirect(303, paymentResult.data.authorization_url);
  },
};
