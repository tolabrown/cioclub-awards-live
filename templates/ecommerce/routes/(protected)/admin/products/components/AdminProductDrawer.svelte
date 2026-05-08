<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import {
    Pencil,
    Trash2,
    Eye,
    Package,
    Tag as TagIcon,
    Layers,
    Info,
    Calendar,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import { formatPrice } from "$lib/fxns";
  import { format } from "date-fns";
  import { browser } from "$app/environment";

  interface Props {
    product: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: () => void;
    onDelete?: () => void;
  }

  let {
    product,
    open = $bindable(),
    onOpenChange,
    onEdit,
    onDelete,
  }: Props = $props();

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
    product
      ? getStockStatus(product.stockQuantity, product.lowStockThreshold)
      : null,
  );

  // Dynamic imports
  let Drawer: any = $state(null);

  $effect(() => {
    if (browser) {
      import("$lib/components/ui/drawer/index.js").then((module) => {
        Drawer = module;
      });
    }
  });
</script>

{#if Drawer}
<Drawer.Root bind:open {onOpenChange}>
  <Drawer.Content class="max-h-[90vh]">
    {#if product}
      <Drawer.Header class="border-b">
        <div class="flex items-center gap-4">
          <div
            class="h-16 w-16 overflow-hidden rounded-xl border bg-muted shrink-0"
          >
            {#if product.images?.[0]?.url}
              <img
                src={product.images[0].url}
                alt={product.name}
                class="h-full w-full object-cover"
              />
            {:else}
              <div
                class="flex h-full w-full items-center justify-center text-muted-foreground/30"
              >
                <Package class="h-8 w-8" />
              </div>
            {/if}
          </div>
          <div class="min-w-0">
            <Drawer.Title class="text-lg font-bold truncate"
              >{product.name}</Drawer.Title
            >
            <Drawer.Description class="flex items-center gap-1.5 text-xs">
              <span class="font-mono">{product.sku}</span>
              <span class="opacity-30">•</span>
              <span>{product.category?.name || "Uncategorized"}</span>
            </Drawer.Description>
          </div>
        </div>
      </Drawer.Header>

      <div class="overflow-y-auto p-4 space-y-6 pb-12">
        <!-- Status Badges -->
        <div class="flex flex-wrap gap-2">
          {#if status}
            <Badge variant="outline" class={cn("font-medium", status.class)}>
              {product.stockQuantity}
              {status.label}
            </Badge>
          {/if}
          <Badge
            variant={product.isPublished ? "default" : "secondary"}
            class={product.isPublished
              ? "bg-green-500/10 text-green-600 border-green-500/20"
              : "bg-orange-500/10 text-orange-600 border-orange-500/20"}
          >
            {product.isPublished ? "Published" : "Draft"}
          </Badge>
          {#if product.isFeatured}
            <Badge
              variant="default"
              class="bg-amber-500/10 text-amber-600 border-amber-200"
            >
              Featured
            </Badge>
          {/if}
        </div>

        <!-- Pricing Section -->
        <div class="rounded-xl border bg-card p-4 space-y-3">
          <h3
            class="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2"
          >
            <Info class="h-3.5 w-3.5" /> Pricing Details
          </h3>
          <div class="flex items-baseline justify-between">
            <span class="text-sm text-muted-foreground">Selling Price</span>
            <span class="text-xl font-bold text-primary"
              >{formatPrice(product.basePrice)}</span
            >
          </div>
          {#if product.compareAtPrice}
            <div
              class="flex items-baseline justify-between border-t pt-2 border-dashed"
            >
              <span class="text-xs text-muted-foreground">Original Price</span>
              <span
                class="text-sm text-muted-foreground line-through font-medium"
                >{formatPrice(product.compareAtPrice)}</span
              >
            </div>
          {/if}
        </div>

        <!-- Description -->
        {#if product.shortDescription}
          <div class="space-y-2">
            <h3
              class="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 px-1"
            >
              <Layers class="h-3.5 w-3.5" /> Summary
            </h3>
            <p class="text-sm text-foreground/80 leading-relaxed px-1">
              {product.shortDescription}
            </p>
          </div>
        {/if}

        <!-- Meta Info -->
        <div class="space-y-3 border-t pt-4">
          <div
            class="flex items-center gap-3 text-sm text-muted-foreground px-1"
          >
            <Calendar class="h-4 w-4" />
            <span
              >Created: {format(
                new Date(product.createdAt),
                "MMM dd, yyyy",
              )}</span
            >
          </div>
          <div
            class="flex items-center gap-3 text-sm text-muted-foreground px-1"
          >
            <TagIcon class="h-4 w-4" />
            <span>Category: {product.category?.name || "None"}</span>
          </div>
        </div>
      </div>

      <Drawer.Footer class="border-t bg-muted/5 p-4 flex flex-col gap-2">
        <div class="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            class="w-full gap-2"
            href={`/products/${product.id}`}
            target="_blank"
          >
            <Eye class="h-4 w-4" /> View Live
          </Button>
          <Button variant="outline" class="w-full gap-2" onclick={onEdit}>
            <Pencil class="h-4 w-4" /> Edit Product
          </Button>
        </div>
        <Button variant="destructive" class="w-full gap-2" onclick={onDelete}>
          <Trash2 class="h-4 w-4" /> Delete Product
        </Button>
      </Drawer.Footer>
    {/if}
  </Drawer.Content>
</Drawer.Root>
{/if}
