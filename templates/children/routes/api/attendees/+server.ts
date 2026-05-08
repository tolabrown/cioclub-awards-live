import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  addAttendee,
  getAttendeesBySearchFilter,
} from "$lib/db/attendee";
import { onError } from "$lib/fxns";

export const GET: RequestHandler = async ({ url }) => {
  try {
    const params = Object.fromEntries(url.searchParams);
    const result = await getAttendeesBySearchFilter(params);
    return json(result);
  } catch (error: any) {
    console.error("GET /api/attendees error:", error);
    return json(onError(error.message || "Failed to fetch attendees"));
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.meeting) {
      return json(onError("Meeting ID is required"));
    }

    if (!data.child) {
      return json(onError("Child ID is required"));
    }

    const newAttendee = await addAttendee(data, locals.user);

    if (!newAttendee) {
      return json(onError("Failed to create attendee record"));
    }

    return json({
      status: "success",
      message: "Attendee record created successfully",
      data: { attendee: newAttendee },
    });
  } catch (error: any) {
    console.error("POST /api/attendees error:", error);
    return json(onError(error.message || "Failed to create attendee record"));
  }
};
