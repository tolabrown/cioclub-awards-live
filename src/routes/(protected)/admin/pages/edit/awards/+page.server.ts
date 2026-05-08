import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/db';
import { pageContent, partner, awardsJury, awardWinner, awardsTeam } from '$lib/db/schema';
import { getMostRecentJuryYear, getAllJuryYears } from '$lib/db/jury';
import { getMostRecentWinnerYear, getAllWinnerYears } from '$lib/db/winners';
import { getMostRecentTeamYear, getAllTeamYears } from '$lib/db/team';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { deleteAndRemoveFile, uploadAndSaveBuffer } from '$lib/server/minio';
import sharp from 'sharp';
import type { PageServerLoad } from './$types';

const PATH = '/awards';

export const load: PageServerLoad = async () => {
  const [content, partners, recentYear, availableYears, recentWinnerYear, availableWinnerYears, recentTeamYear, availableTeamYears] = await Promise.all([
    db.query.pageContent.findFirst({
      where: eq(pageContent.path, PATH)
    }),
    db.query.partner.findMany({
      where: eq(partner.category, 'Awards'),
      orderBy: partner.displayOrder,
      with: {
        logo: true
      }
    }),
    getMostRecentJuryYear(),
    getAllJuryYears(),
    getMostRecentWinnerYear(),
    getAllWinnerYears(),
    getMostRecentTeamYear(),
    getAllTeamYears()
  ]);

  return {
    content: content ? JSON.parse(content.data) : null,
    meta: content ? {
      title: content.title,
      description: content.description,
      ogImage: content.ogImage
    } : null,
    partners: partners || [],
    path: PATH,
    recentYear,
    availableYears,
    recentWinnerYear,
    availableWinnerYears,
    recentTeamYear,
    availableTeamYears
  };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    const formData = await request.formData();
    const data = formData.get('data') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const ogImage = formData.get('ogImage') as string;

    if (!data) {
      return fail(400, { error: 'Missing content data' });
    }

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
            ogImage,
            updatedAt: new Date(),
            updatedBy: locals.user?.id
          })
          .where(eq(pageContent.path, PATH));
      } else {
        await db.insert(pageContent).values({
          path: PATH,
          data,
          title,
          description,
          ogImage,
          updatedBy: locals.user?.id
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Save error:', error);
      return fail(500, { error: 'Failed to save awards page content' });
    }
  },

  uploadImage: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return fail(400, { error: 'No image provided' });
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const resizedBuffer = await sharp(buffer)
        .resize(800, 400, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const result = await uploadAndSaveBuffer(resizedBuffer, 'image/webp', file.name);
      return { success: true, image: { ...result, id: result.dbId } };
    } catch (error) {
      console.error('Upload error:', error);
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
          .set({ name, logoId, displayOrder, websiteUrl, type })
          .where(and(eq(partner.id, id), eq(partner.category, 'Awards')));
      } else {
        await db.insert(partner).values({
          name,
          logoId,
          displayOrder,
          websiteUrl,
          type,
          category: 'Awards'
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Partner save error:', error);
      return fail(500, { error: 'Failed to save partner' });
    }
  },

  deletePartner: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) return fail(400, { error: 'Missing partner ID' });

    try {
      const partnerData = await db.query.partner.findFirst({
        where: and(eq(partner.id, id), eq(partner.category, 'Awards'))
      });

      if (partnerData?.logoId) {
        await deleteAndRemoveFile(partnerData.logoId);
      }

      await db.delete(partner)
        .where(and(eq(partner.id, id), eq(partner.category, 'Awards')));
      return { success: true };
    } catch (error) {
      console.error('Partner delete error:', error);
      return fail(500, { error: 'Failed to delete partner' });
    }
  },

  saveJury: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const occupation = formData.get('occupation') as string;
    const year = formData.get('year') as string;
    const imageFile = formData.get('image') as File;
    const existingImageId = formData.get('imageId') as string;

    if (!name || !occupation || !year) {
      return fail(400, { error: 'Missing required fields' });
    }

    try {
      let imageId = existingImageId;

      if (imageFile && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const resizedBuffer = await sharp(buffer)
          .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        if (existingImageId) {
          await deleteAndRemoveFile(existingImageId);
        }

        const result = await uploadAndSaveBuffer(resizedBuffer, 'image/webp', imageFile.name);
        imageId = result.dbId;
      }

      if (id) {
        await db.update(awardsJury)
          .set({ name, role, occupation, year, imageId, updatedAt: new Date() })
          .where(eq(awardsJury.id, id));
      } else {
        await db.insert(awardsJury).values({
          name, role, occupation, year, imageId
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Jury save error:', error);
      return fail(500, { error: 'Failed to save jury member' });
    }
  },

  deleteJury: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) return fail(400, { error: 'Missing jury member ID' });

    try {
      const member = await db.query.awardsJury.findFirst({
        where: eq(awardsJury.id, id)
      });

      if (member?.imageId) {
        await deleteAndRemoveFile(member.imageId);
      }

      await db.delete(awardsJury).where(eq(awardsJury.id, id));
      return { success: true };
    } catch (error) {
      console.error('Jury delete error:', error);
      return fail(500, { error: 'Failed to delete jury member' });
    }
  },

  saveWinner: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const awardType = formData.get('awardType') as string;
    const awardDescription = formData.get('awardDescription') as string;
    const organization = formData.get('organization') as string;
    const year = formData.get('year') as string;
    const imageFile = formData.get('image') as File;
    const existingImageId = formData.get('imageId') as string;

    if (!name || !awardType || !year) {
      return fail(400, { error: 'Missing required fields' });
    }

    try {
      let imageId = existingImageId;

      if (imageFile && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const resizedBuffer = await sharp(buffer)
          .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        if (existingImageId) {
          await deleteAndRemoveFile(existingImageId);
        }

        const result = await uploadAndSaveBuffer(resizedBuffer, 'image/webp', imageFile.name);
        imageId = result.dbId;
      }

      if (id) {
        await db.update(awardWinner)
          .set({ name, awardType, awardDescription, organization, year, imageId, updatedAt: new Date() })
          .where(eq(awardWinner.id, id));
      } else {
        await db.insert(awardWinner).values({
          name, awardType, awardDescription, organization, year, imageId
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Winner save error:', error);
      return fail(500, { error: 'Failed to save award winner' });
    }
  },

  deleteWinner: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) return fail(400, { error: 'Missing winner ID' });

    try {
      const winnerData = await db.query.awardWinner.findFirst({
        where: eq(awardWinner.id, id)
      });

      if (winnerData?.imageId) {
        await deleteAndRemoveFile(winnerData.imageId);
      }

      await db.delete(awardWinner).where(eq(awardWinner.id, id));
      return { success: true };
    } catch (error) {
      console.error('Winner delete error:', error);
      return fail(500, { error: 'Failed to delete winner' });
    }
  },

  deleteFile: async ({ request }) => {
    const formData = await request.formData();
    const fileId = formData.get('fileId') as string;

    if (!fileId) return fail(400, { error: 'Missing file ID' });

    try {
      await deleteAndRemoveFile(fileId);
      return { success: true };
    } catch (error) {
      console.error('File delete error:', error);
      return fail(500, { error: 'Failed to delete file' });
    }
  },

  saveTeam: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const title = formData.get('title') as string;
    const teamYear = formData.get('year') as string;
    const imageFile = formData.get('image') as File;
    const existingImageId = formData.get('imageId') as string;

    if (!name || !title || !teamYear) {
      return fail(400, { error: 'Missing required fields' });
    }

    try {
      let imageId = existingImageId;

      if (imageFile && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const resizedBuffer = await sharp(buffer)
          .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        if (existingImageId) {
          await deleteAndRemoveFile(existingImageId);
        }

        const result = await uploadAndSaveBuffer(resizedBuffer, 'image/webp', imageFile.name);
        imageId = result.dbId;
      }

      if (id) {
        await db.update(awardsTeam)
          .set({ name, title, year: teamYear, imageId, updatedAt: new Date() })
          .where(eq(awardsTeam.id, id));
      } else {
        await db.insert(awardsTeam).values({
          name, title, year: teamYear, imageId
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Team save error:', error);
      return fail(500, { error: 'Failed to save team member' });
    }
  },

  deleteTeam: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) return fail(400, { error: 'Missing team member ID' });

    try {
      const member = await db.query.awardsTeam.findFirst({
        where: eq(awardsTeam.id, id)
      });

      if (member?.imageId) {
        await deleteAndRemoveFile(member.imageId);
      }

      await db.delete(awardsTeam).where(eq(awardsTeam.id, id));
      return { success: true };
    } catch (error) {
      console.error('Team delete error:', error);
      return fail(500, { error: 'Failed to delete team member' });
    }
  },

  reorderWinners: async ({ request }) => {
    const formData = await request.formData();
    const ids = JSON.parse(formData.get('ids') as string) as string[];

    if (!ids || ids.length === 0) return fail(400, { error: 'Missing winner IDs' });
    
    try {
      const sqlChunks: any[] = [];
      sqlChunks.push(sql`(case`);
      for (let i = 0; i < ids.length; i++) {
        sqlChunks.push(sql`when ${awardWinner.id} = ${ids[i]} then ${i}`);
      }
      sqlChunks.push(sql`end)`);
      
      const finalCase = sql.join(sqlChunks, sql.raw(' '));
      
      await db.update(awardWinner)
        .set({ 
          displayOrder: sql`CAST(${finalCase} AS INTEGER)`,
          updatedAt: new Date()
        })
        .where(inArray(awardWinner.id, ids));

      return { success: true };
    } catch (error) {
      console.error('Winner reorder error:', error);
      return fail(500, { error: 'Failed to reorder winners' });
    }
  },

  reorderTeam: async ({ request }) => {
    const formData = await request.formData();
    const ids = JSON.parse(formData.get('ids') as string) as string[];

    if (!ids || ids.length === 0) return fail(400, { error: 'Missing team member IDs' });

    try {
      const sqlChunks: any[] = [];
      sqlChunks.push(sql`(case`);
      for (let i = 0; i < ids.length; i++) {
        sqlChunks.push(sql`when ${awardsTeam.id} = ${ids[i]} then ${i}`);
      }
      sqlChunks.push(sql`end)`);
      
      const finalCase = sql.join(sqlChunks, sql.raw(' '));
      
      await db.update(awardsTeam)
        .set({ 
          displayOrder: sql`CAST(${finalCase} AS INTEGER)`,
          updatedAt: new Date()
        })
        .where(inArray(awardsTeam.id, ids));

      return { success: true };
    } catch (error) {
      console.error('Team reorder error:', error);
      return fail(500, { error: 'Failed to reorder team members' });
    }
  }
};
