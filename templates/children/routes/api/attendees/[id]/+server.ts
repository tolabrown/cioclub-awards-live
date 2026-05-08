import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  getAttendee,
  updateAttendee,
  deleteAttendee,
} from "$lib/db/attendee";
import { onError } from "$lib/fxns";

export const GET: RequestHandler = async ({ params }) => {
  try {
    const attendee = await getAttendee(params.id);

    if (!attendee) {
      return json(onError("Attendee record not found"));
    }

    return json({
      status: "success",
      message: "Attendee record fetched successfully",
      data: { attendee },
    });
  } catch (error: any) {
    console.error("GET /api/attendees/[id] error:", error);
    return json(onError(error.message || "Failed to fetch attendee record"));
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const data = await request.json();
    const result = await updateAttendee(params.id, data, locals.user);

    return json(result);
  } catch (error: any) {
    console.error("PUT /api/attendees/[id] error:", error);
    return json(onError(error.message || "Failed to update attendee record"));
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const result = await deleteAttendee(params.id, locals.user);
    return json(result);
  } catch (error: any) {
    console.error("DELETE /api/attendees/[id] error:", error);
    return json(onError(error.message || "Failed to delete attendee record"));
  }
};
