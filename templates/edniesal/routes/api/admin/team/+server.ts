import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { teamMembers, file } from '$lib/db/schema';
import { eq, or, ilike, and, sql, asc } from 'drizzle-orm';
import { Role } from '$lib/constants';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user || locals.user.role !== Role.ADMIN) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  const search = url.searchParams.get('search') || '';
  const type = url.searchParams.get('type') || '';

  try {
    let query = db.select({
      id: teamMembers.id,
      name: teamMembers.name,
      role: teamMembers.role,
      bio: teamMembers.bio,
      imageUrl: teamMembers.imageUrl,
      imageId: teamMembers.imageId,
      linkedinUrl: teamMembers.linkedinUrl,
      type: teamMembers.type,
      updatedAt: teamMembers.updatedAt,
      image: {
        url: file.url,
      }
    }).from(teamMembers)
      .leftJoin(file, eq(teamMembers.imageId, file.id));

    const conditions = [];
    if (search) {
      conditions.push(or(
        ilike(teamMembers.name, `%${search}%`),
        ilike(teamMembers.role, `%${search}%`)
      ));
    }
    if (type) {
      conditions.push(eq(teamMembers.type, type));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(asc(teamMembers.displayOrder), teamMembers.name);

    return json({ success: true, results });
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || locals.user.role !== Role.ADMIN) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await request.json();
    const { id, name, role, bio, imageId, imageUrl, linkedinUrl, type } = data;

    if (!name || !role) {
      return json({ error: 'Name and Role are required' }, { status: 400 });
    }

    const values = {
      name,
      role,
      bio,
      imageId,
      imageUrl,
      linkedinUrl,
      type: type || 'executive',
      updatedAt: new Date()
    };

    if (id) {
      await db.update(teamMembers).set(values).where(eq(teamMembers.id, id));
      return json({ success: true, message: 'Member updated' });
    } else {
      // Get the next displayOrder
      const lastMember = await db.select({ maxOrder: sql<number>`max(${teamMembers.displayOrder})` })
        .from(teamMembers);
      const nextOrder = (lastMember[0]?.maxOrder || 0) + 1;

      await db.insert(teamMembers).values({
        ...values,
        displayOrder: nextOrder
      });
      return json({ success: true, message: 'Member created' });
    }
  } catch (error) {
    console.error('Failed to save team member:', error);
    return json({ error: 'Failed to save team member' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || locals.user.role !== Role.ADMIN) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) return json({ error: 'ID required' }, { status: 400 });

    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return json({ success: true, message: 'Member deleted' });
  } catch (error) {
    console.error('Failed to delete team member:', error);
    return json({ error: 'Failed to delete team member' }, { status: 500 });
  }
};
