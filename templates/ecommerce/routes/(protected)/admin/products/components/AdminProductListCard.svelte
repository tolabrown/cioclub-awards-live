<script lang="ts">
  import { TableCell, TableRow } from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Trash2, Edit, Eye, Package } from "@lucide/svelte";
  import { formatPrice } from "$lib/fxns";

  interface Props {
    product: any;
    i: number;
    onDelete: (id: string) => void;
    onView?: (product: any) => void;
  }

  let { product, i, onDelete, onView }: Props = $props();

  const num = $derived(i + 1);

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        class: "bg-red-500/10 text-red-600 border-red-200",
      };
    if (stock <= threshold)
      return {
        label: "Low Stock",
        class: "bg-orange-500/10 text-orange-600 border-orange-200",
      };
    return {
      label: "In Stock",
      class: "bg-green-500/10 text-green-600 border-green-200",
    };
  };

  const status = $derived(
    getStockStatus(product.stockQuantity, product.lowStockThreshold),
  );
</script>

<TableRow
  class="cursor-pointer hover:bg-muted/50"
  onclick={() => onView?.(product)}
>
  <TableCell class="font-medium text-muted-foreground w-12">{num}.</TableCell>
  <TableCell>
    <div class="flex items-center gap-3">
      <div
        class="h-12 w-12 overflow-hidden rounded-lg border bg-muted shrink-0"
      >
        {#if product.images?.[0]?.url}
          <img
            src={product.images[0].url}
            alt={product.name}
            class="h-full w-full object-cover"
          />
        {:else}
          <div
            class="flex h-full w-full items-center justify-center text-muted-foreground/40"
          >
            <Package class="h-5 w-5" />
          </div>
        {/if}
      </div>
      <div class="min-w-0">
        <div class="font-semibold text-foreground truncate max-w-[200px]">
          {product.name}
        </div>
        <div class="text-xs text-muted-foreground truncate max-w-[180px]">
          {product.shortDescription || "No description"}
        </div>
      </div>
    </div>
  </TableCell>
  <TableCell>
    <code
      class="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider"
    >
      {product.sku}
    </code>
  </TableCell>
  <TableCell>
    {#if product.category}
      <Badge variant="secondary" class="font-normal">
        {product.category.name}
      </Badge>
    {:else}
      <span class="text-xs text-muted-foreground italic">Uncategorized</span>
    {/if}
  </TableCell>
  <TableCell>
    <div class="flex flex-col">
      <span class="font-bold text-foreground"
        >{formatPrice(product.basePrice)}</span
      >
      {#if product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice)}
        <span class="text-[10px] text-muted-foreground line-through">
          {formatPrice(product.compareAtPrice)}
        </span>
      {/if}
    </div>
  </TableCell>
  <TableCell>
    <Badge variant="outline" class={status.class}>
      {product.stockQuantity}
      {status.label}
    </Badge>
  </TableCell>
  <TableCell>
    <div class="flex flex-col gap-1">
      <Badge
        variant={product.isPublished ? "default" : "secondary"}
        class={product.isPublished
          ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
          : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20"}
      >
        {product.isPublished ? "Published" : "Draft"}
      </Badge>
    </div>
  </TableCell>
  <TableCell class="text-right">
    <div class="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 text-muted-foreground"
        onclick={(e) => {
          e.stopPropagation();
          onView?.(product);
        }}
      >
        <Eye class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        href={`/admin/products/${product.id}/edit`}
        onclick={(e) => e.stopPropagation()}
        class="h-8 w-8 text-primary hover:bg-primary/10"
      >
        <Edit class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onclick={(e) => {
          e.stopPropagation();
          onDelete(product);
        }}
        class="h-8 w-8 text-destructive hover:bg-destructive/10"
      >
        <Trash2 class="h-4 w-4" />
      </Button>
    </div>
  </TableCell>
</TableRow>
