import { getBlog, getRecentBlogs } from "$lib/db/crm";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const blog = await getBlog(params.id);

  if (!blog) {
    throw error(404, "Blog post not found");
  }

  const relatedBlogs = await getRecentBlogs(params.id, 3);

  return {
    blog,
    relatedBlogs
  };
};
