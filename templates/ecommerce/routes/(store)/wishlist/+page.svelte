<script lang="ts">
  import type { PageProps } from "./$types";
  import { Button } from "$lib/components/ui/button/index.js";
  import { ProductCard, ProductCardBox } from "$lib/components/store/index.js";
  import {
    Heart,
    ArrowLeft,
    ShoppingBag,
    Grid3X3,
    Grid2X2,
    List,
    Loader2,
    Sparkles,
  } from "@lucide/svelte";
  import { fade, fly } from "svelte/transition";
  import {
    ToggleGroup,
    ToggleGroupItem,
  } from "$lib/components/ui/toggle-group/index.js";
  import { untrack } from "svelte";
  import { MAX_ITEMS_PER_PAGE } from "$lib/constants/index";
    import { cn } from "$lib/utils";

  let { data }: PageProps = $props();

  // Fix Svelte 5 warning by using untrack and syncing changes
  let allWishlistItems = $state(untrack(() => data.wishlistItems || []));
  let currentPage = $state(untrack(() => data.meta?.page || 1));
  let totalPages = $state(untrack(() => data.meta?.totalPages || 1));
  let isLoadingMore = $state(false);
  let viewMode = $state<"grid" | "list" | "box">("box");
  let observerTarget = $state<HTMLElement | null>(null);

  $effect(() => {
    allWishlistItems = data.wishlistItems || [];
    currentPage = data.meta?.page || 1;
    totalPages = data.meta?.totalPages || 1;
  });

  const loadMore = async () => {
    if (isLoadingMore || currentPage >= totalPages) return;

    isLoadingMore = true;
    try {
      const res = await fetch(
        `/api/wishlist?page=${currentPage + 1}&limit=${MAX_ITEMS_PER_PAGE}`,
      );
      const result = await res.json();

      if (result.success && result.data) {
        allWishlistItems = [...allWishlistItems, ...result.data];
        currentPage = result.meta.page;
        totalPages = result.meta.totalPages;
      }
    } catch (e) {
      console.error("Failed to load more wishlist items:", e);
    } finally {
      isLoadingMore = false;
    }
  };

  $effect(() => {
    if (!observerTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerTarget);
    return () => observer.disconnect();
  });

  const removeLocally = (productId: string) => {
    allWishlistItems = allWishlistItems.filter(
      (item) => item.productId !== productId,
    );
  };
</script>

<svelte:head>
  <title>Your Wishlist | TnT Store</title>
  <meta
    name="description"
    content="View and manage items you've saved for later."
  />
</svelte:head>

<div class="min-h-screen bg-muted/30 pb-20 pt-8 lg:pt-12">
  <div class="center px-4">
    <div
      class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div class="mb-2 flex items-center gap-2 text-primary">
          <Heart class="h-5 w-5 fill-current" />
          <span class="text-sm font-bold tracking-wider uppercase"
            >Your Collection</span
          >
        </div>
        <h1 class="text-3xl font-bold tracking-tight lg:text-4xl">
          Your Wishlist
        </h1>
        <p class="mt-1 text-muted-foreground">
          {allWishlistItems.length} items saved for later
        </p>
      </div>

      <div class="flex items-center gap-4">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => {
            if (v) viewMode = v as any;
          }}
          class="bg-background border border-border p-1 rounded-xl shadow-sm"
        >
          <ToggleGroupItem value="box" class="rounded-lg px-3">
            <Grid3X3 class="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" class="rounded-lg px-3">
            <Grid2X2 class="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" class="rounded-lg px-3">
            <List class="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Button
          href="/products"
          variant="outline"
          class="rounded-xl border-2 font-bold transition-all hover:bg-primary hover:text-primary-foreground"
        >
          <ArrowLeft class="mr-2 h-4 w-4" />
          Browse More
        </Button>
      </div>
    </div>

    {#if allWishlistItems.length === 0}
      <div
        in:fade={{ duration: 400 }}
        class="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-sm"
      >
        <div
          class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <Heart class="h-10 w-10" />
        </div>
        <h2 class="text-2xl font-bold">Your wishlist is empty</h2>
        <p class="mx-auto mt-2 max-w-xs text-muted-foreground">
          Start adding items you love to keep track of them and buy them later.
        </p>
        <Button
          href="/products"
          class="mt-8 transition-all hover:scale-105 active:scale-95"
        >
          Explore Products
        </Button>
      </div>
    {:else}
      <div
        class={cn(
          "grid gap-4",
          viewMode === "list"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : viewMode === "grid"
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        )}
      >
        {#each allWishlistItems as item (item.id)}
          <div in:fly={{ y: 20, duration: 400 }}>
            {#if viewMode === "box"}
              <ProductCardBox
                product={item.product}
                isWishlisted={true}
                onWishlistToggle={(is) => !is && removeLocally(item.productId)}
              />
            {:else}
              <ProductCard
                product={item.product}
                isWishlisted={true}
                {viewMode}
                onWishlistToggle={(is) => !is && removeLocally(item.productId)}
              />
            {/if}
          </div>
        {/each}
      </div>

      <!-- Infinite Scroll Trigger -->
      {#if currentPage < totalPages}
        <div bind:this={observerTarget} class="mt-12 flex justify-center py-8">
          {#if isLoadingMore}
            <div
              class="flex items-center gap-3 rounded-full bg-card px-6 py-3 shadow-sm border border-border"
            >
              <Loader2 class="h-5 w-5 animate-spin text-primary" />
              <span class="text-sm font-medium animate-pulse"
                >Loading amazing items...</span
              >
            </div>
          {/if}
        </div>
      {/if}
    {/if}

    <!-- Features/Promotion Section following the gradient + highlight guidelines -->
    <div
      class="mt-20 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-border shadow-xl"
    >
      <div
        class="grid grid-cols-1 gap-8 p-4 lg:grid-cols-2 lg:p-12 items-center"
      >
        <div>
          <div
            class="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary"
          >
            <Sparkles class="h-3.5 w-3.5" />
            Special Benefits
          </div>
          <h2 class="text-3xl font-bold tracking-tight lg:text-4xl italic">
            Why use <span class="text-primary not-italic">Wishlist?</span>
          </h2>
          <ul class="mt-8 space-y-6 text-muted-foreground">
            <li
              class="flex items-start gap-4 transition-transform hover:translate-x-1"
            >
              <div
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary mt-0.5"
              >
                <span class="text-sm font-bold">1</span>
              </div>
              <span>Save items to purchase later when you're ready</span>
            </li>
            <li
              class="flex items-start gap-4 transition-transform hover:translate-x-1"
            >
              <div
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary mt-0.5"
              >
                <span class="text-sm font-bold">2</span>
              </div>
              <span>Easily compare products and track your favorites</span>
            </li>
            <li
              class="flex items-start gap-4 transition-transform hover:translate-x-1"
            >
              <div
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary mt-0.5"
              >
                <span class="text-sm font-bold">3</span>
              </div>
              <span>Access your wishlist from any device when logged in</span>
            </li>
          </ul>
        </div>
        <div class="relative hidden lg:block">
          <div
            class="absolute -inset-4 rounded-full bg-primary/10 blur-3xl"
          ></div>
          <div class="relative flex items-center justify-center">
            <div
              class="relative h-64 w-64 rounded-2xl bg-card p-6 shadow-2xl transition-all hover:scale-105 hover:rotate-2 border border-border overflow-hidden"
            >
              <div class="absolute top-0 right-0 p-4">
                <Heart
                  class="h-10 w-10 text-primary fill-current animate-pulse"
                />
              </div>
              <div class="space-y-4">
                <div
                  class="h-32 w-full rounded-lg bg-muted animate-pulse"
                ></div>
                <div class="h-4 w-3/4 rounded bg-muted animate-pulse"></div>
                <div class="h-4 w-1/2 rounded bg-muted animate-pulse"></div>
              </div>
            </div>
            <div
              class="absolute -bottom-6 -right-6 h-48 w-48 rounded-2xl bg-card p-4 shadow-2xl transition-all hover:scale-110 hover:-rotate-3 border border-border"
            >
              <div class="absolute top-0 left-0 p-3">
                <ShoppingBag class="h-8 w-8 text-secondary fill-current" />
              </div>
              <div class="space-y-4">
                <div class="h-24 w-full rounded-lg bg-muted"></div>
                <div class="h-3 w-2/3 rounded bg-muted"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
