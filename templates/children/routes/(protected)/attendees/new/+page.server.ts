import { getChildren } from "$lib/db/child";
import { getMeetingsBySearchFilter } from "$lib/db/meeting";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {};
};
