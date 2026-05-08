import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { ProductCRUD } from '$lib/db/product';
import { TagCRUD } from '$lib/db/tag';
import { SizeCRUD } from '$lib/db/size';
import { CategoryCRUD } from '$lib/db/category';
import { FileCRUD } from '$lib/db/file';
import { deleteFileById } from '$lib/server/minio';
import { db } from '$lib/db/drizzle';
import { productImage, productTag, productSize } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load = (async ({ params }) => {
  const [productResult, categories, tags, sizes] = await Promise.all([
    ProductCRUD.getById(params.id),
    CategoryCRUD.getAll(),
    TagCRUD.getAll(),
    SizeCRUD.getAll(),
  ]);

  if (!productResult.success || !productResult.data) {
    throw redirect(303, '/admin/products');
  }

  return {
    product: productResult.data,
    categories: categories.data || [],
    tags: tags.data || [],
    sizes: sizes.data || [],
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  update: async ({ params, request }) => {
    const formData = await request.formData();
    const productId = params.id;

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const sku = formData.get('sku') as string;
    const barcode = formData.get('barcode') as string;
    const basePrice = formData.get('basePrice') as string;
    const compareAtPrice = formData.get('compareAtPrice') as string;
    const marketPrice = formData.get('marketPrice') as string;
    const stockQuantity = parseInt(formData.get('stockQuantity') as string) || 0;
    const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string) || 10;
    const categoryId = formData.get('categoryId') as string;
    const isActive = formData.get('isActive') === 'on' || formData.get('isActive') === 'true';
    const isFeatured = formData.get('isFeatured') === 'on' || formData.get('isFeatured') === 'true';
    const metaTitle = formData.get('metaTitle') as string;
    const metaDescription = formData.get('metaDescription') as string;
    const isPublished = formData.get('isPublished') === 'true';
    const images = formData.getAll('images') as File[];

    console.log(`[Product Update] Recevied productId: ${productId}, name: ${name}, categoryId: ${categoryId}`);

    // Complex fields
    const tagIds = formData.getAll('tagIds') as string[];
    const featuresJson = formData.get('features') as string;
    const sizesDataJson = formData.get('sizes') as string;

    // Validate required fields
    if (!name || !description || !sku || !basePrice) {
      return fail(400, { error: 'Missing required fields' });
    }

    try {
      let features = [];
      try {
        if (featuresJson) features = JSON.parse(featuresJson);
      } catch (e) {
        console.error('Failed to parse features JSON', e);
      }

      // Update product
      const result = await ProductCRUD.update(productId, {
        name,
        description,
        shortDescription: shortDescription || null,
        sku,
        barcode: barcode || null,
        basePrice,
        compareAtPrice: compareAtPrice || null,
        marketPrice: marketPrice || null,
        stockQuantity,
        lowStockThreshold,
        categoryId: categoryId || null,
        isActive,
        isPublished,
        isFeatured,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        features,
        updatedAt: new Date(),
      });

      if (!result.success) {
        return fail(400, { error: result.error || 'Failed to update product' });
      }

      // Sync tags
      await db.delete(productTag).where(eq(productTag.productId, productId));
      if (tagIds.length > 0) {
        const tagInserts = tagIds.map(tagId => ({
          id: crypto.randomUUID(),
          productId,
          tagId,
        }));
        await db.insert(productTag).values(tagInserts);
      }

      // Sync sizes
      await db.delete(productSize).where(eq(productSize.productId, productId));
      if (sizesDataJson) {
        try {
          const sizesData = JSON.parse(sizesDataJson);
          if (Array.isArray(sizesData) && sizesData.length > 0) {
            const sizeInserts = sizesData.map(s => ({
              id: crypto.randomUUID(),
              productId,
              sizeId: s.sizeId,
              additionalPrice: s.additionalPrice || "0",
              stockQuantity: parseInt(s.stockQuantity) || 0,
              sku: s.sku || null,
              isAvailable: s.isAvailable !== false,
            }));
            await db.insert(productSize).values(sizeInserts);
          }
        } catch (e) {
          console.error('Failed to parse sizes JSON', e);
        }
      }

      // Handle new images (fallback for traditional form submission if needed, though we prefer immediate)
      const validImages = images.filter(img => img.size > 0);
      if (validImages.length > 0) {
        // Get current max sort order
        const currentImages = await db.select().from(productImage).where(eq(productImage.productId, productId));
        let maxSortOrder = currentImages.reduce((max, img) => Math.max(max, img.sortOrder), -1);

        for (let i = 0; i < validImages.length; i++) {
          const fileData = validImages[i];
          const uploadResult = await FileCRUD.upload(fileData, 'products');

          if (uploadResult.success && uploadResult.data) {
            await db.insert(productImage).values({
              id: crypto.randomUUID(),
              productId,
              fileId: uploadResult.data.id,
              url: uploadResult.data.url,
              remoteId: uploadResult.data.remoteId,
              altText: name,
              sortOrder: ++maxSortOrder,
              isPrimary: maxSortOrder === 0,
            });
          }
        }
      }

      throw redirect(303, '/admin/products');
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error && 'location' in error) {
        throw error;
      }
      console.error('Update product error:', error);

      let message = 'Failed to update product';
      if (error && typeof error === 'object') {
        const pgError = error as any;
        if (pgError.detail) {
          message = pgError.detail;
        } else if (pgError.message) {
          if (pgError.message.includes('unique constraint') && pgError.message.includes('sku')) {
            message = 'A product with this SKU already exists. Product SKUs must be unique.';
          } else {
            message = pgError.message;
          }
        }
      }

      return fail(500, { error: message });
    }
  },
  uploadImage: async ({ request, params }) => {
    const productId = params.id;
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file || file.size === 0) {
      return fail(400, { error: 'No image provided' });
    }

    try {
      const uploadResult = await FileCRUD.upload(file, 'products');

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      // Get current max sort order
      const currentImages = await db.select().from(productImage).where(eq(productImage.productId, productId));
      const maxSortOrder = currentImages.reduce((max, img) => Math.max(max, img.sortOrder), -1);

      const [newImage] = await db.insert(productImage).values({
        id: crypto.randomUUID(),
        productId,
        fileId: uploadResult.data.id,
        url: uploadResult.data.url,
        remoteId: uploadResult.data.remoteId,
        altText: 'Product Image',
        sortOrder: maxSortOrder + 1,
        isPrimary: maxSortOrder === -1,
      }).returning();

      // Return image with file metadata
      return {
        image: {
          ...newImage,
          imageFile: uploadResult.data
        }
      };
    } catch (error) {
      console.error('Upload image error:', error);
      return fail(500, { error: error instanceof Error ? error.message : 'Failed to upload image' });
    }
  },
  uploadImageUrl: async ({ request, params }) => {
    const productId = params.id;
    const formData = await request.formData();
    const url = formData.get('url') as string;

    if (!url) {
      return fail(400, { error: 'URL is required' });
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image from URL');

      const blob = await response.blob();
      const filename = url.split('/').pop()?.split('?')[0] || 'image.webp';
      const file = new File([blob], filename, { type: blob.type });

      const uploadResult = await FileCRUD.upload(file, 'products');

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Failed to upload image from URL');
      }

      // Get current max sort order
      const currentImages = await db.select().from(productImage).where(eq(productImage.productId, productId));
      const maxSortOrder = currentImages.reduce((max, img) => Math.max(max, img.sortOrder), -1);

      const [newImage] = await db.insert(productImage).values({
        id: crypto.randomUUID(),
        productId,
        fileId: uploadResult.data.id,
        url: uploadResult.data.url,
        remoteId: uploadResult.data.remoteId,
        altText: 'Product Image',
        sortOrder: maxSortOrder + 1,
        isPrimary: maxSortOrder === -1,
      }).returning();

      return {
        image: {
          ...newImage,
          imageFile: uploadResult.data
        }
      };
    } catch (error) {
      console.error('Upload image URL error:', error);
      return fail(500, { error: 'Failed to upload image from URL' });
    }
  },
  deleteImage: async ({ request }) => {
    const formData = await request.formData();
    const imageId = formData.get('imageId') as string;
    const objectId = formData.get('objectId') as string;

    if (!imageId || !objectId) {
      return fail(400, { error: 'Image ID and Object ID are required' });
    }

    try {
      console.log(`--- [Product Image Delete] Step 1: Deleting from MinIO. Object: ${objectId} ---`);
      await deleteFileById('products', objectId);

      console.log(`[Product Image Delete] Step 2: Deleting from Database. ID: ${imageId}`);
      await ProductCRUD.removeImage(imageId);

      console.log('--- [Product Image Delete] Process Complete ---');
      return { success: true };
    } catch (error) {
      console.error('[Product Image Delete] Critical Error:', error);
      return fail(500, { error: 'Failed to delete image' });
    }
  },
};
