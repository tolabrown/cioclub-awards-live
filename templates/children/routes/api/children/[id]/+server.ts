import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getChild, deleteChild, updateChild } from '$lib/db/child';
import type { iChild } from '$lib/interface';

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;
  const child = await getChild(id);

  if (!child) {
    return json({ status: 'error', message: 'Child not found' }, { status: 404 });
  }

  return json(child);
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const { id } = params;
  const body = await request.json();
  const {
    data: {
      parents = [],
      image, // New avatar file ID
      files = [], // New additional media file IDs
      ...childData
    }
  } = body;

  // 1. Handle avatar update (delete old if changed)
  if (image !== undefined) {
    const currentChild = await getChild(id);
    if (currentChild && currentChild.image) {
      // Extract the file ID from image (could be string or iFile object)
      const currentImageId = typeof currentChild.image === 'string'
        ? currentChild.image
        : currentChild.image.id;

      if (currentImageId !== image) {
        // Delete old avatar from MinIO and database
        const { deleteFileFromMinioAndFileTable } = await import('$lib/server');
        await deleteFileFromMinioAndFileTable(currentImageId);
      }
    }
    childData.image = image;
  }

  // 2. Update Child
  const updatedChild = await updateChild(id, childData, locals.user);

  if (updatedChild.status === 'error') {
    return json(updatedChild, { status: 500 });
  }

  // 3. Handle Parent Updates
  if (parents && parents.length > 0) {
    const { getParentsByChildId, addParentChild } = await import('$lib/db/parentchild');
    const { updateParent, addParent, getParentByPhone } = await import('$lib/db/parent');

    // Get existing relationships to know which parents are already linked
    const existingRelationsResult = await getParentsByChildId(id);
    const existingRelations = existingRelationsResult.data || [];

    for (const [index, parentData] of parents.entries()) {
      const { name, phone, email, parentType, isPrimary } = parentData;

      if (!name || !phone) continue;

      // Check if this parent is already linked to the child (by phone)
      const existingRelation = existingRelations.find((r: any) => r.parent.phone === phone);

      if (existingRelation) {
        // Update existing parent details
        await updateParent(existingRelation.parent.id, {
          name,
          phone,
          email,
          parentType: parentType || existingRelation.parent.parentType
        }, locals.user);
        // Note: We could also update isPrimary status in parentChild table if needed
      } else {
        // Parent not linked. Check if parent exists in DB by phone
        const existingParent = await getParentByPhone(phone);
        let parentId = existingParent?.id;

        if (existingParent) {
          // Update existing parent details
          await updateParent(existingParent.id, {
            name,
            phone,
            email,
            parentType: parentType || existingParent.parentType
          }, locals.user);
        } else {
          // Create new parent
          const newParent = await addParent({
            name,
            phone,
            email,
            parentType: parentType || 'Guardian'
          }, locals.user);
          parentId = newParent?.id;
        }

        // Create relationship if we have a parentId
        if (parentId) {
          await addParentChild({
            parentId: parentId,
            childId: id, // id is string from params, schema expects text
            isPrimary: isPrimary ?? (index === 0 && existingRelations.length === 0)
          }, locals.user);
        }
      }
    }
  }

  // 4. Handle additional media files (replace all existing relationships)
  if (files !== undefined) {
    const { addChildFile, deleteFilesByChildId } = await import('$lib/db/childfile');

    // First, delete all existing file relationships for this child
    await deleteFilesByChildId(id, locals.user);

    // Then add the new relationships
    if (files && files.length > 0) {
      for (const fileId of files) {
        if (fileId) {
          await addChildFile({
            childId: id,
            fileId: fileId
          }, locals.user);
        }
      }
    }
  }

  return json(updatedChild);
};

export const DELETE: RequestHandler = async ({ params, request, locals }) => {
  const { id } = params;

  // 1. Get child data to access avatar and files
  const { child } = await request.json() as { child: iChild }

  if (!child) {
    return json({ status: 'error', message: 'Child not found' }, { status: 404 });
  }

  // 2. Delete avatar from MinIO if exists
  if (child.image) {
    const { deleteFileFromMinioAndFileTable } = await import('$lib/server');
    // Remove the id of the image from child row
    await updateChild(id, { image: null }, locals.user);
    // Extract the file ID from image (could be string or iFile object)
    const imageId = typeof child.image === 'string'
      ? child.image
      : child.image.id;
    await deleteFileFromMinioAndFileTable(imageId);
  }

  // 3. Delete all associated media files from MinIO
  if (child.files && child.files.length > 0) {
    const { deleteFileFromMinioAndFileTable } = await import('$lib/server');
    for (const file of child.files) {
      if (file.id) {
        await deleteFileFromMinioAndFileTable(file.id);
      }
    }
  }

  // 4. Delete child (cascade will handle relationships)
  const result = await deleteChild(id, locals.user);

  if (result.status === 'error') {
    return json(result, { status: 500 });
  }

  return json(result);
};
