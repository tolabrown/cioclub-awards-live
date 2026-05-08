<script lang="ts">
  import type { PageProps } from "./$types";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import {
    ToggleGroup,
    ToggleGroupItem,
  } from "$lib/components/ui/toggle-group/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import {
    Search,
    SlidersHorizontal,
    Grid3X3,
    Grid2X2,
    List,
    X,
    Copy,
    Download,
    RotateCcw,
    Sparkles,
    ArrowUpDown,
  } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import {
    ProductCard,
    ProductCardBox,
    ProductPage,
    FilterSidebar,
  } from "$lib/components/store/index.js";
  import { cn } from "$lib/utils.js";
  import { navigating } from "$app/stores";
  import { untrack } from "svelte";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import { MAX_ITEMS_PER_PAGE } from "$lib/constants/index";
  import { Loader2 } from "@lucide/svelte";
    import { browser } from "$app/environment";

  let { data }: PageProps = $props();

  // Initialize state with untrack to avoid reactivity warnings
  let searchQuery = $state(untrack(() => data.searchQuery || ""));
  let activeSearch = $state(untrack(() => data.searchQuery || ""));
  let sortBy = $state(untrack(() => data.filters?.sort || "newest"));
  let viewMode = $state<"grid" | "list" | "box">("box");
  let filterOpen = $state(false);
  let searchDialogOpen = $state(false);
  let sortDrawerOpen = $state(false);
  let tempSortBy = $state(untrack(() => data.filters?.sort || "newest"));

  // Expanded Filter State
  let selectedCategory = $state(untrack(() => data.filters?.categoryId || ""));
  let selectedTag = $state("");
  let priceRange = $state(
    untrack(() => [
      data.filters?.minPrice || 0,
      data.filters?.maxPrice || 100000,
    ]),
  );
  let rating = $state("0-5");
  let discountRange = $state(untrack(() => data.filters?.discount || "0-100"));

  // Sync prop changes (e.g. from navigation) back to local state
  $effect(() => {
    searchQuery = data.searchQuery || "";
    activeSearch = data.searchQuery || "";
    selectedCategory = data.filters?.categoryId || "";
    discountRange = data.filters?.discount || "0-100";
    priceRange = [
      data.filters?.minPrice || 0,
      data.filters?.maxPrice || 100000,
    ];
  });

  // Dynamic imports
  let Drawer: any = $state(null);

  $effect(() => {
    if (browser) {
      import("$lib/components/ui/drawer/index.js").then((module) => {
        Drawer = module;
      });
    }
  });

  // Listen for filter/sort open from layout (mobile only)
  $effect(() => {
    const handleOpenFilters = () => {
      if (window.innerWidth < 1024) filterOpen = true;
    };
    const handleOpenSort = () => {
      if (window.innerWidth < 1024) {
        tempSortBy = sortBy;
        sortDrawerOpen = true;
      }
    };
    window.addEventListener("open-filters", handleOpenFilters);
    window.addEventListener("open-sort", handleOpenSort);
    return () => {
      window.removeEventListener("open-filters", handleOpenFilters);
      window.removeEventListener("open-sort", handleOpenSort);
    };
  });

  // Products State management for infinite scroll
  let allProducts = $state(untrack(() => data.products || []));
  let currentPage = $state(untrack(() => data.meta?.page || 1));
  let totalPages = $state(untrack(() => data.meta?.totalPages || 1));
  let isLoadingMore = $state(false);
  let observerTarget = $state<HTMLElement | null>(null);

  const categories = $derived(data.categories || []);

  // Update products when data prop changes (initial load or browser navigation)
  $effect(() => {
    allProducts = data.products || [];
    currentPage = data.meta?.page || 1;
    totalPages = data.meta?.totalPages || 1;
  });

  const loadMore = async () => {
    if (isLoadingMore || currentPage >= totalPages) return;

    isLoadingMore = true;
    try {
      const params = new URLSearchParams(window.location.search);
      params.set("page", (currentPage + 1).toString());
      params.set("limit", MAX_ITEMS_PER_PAGE.toString());

      const res = await fetch(`/api/all-products?${params.toString()}`);
      const result = await res.json();

      if (result.success && result.data) {
        allProducts = [...allProducts, ...result.data];
        currentPage = result.meta.page;
        totalPages = result.meta.totalPages;
      }
    } catch (e) {
      console.error("Failed to load more products:", e);
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

    return () => {
      observer.disconnect();
    };
  });

  const updateFilters = () => {
    const params = new URLSearchParams();
    if (activeSearch) params.set("search", activeSearch);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedTag) params.set("tag", selectedTag);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 100000)
      params.set("maxPrice", priceRange[1].toString());
    if (rating !== "0-5") params.set("rating", rating);
    if (discountRange !== "0-100") params.set("discount", discountRange);

    const url = `/products?${params.toString()}`;
    if (window.location.search !== `?${params.toString()}`) {
      goto(url, {
        replaceState: true,
        keepFocus: true,
        noScroll: true,
      });
    }
  };

  // Reactively update URL when filters change
  $effect(() => {
    // Track dependencies - access array elements explicitly for reactivity
    const s = sortBy;
    const cat = selectedCategory;
    const tag = selectedTag;
    const minP = priceRange[0];
    const maxP = priceRange[1];
    const r = rating;
    const d = discountRange;

    updateFilters();
  });

  const handleSearch = (e: SubmitEvent) => {
    e.preventDefault();
    activeSearch = searchQuery;
    searchDialogOpen = false;
    updateFilters();
  };

  const clearFilters = () => {
    selectedCategory = "";
    selectedTag = "";
    priceRange = [0, 100000];
    rating = "0-5";
    discountRange = "0-100";
    sortBy = "newest";
    tempSortBy = "newest";
    searchQuery = "";
    activeSearch = "";
  };

  const handleCopy = () => {
    const baseUrl = window.location.origin;
    const productList = allProducts
      .map((p) => `- ${p.name}: ${baseUrl}/products/${p.id}`)
      .join("\n");

    navigator.clipboard.writeText(productList);
    toast.success("Product list copied", {
      description: `${allProducts.length} products copied to clipboard.`,
    });
  };

  const handleDownload = () => {
    const baseUrl = window.location.origin;
    const productList = allProducts
      .map((p) => `- ${p.name}: ${baseUrl}/products/${p.id}`)
      .join("\n");

    const blob = new Blob([productList], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Download started", {
      description: `${allProducts.length} products exported to products.txt`,
    });
  };

  const sortOptions = [
    { value: "newest", label: "Newest Arrivals" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name", label: "Product Name" },
  ];
</script>

{#snippet searchForm(isMobileDialog = false)}
  <form
    class={cn(
      "relative group flex items-center gap-2",
      isMobileDialog ? "flex-col w-full gap-4" : "flex-1",
    )}
    onsubmit={handleSearch}
  >
    <div class="relative flex-1 w-full">
      <Search
        class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
      />
      <Input
        type="search"
        placeholder="Search products..."
        bind:value={searchQuery}
        class={cn(
          "pl-10 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl text-sm transition-all",
          isMobileDialog && "h-14 text-base",
        )}
      />
    </div>
    <Button
      type="submit"
      class={cn(
        "font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95",
        isMobileDialog ? "w-full" : "hover:scale-[1.02]",
      )}
    >
      {isMobileDialog ? "Find Products" : "Search"}
    </Button>
  </form>
{/snippet}

{#if $navigating}
  <ProductPage.Skeleton {viewMode} />
{:else}
  <div class="bg-muted/30 min-h-screen">
    <div class="mx-auto max-w-[1440px] px-2">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <!-- Desktop Sidebar -->
        <div class="hidden lg:block space-y-6">
          <FilterSidebar
            class="sticky top-24 h-fit rounded-xl border border-border bg-card p-6 shadow-sm"
            {categories}
            bind:selectedCategory
            bind:selectedTag
            bind:priceRange
            bind:rating
            bind:discountRange
            onClear={clearFilters}
          />
        </div>

        <main class="flex flex-col gap-6">
          <!-- Products Header & Toolbar -->
          <div
            class="sticky top-20 z-30 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-lg overflow-hidden"
          >
            <!-- Desktop Toolbar Header (Hidden on Mobile) -->
            <div
              class="hidden lg:flex items-center justify-between border-b border-border p-4 px-6 bg-muted/5"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm text-primary-foreground"
                >
                  <Sparkles class="h-5 w-5" />
                </div>
                <div>
                  <h1 class="text-lg font-bold text-foreground leading-none">
                    Products
                  </h1>
                  <p
                    class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1"
                  >
                    {data.meta?.total || 0} ITEMS FOUND
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  onclick={handleCopy}
                  title="Copy Link"
                >
                  <Copy class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  onclick={clearFilters}
                  title="Reset Filters"
                >
                  <RotateCcw class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  onclick={handleDownload}
                  title="Export Products"
                >
                  <Download class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <!-- Toolbar Line 1 (Mobile Consistently): Count, Search, View Toggle -->
            <div
              class="flex lg:hidden items-center justify-between gap-3 p-3 pb-3 border-b border-white/5"
            >
              <div
                class="h-10 flex items-center px-4 rounded-xl bg-primary/10 border border-primary/20"
              >
                <span
                  class="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap"
                >
                  {data.meta?.total || 0} ITEMS
                </span>
              </div>

              <div class="flex items-center gap-2">
                <!-- Mobile Search Trigger -->
                <Button
                  variant="outline"
                  size="icon"
                  class="h-10 w-10 rounded-xl bg-muted/30 border-none hover:bg-primary/10 hover:text-primary transition-colors active:scale-95"
                  onclick={() => (searchDialogOpen = true)}
                >
                  <Search class="h-4 w-4" />
                </Button>

                <div
                  class="flex items-center p-1 rounded-xl bg-muted/50 border border-border"
                >
                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(v) => v && (viewMode = v as any)}
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
            </div>

            <!-- Toolbar Line 2: Desktop Search & Sort -->
            <div
              class="hidden lg:flex items-center justify-between gap-3 p-3 sm:p-4"
            >
              <!-- Desktop Search -->
              <div class="flex-1">
                {@render searchForm()}
              </div>

              <div class="flex items-center gap-3">
                <div
                  class="flex items-center p-1 rounded-xl bg-muted/50 border border-border"
                >
                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(v) => v && (viewMode = v as any)}
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

                <!-- Desktop Specific Sort -->
                <SelectComponent
                  name="sort"
                  placeholder="Sort By"
                  options={sortOptions}
                  bind:value={sortBy}
                  class="h-11 min-w-[200px] rounded-xl border-none bg-muted/50 font-bold text-xs uppercase tracking-widest px-4"
                />
              </div>
            </div>
          </div>

          <!-- Products List -->
          {#if allProducts.length > 0}
            <div
              class={cn(
                "grid gap-2",
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                  : viewMode === "box"
                    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {#each allProducts as product, i}
                {#if viewMode === "box"}
                  <ProductCardBox
                    {product}
                    dealLabel={product.isFeatured ? "Hot" : undefined}
                  />
                {:else}
                  <ProductCard
                    {product}
                    {viewMode}
                    dealLabel={product.isFeatured ? "Hot" : undefined}
                    showOfficialBadge={i % 4 === 0}
                  />
                {/if}
              {/each}
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
                  Discovering more items...
                </p>
              </div>
            {/if}

            <div class="pb-20"></div>
          {:else}
            <div
              class="rounded-2xl border border-dashed border-border py-32 text-center bg-card shadow-sm"
            >
              <div
                class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 text-muted-foreground"
              >
                <Search class="h-10 w-10" />
              </div>
              <h3 class="mt-6 text-2xl font-bold text-foreground">
                No results found
              </h3>
              <p class="mt-3 text-muted-foreground max-w-xs mx-auto">
                We couldn't find any products matching your current filters. Try
                resetting or adjusting them.
              </p>
              <Button
                class="mt-8 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
                onclick={clearFilters}
              >
                Reset All Filters
              </Button>
            </div>
          {/if}
        </main>
      </div>
    </div>
  </div>
{/if}

<!-- Mobile Filter Drawer -->
{#if Drawer}
<Drawer.Root bind:open={filterOpen}>
  <Drawer.Content>
    <div class="mx-auto w-full max-w-lg px-6 pb-12 pt-4">
      <Drawer.Header class="px-0">
        <Drawer.Title class="text-2xl font-bold">Filter Products</Drawer.Title>
        <Drawer.Description>Refine your search results.</Drawer.Description>
      </Drawer.Header>

      <div class="mt-6 h-[60vh] overflow-y-auto pr-2 pb-12">
        <FilterSidebar
          {categories}
          bind:selectedCategory
          bind:selectedTag
          bind:priceRange
          bind:rating
          bind:discountRange
          onClear={clearFilters}
        />
      </div>

      <Drawer.Footer
        class="mt-8 flex-row gap-3 px-0 border-t border-border pt-6"
      >
        <Button
          variant="ghost"
          class="flex-1 font-bold h-12 rounded-xl"
          onclick={clearFilters}>Reset</Button
        >
        <Button
          class="flex-1 font-bold h-12 rounded-xl shadow-lg shadow-primary/20"
          onclick={() => (filterOpen = false)}>Apply Results</Button
        >
      </Drawer.Footer>
    </div>
  </Drawer.Content>
</Drawer.Root>
{/if}

<!-- Mobile Search Dialog/Drawer -->
{#if Drawer}
<Drawer.Root bind:open={searchDialogOpen}>
  <Drawer.Content class="rounded-t-[2rem]">
    <div class="mx-auto w-full max-w-lg px-6 pb-12 pt-8">
      <Drawer.Header class="px-0 pt-0 text-left">
        <div class="flex items-center gap-3 mb-2">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <Search class="h-6 w-6" />
          </div>
          <Drawer.Title class="text-2xl font-bold tracking-tight"
            >Search Products</Drawer.Title
          >
        </div>
        <Drawer.Description class="text-sm font-medium text-muted-foreground">
          Enter keywords to find exactly what you're looking for.
        </Drawer.Description>
      </Drawer.Header>

      <div class="mt-8">
        {@render searchForm(true)}
      </div>
    </div>
  </Drawer.Content>
</Drawer.Root>
{/if}

<!-- Mobile Sort Drawer -->
{#if Drawer}
<Drawer.Root bind:open={sortDrawerOpen}>
  <Drawer.Content class="rounded-t-[2rem]">
    <div class="mx-auto w-full max-w-lg px-6 pb-12 pt-8">
      <Drawer.Header class="px-0 pt-0 text-left">
        <div class="flex items-center gap-3 mb-2">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <ArrowUpDown class="h-6 w-6" />
          </div>
          <Drawer.Title class="text-2xl font-bold tracking-tight"
            >Sort Products</Drawer.Title
          >
        </div>
        <Drawer.Description class="text-sm font-medium text-muted-foreground">
          Select how you'd like to arrange the product list.
        </Drawer.Description>
      </Drawer.Header>

      <div class="mt-8">
        <RadioGroup.Root bind:value={tempSortBy} class="grid gap-4">
          {#each sortOptions as option}
            <Label
              class={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer active:scale-[0.98]",
                tempSortBy === option.value
                   ? "border-primary bg-primary/5 text-primary"
                  : "border-muted/50 bg-muted/20 text-muted-foreground hover:border-muted hover:bg-muted/30",
              )}
            >
              <div class="flex flex-col gap-0.5">
                <span class="text-sm font-bold tracking-tight"
                  >{option.label}</span
                >
              </div>
              <RadioGroup.Item value={option.value} class="sr-only" />
              {#if tempSortBy === option.value}
                <div
                  class="h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                >
                  <div class="h-1.5 w-1.5 rounded-full bg-white"></div>
                </div>
              {:else}
                <div
                  class="h-4 w-4 rounded-full border-2 border-muted-foreground/30"
                ></div>
              {/if}
            </Label>
          {/each}
        </RadioGroup.Root>

        <Button
          class="w-full h-12 mt-8 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
          onclick={() => {
            sortBy = tempSortBy;
            sortDrawerOpen = false;
            updateFilters();
          }}
        >
          Apply Sorting
        </Button>
      </div>
    </div>
  </Drawer.Content>
</Drawer.Root>
{/if}
