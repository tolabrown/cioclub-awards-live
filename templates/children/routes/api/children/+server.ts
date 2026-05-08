import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Fields } from '$lib/constants';
import { getSearchFilterList } from '$lib/server';
import { addChild } from '$lib/db/child';

export const GET: RequestHandler = async ({ locals, url }) => {
  return await getSearchFilterList(locals, url, Fields.CHILD)
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  const {
    parents = [], // Expect an array of parent objects
    image, // Avatar file ID
    files = [], // Additional media file IDs
    ...childData
  } = body;

  // 1. Create Child with avatar (ID will be auto-generated)
  const newChild = await addChild({
    ...childData,
    image: image || null
  }, locals.user);

  if (!newChild) {
    return json({ status: 'error', message: 'Failed to create child' }, { status: 500 });
  }

  // 2. Handle Parents (Create or Get)
  if (parents && parents.length > 0) {
    const { addParent, getParentByPhone } = await import('$lib/db/parent');
    const { addParentChild } = await import('$lib/db/parentchild');

    for (const [index, parent] of parents.entries()) {
      const { name, phone, email, parentType, isPrimary } = parent;

      if (!name || !phone) continue;

      let parentId: string;

      // Check if parent exists by phone
      const existingParent = await getParentByPhone(phone);

      if (existingParent) {
        parentId = existingParent.id;
      } else {
        // Create new parent (ID will be auto-generated)
        const newParent = await addParent({
          name,
          phone,
          email,
          parentType: parentType || 'Guardian'
        }, locals.user);

        if (newParent) {
          parentId = newParent.id;
        } else {
          console.error(`Failed to create parent: ${name}`);
          continue;
        }
      }

      // 3. Create Relationship (ID will be auto-generated)
      if (parentId) {
        await addParentChild({
          parentId: parentId,
          childId: newChild.id,
          isPrimary: isPrimary ?? (index === 0) // Default first parent to primary if not specified
        }, locals.user);
      }
    }
  }

  // 4. Handle additional media files
  if (files && files.length > 0) {
    const { addChildFile } = await import('$lib/db/childfile');

    for (const fileId of files) {
      if (fileId) {
        await addChildFile({
          childId: newChild.id,
          fileId: fileId
        }, locals.user);
      }
    }
  }

  return json({ status: 'success', data: newChild });
};
