import type { PageServerLoad } from './$types';
import { OrderCRUD } from '$lib/db/order';

export const load = (async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const status = url.searchParams.get('status') as any;

  const result = await OrderCRUD.getFiltered(
    status ? { status } : undefined,
    page,
    20
  );

  return {
    orders: result.data || [],
    meta: result.meta,
  };
}) satisfies PageServerLoad;
