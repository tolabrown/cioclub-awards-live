<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { ShoppingCart, Plus, Minus, Loader2, Check } from "@lucide/svelte";
  import { cart } from "$lib/store/cart.svelte";
  import { toast } from "svelte-sonner";
  import { cn } from "$lib/utils";

  interface Props {
    product: any;
    sizeId?: string | null;
    showLabel?: boolean;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    onkeydown?: (e: KeyboardEvent) => void;
  }

  let {
    product,
    sizeId = null,
    showLabel = true,
    class: className = "",
    onclick,
    onkeydown: propsOnKeyDown,
  }: Props = $props();

  const productInCart = $derived(
    cart.items.find(
      (item) =>
        item.productId === product.id &&
        item.productSizeId === (sizeId || null),
    ),
  );

  const quantity = $derived(productInCart ? productInCart.quantity : 0);
  let localValue = $state(1); // Default to 1 for the selector
  let isUpdating = $state(false);

  // Sync local value with cart quantity when cart changes, but only if in cart
  $effect(() => {
    if (quantity > 0) {
      localValue = quantity;
    } else {
      localValue = 1; // Default selector back to 1 when removed
    }
  });

  async function handleUpdate(newQty: number) {
    if (newQty < 0) newQty = 0;
    if (newQty > (product.stockQuantity || 999)) {
      newQty = product.stockQuantity || 999;
      toast.error(`Only ${newQty} items available in stock`);
    }

    // Capture previous for feedback
    const wasInCart = quantity > 0;

    isUpdating = true;
    try {
      await cart.setQuantity(product, newQty, sizeId || undefined);

      if (newQty > 0 && !wasInCart) {
        toast.success(`${product.name} added to cart`, {
          position: "top-center",
        });
      }
    } finally {
      isUpdating = false;
    }
  }

  function increment() {
    handleUpdate(localValue + 1);
  }

  function decrement() {
    if (localValue > 0) {
      handleUpdate(localValue - 1);
    }
  }

  function handleInputKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class={cn("group/cart relative flex w-full items-center gap-1.5", className)}
  {onclick}
  onkeydown={propsOnKeyDown}
  role="presentation"
>
  <!-- Main Selector Control -->
  <div
    class={cn(
      "flex h-9 items-center rounded-xl border transition-all duration-300 overflow-hidden",
      quantity > 0
        ? "border-primary/30 bg-primary/5 ring-1 ring-primary/10 shadow-sm"
        : "border-border bg-muted/20 hover:border-primary/30",
      "flex-1",
    )}
  >
    <Button
      variant="ghost"
      size="icon-sm"
      class="h-full rounded-none text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-30"
      onclick={decrement}
      disabled={isUpdating || (quantity === 0 && localValue <= 1)}
    >
      <Minus class="size-3.5" />
    </Button>

    <div class="relative flex flex-1 items-center justify-center px-0.5">
      <Input
        type="number"
        bind:value={localValue}
        onkeydown={handleInputKeyDown}
        onblur={() => handleUpdate(localValue)}
        class="h-7 border-none bg-transparent p-0 text-center text-sm font-bold text-foreground shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        disabled={isUpdating}
      />
      {#if isUpdating}
        <div
          class="absolute inset-x-2 bottom-0 h-0.5 animate-pulse bg-primary/30"
        ></div>
      {/if}
    </div>

    <Button
      variant="ghost"
      size="icon-sm"
      class="h-full rounded-none text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-30"
      onclick={increment}
      disabled={isUpdating || localValue >= (product.stockQuantity || 999)}
    >
      <Plus class="size-3.5" />
    </Button>

    {#if !showLabel && quantity === 0}
      <Button
        size="sm"
        class="h-full rounded-none bg-primary text-primary-foreground font-bold px-3 transition-all hover:bg-primary/90"
        onclick={() => handleUpdate(localValue)}
        disabled={product.stockQuantity === 0 || isUpdating}
      >
        Add
      </Button>
    {/if}
  </div>

  <!-- Action Button (only if showLabel is true) -->
  {#if showLabel}
    <Button
      class={cn(
        "h-9 flex-1 rounded-xl font-bold shadow-md transition-all active:scale-[0.98]",
        quantity > 0
          ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 shadow-none"
          : "bg-primary text-primary-foreground hover:shadow-lg",
      )}
      onclick={() => handleUpdate(localValue === 0 ? 1 : localValue)}
      disabled={product.stockQuantity === 0 || isUpdating}
    >
      {#if isUpdating}
        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      {:else if quantity > 0}
        <Check class="mr-2 h-4 w-4" />
      {:else}
        <ShoppingCart class="mr-2 h-4 w-4" />
      {/if}

      <span class="truncate">
        {#if quantity > 0}
          In Cart
        {:else}
          Add to Cart
        {/if}
      </span>
    </Button>
  {/if}
</div>

<style>
  /* Hide arrows in input[type="number"] */
  :global(.group\/cart input::-webkit-outer-spin-button),
  :global(.group\/cart input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }
  :global(.group\/cart input[type="number"]) {
    -moz-appearance: textfield;
    appearance: textfield;
  }
</style>
