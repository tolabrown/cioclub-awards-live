<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Trophy, ArrowLeft, User, Loader2 } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import { onMount } from "svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { goto } from "$app/navigation";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";

  let { data } = $props();
  let year = $derived(data.year);
  const availableYears = $derived(data.availableYears || []);

  // Filters state
  let selectedCategory = $state("");

  // Year selector options
  const yearOptions = $derived(
    availableYears.map((y) => ({ label: y, value: y })),
  );

  // Category selector options
  const categoryOptions = [
    { label: "All Categories", value: "" },
    { label: "Special Award", value: "special" },
    { label: "Corporate Award", value: "corporate" },
    { label: "Industry Award", value: "industry" },
  ];

  // Infinite Scroll Setup
  let observerNode = $state<HTMLElement | null>(null);

  const winnersQuery = infiniteScroll.listQuery<any>(
    () => ({
      year: data.year,
      category: selectedCategory,
    }),
    "",
    "awards/winners",
  );

  const results = $derived($winnersQuery.data?.results || data.winners || []);
  const hasMore = $derived($winnersQuery.hasNextPage);

  onMount(() => {
    if (!observerNode) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          $winnersQuery.hasNextPage &&
          !$winnersQuery.isFetchingNextPage
        ) {
          $winnersQuery.fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );
    observer.observe(observerNode);
    return () => observer.disconnect();
  });

  let innerWidth = $state(0);
  let isMobile = $derived(innerWidth < 768);
  let isModalOpen = $state(false);
  let selectedWinner = $state<any>(null);

  function openDetail(winner: any) {
    selectedWinner = winner;
    isModalOpen = true;
  }

  function handleYearChange(val: string) {
    if (val && val !== year) {
      window.location.href = `/awards/winners/${val}`;
    }
  }

  function handleCategoryChange(val: string) {
    selectedCategory = val;
  }
</script>

<svelte:window bind:innerWidth />

<div class="min-h-screen bg-background pb-32">
  <!-- Dynamic Hero Header -->
  <section
    class="relative py-24 bg-gradient-to-br from-primary/95 to-primary text-primary-foreground overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px] opacity-30"
    ></div>

    <div class="container mx-auto px-4 relative z-10 space-y-8">
      <a
        href="/awards"
        class="inline-flex items-center gap-2 text-sm font-bold text-primary-foreground/70 hover:text-primary-foreground transition-colors group"
      >
        <ArrowLeft
          class="size-4 group-hover:-translate-x-1 transition-transform"
        />
        Back to Awards Overview
      </a>

      <div
        class="flex flex-col md:flex-row md:items-end justify-between gap-12"
      >
        <div class="max-w-2xl space-y-6">
          <Badge
            variant="outline"
            class="px-4 py-1.5 rounded-full border-primary-foreground/30 text-primary-foreground font-bold uppercase tracking-widest backdrop-blur-sm"
          >
            Hall of Fame
          </Badge>
          <h1 class="text-4xl lg:text-7xl font-bold tracking-tight">
            Winners Archive <span class="text-accent-gold">{year}</span>
          </h1>
          <p
            class="text-xl text-primary-foreground/80 font-medium font-display leading-relaxed"
          >
            Celebrating the continental standard of digital leadership. These
            visionaries represent the pinnacle of IT excellence for the {year} season.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Winners Grid -->
  <section class="py-4 mx-auto px-4 flex flex-col gap-4 container">
    <!-- Year & Category Selectors -->
    <div class="flex flex-col md:flex-row gap-6 md:items-end">
      <!-- Year Selector -->
      <div class="flex flex-col gap-3 min-w-[200px]">
        <span
          class="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-gold ml-1"
          >Select Archive Season</span
        >
        <SelectComponent
          options={yearOptions}
          value={year}
          placeholder="Choose Year"
          name="year-selector"
          onValueChange={handleYearChange}
        />
      </div>

      <!-- Category Selector -->
      <div class="flex flex-col gap-3 min-w-[200px]">
        <span
          class="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-gold ml-1"
          >Filter by Category</span
        >
        <SelectComponent
          options={categoryOptions}
          value={selectedCategory}
          placeholder="All Categories"
          name="category-selector"
          onValueChange={handleCategoryChange}
        />
      </div>
    </div>
    <div
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      {#each results as winner}
        <button
          onclick={() => openDetail(winner)}
          class="group relative overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex flex-col aspect-square w-full"
        >
          <!-- Image Section -->
          <div class="relative overflow-hidden bg-muted w-full h-full">
            {#if winner.image}
              <img
                src={winner.image.url}
                alt={winner.name}
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            {:else}
              <div
                class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5"
              >
                <User class="h-10 w-10 text-primary/40" />
              </div>
            {/if}

            <!-- Gradient Overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
            ></div>
          </div>

          <!-- Content Overlay -->
          <div class="absolute bottom-0 left-0 w-full p-3 pointer-events-none">
            <h3 class="font-bold leading-tight line-clamp-1 text-lg text-white">
              {winner.name}
            </h3>
            {#if winner.awardType?.toLowerCase().includes('special') || winner.awardType?.toLowerCase().includes('corporate')}
              <p class="text-[11px] font-medium text-white/70 line-clamp-1 mt-0.5">
                {winner.awardDescription || winner.organization}
              </p>
            {:else}
              <div class="flex items-center gap-2 mt-1">
                <span
                  class="text-xs font-medium text-white/90 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 line-clamp-1"
                >
                  {winner.awardType}
                </span>
              </div>
            {/if}
          </div>
        </button>
      {/each}
    </div>

    <!-- Loading Sentinel & Load More -->
    <div class="w-full flex flex-col items-center gap-6 py-12">
      {#if $winnersQuery.isFetchingNextPage}
        <div class="flex flex-col items-center gap-4">
          <Loader2 class="size-8 animate-spin text-primary" />
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse"
          >
            Loading more winners...
          </p>
        </div>
      {:else if hasMore}
        <Button
          variant="outline"
          onclick={() => $winnersQuery.fetchNextPage()}
          class="rounded-full px-8 border-primary/20 hover:bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]"
        >
          Load More Winners
        </Button>
      {:else if results.length > 0}
        <div class="text-center space-y-2 opacity-40">
          <div class="h-px w-24 bg-border mx-auto"></div>
          <p
            class="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground"
          >
            End of {year} Archive
          </p>
        </div>
      {/if}
      <div bind:this={observerNode} class="h-4 w-full"></div>
    </div>
  </section>

  {#if results.length === 0 && !$winnersQuery.isLoading}
    <div
      class="text-center py-24 bg-muted/30 rounded-2xl border border-dashed container mx-auto"
    >
      <Trophy class="size-12 text-muted-foreground/20 mx-auto mb-4" />
      <h3 class="text-xl font-bold text-foreground">No winners found</h3>
      <p class="text-muted-foreground mt-2">
        Archive for this year is currently empty
      </p>
    </div>
  {/if}

  {#snippet winnerDetailContent()}
    <div class="flex flex-col gap-6 p-4">
      <div
        class="relative aspect-square w-full max-h-[40vh] md:max-h-[50vh] rounded-2xl overflow-hidden border mx-auto"
      >
        {#if selectedWinner?.image}
          <img
            src={selectedWinner.image.url}
            alt={selectedWinner.name}
            class="h-full w-full object-cover"
          />
        {:else}
          <div
            class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5"
          >
            <User class="h-20 w-20 text-primary/40" />
          </div>
        {/if}
      </div>

      <div class="space-y-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <Badge
              variant="outline"
              class="uppercase tracking-widest text-[10px] font-bold"
            >
              {selectedWinner?.awardType}
            </Badge>
          </div>
          <h2 class="text-3xl font-bold tracking-tight text-foreground">
            {selectedWinner?.name}
          </h2>
        </div>

        {#if selectedWinner?.awardType?.toLowerCase().includes('special') || selectedWinner?.awardType?.toLowerCase().includes('corporate')}
          {#if selectedWinner?.awardDescription || selectedWinner?.organization}
            <div class="p-6 rounded-2xl bg-muted/50 border border-border/50">
              <h4
                class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3"
              >
                Award Description
              </h4>
              <p
                class="text-lg font-medium leading-relaxed text-foreground italic"
              >
                "{selectedWinner?.awardDescription || selectedWinner?.organization}"
              </p>
            </div>
          {/if}
        {:else if selectedWinner?.organization}
          <div class="p-6 rounded-2xl bg-muted/50 border border-border/50">
            <h4
              class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3"
            >
              Organization & Institutional Affiliation
            </h4>
            <p
              class="text-lg font-medium leading-relaxed text-foreground italic"
            >
              "{selectedWinner?.organization}"
            </p>
          </div>
        {/if}

        <div class="pt-4 border-t border-border mt-4">
          <p class="text-sm text-muted-foreground leading-relaxed">
            The {year} award for
            <span class="text-foreground font-bold"
              >{selectedWinner?.awardType}</span
            >
            recognizes {selectedWinner?.name}'s outstanding contributions and
            leadership in the African technology landscape. This award
            celebrates the excellence and innovation demonstrated in driving
            digital transformation across the continent.
          </p>
        </div>
      </div>
    </div>
  {/snippet}

  {#if !isMobile}
    <Dialog.Root bind:open={isModalOpen}>
      <Dialog.Content
        class="sm:max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-card max-h-[90vh] flex flex-col"
      >
        <div class="p-4 md:p-8 overflow-y-auto">
          {@render winnerDetailContent()}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  {:else}
    <Drawer.Root bind:open={isModalOpen}>
      <Drawer.Content class="max-h-[85vh] p-0 rounded-t-[32px] bg-card">
        <div class="overflow-y-auto p-4 pb-12">
          <div
            class="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 opacity-40"
          ></div>
          {@render winnerDetailContent()}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  {/if}
</div>
