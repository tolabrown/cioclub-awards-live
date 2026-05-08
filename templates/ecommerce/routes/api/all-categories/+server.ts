import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CategoryCRUD } from '$lib/db/category';
import { MAX_ITEMS_PER_PAGE } from '$lib/constants/index';

export const GET: RequestHandler = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || MAX_ITEMS_PER_PAGE.toString());
  const search = url.searchParams.get('search') || undefined;
  const activeParam = url.searchParams.get('active');
  const isActive = activeParam === 'true' ? true : activeParam === 'false' ? false : undefined;

  const results = await CategoryCRUD.getFiltered(
    { search, isActive },
    page,
    limit
  );

  return json(results);
};
