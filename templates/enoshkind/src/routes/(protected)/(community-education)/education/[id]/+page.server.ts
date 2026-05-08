import { EducationCRUD } from "$lib/db/education";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  const article = await EducationCRUD.getById(id);

  if (!article) {
    throw error(404, "Article not found");
  }

  const adjacent = await EducationCRUD.getAdjacent(id);

  return {
    article,
    adjacent
  };
};
