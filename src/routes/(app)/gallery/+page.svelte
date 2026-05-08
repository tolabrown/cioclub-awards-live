<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$lib/components/ui/select";
  import { Image as ImageIcon, MapPin, Grid, Camera } from "@lucide/svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const albums = $derived(data.albums || []);

  const years = $derived(
    [...new Set(albums.map((a: any) => a.year || "2024"))].sort().reverse(),
  );

  let selectedYear = $state("");

  $effect(() => {
    if (years.length > 0 && !selectedYear) {
      selectedYear = String(years[0]);
    }
  });

  const filteredAlbums = $derived(
    albums.filter((a: any) => String(a.year || "2024") === selectedYear),
  );

  // Use CMS data for hero content with defaults as fallback
  const heroContent = $derived({
    badge: data.content?.hero?.badge || "Visual Archive",
    title: data.content?.hero?.title || "Moments of Impact",
    description:
      data.content?.hero?.description ||
      "Relive the energy, the connections, and the breakthroughs from our continental gatherings.",
  });

  const archivesSection = $derived({
    title: data.content?.archivesSection?.title || "Gallery Archives",
    description:
      data.content?.archivesSection?.description ||
      "Recent event albums and highlights",
  });

  const mediaAccess = $derived({
    title: data.content?.mediaAccess?.title || "Professional Media Access",
    description:
      data.content?.mediaAccess?.description ||
      "Members and press partners can request high-resolution assets from our official events for publication or internal use.",
    ctaPrimary: data.content?.mediaAccess?.ctaPrimary || "Request HD Photos",
    ctaSecondary: data.content?.mediaAccess?.ctaSecondary || "Press Guidelines",
  });
</script>

<svelte:head>
  {#if data.meta?.title}
    <title>{data.meta.title}</title>
    <meta name="title" content={data.meta.title} />
    <meta property="og:title" content={data.meta.title} />
    <meta property="twitter:title" content={data.meta.title} />
  {/if}
  {#if data.meta?.description}
    <meta name="description" content={data.meta.description} />
    <meta property="og:description" content={data.meta.description} />
    <meta property="twitter:description" content={data.meta.description} />
  {/if}
  {#if data.meta?.ogImage}
    <meta property="og:image" content={data.meta.ogImage} />
    <meta property="twitter:image" content={data.meta.ogImage} />
  {/if}
</svelte:head>

<div class="min-h-screen">
  <!-- Hero Section -->
  <section
    class="relative py-32 bg-primary text-primary-foreground overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(#135bec22_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
    ></div>
    <div
      class="container mx-auto px-4 relative z-10 text-center space-y-4 pt-20"
    >
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
      >
        <Camera class="size-4" />
        {heroContent.badge}
      </div>
      <h1
        class="text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight tracking-tight"
      >
        {heroContent.title}
      </h1>
      <p
        class="text-xl text-primary-foreground/80 max-w-2xl mx-auto font-medium"
      >
        {heroContent.description}
      </p>
    </div>
  </section>

  <!-- Filter & Archives Section -->
  <section class="py-20 bg-background relative -mt-16 z-20">
    <div class="container mx-auto px-4">
      <div
        class="flex flex-col lg:flex-row gap-4 justify-between items-center bg-card border border-border shadow-lg rounded-xl p-8 lg:px-12"
      >
        <div class="flex items-center gap-4">
          <div
            class="size-14 rounded-xl bg-muted flex items-center justify-center text-primary"
          >
            <Grid class="size-6" />
          </div>
          <div>
            <h3
              class="text-xl font-bold uppercase tracking-tight text-foreground"
            >
              {archivesSection.title}
            </h3>
            <p class="text-sm text-muted-foreground font-medium">
              {archivesSection.description}
            </p>
          </div>
        </div>

        {#if years.length > 0}
          <div class="w-full lg:w-72">
            <Select type="single" bind:value={selectedYear}>
              <SelectTrigger
                class="h-12 rounded-xl border border-border/50 bg-muted/50 font-bold text-base"
              >
                {selectedYear ? `${selectedYear} Archives` : "Select Year"}
              </SelectTrigger>
              <SelectContent class="rounded-xl">
                {#each years as year, i}
                  <SelectItem value={year as string} class="font-bold py-3"
                    >{year} Archives</SelectItem
                  >
                {/each}
              </SelectContent>
            </Select>
          </div>
        {/if}
      </div>
    </div>
  </section>

  <!-- Album Grid -->
  <section class="pb-32 bg-background">
    <div class="container mx-auto px-4">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filteredAlbums as album}
          <a
            href="/gallery/{album.id}"
            class="group relative bg-primary rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer block"
          >
            <div class="relative aspect-[4/5]">
              <img
                src={album.image}
                alt={album.title}
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              ></div>

              <div class="absolute top-6 right-6">
                <Badge
                  class="bg-primary text-primary-foreground border-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg"
                >
                  {album.mediaCount || 0} Photos
                </Badge>
              </div>

              <div class="absolute bottom-10 left-10 right-10 space-y-4">
                <div
                  class="flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest"
                >
                  <MapPin class="size-3" />
                  {album.location}
                </div>
                <h3
                  class="text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight"
                >
                  {album.title}
                </h3>
                <div
                  class="pt-4 flex items-center gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
                >
                  <div
                    class="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
                  >
                    <ImageIcon class="size-4" />
                  </div>
                  <span
                    class="text-white font-bold uppercase text-[10px] tracking-widest"
                    >Open Album</span
                  >
                </div>
              </div>
            </div>
          </a>
        {/each}
      </div>

      {#if filteredAlbums.length === 0}
        <div
          class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/30 gap-4"
        >
          <div
            class="size-20 rounded-full bg-primary/10 flex items-center justify-center shadow-inner"
          >
            <ImageIcon class="size-10 text-primary/40" />
          </div>
          <div class="text-center space-y-2">
            <h4 class="text-xl font-bold tracking-tight">No Albums Found</h4>
            <p class="text-muted-foreground font-medium max-w-sm">
              We haven't uploaded any albums for the year {selectedYear} yet. Check
              back soon!
            </p>
          </div>
        </div>
      {/if}

      <!-- <div class="mt-20 text-center">
        <Button size="lg" variant="outline" class="font-bold transition-all">
          View All Archives
        </Button>
      </div> -->
    </div>
  </section>

  <!-- Request Access CTA -->
  <!-- <section class="py-32 bg-slate-50 dark:bg-slate-900/50">
    <div class="container mx-auto px-4">
      <div
        class="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 bg-card border border-border rounded-xl p-12 lg:p-16 shadow-lg text-center md:text-left"
      >
        <div
          class="size-24 lg:size-32 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"
        >
          <ImageIcon class="size-10 lg:size-12" />
        </div>
        <div class="flex-1 space-y-4">
          <h2
            class="text-3xl font-bold uppercase tracking-tight text-foreground"
          >
            {mediaAccess.title}
          </h2>
          <p class="text-lg text-muted-foreground font-medium leading-relaxed">
            {mediaAccess.description}
          </p>
          <div class="flex flex-wrap gap-4 justify-center md:justify-start">
            <Button
              class="font-bold uppercase text-xs tracking-widest transition-all"
            >
              {mediaAccess.ctaPrimary}
            </Button>
            <Button
              variant="outline"
              class="font-bold uppercase text-xs tracking-widest transition-all"
            >
              {mediaAccess.ctaSecondary}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section> -->
</div>
