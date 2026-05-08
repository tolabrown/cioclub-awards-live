import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import { news } from "$lib/db/schema";
import { ilike, or } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  if (locals.user?.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  const query = url.searchParams.get("q") || "";

  try {
    const results = await db.query.news.findMany({
      where: or(
        ilike(news.title, `%${query}%`),
        ilike(news.category, `%${query}%`)
      ),
      limit: 10,
      with: {
        image: true
      }
    });

    return json(results.map(item => ({
      id: item.id,
      name: item.title,
      description: item.category,
      image: item.image ? { url: item.image.url } : null
    })));
  } catch (error) {
    console.error("News search error:", error);
    return json([], { status: 500 });
  }
};
