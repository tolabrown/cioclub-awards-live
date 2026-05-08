<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Switch } from "$lib/components/ui/switch";
  import { Button } from "$lib/components/ui/button";
  import { Plus, Trash2, ChevronDown, ChevronUp } from "@lucide/svelte";
  import ImageUpload from "./ImageUpload.svelte";
  import JSONForm from "./JSONForm.svelte";
  import { slide } from "svelte/transition";

  let { data = $bindable() } = $props();

  function isImageKey(key: string) {
    const k = key.toLowerCase();
    return (
      k.includes("image") ||
      k.includes("url") ||
      k.includes("src") ||
      k.includes("thumbnail") ||
      k.includes("logo") ||
      k.includes("banner") ||
      k.includes("icon") ||
      k.includes("avatar")
    );
  }

  function formatKey(key: string) {
    if (!isNaN(Number(key))) return `Item ${Number(key) + 1}`;
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  }

  function addItem(key: string) {
    const arr = data[key];
    if (Array.isArray(arr)) {
      // Try to clone the first item's structure or use an empty string
      const template = arr.length > 0 ? JSON.parse(JSON.stringify(arr[0])) : "";
      
      // Reset values in template if it's an object
      if (typeof template === 'object' && template !== null) {
        Object.keys(template).forEach(k => {
          if (typeof template[k] === 'string') template[k] = "";
          else if (typeof template[k] === 'number') template[k] = 0;
          else if (typeof template[k] === 'boolean') template[k] = false;
        });
      }
      
      data[key] = [...arr, template];
    }
  }

  function removeItem(key: string, index: number) {
    data[key] = data[key].filter((_: any, i: number) => i !== index);
  }

  let expandedItems = $state<Record<string, number>>({});
</script>

<div class="space-y-4">
  {#if typeof data === "object" && data !== null}
    {#each Object.entries(data) as [key, value]}
      <div
        class="space-y-4 rounded-xl border border-border/50 p-4 bg-background/30 backdrop-blur-sm shadow-sm"
      >
        <div class="flex items-center justify-between">
          <h3
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary"
          >
            {formatKey(key)}
          </h3>
          {#if Array.isArray(value)}
            <Button 
              variant="outline" 
              size="sm" 
              onclick={() => addItem(key)}
              class="h-7 px-2 text-[9px] font-bold uppercase tracking-widest rounded-lg gap-1 border-primary/20 text-primary hover:bg-primary/5"
            >
              <Plus class="size-3" /> Add Item
            </Button>
          {/if}
        </div>

        {#if typeof value === "object" && value !== null}
          <div class="pl-4 border-l-2 border-primary/10 space-y-4">
            {#if Array.isArray(value)}
              <div class="space-y-3">
                {#each value as item, i}
                  <div class="relative group border border-border/50 rounded-xl bg-muted/20 p-3">
                    <div class="flex items-center justify-between mb-2">
                       <span class="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground opacity-50"># {i + 1}</span>
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        class="size-6 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onclick={() => removeItem(key, i)}
                      >
                        <Trash2 class="size-3.5" />
                      </Button>
                    </div>
                    {#if typeof item === 'object' && item !== null}
                      <JSONForm bind:data={data[key][i]} />
                    {:else}
                      <Input bind:value={data[key][i]} class="h-9 rounded-lg text-sm" />
                    {/if}
                  </div>
                {/each}
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
              <Label
                class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >{formatKey(key)}</Label
              >
              <Textarea
                bind:value={data[key]}
                class="h-32 font-medium text-sm rounded-xl focus-visible:ring-primary/20"
              />
            {:else}
              <Label
                class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >{formatKey(key)}</Label
              >
              <Input
                bind:value={data[key]}
                class="font-medium text-sm rounded-xl h-10 focus-visible:ring-primary/20"
              />
            {/if}
          </div>
        {:else if typeof value === "number"}
          <div class="space-y-2">
            <Label
              class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >{formatKey(key)}</Label
            >
            <Input
              type="number"
              bind:value={data[key]}
              class="font-medium text-sm rounded-xl h-10"
            />
          </div>
        {:else if typeof value === "boolean"}
          <div
            class="flex items-center justify-between py-2 border-b border-border/20 last:border-0"
          >
            <Label
              class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >{formatKey(key)}</Label
            >
            <Switch bind:checked={data[key]} />
          </div>
        {/if}
      </div>
    {/each}
  {:else}
    <div
      class="p-8 text-center text-muted-foreground italic text-xs font-bold uppercase tracking-widest opacity-50"
    >
      No editable content found.
    </div>
  {/if}
</div>

