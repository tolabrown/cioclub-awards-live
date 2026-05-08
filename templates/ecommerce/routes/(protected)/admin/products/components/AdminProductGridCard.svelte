<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { cn } from "$lib/utils";
  import { Package, Tag } from "@lucide/svelte";
  import { formatPrice } from "$lib/fxns";

  interface Props {
    product: any;
    onClick: () => void;
    columns?: number;
  }

  let { product, onClick, columns = 2 }: Props = $props();

  const getStockStatus = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    return `${stock} in stock`;
  };
</script>

<button
  onclick={onClick}
  class={cn(
    "group relative overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-lg active:scale-[0.98]",
    columns === 1
      ? "flex flex-row h-28 sm:h-36"
      : "flex flex-col aspect-square w-full",
  )}
>
  <!-- Image Section -->
  <div
    class={cn(
      "relative overflow-hidden bg-muted",
      columns === 1 ? "w-1/3 sm:w-40 h-full shrink-0" : "w-full h-full",
    )}
  >
    {#if product.images?.[0]?.url}
      <img
        src={product.images[0].url}
        alt={product.name}
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    {:else}
      <div
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5"
      >
        <Package class="h-8 w-8 text-primary/30" />
      </div>
    {/if}

    <!-- Gradient Overlay for 2-column mode text readability -->
    {#if columns !== 1}
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"
      ></div>
    {/if}
  </div>

  <!-- Content Section -->
  <div
    class={cn(
      "flex flex-col justify-center",
      columns === 1
        ? "flex-1 p-3 bg-gradient-to-br from-card to-card/50"
        : "absolute bottom-0 left-0 w-full p-3 pointer-events-none",
    )}
  >
    <div class="space-y-1">
      <h3
        class={cn(
          "font-bold leading-tight line-clamp-1",
          columns === 1 ? "text-base text-foreground" : "text-base text-white",
        )}
      >
        {product.name}
      </h3>

      {#if columns === 1}
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-bold text-primary">{formatPrice(product.basePrice)}</span>
          {#if product.category}
            <Badge variant="outline" class="text-[10px] h-4 px-1 py-0 border-primary/20 text-primary">
              {product.category.name}
            </Badge>
          {/if}
        </div>
        <div class="flex items-center gap-1.5 mt-1">
           <Badge variant="secondary" class="text-[10px] font-normal py-0">
             {getStockStatus(product.stockQuantity)}
           </Badge>
           {#if !product.isPublished}
             <Badge variant="outline" class="text-[10px] bg-orange-500/10 text-orange-600 border-orange-200 py-0">
                Draft
             </Badge>
           {/if}
        </div>
      {:else}
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-white">
            {formatPrice(product.basePrice)}
          </span>
          <span class="text-[9px] text-white/80 font-medium bg-black/20 backdrop-blur-md px-1.5 rounded-full border border-white/10">
            {product.stockQuantity} Left
          </span>
        </div>
      {/if}
    </div>
  </div>
</button>
