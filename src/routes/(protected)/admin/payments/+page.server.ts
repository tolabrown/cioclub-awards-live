import { db } from '$lib/db';
import { membershipPayment } from '$lib/db/schema';
import { desc, count, eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const payments = await db
      .select()
      .from(membershipPayment)
      .orderBy(desc(membershipPayment.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(membershipPayment);

    return {
      payments: payments.map(p => ({
        ...p,
        metadata: p.metadata ? JSON.parse(p.metadata) : null
      })),
      pagination: {
        total: Number(totalCount),
        page,
        limit,
        hasMore: offset + limit < Number(totalCount)
      }
    };
  } catch (e) {
    console.error('Error loading payments:', e);
    throw error(500, 'Failed to load membership payments');
  }
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return fail(400, { message: 'ID is required' });
    }

    try {
      await db.delete(membershipPayment).where(eq(membershipPayment.id, id));
      return { success: true };
    } catch (e) {
      console.error('Error deleting payment:', e);
      return fail(500, { message: 'Failed to delete payment record' });
    }
  }
};
