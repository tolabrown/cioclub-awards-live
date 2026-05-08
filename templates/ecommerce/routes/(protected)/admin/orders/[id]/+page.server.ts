import type { PageServerLoad, Actions } from './$types';
import { OrderCRUD } from '$lib/db/order';
import { error, redirect } from '@sveltejs/kit';

export const load = (async ({ params }) => {
  const { id } = params;

  const result = await OrderCRUD.getByIdWithItems(id);

  if (!result.success || !result.data) {
    throw error(404, 'Order not found');
  }

  return {
    order: result.data,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  updateStatus: async ({ request, params }) => {
    const { id } = params;
    const formData = await request.formData();
    const status = formData.get('status') as string;
    const trackingNumber = formData.get('trackingNumber') as string;
    const shippedAtStr = formData.get('shippedAt') as string;
    const deliveredAtStr = formData.get('deliveredAt') as string;

    const updates: any = {};
    if (status) updates.status = status;
    if (trackingNumber !== null) updates.trackingNumber = trackingNumber;

    if (shippedAtStr) {
      updates.shippedAt = new Date(shippedAtStr);
    } else if (shippedAtStr === "") {
      updates.shippedAt = null;
    }

    if (deliveredAtStr) {
      updates.deliveredAt = new Date(deliveredAtStr);
    } else if (deliveredAtStr === "") {
      updates.deliveredAt = null;
    }

    const result = await OrderCRUD.update(id as string, updates);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  },
};
