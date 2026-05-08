import type { PageServerLoad } from './$types';
import { OrderCRUD } from '$lib/db/order';
import { error } from '@sveltejs/kit';

export const load = (async ({ params, url }) => {
  const { id } = params;
  const status = url.searchParams.get('status');
  const errorMsg = url.searchParams.get('message');

  const orderResult = await OrderCRUD.getByIdWithItems(id);

  return {
    order: orderResult.data || null,
    status,
    error: errorMsg,
  };
}) satisfies PageServerLoad;
