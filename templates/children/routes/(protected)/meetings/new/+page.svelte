<script lang="ts">
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { AlertCircleIcon } from "@lucide/svelte";
  import MeetingForm from "../components/MeetingForm.svelte";
  import { Separator } from "$lib/components/ui/separator";
</script>

<div class="grid grid-cols-1 gap-4">
  <div class="flex flex-col justify-between">
    <h1 class="text-2xl font-bold sm:text-3xl">Add New Meeting</h1>
    <p class="mt-2 text-muted-foreground">
      Fill the form below to create a new meeting
    </p>
  </div>
  <Separator />
  <MeetingForm />
</div>
