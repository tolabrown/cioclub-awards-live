import type { PageServerLoad } from './$types';
import { ProductCRUD } from '$lib/db/product';
import { CategoryCRUD } from '$lib/db/category';
import { MAX_ITEMS_PER_PAGE } from '$lib/constants/index';

export const load = (async () => {
  // Fetch featured products
  const featuredProducts = await ProductCRUD.getFeatured(8);

  // Fetch new arrivals
  const newArrivalsResult = await ProductCRUD.getFiltered(
    { isActive: true },
    { field: 'createdAt', direction: 'desc' },
    1,
    MAX_ITEMS_PER_PAGE
  );

  // Fetch categories (sorted by product count)
  const categoriesResult = await CategoryCRUD.getActiveWithCounts();
  const categories = categoriesResult.data ? categoriesResult.data.slice(0, 6) : [];

  return {
    featuredProducts: featuredProducts.data || [],
    newArrivals: newArrivalsResult.data || [],
    newArrivalsMeta: newArrivalsResult.meta,
    categories: categories
  };
}) satisfies PageServerLoad;
