import type { PageServerLoad } from './$types';
import { CategoryCRUD } from '$lib/db/category';

export const load = (async () => {
  const categoriesResult = await CategoryCRUD.getAll();

  return {
    categories: categoriesResult.data || []
  };
}) satisfies PageServerLoad;
