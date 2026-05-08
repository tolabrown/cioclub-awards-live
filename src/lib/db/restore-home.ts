import { db } from './index';
import { pageContent } from './schema';
import { HomepageContent } from '../constants';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function restore() {
  console.log('Restoring homepage content...');

  const content = JSON.stringify(HomepageContent);

  try {
    const existing = await db.query.pageContent.findFirst({
      where: eq(pageContent.path, '/')
    });

    if (existing) {
      await db.update(pageContent)
        .set({
          data: content,
          updatedAt: new Date()
        })
        .where(eq(pageContent.path, '/'));
      console.log('Homepage content updated successfully.');
    } else {
      await db.insert(pageContent).values({
        path: '/',
        data: content,
        title: 'Home',
        description: 'CIO Club Africa Homepage'
      });
      console.log('Homepage content inserted successfully.');
    }
  } catch (error) {
    console.error('Error restoring homepage:', error);
  } finally {
    process.exit(0);
  }
}

restore();
