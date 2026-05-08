<script lang="ts">
  import MemoryForm from "../../components/MemoryForm.svelte";

  const { data } = $props();
  const memory = data.memory;
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <h1 class="text-3xl font-bold tracking-tight">Edit Memory</h1>
    <p class="text-muted-foreground">
      Update the details or media for this memory.
    </p>
  </div>

  <MemoryForm {memory} />
</div>
