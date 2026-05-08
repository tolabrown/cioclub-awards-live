import type { RequestHandler } from './$types';
import { ProductCRUD } from '$lib/db/product';
import { ReviewCRUD } from '$lib/db/review';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  const [productResult, reviewStats] = await Promise.all([
    ProductCRUD.getById(params.id),
    ReviewCRUD.getProductStats(params.id)
  ]);

  if (!productResult.success || !productResult.data) {
    return json({ success: false, error: 'Product not found' }, { status: 404 });
  }

  // Combine product data with review stats
  const productData = {
    ...productResult.data,
    reviewStats: reviewStats.data
  };

  return json({ success: true, data: productData });
};
