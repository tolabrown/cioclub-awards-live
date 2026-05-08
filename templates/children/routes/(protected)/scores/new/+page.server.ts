import { db } from "$lib/db/drizzle";
import { child } from "$lib/db/schema";
import { desc, eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import type { iChild } from "$lib/interface";

export const load: PageServerLoad = async () => {
  return {};
};
