<script lang="ts">
  import AttendeeForm from "../components/AttendeeForm.svelte";
  import type { iAttendee } from "$lib/interface";

  let { data } = $props();

  // Convert the attendee data to the format expected by the form
  const attendee: iAttendee = {
    ...data.attendee,
    child:
      typeof data.attendee.child === "object"
        ? data.attendee.child.id
        : data.attendee.child,
    meeting:
      typeof data.attendee.meeting === "object"
        ? data.attendee.meeting.id
        : data.attendee.meeting,
  };
</script>

<div class="flex flex-col gap-4">
  <!-- Header -->
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Edit Attendance</h1>
    <p class="text-muted-foreground">Update the attendance record details.</p>
  </div>

  <!-- Form -->
  <div class="max-w-3xl">
    <div class="rounded-lg border bg-card p-4">
      <AttendeeForm {attendee} mode="edit" />
    </div>
  </div>
</div>
