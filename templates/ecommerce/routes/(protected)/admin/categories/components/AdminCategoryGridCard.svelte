<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { FolderTree } from "@lucide/svelte";

  interface Props {
    category: any;
    columns: number;
    onClick?: () => void;
  }

  let { category, columns, onClick }: Props = $props();
</script>

<button
  class="group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-left transition-all hover:shadow-md active:scale-[0.98] border-muted-foreground/10"
  onclick={onClick}
>
  <div class="aspect-square w-full overflow-hidden bg-muted">
    {#if category.imageFile?.url}
      <img
        src={category.imageFile.url}
        alt={category.name}
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    {:else}
      <div
        class="flex h-full w-full items-center justify-center text-muted-foreground/30 text-primary"
      >
        <FolderTree class="h-12 w-12" />
      </div>
    {/if}

    <div class="absolute top-2 right-2">
      <Badge
        variant={category.isActive ? "default" : "secondary"}
        class="{category.isActive
          ? 'bg-green-500/80 backdrop-blur-md text-white border-none'
          : 'bg-orange-500/80 backdrop-blur-md text-white border-none'} text-[10px] px-2 py-0"
      >
        {category.isActive ? "Active" : "Inactive"}
      </Badge>
    </div>
  </div>

  <div class="flex flex-1 flex-col p-3">
    <h3
      class="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors"
    >
      {category.name}
    </h3>
    <div class="mt-auto flex items-center justify-between pt-2">
      <span
        class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
      >
        {category.productCount || 0} Products
      </span>
    </div>
  </div>
</button>
