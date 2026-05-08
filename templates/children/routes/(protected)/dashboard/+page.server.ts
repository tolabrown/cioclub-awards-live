import type { PageServerLoad } from "./$types";
import { getDashboardLogs } from "$lib/db/log";
import { redirect } from "@sveltejs/kit";
import { Constants, dashboardRoles, type Role } from "$lib/constants";

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = locals.user

  if (!user) {
    throw redirect(303, `/auth/login?redirectTo=${url.pathname}`);
  }

  if (!dashboardRoles.includes(user.role as Role)) {
    throw redirect(303, Constants.AFTERAUTH);
  }

  // Only fetch logs on server side, stats and charts will be fetched on client
  return {
    logs: getDashboardLogs(user),
  };
};
