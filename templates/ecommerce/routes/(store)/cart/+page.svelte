<script lang="ts">
  import { cart } from "$lib/store/cart.svelte";
  import { formatPrice } from "$lib/fxns";
  import {
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    ArrowRight,
    Truck,
    ShieldCheck,
    MapPin,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { Badge } from "$lib/components/ui/badge";
  import { Textarea } from "$lib/components/ui/textarea";
  import CartItemSkeleton from "$lib/components/store/CartItemSkeleton.svelte";
  import { toast } from "svelte-sonner";
  import { cn } from "$lib/utils";
  import { fade, slide, fly } from "svelte/transition";

  let { data } = $props();
  const total = $derived(cart.total);

  async function handleUpdateQuantity(itemId: string, qty: number) {
    if (qty < 1) return;
    await cart.updateQuantity(itemId, qty);
  }

  async function handleRemove(itemId: string) {
    await cart.removeItem(itemId);
    toast.success("Item removed from cart");
  }

  const items = $derived(cart.items);
  const isInitialLoading = $derived(!cart.isReady);
  const isUpdating = $derived(cart.isUpdating);
</script>

<svelte:head>
  <title>Shopping Cart | Tools N Tuts</title>
</svelte:head>

<div class="min-h-screen bg-slate-50/50 pb-20 dark:bg-slate-950/50">
  <div class="center px-2 p-2">
    <!-- Header -->
    <div class="mb-8 flex items-end justify-between">
      <div class="space-y-1">
        <h1
          class="text-3xl font-bold tracking-tight text-foreground md:text-4xl"
        >
          Shopping Cart
        </h1>
        <p class="text-muted-foreground">
          {#if isInitialLoading}
            Loading your cart...
          {:else if items.length > 0}
            You have {cart.count}
            {cart.count === 1 ? "item" : "items"} in your cart.
          {:else}
            Your cart is currently empty.
          {/if}
        </p>
      </div>
      {#if items.length > 0}
        <Button
          variant="outline"
          class="hidden text-muted-foreground hover:text-destructive md:flex rounded-xl"
          onclick={() => cart.clear()}
          loading={isUpdating}
        >
          <Trash2 class="mr-2 h-4 w-4" />
          Clear Cart
        </Button>
      {/if}
    </div>

    {#if isInitialLoading}
      <div class="grid gap-8 lg:grid-cols-12 w-full">
        <div class="space-y-4 lg:col-span-8 w-full">
          {#each Array(3) as _}
            <CartItemSkeleton />
          {/each}
        </div>
        <div class="lg:col-span-4 space-y-6">
          <Card class="border-none shadow-sm animate-pulse h-64"></Card>
          <Card class="border-none shadow-lg animate-pulse h-80"></Card>
        </div>
      </div>
    {:else if items.length > 0}
      <div class="grid gap-8 lg:grid-cols-12 w-full">
        <!-- Cart Items List -->
        <div class="space-y-4 lg:col-span-8 w-full">
          {#each items as item (item.id)}
            <div transition:slide|local>
              <Card
                class="group relative overflow-hidden border-none bg-white/70 shadow-sm backdrop-blur-md transition-all hover:shadow-md dark:bg-white/5 py-0 gap-0"
              >
                <div class="flex">
                  <!-- Image Area -->
                  <a
                    href={`/products/${item.productId}`}
                    class="relative w-32 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-900 sm:w-40"
                  >
                    {#if item.product?.images?.[0]?.url}
                      <img
                        src={item.product.images[0].url}
                        alt={item.product?.name}
                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    {:else}
                      <div
                        class="flex h-full items-center justify-center text-slate-300 dark:text-slate-700"
                      >
                        <ShoppingBag class="h-10 w-10" />
                      </div>
                    {/if}
                  </a>

                  <!-- Info & Actions Area -->
                  <div class="flex min-w-0 flex-1 flex-col">
                    <!-- Top Section: Info -->
                    <div class="flex flex-1 flex-col p-4 pb-2">
                      <div
                        class="flex flex-col md:flex-row items-start justify-between gap-2"
                      >
                        <div class="min-w-0 flex-1 space-y-1">
                          {#if item.product?.category}
                            <Badge
                              variant="secondary"
                              class="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            >
                              {item.product.category.name}
                            </Badge>
                          {/if}
                          <h3
                            class="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary sm:text-base"
                          >
                            <a
                              href={`/products/${item.productId}`}
                              class="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary sm:text-base"
                              >{item.product?.name || "Product"}</a
                            >
                          </h3>
                          {#if item.productSize}
                            <div
                              class="flex items-center gap-1.5 text-xs text-muted-foreground pt-1"
                            >
                              <span class="font-medium text-foreground"
                                >Size:</span
                              >
                              <span
                                class="rounded bg-primary/10 px-2 py-0.5 font-bold text-primary"
                              >
                                {item.productSize.size?.name}
                              </span>
                            </div>
                          {/if}
                        </div>
                        <div class="flex flex-col items-end gap-1">
                          <span class="text-lg font-bold text-foreground">
                            {formatPrice(parseFloat(item.priceAtAdd))}
                          </span>
                          <span
                            class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider"
                            >Unit Price</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Bottom Section: Actions -->
                <div class="border-t border-border/50 p-4 pt-3">
                  {#if isUpdating}
                    <Button
                      variant="ghost"
                      class="h-10 w-full justify-center rounded-xl bg-muted/20 border-none animate-pulse"
                      disabled
                    >
                      <Loader2 class="mr-2 h-4 w-4 animate-spin text-primary" />
                      <span class="text-sm">Loading...</span>
                    </Button>
                  {:else}
                    <div class="flex items-center justify-between gap-4">
                      <!-- Quantity Widget -->
                      <div
                        class="flex items-center rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          class="h-9 w-9 rounded-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          onclick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus class="h-3.5 w-3.5" />
                        </Button>
                        <span
                          class="min-w-[2.5rem] text-center text-sm font-bold text-foreground"
                        >
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          class="h-9 w-9 rounded-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          onclick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus class="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div class="flex items-center gap-4">
                        <!-- Line Total -->
                        <div class="hidden flex-col items-end sm:flex">
                          <span
                            class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                            >Total</span
                          >
                          <span class="font-bold text-foreground">
                            {formatPrice(
                              parseFloat(item.priceAtAdd) * item.quantity,
                            )}
                          </span>
                        </div>

                        <!-- Remove -->
                        <Button
                          variant="ghost"
                          size="icon"
                          class="h-9 w-9 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          onclick={() => handleRemove(item.id)}
                        >
                          <Trash2 class="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  {/if}
                </div>
              </Card>
            </div>
          {/each}
        </div>

        <!-- Summary & Shipping -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Order Summary -->
          <Card
            class="border-none shadow-lg bg-white/90 dark:bg-slate-900/90 overflow-hidden rounded-xl py-0"
          >
            <div
              class="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60"
            ></div>
            <CardHeader>
              <CardTitle class="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent class="p-0">
              <div class="px-6 pt-4 space-y-4">
                <!-- Itemized Breakdown -->
                <div class="space-y-3 pb-2">
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Detailed Breakdown
                  </p>
                  {#each items as item}
                    <div class="flex justify-between items-start gap-4">
                      <div class="flex-1 min-w-0">
                        <p
                          class="text-xs font-medium text-foreground line-clamp-1"
                        >
                          {item.product?.name}
                        </p>
                        <p class="text-[10px] text-muted-foreground">
                          {item.quantity} × {formatPrice(
                            parseFloat(item.priceAtAdd),
                          )}
                        </p>
                      </div>
                      <span class="text-xs font-bold text-foreground shrink-0">
                        {formatPrice(
                          parseFloat(item.priceAtAdd) * item.quantity,
                        )}
                      </span>
                    </div>
                  {/each}
                </div>

                <Separator class="opacity-50" />

                <div class="space-y-2 pt-2">
                  <div class="flex justify-between text-base">
                    <span class="text-muted-foreground">Subtotal</span>
                    <span class="font-bold text-foreground"
                      >{formatPrice(cart.total)}</span
                    >
                  </div>
                  <p class="text-[10px] text-muted-foreground italic">
                    Shipping will be calculated at the checkout page.
                  </p>
                </div>

                <Separator />

                <div class="flex items-end justify-between pt-2 pb-6">
                  <div class="space-y-1">
                    <p
                      class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >
                      Total Amount
                    </p>
                    <p class="text-3xl font-bold text-foreground">
                      {formatPrice(total)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    class="mb-1 border-slate-200 dark:border-slate-800 rounded-lg"
                    >Inc. VAT</Badge
                  >
                </div>

                <div class="pt-4 space-y-3">
                  <Button
                    class="w-full rounded-full font-bold shadow-xl shadow-primary/20 group relative overflow-hidden"
                    href="/checkout"
                    disabled={isUpdating || items.length === 0}
                  >
                    <span
                      class="relative z-10 flex items-center justify-center gap-2"
                    >
                      Checkout Now
                      <ArrowRight
                        class="h-5 w-5 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </Button>

                  <div class="flex items-center justify-center gap-4 py-2">
                    <div
                      class="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-help"
                    >
                      <ShieldCheck class="h-4 w-4" />
                      <span
                        class="text-[10px] font-bold uppercase tracking-wider"
                        >Secure Payment</span
                      >
                    </div>
                    <div
                      class="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"
                    ></div>
                    <div
                      class="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-help"
                    >
                      <Truck class="h-4 w-4" />
                      <span
                        class="text-[10px] font-bold uppercase tracking-wider"
                        >Fast Delivery</span
                      >
                    </div>
                  </div>

                  <div
                    class="rounded-xl border border-dashed border-slate-200 p-3 text-center dark:border-slate-800"
                  >
                    <p class="text-[10px] text-muted-foreground italic">
                      Secure checkout powered by <span
                        class="font-bold text-foreground">Paystack</span
                      >
                    </p>
                  </div>
                </div>
              </div></CardContent
            >
          </Card>
        </div>
      </div>
    {:else}
      <!-- Empty Cart State -->
      <div class="flex flex-col items-center justify-center py-20" in:fade>
        <div class="relative mb-8">
          <div
            class="absolute -inset-10 animate-pulse rounded-full bg-primary/5 blur-3xl"
          ></div>
          <div
            class="relative rounded-full bg-white p-10 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
          >
            <ShoppingBag
              class="h-20 w-20 text-slate-200 dark:text-slate-800"
              strokeWidth={1}
            />
          </div>
        </div>
        <h2 class="mb-3 text-2xl font-bold text-foreground">
          Your cart feels a bit lonely
        </h2>
        <p class="mb-10 max-w-sm text-center text-muted-foreground">
          Explore our amazing products and find something you'll love! We
          promise to take good care of it.
        </p>
        <Button
          href="/products"
          class="rounded-full px-10 font-bold shadow-lg shadow-primary/20"
        >
          Start Shopping
          <ArrowRight class="ml-2 h-4 w-4" />
        </Button>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Custom glassmorphism and animations */
  :global(.scrollbar-hide::-webkit-scrollbar) {
    display: none;
  }
  :global(.scrollbar-hide) {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
