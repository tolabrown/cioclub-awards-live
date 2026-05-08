<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import ImageUpload from "./ImageUpload.svelte";
  import JSONForm from "./JSONForm.svelte";

  let { data = $bindable() } = $props();

  function isImageKey(key: string) {
    const k = key.toLowerCase();
    return (
      k.includes("image") ||
      k.includes("url") ||
      k.includes("src") ||
      k.includes("thumbnail") ||
      k.includes("logo")
    );
  }

  function formatKey(key: string) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  }
</script>

<div class="space-y-6">
  {#if typeof data === "object" && data !== null}
    {#each Object.entries(data) as [key, value]}
      <div
        class="space-y-4 rounded-xl border border-border/30 p-4 bg-background/50"
      >
        <h3 class="text-sm font-bold uppercase tracking-wider text-primary">
          {formatKey(key)}
        </h3>

        {#if typeof value === "object" && value !== null}
          <div class="pl-4 border-l-2 border-primary/20 space-y-4">
            <!-- Nested object or array -->
            {#if Array.isArray(value)}
              <div
                class="bg-muted/30 p-4 rounded-lg italic text-xs text-muted-foreground"
              >
                Arrays are currently only editable via JSON tab for safety.
              </div>
            {:else}
              <JSONForm bind:data={data[key]} />
            {/if}
          </div>
        {:else if typeof value === "string"}
          <div class="space-y-2">
            {#if isImageKey(key)}
              <ImageUpload bind:value={data[key]} label={formatKey(key)} />
            {:else if value.length > 100}
              <Label>{formatKey(key)}</Label>
              <Textarea bind:value={data[key]} class="h-32" />
            {:else}
              <Label>{formatKey(key)}</Label>
              <Input bind:value={data[key]} />
            {/if}
          </div>
        {:else if typeof value === "number"}
          <div class="space-y-2">
            <Label>{formatKey(key)}</Label>
            <Input type="number" bind:value={data[key]} />
          </div>
        {:else if typeof value === "boolean"}
          <div class="flex items-center gap-4 py-2">
            <input
              type="checkbox"
              bind:checked={data[key]}
              class="size-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label>{formatKey(key)}</Label>
          </div>
        {/if}
      </div>
    {/each}
  {:else}
    <div class="p-4 text-center text-muted-foreground italic">
      No editable content found or invalid structure.
    </div>
  {/if}
</div>
