import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { pageContent } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { Role } from '$lib/constants';
import { db } from '$lib/db/drizzle';
import {
  HOME_DEFAULT,
  ABOUT_DEFAULT,
  SERVICES_DEFAULT,
  LIT_DEFAULT,
  CONTACT_DEFAULT
} from '$lib/constants/defaults';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user || (locals.user.role !== Role.ADMIN)) {
    throw error(403, 'Forbidden');
  }

  let path = params.path;
  if (path === 'home') path = '/';
  else if (!path.startsWith('/')) path = '/' + path;

  // Determine default data based on path
  let defaultData = {};
  let defaultTitle = 'Page Title';
  let defaultDesc = 'Page Description';

  if (path === '/') {
    const { title, description, ...rest } = HOME_DEFAULT;
    defaultData = rest;
    defaultTitle = title;
    defaultDesc = description;
  } else if (path === '/about') {
    const { title, description, ...rest } = ABOUT_DEFAULT;
    defaultData = rest;
    defaultTitle = title;
    defaultDesc = description;
  } else if (path === '/services') {
    const { title, description, ...rest } = SERVICES_DEFAULT;
    defaultData = rest;
    defaultTitle = title;
    defaultDesc = description;
  } else if (path === '/ladies-in-tech') {
    const { title, description, ...rest } = LIT_DEFAULT;
    defaultData = rest;
    defaultTitle = title;
    defaultDesc = description;
  } else if (path === '/contact') {
    const { title, description, ...rest } = CONTACT_DEFAULT;
    defaultData = rest;
    defaultTitle = title;
    defaultDesc = description;
  }

  let content = null;
  try {
    const results = await db.select().from(pageContent).where(eq(pageContent.path, path)).limit(1);
    content = results[0] || null;
  } catch (e) {
    console.error("Error fetching page content:", e);
  }

  return {
    path,
    pageContent: content ?? {
      path,
      data: JSON.stringify(defaultData),
      title: defaultTitle,
      description: defaultDesc,
      ogimage: ''
    }
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
    const ogimage = formData.get('ogimage') as string;

    if (!path || data === null) return fail(400, { message: 'Missing required fields' });

    try {
      const results = await db.select().from(pageContent).where(eq(pageContent.path, path)).limit(1);
      const existing = results[0];

      if (existing) {
        await db.update(pageContent)
          .set({ data, title, description, ogimage, updatedBy: locals.user.id, updatedAt: new Date() })
          .where(eq(pageContent.path, path));
      } else {
        await db.insert(pageContent).values({
          path,
          data,
          title,
          description,
          ogimage,
          updatedBy: locals.user.id
        });
      }

      return { success: true };
    } catch (e) {
      console.error("Update error:", e);
      return fail(500, { message: 'Failed to update content.' });
    }
  }
};
