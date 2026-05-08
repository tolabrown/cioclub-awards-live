<script lang="ts">
  import AttendeeForm from "../components/AttendeeForm.svelte";

  let { data } = $props();
</script>

<div class="flex flex-col gap-4">
  <!-- Header -->
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Record Attendance</h1>
    <p class="text-muted-foreground">
      Record a child's attendance for a meeting.
    </p>
  </div>

  <!-- Form -->
  <div class="max-w-3xl">
    <div class="rounded-lg border bg-card p-4">
      <AttendeeForm mode="create" />
    </div>
  </div>
</div>
