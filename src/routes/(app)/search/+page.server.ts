import { db } from '$lib/db';
import { news, event as eventTable, trustee } from '$lib/db/schema';
import { ilike, or, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const query = url.searchParams.get('q') || '';

  if (!query) {
    return {
      results: {
        news: [],
        events: [],
        members: []
      },
      searchQuery: ''
    };
  }

  // Perform searches across different tables
  const [newsResults, eventResults, trusteeResults] = await Promise.all([
    db.query.news.findMany({
      where: or(
        ilike(news.title, `%${query}%`),
        ilike(news.content, `%${query}%`)
      ),
      with: {
        image: true
      },
      limit: 10,
      orderBy: [desc(news.createdAt)]
    }),
    db.query.event.findMany({
      where: or(
        ilike(eventTable.title, `%${query}%`),
        ilike(eventTable.description, `%${query}%`)
      ),
      with: {
        coverImage: true
      },
      limit: 10,
      orderBy: [desc(eventTable.date)]
    }),
    db.query.trustee.findMany({
      where: or(
        ilike(trustee.name, `%${query}%`),
        ilike(trustee.role, `%${query}%`),
        ilike(trustee.bio, `%${query}%`)
      ),
      with: {
        image: true
      },
      limit: 10
    })
  ]);

  return {
    results: {
      news: newsResults.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        time: item.createdAt.toLocaleDateString(),
        excerpt: item.caption || item.content.substring(0, 150) + '...',
        author: "CIO Club Africa",
        image: item.image?.url || item.imageUrl || "/hero-bg.webp"
      })),
      events: eventResults.map(item => ({
        id: item.id,
        title: item.title,
        date: item.date?.toLocaleDateString() || "TBA",
        location: item.location || "Online",
        image: item.coverImage?.url || "/hero-bg.webp"
      })),
      members: trusteeResults.map(item => ({
        id: item.id,
        name: item.name,
        role: item.role || item.position,
        image: item.image?.url || item.imageId || "/hero-bg.webp"
      }))
    },
    searchQuery: query
  };
};
