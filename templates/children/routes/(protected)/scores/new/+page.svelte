<script lang="ts">
  import ExerciseForm from "../components/ScoreForm.svelte";
  import { Button } from "$lib/components/ui/button";
  import { ChevronLeft } from "@lucide/svelte";

  let { data } = $props();
</script>

<div class="py-8">
  <div class="mb-8 flex items-center gap-4">
    <Button variant="ghost" size="icon" href="scores">
      <ChevronLeft class="h-4 w-4" />
    </Button>
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Record Exercise</h1>
      <p class="text-muted-foreground">
        Add a new exercise record for a child.
      </p>
    </div>
  </div>

  <div class="rounded-xl border bg-card p-4 shadow-sm">
    <ExerciseForm mode="create" />
  </div>
</div>
