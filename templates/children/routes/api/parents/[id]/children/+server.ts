import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/drizzle';
import { child, parentChild, file } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculateAgeGroup } from '$lib/utils';

export const GET: RequestHandler = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return json({ status: 'error', message: 'Parent ID is required' }, { status: 400 });
  }

  try {
    const children = await db
      .select({
        id: child.id,
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        image: {
          url: file.url
        }
      })
      .from(parentChild)
      .innerJoin(child, eq(parentChild.childId, child.id))
      .leftJoin(file, eq(child.image, file.id))
      .where(eq(parentChild.parentId, id));

    const childrenWithAgeGroup = children.map(c => ({
      ...c,
      ageGroup: calculateAgeGroup(c.dateOfBirth)
    }));

    return json({ status: 'success', data: childrenWithAgeGroup });
  } catch (error: any) {
    console.error("Fetch children by parent error:", error);
    return json({ status: 'error', message: error.message }, { status: 500 });
  }
};
