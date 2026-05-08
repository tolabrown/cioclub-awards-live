<script lang="ts">
  import MemoryForm from "../components/MemoryForm.svelte";
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <h1 class="text-3xl font-bold tracking-tight">Create Memory</h1>
    <p class="text-muted-foreground">
      Capture a new spiritual milestone or event.
    </p>
  </div>

  <MemoryForm />
</div>
