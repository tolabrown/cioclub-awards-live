<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Badge } from "$lib/components/ui/badge";
  import { Loader2, Plus, X } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { cn } from "$lib/utils";

  interface Item {
    id: string;
    name: string;
    image?: { url: string } | null;
    [key: string]: any;
  }

  interface Props {
    selectedIds?: string[];
    name?: string;
    placeholder?: string;
    label?: string;
    entityName?: string;
    fetchOptions: (query: string) => Promise<Item[]>;
    initialItems?: Item[];
    onSelect?: (items: Item[]) => void;
    class?: string;
  }

  let {
    selectedIds = $bindable([]),
    name = "",
    placeholder = "Search and add...",
    label,
    entityName = "Item",
    fetchOptions,
    initialItems = [],
    onSelect,
    class: className,
  }: Props = $props();

  let isSearching = $state(false);
  let hasSearched = $state(false);
  let searchResults = $state<Item[]>([]);
  let searchQuery = $state("");
  let selectedItems = $state<Item[]>([]);

  $effect(() => {
    if (initialItems && initialItems.length > 0 && selectedItems.length === 0) {
      selectedItems = initialItems;
    }
  });

  // Sync selectedIds with selectedItems
  $effect(() => {
    selectedIds = selectedItems.map((item) => item.id);
  });

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    isSearching = true;
    hasSearched = true;
    try {
      searchResults = await fetchOptions(searchQuery);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to search ${entityName.toLowerCase()}s`);
      searchResults = [];
    } finally {
      isSearching = false;
    }
  }

  function handleSelect(item: Item) {
    if (!selectedItems.find((i) => i.id === item.id)) {
      selectedItems = [...selectedItems, item];
      if (onSelect) onSelect(selectedItems);
    }
    searchQuery = "";
    searchResults = [];
    hasSearched = false;
  }

  function removeItem(item: Item) {
    selectedItems = selectedItems.filter((i) => i.id !== item.id);
    if (onSelect) onSelect(selectedItems);
  }
</script>

<div class={cn("space-y-4", className)}>
  {#if label}
    <Label>{label}</Label>
  {/if}

  <!-- Selected Items (Badges) -->
  {#if selectedItems.length > 0}
    <div
      class="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/10 min-h-[42px]"
    >
      {#each selectedItems as item}
        <Badge
          variant="secondary"
          class="flex items-center gap-1.5 pl-2 pr-1 py-1"
        >
          {item.name}
          <button
            type="button"
            onclick={() => removeItem(item)}
            class="hover:bg-muted rounded-full p-0.5"
            title="Remove"
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/each}
    </div>
  {/if}

  <!-- Search UI -->
  <div class="space-y-2">
    <div class="flex gap-2">
      <Input
        {placeholder}
        bind:value={searchQuery}
        onkeydown={(e) =>
          e.key === "Enter" && (e.preventDefault(), handleSearch())}
      />
      <Button
        type="button"
        onclick={handleSearch}
        disabled={isSearching}
        variant="outline"
      >
        {#if isSearching}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
          Search
        {/if}
      </Button>
    </div>

    {#if !isSearching && hasSearched && searchResults.length === 0}
      <div class="text-center py-4 border rounded-md border-dashed">
        <p class="text-sm text-muted-foreground">
          No {entityName.toLowerCase()}s found for "{searchQuery}".
        </p>
      </div>
    {/if}

    {#if searchResults.length > 0}
      <div
        class="border rounded-md max-h-[200px] overflow-y-auto divide-y bg-popover"
      >
        {#each searchResults as item}
          {@const isAlreadySelected = selectedItems.find(
            (i) => i.id === item.id,
          )}
          <button
            type="button"
            class="w-full flex items-center gap-3 p-2 hover:bg-muted/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={() => handleSelect(item)}
            disabled={!!isAlreadySelected}
          >
            {#if item.image?.url}
              <img
                src={item.image.url}
                alt={item.name}
                class="h-8 w-8 rounded-full object-cover"
              />
            {:else}
              <div
                class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase shrink-0"
              >
                {item.name.charAt(0)}
              </div>
            {/if}
            <div class="flex-1">
              <p class="text-sm font-medium">{item.name}</p>
              {#if item.description}
                <p class="text-xs text-muted-foreground line-clamp-1">
                  {item.description}
                </p>
              {/if}
            </div>
            {#if isAlreadySelected}
              <Badge variant="outline" class="text-[10px] uppercase"
                >Added</Badge
              >
            {:else}
              <Plus class="h-4 w-4 text-muted-foreground" />
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Hidden input for form submission -->
  {#each selectedIds as id}
    <input type="hidden" {name} value={id} />
  {/each}
</div>
