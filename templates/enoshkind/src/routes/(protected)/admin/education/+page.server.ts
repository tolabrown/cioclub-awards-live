import { EducationCRUD } from "$lib/db/education";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const search = url.searchParams.get("search") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const type = url.searchParams.get("type") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1");

  const result = await EducationCRUD.list({ search, category, type }, { page });

  return {
    articles: result.data,
    total: result.total,
    meta: result.meta
  };
};
