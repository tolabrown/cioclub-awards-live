<script lang="ts">
  import type { iProduct } from "$lib/interface";
  import { Heart, ShoppingCart, Star } from "@lucide/svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { cn } from "$lib/utils";
  import { Card } from "$lib/components/ui/card";
  import { Button } from "../ui/button";

  interface Props {
    class?: string;
    type?: 'lightning' | 'regular';
    product: iProduct;
  }
  let { product, class: className, type = 'regular' }: Props = $props();
</script>

{#if type === 'lightning'}
  {@render Lightning(product, className)}
{:else}
  {@render Regular(product, className)}
{/if}

{#snippet Lightning(
  product: iProduct,
  className: string | undefined
)}
<Card
  class={cn(
    "!py-0 rounded-none !bg-transparent overflow-hidden gap-0 shadow-none outline-none border-none",
    className
  )}
>
  <div class="relative aspect-square">
    <img
      src={product.image}
      alt={product.title}
      class="w-full h-full object-cover group-hover:scale-105 transition-transform"
    />
    <Button
      size="icon"
      class="absolute top-2 right-2 rounded-full bg-primary/50"
    >
      <Heart class="size-4 fill-white stroke-none" />
    </Button>
    
    {#if product.badge}
      <div class="w-full cpr p-1 font-bold absolute bottom-0 left-0 line-clamp-1 whitespace-nowrap">
        {product.stockLeft ? product.stockLeft : ''} / {product.badge} 
      </div>
    {/if}
  </div>
  <div class="flex items-center gap-2">
    <span class="font-semibold"
      >₦{(product.price / 100).toFixed(0)}</span
    >
    <span></span>
  </div>
</Card>
{/snippet}
{#snippet Regular(
  product: iProduct,
  className: string | undefined
)}
<div class={cn("overflow-hidden transition-all group", className)}>
  <div class="relative aspect-square overflow-hidden">
    <img
      src={product.image}
      alt={product.title}
      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
    />
    <button
      class="absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100"
    >
      <Heart class="size-4" />
    </button>
    <button
      class="absolute bottom-2 right-2 rounded-full p-2transition-all shadow-lg opacity-0 group-hover:opacity-100"
    >
      <ShoppingCart class="size-4" />
    </button>
    {#if product.badge}
      <div class="w-full cpr p-1 font-bold absolute bottom-0 left-0">
        {product.stockLeft ? product.stockLeft : ''} / {product.badge} 
      </div>
    {/if}
  </div>

  <div class="py-1 flex flex-col gap-0.5">
    <a
      href="/#"
      class="text-xs md:text-base font-medium line-clamp-1 md:line-clamp-2 cursor-pointer"
    >
      {product.title}
    </a>
    <div class="flex items-center gap-1">
      {#each Array(5) as _, i}
        <Star
          class="w-3 h-3 {i < Math.floor(product.rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'}"
        />
      {/each}
      <span class="text-xs font-bold ml-1">{product.rating.toFixed(1)}</span>
      <span class="text-xs text-gray-500">{product.reviews}</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="font-medium"
        >₦{(product.price / 100).toFixed(0)}</span
      >
      <span class="text-xs text-muted-foreground line-through"
        >₦{(product.originalPrice / 100).toFixed(0)}</span
      >
      <span
        class="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
        >-{product.discount}%</span
      >
    </div>
  </div>
</div>
{/snippet}

