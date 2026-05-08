<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
  } from "$lib/components/ui/card";
  import {
    Users,
    User,
    ArrowLeft,
    Linkedin,
    ExternalLink,
    ShieldCheck,
    Gavel,
    Globe,
    Search,
    Loader2,
    Check,
    ChevronsUpDown,
    X,
    Calendar,
  } from "@lucide/svelte";
  import * as Popover from "$lib/components/ui/popover";
  import * as Command from "$lib/components/ui/command";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { cn } from "$lib/utils";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import { onMount, untrack } from "svelte";
  import { Input } from "$lib/components/ui/input";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";

  let { data = $bindable() } = $props();

  let searchTerm = $state(data.search || "");
  let yearFilter = $state(data.year || "");
  let observerNode = $state<HTMLElement | null>(null);

  let innerWidth = $state(0);
  let isMobile = $derived(innerWidth < 768);
  let isModalOpen = $state(false);
  let selectedMember = $state<any>(null);

  const juryQuery = infiniteScroll.listQuery<any>(
    () => ({ search: searchTerm, year: yearFilter }),
    "",
    "awards/jury",
  );

  onMount(() => {
    if (!observerNode) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && $juryQuery.hasNextPage) {
          $juryQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(observerNode);
    return () => observer.disconnect();
  });

  const years = $derived(
    data.availableYears?.length > 0
      ? data.availableYears
      : [new Date().getFullYear().toString()],
  );

  const yearOptions = $derived(
    years.map((y: string) => ({ label: `Jury of ${y}`, value: y })),
  );

  function openDetail(member: any) {
    selectedMember = member;
    isModalOpen = true;
  }
</script>

<svelte:window bind:innerWidth />

<div class="min-h-screen bg-background pb-32">
  <!-- Header Section -->
  <section class="relative py-24 bg-slate-900 text-white overflow-hidden">
    <div
      class="absolute inset-0 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:32px_32px] opacity-30"
    ></div>
    <div
      class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"
    ></div>

    <div class="container mx-auto px-4 relative z-10 space-y-8">
      <a
        href="/awards"
        class="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors group"
      >
        <ArrowLeft
          class="size-4 group-hover:-translate-x-1 transition-transform"
        />
        Back to Awards Overview
      </a>

      <div class="max-w-3xl space-y-6">
        <Badge
          variant="outline"
          class="px-4 py-1.5 rounded-full border-white/20 text-white font-bold uppercase tracking-widest backdrop-blur-sm"
        >
          Integrity & Governance
        </Badge>
        <h1 class="text-4xl lg:text-6xl font-bold tracking-tight">
          The Distinguished <span
            class="bg-gradient-to-r from-accent-gold to-white bg-clip-text text-transparent"
            >Jury</span
          >
        </h1>
        <p
          class="text-xl text-white/80 font-medium font-display leading-relaxed"
        >
          Led by industry veterans and academic leaders, our jury ensures the
          highest standards of transparency and excellence in evaluating
          continental transformation.
        </p>

        <!-- Search and Filter -->
        <div class="flex flex-col sm:flex-row gap-4 pt-8">
          <div class="relative flex-1">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40"
            />
            <Input
              bind:value={searchTerm}
              placeholder="Search jury members..."
              class="bg-white/5 border-white/10 text-white pl-10 rounded-xl focus:ring-accent-gold/20"
            />
          </div>
          <div class="flex items-center gap-2">
            <SelectComponent
              name="year"
              placeholder="Filter by year"
              options={yearOptions}
              bind:value={yearFilter}
              class="bg-white/5 border-white/10 text-white rounded-xl focus:ring-accent-gold/20 w-[180px]"
            />
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Jury Grid -->
  <section class="py-24 container mx-auto px-4">
    {#if $juryQuery.data}
      <div
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        {#each $juryQuery.data.results as member}
          <button
            onclick={() => openDetail(member)}
            class="group relative overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex flex-col aspect-square w-full"
          >
            <!-- Image Section -->
            <div class="relative overflow-hidden bg-muted w-full h-full">
              {#if member.image}
                <img
                  src={member.image.url}
                  alt={member.name}
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
            <div
              class="absolute bottom-0 left-0 w-full p-3 pointer-events-none"
            >
              {#if member.role}
                <span
                  class="text-[8px] md:text-[10px] font-bold text-white/90 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 uppercase tracking-widest"
                >
                  {member.role}
                </span>
              {/if}
              <h3
                class="font-bold leading-tight line-clamp-1 text-lg text-white mt-1"
              >
                {member.name}
              </h3>
              <p
                class="text-xs text-white/70 line-clamp-1 md:line-clamp-2 mt-1"
              >
                {member.occupation}
              </p>
            </div>
          </button>
        {/each}
      </div>

      <!-- Loading Sentinel & Load More -->
      <div class="w-full flex flex-col items-center gap-6 py-12">
        {#if $juryQuery.isFetchingNextPage}
          <div class="flex flex-col items-center gap-4">
            <Loader2 class="size-8 animate-spin text-primary" />
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse"
            >
              Loading more jury members...
            </p>
          </div>
        {:else if $juryQuery.hasNextPage}
          <Button
            variant="outline"
            onclick={() => $juryQuery.fetchNextPage()}
            class="rounded-full px-8 border-primary/20 hover:bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]"
          >
            Load More Jury Members
          </Button>
        {:else if $juryQuery.data.results.length > 0}
          <div class="text-center space-y-2 opacity-40">
            <div class="h-px w-24 bg-border mx-auto"></div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground"
            >
              End of Jury List
            </p>
          </div>
        {/if}
        <div bind:this={observerNode} class="h-4 w-full"></div>
      </div>

      {#if $juryQuery.data.results.length === 0}
        <div
          class="text-center py-24 bg-muted/30 rounded-2xl border border-dashed"
        >
          <Users class="size-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 class="text-xl font-bold text-foreground">
            No jury members found
          </h3>
          <p class="text-muted-foreground mt-2">
            Try adjusting your search or filter
          </p>
        </div>
      {/if}
    {:else if $juryQuery.isLoading}
      <div
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        {#each Array(10) as _}
          <div class="aspect-square rounded-xl bg-muted animate-pulse"></div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Governance Statement -->
  <section class="container mx-auto px-4">
    <div class="rounded-xl bg-muted/50 border border-border p-12 lg:p-16">
      <div class="flex flex-col lg:flex-row gap-16">
        <div class="lg:w-1/2 space-y-8">
          <div
            class="size-16 rounded-xl bg-primary flex items-center justify-center shadow-lg"
          >
            <ShieldCheck class="size-8 text-primary-foreground" />
          </div>
          <h2 class="text-3xl font-bold text-foreground tracking-tight">
            An Independent, Multidisciplinary Framework.
          </h2>
          <p class="text-lg text-muted-foreground leading-relaxed">
            Our jury selection process is designed to eliminate bias. Members
            are invitation-only based on their proven track record in
            institutional leadership, digital strategy, and policy development.
          </p>
        </div>
        <div class="lg:w-1/2 grid sm:grid-cols-2 gap-8">
          <div class="space-y-4">
            <Gavel class="size-6 text-primary" />
            <h4
              class="font-bold text-foreground uppercase text-xs tracking-widest"
            >
              Rigorous Evaluation
            </h4>
            <p class="text-sm text-muted-foreground">
              Multiple rounds of blind reviews ensure only the most impactful
              projects emerge.
            </p>
          </div>
          <div class="space-y-4">
            <Globe class="size-6 text-primary" />
            <h4
              class="font-bold text-foreground uppercase text-xs tracking-widest"
            >
              Continental Diversity
            </h4>
            <p class="text-sm text-muted-foreground">
              Expertise represented from across major African economic zones.
            </p>
          </div>
          <div class="space-y-4">
            <ShieldCheck class="size-6 text-primary" />
            <h4
              class="font-bold text-foreground uppercase text-xs tracking-widest"
            >
              Vetting Standards
            </h4>
            <p class="text-sm text-muted-foreground">
              All entries undergo financial and ethical background verification.
            </p>
          </div>
          <div class="space-y-4">
            <Users class="size-6 text-primary" />
            <h4
              class="font-bold text-foreground uppercase text-xs tracking-widest"
            >
              Consensus Driven
            </h4>
            <p class="text-sm text-muted-foreground">
              Final winners are decided by unanimous jury consensus sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

{#snippet juryDetailContent()}
  <div class="flex flex-col gap-6 p-4">
    <div
      class="relative aspect-square w-full max-h-[40vh] md:max-h-[50vh] rounded-2xl overflow-hidden border mx-auto"
    >
      {#if selectedMember?.image}
        <img
          src={selectedMember.image.url}
          alt={selectedMember.name}
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
        {#if selectedMember?.role}
          <Badge
            variant="outline"
            class="uppercase tracking-widest text-[10px] font-bold"
          >
            {selectedMember.role}
          </Badge>
        {/if}
        <h2 class="text-3xl font-bold tracking-tight text-foreground">
          {selectedMember?.name}
        </h2>
        <div
          class="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider"
        >
          <Calendar class="size-4" />
          Jury of {selectedMember?.year}
        </div>
      </div>

      <div class="p-6 rounded-2xl bg-muted/50 border border-border/50">
        <h4
          class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3"
        >
          Occupation & Institutional Affiliation
        </h4>
        <p class="text-lg font-medium leading-relaxed text-foreground italic">
          "{selectedMember?.occupation}"
        </p>
      </div>

      <div class="pt-4 border-t border-border mt-4">
        <p class="text-sm text-muted-foreground leading-relaxed">
          As a member of the {selectedMember?.year} jury, {selectedMember?.name} brings
          significant expertise to the evaluation committee, ensuring that the continental
          transformation awards maintain the highest levels of integrity and excellence.
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
        {@render juryDetailContent()}
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
        {@render juryDetailContent()}
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}
