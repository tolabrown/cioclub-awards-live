import { getPageContent } from '$lib/db/content';
import { HomepageContent } from '$lib/constants';
import { db } from '$lib/db';
import { pageContent, news, testimonial } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  let [content, latestNews] = await Promise.all([
    getPageContent('/', HomepageContent),
    db.query.news.findMany({
      with: {
        image: true
      },
      limit: 3,
      orderBy: [desc(news.createdAt)]
    })
  ]);

  // Self-healing: If content is remarkably empty (e.g. missing hero), restore defaults
  if (!content || !content.hero || !content.hero.title) {
    console.log('Detected empty/corrupt homepage content. Restoring defaults...');
    content = {
      ...HomepageContent,
      hero: {
        subtitle: 'Premier IT Leadership Platform',
        title: 'CIO Club Africa',
        description: 'Empowering Africa\'s digital leadership through strategic collaboration, world-class networking, and groundbreaking innovation.',
        primaryCta: { text: 'Explore More', href: '/membership' },
      }
    };

    try {
      await db.update(pageContent)
        .set({
          data: JSON.stringify(content),
          updatedAt: new Date()
        })
        .where(eq(pageContent.path, '/'));
    } catch (e) {
      console.error('Failed to restore homepage content in DB:', e);
    }
  }

  // Ensure testimonials field exists
  if (!content.testimonials || content.testimonials.length === 0) {
    const featuredTestimonials = await db.query.testimonial.findMany({
      with: { image: true },
      limit: 3,
      orderBy: [desc(testimonial.createdAt)]
    });
    content.testimonials = featuredTestimonials;
  }

  return {
    content,
    latestNews: latestNews.map(item => ({
      ...item,
      image: item.image?.url || item.imageUrl || "/hero-bg.webp"
    }))
  };
};
