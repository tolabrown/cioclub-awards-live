import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductCRUD } from '$lib/db/product';
import { MAX_ITEMS_PER_PAGE } from '$lib/constants/index';

export const GET: RequestHandler = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || MAX_ITEMS_PER_PAGE.toString());
  const search = url.searchParams.get('search') || undefined;
  const categoryId = url.searchParams.get('category') || undefined;
  const categoryIds = url.searchParams.get('categories')?.split(',').filter(Boolean) || undefined;
  const minPrice = url.searchParams.get('minPrice') ? parseInt(url.searchParams.get('minPrice')!) : undefined;
  const maxPrice = url.searchParams.get('maxPrice') ? parseInt(url.searchParams.get('maxPrice')!) : undefined;
  const featured = url.searchParams.get('featured') === 'true';
  const sortParam = url.searchParams.get('sort') || 'newest';

  // Map sort param to field/direction
  const sortMapping: Record<string, { field: any; direction: 'asc' | 'desc' }> = {
    newest: { field: 'createdAt', direction: 'desc' },
    oldest: { field: 'createdAt', direction: 'asc' },
    'price-asc': { field: 'basePrice', direction: 'asc' },
    'price-desc': { field: 'basePrice', direction: 'desc' },
    name: { field: 'name', direction: 'asc' },
  };

  const sort = sortMapping[sortParam] || sortMapping.newest;

  const discountValue = url.searchParams.get('discount')?.split('-')[0];
  const minDiscount = discountValue ? parseInt(discountValue) : undefined;

  const activeParam = url.searchParams.get('active');
  const isActive = activeParam === 'true' ? true : activeParam === 'false' ? false : undefined;

  const productsResult = await ProductCRUD.getFiltered(
    {
      search,
      isActive,
      isFeatured: featured || undefined,
      categoryId,
      categoryIds,
      minPrice,
      maxPrice,
      minDiscount
    },
    sort,
    page,
    limit
  );

  return json(productsResult);
};
