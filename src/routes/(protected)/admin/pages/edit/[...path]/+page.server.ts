import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { pageContent } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { Role } from '$lib/constants';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user || (locals.user.role !== Role.ADMIN)) {
    throw error(403, 'Forbidden');
  }

  let path = params.path;
  if (path === 'home') path = '/';
  else if (!path.startsWith('/')) path = '/' + path;

  let content = null;
  try {
    content = await db.query.pageContent.findFirst({
      where: eq(pageContent.path, path)
    });
  } catch (e) {
    console.error("Error fetching page content:", e);
  }

  return {
    path,
    pageContent: content ?? { path, data: '{}', title: '', description: '' }
  };
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    if (!locals.user || (locals.user.role !== Role.ADMIN)) {
      throw error(403, 'Forbidden');
    }

    const formData = await request.formData();
    const path = formData.get('path') as string;
    const data = formData.get('data') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!path || data === null) return fail(400, { message: 'Missing required fields' });

    try {
      const existing = await db.query.pageContent.findFirst({
        where: eq(pageContent.path, path)
      });

      if (existing) {
        await db.update(pageContent)
          .set({ data, title, description, updatedBy: locals.user.id, updatedAt: new Date() })
          .where(eq(pageContent.path, path));
      } else {
        await db.insert(pageContent).values({
          path,
          data,
          title,
          description,
          updatedBy: locals.user.id
        });
      }

      return { success: true };
    } catch (e) {
      console.error("Update error:", e);
      return fail(500, { message: 'Failed to update content. Database table might be missing.' });
    }
  }
};
