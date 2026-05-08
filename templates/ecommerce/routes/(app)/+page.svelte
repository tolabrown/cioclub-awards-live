<script lang="ts">
  import type { PageProps } from "./$types";
  import { ProductCard, ProductCardBox } from "$lib/components/store/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import {
    ToggleGroup,
    ToggleGroupItem,
  } from "$lib/components/ui/toggle-group/index.js";
  import { cart } from "$lib/store/cart.svelte";
  import {
    ArrowRight,
    Sparkles,
    Truck,
    ShieldCheck,
    Clock,
    Store as StoreIcon,
    ChevronRight,
    History,
    Package,
    Grid3X3,
    Grid2X2,
    List,
  } from "@lucide/svelte";
  import { navigating } from "$app/stores";
  import { onMount, untrack } from "svelte";
  import { MAX_ITEMS_PER_PAGE } from "$lib/constants/index";
  import { Loader2 } from "@lucide/svelte";
  import { cn } from "$lib/utils.js";
  import Hero from "./components/Hero.svelte";

  let { data }: PageProps = $props();

  const featuredProducts = $derived(data.featuredProducts || []);
  const categories = $derived(data.categories || []);
  const recentlyViewed = $derived(cart.recentlyViewed);

  // New Arrivals Infinite Scroll State
  let allNewArrivals = $state(untrack(() => data.newArrivals || []));
  let currentPage = $state(untrack(() => data.newArrivalsMeta?.page || 1));
  let totalPages = $state(untrack(() => data.newArrivalsMeta?.totalPages || 1));
  // View Modes State
  let recentlyViewedMode = $state<"grid" | "list" | "box">("grid");
  let trendingMode = $state<"grid" | "list" | "box">("box");
  let newArrivalsMode = $state<"grid" | "list" | "box">("box");

  let isLoadingMore = $state(false);
  let observerTarget = $state<HTMLElement | null>(null);

  const loadMore = async () => {
    if (isLoadingMore || currentPage >= totalPages) return;

    isLoadingMore = true;
    try {
      const params = new URLSearchParams();
      params.set("page", (currentPage + 1).toString());
      params.set("limit", MAX_ITEMS_PER_PAGE.toString());
      params.set("sort", "newest"); // Force newest for Arrivals

      const res = await fetch(`/api/all-products?${params.toString()}`);
      const result = await res.json();

      if (result.success && result.data) {
        allNewArrivals = [...allNewArrivals, ...result.data];
        currentPage = result.meta.page;
        totalPages = result.meta.totalPages;
      }
    } catch (e) {
      console.error("Failed to load more new arrivals:", e);
    } finally {
      isLoadingMore = false;
    }
  };

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget) observer.observe(observerTarget);

    return () => {
      if (observerTarget) observer.unobserve(observerTarget);
    };
  });
</script>

<div class="space-y-12 pb-8">
  <Hero {categories} />

  <!-- Categories Highlights -->
  <section class="center mx-auto px-2">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 justify-between mb-8">
      <div>
        <h2 class="text-3xl font-bold">
          Featured <span class="text-primary">Categories</span>
        </h2>
        <p class="text-muted-foreground mt-1">
          Explore our most popular departments
        </p>
      </div>
      <Button href="/categories" variant="outline" size="sm" class="font-bold self-start justify-start">
        View All <ChevronRight class="ml-1 h-4 w-4" />
      </Button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      {#each categories as category}
        <a href="/products?category={category.id}" class="group space-y-1">
          <div
            class="relative aspect-square overflow-hidden rounded-xl bg-muted border border-border group-hover:border-primary transition-all flex items-center justify-center"
          >
            {#if category.imageFile?.url}
              <img
                src={category.imageFile.url}
                alt={category.name}
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            {:else}
              <div
                class="flex flex-col items-center gap-2 text-muted-foreground/40 group-hover:text-primary/40 transition-colors"
              >
                <Package class="h-12 w-12" />
              </div>
            {/if}
          </div>
          <p
            class="text-center font-bold text-sm group-hover:text-primary transition-colors"
          >
            {category.name}
          </p>
        </a>
      {/each}
    </div>
  </section>

  <!-- Personalization: Recently Viewed -->
  {#if recentlyViewed.length > 0}
    <section class="bg-muted/30 py-16">
      <div class="center mx-auto px-2">
        <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-2 mb-8">
          <div class="flex items-center gap-2">
            <div
              class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"
            >
              <History class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-2xl font-bold">
                Recently <span class="text-primary">Viewed</span>
              </h2>
              <p class="text-xs text-muted-foreground">
                Pick up where you left off
              </p>
            </div>
          </div>
          <div
            class="sm:ml-auto flex items-center p-1 rounded-xl bg-muted/50 border border-border w-fit"
          >
            <ToggleGroup
              type="single"
              value={recentlyViewedMode}
              onValueChange={(v) => v && (recentlyViewedMode = v as any)}
              class="gap-1"
            >
              <ToggleGroupItem
                value="box"
                aria-label="Box view"
                class="rounded-lg h-8 w-8 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                <Grid2X2 class="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                class="rounded-lg h-8 w-8 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                <Grid3X3 class="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                aria-label="List view"
                class="rounded-lg h-8 w-8 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                <List class="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div
          class={cn(
            "grid gap-2",
            recentlyViewedMode === "grid"
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
              : recentlyViewedMode === "box"
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {#if $navigating}
            {#each Array(recentlyViewed.slice(0, 6).length || 6) as _}
              <ProductCard.Skeleton viewMode={recentlyViewedMode} />
            {/each}
          {:else}
            {#each recentlyViewed.slice(0, 6) as product}
              {#if recentlyViewedMode === "box"}
                <ProductCardBox {product} />
              {:else}
                <ProductCard {product} viewMode={recentlyViewedMode} />
              {/if}
            {/each}
          {/if}
        </div>
      </div>
    </section>
  {/if}

  <!-- Featured Products -->
  <section class="center mx-auto px-2">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 justify-between mb-10">
      <div>
        <h2 class="text-3xl font-bold">
          Trending <span class="text-primary">Now</span>
        </h2>
        <p class="text-muted-foreground mt-1">
          Our best-selling and featured items
        </p>
      </div>
      <div class="flex items-center gap-2">
        <div
          class="flex items-center p-1 rounded-xl bg-muted/50 border border-border"
        >
          <ToggleGroup
            type="single"
            value={trendingMode}
            onValueChange={(v) => v && (trendingMode = v as any)}
            class="gap-1"
          >
            <ToggleGroupItem
              value="box"
              aria-label="Box view"
              class="rounded-lg h-8 w-8 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              <Grid2X2 class="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="grid"
              aria-label="Grid view"
              class="rounded-lg h-8 w-8 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              <Grid3X3 class="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              aria-label="List view"
              class="rounded-lg h-8 w-8 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              <List class="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Button
          href="/products"
          variant="outline"
          class="hidden sm:flex rounded-xl font-bold"
        >
          View All
        </Button>
      </div>
    </div>

    <div
      class={cn(
        "grid gap-2",
        trendingMode === "grid"
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
          : trendingMode === "box"
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {#if $navigating}
        {#each Array(featuredProducts.length || 6) as _}
          <ProductCard.Skeleton viewMode={trendingMode} />
        {/each}
      {:else}
        {#each featuredProducts as product}
          {#if trendingMode === "box"}
            <ProductCardBox {product} dealLabel="Trending" />
          {:else}
            <ProductCard
              {product}
              viewMode={trendingMode}
              dealLabel="Trending"
            />
          {/if}
        {/each}
      {/if}
    </div>
  </section>

  <!-- Brand Banner -->
  <section class="center mx-auto px-2">
    <div
      class="relative overflow-hidden rounded-xl bg-primary px-8 py-12 md:py-16 text-primary-foreground shadow-lg"
    >
      <div
        class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-10"
      >
        <StoreIcon class="size-96" />
      </div>
      <div class="relative z-10 max-w-2xl space-y-6">
        <h2 class="text-3xl md:text-5xl font-bold leading-tight">
          Elevate Your Everyday with Professional Tools
        </h2>
        <p class="text-lg opacity-90">
          Join 50,000+ happy customers who trust our quality and service for
          their workspace and lifestyle needs.
        </p>
        <div class="flex pt-4">
          <Button
            href="/register"
            variant="secondary"
            class="rounded-xl font-bold px-10 shadow-lg transition-all hover:-translate-y-1"
          >
            Get Exclusive Access
          </Button>
        </div>
      </div>
    </div>
  </section>

  <!-- New Arrivals -->
  <section class="center mx-auto px-2">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 justify-between mb-10">
      <div>
        <h2 class="text-3xl font-bold">
          New <span class="text-primary">Arrivals</span>
        </h2>
        <p class="text-muted-foreground mt-1">Fresh from the warehouse</p>
      </div>
      <div
        class="flex items-center p-1 rounded-xl bg-muted/50 border border-border w-fit"
      >
        <ToggleGroup
          type="single"
          value={newArrivalsMode}
          onValueChange={(v) => v && (newArrivalsMode = v as any)}
          class="gap-1"
        >
          <ToggleGroupItem
            value="box"
            aria-label="Box view"
            class="rounded-lg h-8 w-8 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            <Grid2X2 class="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="grid"
            aria-label="Grid view"
            class="rounded-lg h-8 w-8 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            <Grid3X3 class="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            aria-label="List view"
            class="rounded-lg h-8 w-8 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            <List class="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>

    <div
      class={cn(
        "grid gap-2",
        newArrivalsMode === "grid"
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
          : newArrivalsMode === "box"
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {#if $navigating}
        {#each Array(allNewArrivals.length || 6) as _}
          <ProductCard.Skeleton viewMode={newArrivalsMode} />
        {/each}
      {:else}
        {#each allNewArrivals as product}
          {#if newArrivalsMode === "box"}
            <ProductCardBox {product} />
          {:else}
            <ProductCard {product} viewMode={newArrivalsMode} />
          {/if}
        {/each}
      {/if}
    </div>

    <!-- Infinite Scroll Loader -->
    {#if currentPage < totalPages}
      <div
        bind:this={observerTarget}
        class="py-20 flex flex-col items-center justify-center gap-4"
      >
        <div
          class="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary animate-spin"
        >
          <Loader2 class="h-6 w-6" />
        </div>
        <p
          class="text-xs font-bold text-muted-foreground uppercase tracking-widest"
        >
          Fresh arrivals incoming...
        </p>
      </div>
    {/if}

    <div class="pb-20"></div>
  </section>
</div>
