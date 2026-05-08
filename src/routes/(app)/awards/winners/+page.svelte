<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Trophy,
    Calendar,
    ArrowRight,
    Crown,
    Star,
    Users,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  let { data } = $props();

  // Deduplicate and sort years
  const dbYears = $derived(data.availableYears || []);

  const allYears = $derived.by(() => {
    // Convert dbYears to numbers for easier comparison
    const existingYears = dbYears.map((y) => parseInt(y));

    // Create the list from DB
    return existingYears
      .map((year) => ({
        year,
        status: "completed",
        description: `Celebrating excellence and innovation in ${year}`,
        winners: "Various",
        highlights: [
          "Visionary Leadership",
          "Digital Transformation",
          "IT Excellence",
        ],
      }))
      .sort((a, b) => b.year - a.year);
  });
</script>

<svelte:head>
  <title>Winners | CIO Awards Africa</title>
  <meta
    name="description"
    content="Explore the hall of fame of CIO Awards Africa winners. Discover the exceptional IT leaders recognized for their contributions across the African continent."
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Hero Section -->
  <section class="relative py-24 overflow-hidden">
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10"
    ></div>
    <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-4xl mx-auto text-center space-y-6">
        <Badge
          variant="secondary"
          class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
        >
          <Trophy class="size-3 mr-2" />
          Hall of Fame
        </Badge>
        <h1
          class="text-3xl md:text-5xl font-bold tracking-tight text-foreground"
        >
          Our <span class="text-primary">Award Winners</span>
        </h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Celebrating the exceptional IT leaders who have been recognized for
          their outstanding contributions to digital transformation across
          Africa.
        </p>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-16 bg-muted/30">
    <div class="container mx-auto px-4">
      <div class="grid sm:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
        <div class="space-y-2">
          <p class="text-4xl font-bold text-primary">137+</p>
          <p class="text-sm text-muted-foreground font-medium">Total Winners</p>
        </div>
        <div class="space-y-2">
          <p class="text-4xl font-bold text-primary">5</p>
          <p class="text-sm text-muted-foreground font-medium">Years Running</p>
        </div>
        <div class="space-y-2">
          <p class="text-4xl font-bold text-primary">11</p>
          <p class="text-sm text-muted-foreground font-medium">Countries</p>
        </div>
        <div class="space-y-2">
          <p class="text-4xl font-bold text-primary">2,800+</p>
          <p class="text-sm text-muted-foreground font-medium">Total Entries</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Years Grid -->
  <section class="py-16">
    <div class="container mx-auto px-4">
      <div class="text-center space-y-4 mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-foreground">
          Browse by Year
        </h2>
        <p class="text-muted-foreground">
          Select a year to view all winners and categories
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {#each allYears as item}
          <Card
            class={cn(
              "relative overflow-hidden transition-all hover:shadow-lg group",
              item.status === "upcoming" && "border-primary/30",
            )}
          >
            {#if item.status === "upcoming"}
              <div class="absolute top-4 right-4">
                <Badge variant="secondary" class="text-xs">Coming Soon</Badge>
              </div>
            {/if}
            <CardContent class="p-8 space-y-6">
              <div class="flex items-center gap-4">
                <div
                  class="size-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                  {#if item.status === "upcoming"}
                    <Crown class="size-8" />
                  {:else}
                    <Trophy class="size-8" />
                  {/if}
                </div>
                <div>
                  <p class="text-3xl font-bold text-foreground">{item.year}</p>
                  {#if item.winners && item.status === "completed"}
                    <p class="text-sm text-muted-foreground">
                      {item.winners} Winners
                    </p>
                  {/if}
                </div>
              </div>

              <p class="text-muted-foreground">{item.description}</p>

              <div class="flex flex-wrap gap-2">
                {#each item.highlights as highlight}
                  <Badge variant="outline" class="text-xs">{highlight}</Badge>
                {/each}
              </div>

              {#if item.status === "completed"}
                <Button href="/awards/winners/{item.year}" class="w-full group">
                  View Winners
                  <ArrowRight
                    class="ml-2 size-4 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              {:else}
                <Button disabled class="w-full" variant="outline">
                  <Calendar class="mr-2 size-4" />
                  November {item.year}
                </Button>
              {/if}
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-16 bg-primary">
    <div class="container mx-auto px-4 text-center">
      <div class="max-w-3xl mx-auto space-y-6">
        <h2 class="text-2xl md:text-4xl font-bold text-primary-foreground">
          Want to Join the Hall of Fame?
        </h2>
        <p class="text-primary-foreground/80">
          Submit your entry for the upcoming CIO Awards Africa and showcase your IT
          leadership excellence.
        </p>
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button variant="secondary" href="/awards/entry">
            Submit Entry <ArrowRight class="ml-2 size-4" />
          </Button>
          <Button
            variant="outline"
            href="/awards/nominate"
            class="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            Nominate a Leader
          </Button>
        </div>
      </div>
    </div>
  </section>
</div>
