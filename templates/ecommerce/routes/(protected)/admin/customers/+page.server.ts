import { UserCRUD } from "$lib/db/user";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");

  const { data: users, total } = await UserCRUD.list({
    page,
    limit,
    search,
  });

  return {
    users,
    total,
    page,
    limit,
    search,
  };
};
