import { json } from "@sveltejs/kit";
import { getTestimonialsBySearchFilter } from "$lib/db/testimonial";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const params: Record<string, string> = {
    search: url.searchParams.get("search") || "",
    offset: url.searchParams.get("offset") || "0",
  };

  const result = await getTestimonialsBySearchFilter(params);

  if (result.status === "success") {
    return json(result.data);
  } else {
    return json({ error: result.message }, { status: 500 });
  }
};
