import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import { testimonial } from "$lib/db/schema";
import { ilike, or } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const query = url.searchParams.get("q") || "";

  try {
    const results = await db.query.testimonial.findMany({
      where: or(
        ilike(testimonial.name, `%${query}%`),
        ilike(testimonial.organization, `%${query}%`)
      ),
      limit: 10,
      with: {
        image: true
      }
    });

    return json(results);
  } catch (error) {
    console.error("Testimonial search error:", error);
    return json({ error: "Search failed" }, { status: 500 });
  }
};
