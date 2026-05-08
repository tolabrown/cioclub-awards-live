<script lang="ts">
  import { TableCell, TableRow } from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Trash2, Edit, Eye, FolderTree } from "@lucide/svelte";

  interface Props {
    category: any;
    i: number;
    onDelete: (id: string) => void;
    onView?: (category: any) => void;
  }

  let { category, i, onDelete, onView }: Props = $props();

  const num = $derived(i + 1);
</script>

<TableRow
  class="cursor-pointer hover:bg-muted/50"
  onclick={() => onView?.(category)}
>
  <TableCell class="font-medium text-muted-foreground w-12">{num}.</TableCell>
  <TableCell>
    <div class="flex items-center gap-3">
      <div
        class="h-12 w-12 overflow-hidden rounded-lg border bg-muted shrink-0"
      >
        {#if category.imageFile?.url}
          <img
            src={category.imageFile.url}
            alt={category.name}
            class="h-full w-full object-cover"
          />
        {:else}
          <div
            class="flex h-full w-full items-center justify-center text-muted-foreground/40 text-primary"
          >
            <FolderTree class="h-5 w-5" />
          </div>
        {/if}
      </div>
      <div class="min-w-0">
        <div class="font-semibold text-foreground truncate max-w-[200px]">
          {category.name}
        </div>
        <div class="text-xs text-muted-foreground truncate max-w-[180px]">
          {category.description || "No description"}
        </div>
      </div>
    </div>
  </TableCell>
  <TableCell>
    <code
      class="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider"
    >
      {category.id.slice(0, 8)}...
    </code>
  </TableCell>
  <TableCell>
    <span class="text-sm text-muted-foreground">
      {category.productCount || 0} Products
    </span>
  </TableCell>
  <TableCell>
    <Badge
      variant={category.isActive ? "default" : "secondary"}
      class={category.isActive
        ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
        : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20"}
    >
      {category.isActive ? "Active" : "Inactive"}
    </Badge>
  </TableCell>
  <TableCell class="text-right">
    <div class="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 text-muted-foreground"
        onclick={(e) => {
          e.stopPropagation();
          onView?.(category);
        }}
      >
        <Eye class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        href={`/admin/categories/${category.id}/edit`}
        onclick={(e) => e.stopPropagation()}
        class="h-8 w-8 text-blue-600 hover:bg-blue-50/50 hover:text-blue-700"
      >
        <Edit class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onclick={(e) => {
          e.stopPropagation();
          onDelete(category.id);
        }}
        class="h-8 w-8 text-red-600 hover:bg-red-50/50 hover:text-red-700"
      >
        <Trash2 class="h-4 w-4" />
      </Button>
    </div>
  </TableCell>
</TableRow>
