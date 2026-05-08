import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/auth';
import { OrderCRUD } from '$lib/db/order';
import { initializeTransaction, generatePaymentReference } from '$lib/server/paystack.server';
import { ProductCRUD } from '$lib/db/product';

export const POST: RequestHandler = async ({ request, url }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  const { productId, quantity = 1, email, fullName, phone, deliveryMethod, zoneId, city, shippingCost, pickupDetails, paymentMethod, amountToPayNow } = await request.json();

  // Validate based on delivery method
  if (!productId || !email || !fullName || !phone) {
    return json({ success: false, error: 'Missing required contact fields' }, { status: 400 });
  }

  const isPickup = deliveryMethod === 'pickup';

  if (!isPickup && (!zoneId || !city)) {
    return json({ success: false, error: 'Missing delivery zone or city' }, { status: 400 });
  }

  if (isPickup && !pickupDetails?.trim()) {
    return json({ success: false, error: 'Please provide pickup details' }, { status: 400 });
  }

  // Get product details
  const productResult = await ProductCRUD.getById(productId);
  if (!productResult.success || !productResult.data) {
    return json({ success: false, error: 'Product not found' }, { status: 404 });
  }
  const product = productResult.data;

  // Create shipping address object
  const shippingAddress = {
    fullName,
    addressLine1: isPickup ? 'Pickup' : `Quick Purchase - ${city}`,
    city: isPickup ? 'Lagos' : city,
    state: isPickup ? 'Lagos' : zoneId, // Using zone name as state for now
    country: 'NG',
    phone
  };

  // Calculate total (shipping is 0 for pickup)
  const subtotal = parseFloat(product.basePrice) * quantity;
  const totalShipping = isPickup ? 0 : (parseFloat(shippingCost) || 0);
  const total = subtotal + totalShipping;

  // Create order item
  const orderItems = [{
    productId: product.id,
    productName: product.name,
    productSku: product.sku,
    quantity: quantity,
    unitPrice: product.basePrice,
    totalPrice: (parseFloat(product.basePrice) * quantity).toFixed(2),
  }];

  // Create order
  const orderResult = await OrderCRUD.createWithItems(
    {
      userId: session?.user?.id || null,
      guestEmail: session?.user ? null : email,
      status: 'pending',
      paymentStatus: 'pending',
      subtotal: subtotal.toFixed(2),
      tax: '0.00',
      shippingCost: totalShipping.toFixed(2),
      total: total.toFixed(2),
      shippingAddress: shippingAddress as any,
      billingAddress: shippingAddress as any,
      deliveryMethod: isPickup ? 'pickup' : 'shipping',
      pickupDetails: isPickup ? pickupDetails : null,
      paymentMethod: paymentMethod || 'paystack',
      adminNotes: (paymentMethod === 'pod') ? `POD Order. Remaining balance: ${(total - (amountToPayNow || 0)).toFixed(2)}` : null,
    },
    orderItems as any
  );

  if (!orderResult.success || !orderResult.data) {
    return json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }

  const order = orderResult.data;

  // Initialize Paystack payment
  const paymentRef = generatePaymentReference();
  const callbackUrl = `${url.origin}/checkout/success?orderId=${order.id}`;

  const paymentResult = await initializeTransaction({
    email,
    amount: Math.round((amountToPayNow || total) * 100),
    reference: paymentRef,
    callback_url: callbackUrl,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      isQuickPurchase: true,
      customerName: fullName,
      customerPhone: phone,
      paymentMethod: paymentMethod || 'paystack'
    },
  });

  if (!paymentResult.success || !paymentResult.data) {
    return json({ success: false, error: paymentResult.error || 'Failed to initialize payment' }, { status: 500 });
  }

  // Update order with payment reference
  await OrderCRUD.update(order.id, { paymentReference: paymentRef } as any);

  return json({
    success: true,
    authorization_url: paymentResult.data.authorization_url
  });
};
