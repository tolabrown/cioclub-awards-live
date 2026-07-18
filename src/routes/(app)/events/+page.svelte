<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import * as Select from "$lib/components/ui/select";
  import EventDetails from "./EventDetails.svelte";
  import {
    MapPin,
    ArrowRight,
    ChevronRight,
    Sparkles,
    MousePointer2,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";

  let { data } = $props();
  const content = $derived(data.content || {});
  const events = $derived(data.events || []);

  let selectedYear = $state("all");
  let mounted = $state(false);
  let selectedEvent = $state<any>(null);
  let isDialogOpen = $state(false);
  let isDrawerOpen = $state(false);

  onMount(() => {
    mounted = true;
  });

  const filteredEvents = $derived(
    (() => {
      const now = new Date();
      const baseFiltered = events.filter((e: any) => {
        if (selectedYear === "all") return true;
        return new Date(e.date).getFullYear().toString() === selectedYear;
      });

      const upcoming = baseFiltered
        .filter((e: any) => new Date(e.date) >= now)
        .sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

      const past = baseFiltered
        .filter((e: any) => new Date(e.date) < now)
        .sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

      return [...upcoming, ...past];
    })(),
  );

  const availableYears = $derived(
    Array.from(
      new Set(events.map((e: any) => new Date(e.date).getFullYear())),
    ).sort((a, b) => b - a),
  );

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function handleOpenDetails(event: any) {
    selectedEvent = event;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      isDrawerOpen = true;
    } else {
      isDialogOpen = true;
    }
  }
</script>

<div class="min-h-screen bg-background selection:bg-primary/20">
  <!-- Dynamic Hero Section -->
  <section
    class="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[#050A18]"
  >
    <!-- Animated background elements -->
    <div class="absolute inset-0 z-0">
      <div
        class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"
      ></div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"
      ></div>
      <div
        class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 contrast-150"
      ></div>
    </div>

    <div class="container relative z-10 px-4 text-center">
      {#if mounted}
        <div in:fly={{ y: 20, duration: 1000 }} class="space-y-8">
          <Badge
            variant="outline"
            class="bg-white/5 border-white/10 text-blue-400 px-6 py-2 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md rounded-full"
          >
            <Sparkles class="size-3 mr-2 animate-spin-slow" />
            {content?.hero?.badge || "Events"}
          </Badge>

          <h1
            class="text-4xl md:text-7xl font-bold text-white leading-[1.1] tracking-tighter uppercase"
          >
            {#each (content?.hero?.title || "").split(" ") as word, i}
              {#if i === (content?.hero?.title || "").split(" ").length - 1}
                <span
                  class="text-transparent bg-clip-text bg-gradient-to-r from-primary/80 via-primary to-primary/60"
                >
                  {word}
                </span>
              {:else}
                {word}{" "}
              {/if}
            {/each}
          </h1>

          <p
            class="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            {content?.hero?.description || ""}
          </p>

          <div class="flex flex-wrap justify-center gap-4 pt-8">
            <Button href="#events-section" class="rounded-xl shadow-lg group">
              View Calendar
              <ArrowRight
                class="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Button>
            <Button
              href="/about"
              variant="outline"
              class="rounded-xl border-white/20 dark:border-white/10 text-white hover:bg-white/5 backdrop-blur-md bg-transparent"
            >
              Our Vision
            </Button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Scroll Indicator -->
    <div
      class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
    >
      <span class="text-[10px] font-bold uppercase tracking-widest text-white"
        >Scroll</span
      >
      <div class="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
    </div>
  </section>

  <!-- Events Filter and Grid -->
  <section id="events-section" class="py-24 relative overflow-hidden">
    <div class="container px-4">
      <div
        class="flex flex-col md:flex-row items-end justify-between gap-8 mb-16"
      >
        <div class="space-y-4">
          <h2 class="text-4xl md:text-5xl font-bold uppercase tracking-tight">
            Initiatives
          </h2>
          <p class="text-muted-foreground font-medium max-w-lg">
            Explore our continental roadmaps, strategic summits, and leadership
            induction programs.
          </p>
        </div>

        <!-- Premium Year Filter -->
        <Select.Root
          type="single"
          value={selectedYear}
          onValueChange={(v) => {
            if (v) selectedYear = v;
          }}
        >
          <Select.Trigger
            class="w-[180px] h-11 rounded-xl bg-muted border-border font-bold uppercase tracking-[0.1em] text-[10px] px-4 shadow-sm hover:border-primary/50 transition-all flex items-center justify-between"
          >
            <Select.Value placeholder="Select Period" />
          </Select.Trigger>
          <Select.Content
            class="rounded-xl border-border bg-background shadow-2xl p-1 min-w-[180px]"
          >
            <Select.Item
              value="all"
              class="rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors focus:bg-primary/10"
            >
              All Periods
            </Select.Item>
            {#each availableYears as year}
              <Select.Item
                value={year.toString()}
                class="rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors focus:bg-primary/10"
              >
                {year}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <!-- Events Timeline -->
      <div class="relative max-w-4xl mx-auto py-10">
        <!-- Vertical Line -->
        <div
          class="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden sm:block"
        ></div>

        <div class="space-y-12">
          {#each filteredEvents as event, i (event.id)}
            <div class="relative group" in:fade={{ delay: i * 50 }}>
              <!-- Timeline Dot -->
              <div
                class="absolute left-4 md:left-1/2 top-6 size-4 rounded-full bg-primary border-4 border-background -translate-x-1/2 z-20 hidden sm:block"
              ></div>

              <div
                class={cn(
                  "flex flex-col sm:flex-row items-start sm:items-center gap-8",
                  i % 2 === 0
                    ? "md:flex-row"
                    : "md:flex-row-reverse text-right",
                )}
              >
                <!-- Date Label (Mobile: above, Desktop: opposite side) -->
                <div
                  class="flex-1 w-full sm:w-auto md:text-xl font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {formatDate(event.date)}
                </div>

                <!-- Event Card -->
                <div class="flex-[2] w-full">
                  <Card.Root
                    class="rounded-xl shadow-md border-border/50 overflow-hidden group-hover:border-primary/50 transition-colors"
                  >
                    <div
                      class="flex flex-col md:flex-row items-stretch min-h-[220px]"
                    >
                      {#if event.image?.directUrl || event.image?.url || event.coverImage?.directUrl || event.coverImage?.url}
                        <div
                          class="w-full md:w-72 overflow-hidden flex-shrink-0 relative bg-slate-950/50 flex items-center justify-center p-2"
                        >
                          <img
                            src={event.image?.directUrl || event.image?.url || event.coverImage?.directUrl || event.coverImage?.url}
                            alt={event.title}
                            class="max-w-full max-h-full w-auto h-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        </div>
                      {/if}
                      <Card.Header class="flex-1 p-6">
                        <div
                          class="flex items-center gap-2 mb-4 flex-wrap"
                          class:justify-end={i % 2 !== 0}
                        >
                          <Badge
                            variant={event.status === "upcoming"
                              ? "default"
                              : "secondary"}
                            class="rounded-lg px-4 py-1 text-[10px] uppercase font-bold tracking-widest shadow-sm border-none"
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <Card.Title
                          class="text-2xl font-bold uppercase tracking-tight mb-2"
                        >
                          {event.title}
                        </Card.Title>
                        <Card.Description
                          class="text-sm font-medium line-clamp-3 mb-4"
                        >
                          {event.description}
                        </Card.Description>
                        <div
                          class="flex flex-col gap-2 pt-2 border-t border-border/50"
                        >
                          {#if event.location}
                            <div
                              class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider"
                              class:justify-end={i % 2 !== 0}
                            >
                              <MapPin class="size-3 text-primary" />
                              {event.location}
                            </div>
                          {/if}
                          <div
                            class="pt-4 flex"
                            class:justify-end={i % 2 !== 0}
                          >
                            <Button
                              variant="outline"
                              onclick={() => handleOpenDetails(event)}
                              class="text-xs font-bold uppercase tracking-widest gap-2 group/btn rounded-xl"
                            >
                              More Details
                              <ChevronRight
                                class="size-3 transition-transform group-hover/btn:translate-x-0.5"
                              />
                            </Button>
                          </div>
                        </div>
                      </Card.Header>
                    </div>
                  </Card.Root>
                </div>
              </div>
            </div>
          {:else}
            <div class="text-center py-20 px-4">
              <div
                class="bg-muted/30 rounded-xl p-12 border border-dashed border-border inline-block max-w-md"
              >
                <p
                  class="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs"
                >
                  No events found for this period
                </p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- Details Dialog (Desktop) -->
  <Dialog.Root bind:open={isDialogOpen}>
    <Dialog.Content
      class="max-w-2xl bg-card border-border shadow-lg rounded-xl overflow-hidden p-0"
    >
      <Dialog.Header class="sr-only">
        <Dialog.Title>Event Details</Dialog.Title>
      </Dialog.Header>
      <div class="p-8">
        {#if selectedEvent}
          <EventDetails event={selectedEvent} />
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Details Drawer (Mobile) -->
  <Drawer.Root bind:open={isDrawerOpen}>
    <Drawer.Content class="bg-card border-border rounded-t-xl max-h-[90vh]">
      <Drawer.Header class="sr-only">
        <Drawer.Title>Event Details</Drawer.Title>
      </Drawer.Header>
      <div class="px-6 py-8 overflow-y-auto">
        <div class="mx-auto w-12 h-1.5 bg-muted rounded-full mb-8"></div>
        {#if selectedEvent}
          <EventDetails event={selectedEvent} />
        {/if}
      </div>
      <Drawer.Footer class="p-6 border-t border-border">
        <Drawer.Close>
          <Button
            variant="outline"
            class="w-full rounded-xl uppercase font-bold tracking-widest text-xs"
            >Close Details</Button
          >
        </Drawer.Close>
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root>
</div>

<style>
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .animate-spin-slow {
    animation: spin-slow 12s linear infinite;
  }
</style>
