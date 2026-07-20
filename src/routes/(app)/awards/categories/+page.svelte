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
    Coins,
    Building2,
    ShoppingBag,
    Zap,
    HeartHandshake,
    ShieldCheck,
    Laptop,
    Smartphone,
    GraduationCap,
    Tv,
    HeartPulse,
    Leaf,
    ArrowLeft,
    Search,
    Award,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import { AwardCategories } from "$lib/constants";

  const categories = AwardCategories;
</script>

<div class="min-h-screen bg-background pb-24">
  <!-- Header Section -->
  <section
    class="relative py-24 bg-primary text-primary-foreground overflow-hidden"
  >
    <!-- Abstract pattern -->
    <div
      class="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] bg-size-[24px_24px] opacity-20"
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

      <div class="max-w-3xl space-y-6">
        <Badge
          variant="outline"
          class="px-4 py-1.5 rounded-full border-primary-foreground/30 text-primary-foreground font-bold uppercase tracking-widest backdrop-blur-sm"
        >
          Recognition Framework
        </Badge>
        <h1 class="text-4xl lg:text-6xl font-bold tracking-tight">
          Sector-Based Categories
        </h1>
        <p class="text-xl text-primary-foreground/80 font-medium">
          Our awards span 10 vital economic sectors, recognizing the diverse
          impact of IT leadership across the African transformation landscape.
        </p>
      </div>
    </div>
  </section>

  <!-- Categories Grid -->
  <section class="py-24">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {#each categories as category}
          <div class="group block transition-all duration-300">
            <Card
              class="relative h-full rounded-xl border-border/50 shadow-sm hover:shadow-lg transition-all duration-500 bg-card overflow-hidden"
            >
              <CardHeader class="pb-4">
                <div
                  class="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
                >
                  <Award class="size-7" />
                </div>
                <CardTitle
                  class="text-xl font-bold text-foreground transition-colors"
                >
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Special Categories / Summary -->
  <section class="container mx-auto px-4">
    <div
      class="rounded-xl border border-accent bg-accent/5 p-12 lg:p-16 flex flex-col lg:flex-row gap-12 items-center"
    >
      <div class="lg:w-2/3 space-y-6">
        <h2 class="text-3xl font-bold text-foreground">Beyond the sectors.</h2>
        <p
          class="text-lg text-muted-foreground font-medium italic leading-relaxed"
        >
          "Our recognition program goes beyond industry vertically. We also
          celebrate excellence in continental tech championships, lifetime
          achievements, and visionary leadership that transcends sectoral
          boundaries."
        </p>
        <div class="flex gap-4">
          <Badge
            class="bg-primary/10 text-primary border-0 font-bold px-4 py-1.5 rounded-full"
            >Visionary Leader</Badge
          >
          <Badge
            class="bg-primary/10 text-primary border-0 font-bold px-4 py-1.5 rounded-full"
            >Icon of Innovation</Badge
          >
          <Badge
            class="bg-primary/10 text-primary border-0 font-bold px-4 py-1.5 rounded-full"
            >Tech Champion</Badge
          >
        </div>
      </div>
      <!-- <div class="lg:w-1/3 w-full">
        <Button
          class="w-full py-8 rounded-xl shadow-lg transition-all"
        >
          Download Full Category Guide
        </Button>
      </div> -->
    </div>
  </section>
</div>
