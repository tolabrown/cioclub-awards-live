<script lang="ts">
  import ParentForm from "../components/ParentForm.svelte";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import type { iParent } from "$lib/interface";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";

  let parent = $state<iParent | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const response = await fetch(`/api/parents/${page.params.id}`);
      const result = await response.json();

      if (result.status === "error") {
        error = result.message;
      } else {
        parent = result.data;
      }
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
</script>

<div class="container max-w-4xl py-8">
  <div class="mb-6">
    <h1 class="text-3xl font-bold">Edit Parent</h1>
    <p class="text-muted-foreground">Update parent information</p>
  </div>

  {#if loading}
    <div class="flex h-64 items-center justify-center">
      <LoadingSpinner class="h-8 w-8" />
    </div>
  {:else if error}
    <div class="rounded-lg border border-destructive bg-destructive/10 p-4">
      <p class="text-destructive">{error}</p>
    </div>
  {:else if parent}
    <ParentForm {parent} />
  {/if}
</div>
