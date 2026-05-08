import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMarketplaceProducts, addMarketplaceProduct } from '$lib/db/marketplace';

export const GET: RequestHandler = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    let items = await getMarketplaceProducts();

    // Auto-seed if empty
    if (items.length === 0) {
      const seedItems = [
        {
          name: 'Smart Blood Pressure Monitor',
          category: 'Medical Devices',
          description: 'Bluetooth-enabled monitor that syncs results directly to your Enoshkind profile.',
          image: 'BP',
          price: 2500000, // in kobo
          rating: '4.90'
        },
        {
          name: 'GLUCO-Link Kit',
          category: 'Medical Devices',
          description: 'Premium glucometer with automatic meal-impact logging features.',
          image: 'GK',
          price: 1850000, // in kobo
          rating: '4.85'
        },
        {
          name: 'Chronic Care Subscription',
          category: 'Medications',
          description: 'Monthly delivery of your prescribed chronic medications with dosage reminders.',
          image: 'CC',
          price: 500000, // in kobo
          rating: '4.95'
        }
      ];

      for (const item of seedItems) {
        await addMarketplaceProduct(item);
      }
      items = await getMarketplaceProducts();
    }

    return json({ success: true, data: items });
  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await request.json();
    const result = await addMarketplaceProduct(data);
    return json({ success: true, data: result });
  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};
