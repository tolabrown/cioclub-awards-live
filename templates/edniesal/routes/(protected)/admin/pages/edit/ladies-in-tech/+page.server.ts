import { fail, type Actions, error } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { pageContent, partner, file as fileTable } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { Role } from '$lib/constants';
import { handleFileUpload, deleteFileById } from '$lib/server/minio';
import type { PageServerLoad } from './$types';
import { LIT_DEFAULT } from '$lib/constants/defaults';

const PATH = '/ladies-in-tech';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || (locals.user.role !== Role.ADMIN)) {
    throw error(403, 'Forbidden');
  }

  const [content, partners] = await Promise.all([
    db.query.pageContent.findFirst({
      where: eq(pageContent.path, PATH)
    }),
    db.query.partner.findMany({
      where: eq(partner.category, 'LadiesInTech'),
      orderBy: partner.displayOrder,
      with: {
        logo: true
      }
    })
  ]);

  return {
    path: PATH,
    pageContent: content || {
      path: PATH,
      data: JSON.stringify(LIT_DEFAULT),
      title: LIT_DEFAULT.title || 'Ladies in Tech',
      description: LIT_DEFAULT.description || '',
      ogimage: ''
    },
    partners: partners || []
  };
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    if (!locals.user || (locals.user.role !== Role.ADMIN)) {
      throw error(403, 'Forbidden');
    }

    const formData = await request.formData();
    const data = formData.get('data') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const ogimage = formData.get('ogimage') as string;

    if (data === null) return fail(400, { error: 'Missing content data' });

    try {
      const existing = await db.query.pageContent.findFirst({
        where: eq(pageContent.path, PATH)
      });

      if (existing) {
        await db.update(pageContent)
          .set({
            data,
            title,
            description,
            ogimage,
            updatedBy: locals.user.id,
            updatedAt: new Date()
          })
          .where(eq(pageContent.path, PATH));
      } else {
        await db.insert(pageContent).values({
          path: PATH,
          data,
          title,
          description,
          ogimage,
          updatedBy: locals.user.id
        });
      }

      return { success: true };
    } catch (err) {
      console.error('Save error:', err);
      return fail(500, { error: 'Failed to save page content' });
    }
  },

  uploadImage: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return fail(400, { error: 'No image provided' });
    }

    try {
      // Use existing project utility for MinIO upload
      const result = await handleFileUpload(file);

      // Save to database file table
      const [dbFile] = await db.insert(fileTable).values({
        remoteId: result.id,
        url: result.url,
        directUrl: result.directUrl,
        size: result.size,
        type: result.contentType,
        name: result.filename
      }).returning();

      return {
        success: true,
        image: {
          url: dbFile.url,
          directUrl: dbFile.directUrl,
          id: dbFile.id
        }
      };
    } catch (err) {
      console.error('Upload error:', err);
      return fail(500, { error: 'Upload failed' });
    }
  },

  savePartner: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const logoId = formData.get('logoId') as string;
    const displayOrder = parseInt(formData.get('displayOrder') as string) || 0;
    const websiteUrl = formData.get('websiteUrl') as string;
    const type = formData.get('type') as string;

    if (!name || !logoId) {
      return fail(400, { error: 'Missing name or logo' });
    }

    try {
      if (id) {
        await db.update(partner)
          .set({ name, logoId, displayOrder, websiteUrl, type, updatedAt: new Date() })
          .where(and(eq(partner.id, id), eq(partner.category, 'LadiesInTech')));
      } else {
        await db.insert(partner).values({
          name,
          logoId,
          displayOrder,
          websiteUrl,
          type,
          category: 'LadiesInTech'
        });
      }
      return { success: true };
    } catch (err) {
      console.error('Partner save error:', err);
      return fail(500, { error: 'Failed to save partner' });
    }
  },

  deletePartner: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) return fail(400, { error: 'Missing partner ID' });

    try {
      const partnerData = await db.query.partner.findFirst({
        where: and(eq(partner.id, id), eq(partner.category, 'LadiesInTech'))
      });

      if (partnerData?.logoId) {
        // Find the file record to get the remoteId for MinIO deletion
        const fileRecord = await db.query.file.findFirst({
          where: eq(fileTable.id, partnerData.logoId)
        });

        if (fileRecord) {
          await deleteFileById('uploads', fileRecord.remoteId);
          await db.delete(fileTable).where(eq(fileTable.id, fileRecord.id));
        }
      }

      await db.delete(partner)
        .where(and(eq(partner.id, id), eq(partner.category, 'LadiesInTech')));
      return { success: true };
    } catch (err) {
      console.error('Partner delete error:', err);
      return fail(500, { error: 'Failed to delete partner' });
    }
  },

  deleteFile: async ({ request }) => {
    const formData = await request.formData();
    const fileId = formData.get('fileId') as string;

    if (!fileId) return fail(400, { error: 'Missing file ID' });

    try {
      const fileRecord = await db.query.file.findFirst({
        where: eq(fileTable.id, fileId)
      });

      if (fileRecord) {
        await deleteFileById('uploads', fileRecord.remoteId);
        await db.delete(fileTable).where(eq(fileTable.id, fileId));
      }
      return { success: true };
    } catch (err) {
      console.error('File delete error:', err);
      return fail(500, { error: 'Failed to delete file' });
    }
  }
};
