import { getAttendee } from "$lib/db/attendee";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { pageGuard } from "$lib/server";
import { FieldsPlural } from "$lib/constants";

export const load: PageServerLoad = async ({ params, locals }) => {


  await pageGuard(params.id, locals, FieldsPlural.ATTENDEE);

  const attendee = await getAttendee(params.id);

  if (!attendee) {
    throw error(404, "Attendance record not found");
  }

  return {
    attendee,
  };
};
