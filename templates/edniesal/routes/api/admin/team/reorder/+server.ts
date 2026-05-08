import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { teamMembers } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { Role } from '$lib/constants';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || locals.user.role !== Role.ADMIN) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { items } = await request.json(); // Array of { id: string, displayOrder: number }

    if (!Array.isArray(items)) {
      return json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Perform batch updates
    // In a real production app with many members, you might want to use a transaction
    // and potentially a more optimized SQL query if the list is very large.
    // For this context, sequential updates are fine.
    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx.update(teamMembers)
          .set({ displayOrder: item.displayOrder })
          .where(eq(teamMembers.id, item.id));
      }
    });

    return json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Failed to reorder team members:', error);
    return json({ error: 'Failed to reorder team members' }, { status: 500 });
  }
};
