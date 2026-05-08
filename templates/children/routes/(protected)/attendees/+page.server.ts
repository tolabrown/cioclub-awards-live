import { getAttendeesBySearchFilter } from "$lib/db/attendee";
import type { PageServerLoad } from "./$types";
import { attendeesRoles, Constants, Role } from "$lib/constants";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ url, locals }) => {
  const params = Object.fromEntries(url.searchParams);
  const user = locals.user;

  if (!user) {
    throw redirect(303, `/auth/login?redirectTo=${url.pathname}`);
  }

  if (!attendeesRoles.includes(user.role as Role)) {
    throw redirect(303, Constants.AFTERAUTH);
  }

  return {
    attendees: getAttendeesBySearchFilter(params).then((result) =>
      result.status === "success"
        ? result.data
        : { data: [], meta: { cursor: "", more: false, size: 0 }, total: 0 },
    ),
  };
};
