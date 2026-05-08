<script lang="ts">
  import MeshGradient from "$lib/components/widgets/MeshGradient.svelte";
  import { LIT_DEFAULT } from "$lib/constants/defaults";
  import {
    Heart,
    Users,
    Sparkles,
    ArrowRight,
    ShieldCheck,
    Globe,
    Calendar,
    Clock,
    MapPin,
    CreditCard,
    Image as ImageIcon,
    Camera,
    // Additional icons for mapping
    Zap,
    Target,
    Award,
    Star,
    Rocket,
    Brain,
  } from "@lucide/svelte";

  const iconMap: Record<string, any> = {
    Globe,
    Users,
    Sparkles,
    ShieldCheck,
    Heart,
    Zap,
    Target,
    Award,
    Star,
    Rocket,
    Brain,
  };
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
    import { cn } from "$lib/utils.js";

  let { data } = $props();
  const page = $derived({
    ...LIT_DEFAULT,
    ...data.page.data,
    hero: { ...LIT_DEFAULT.hero, ...data.page.data.hero },
    ctaSection: { ...LIT_DEFAULT.ctaSection, ...data.page.data.ctaSection },
    pillars: (data.page.data.pillars || LIT_DEFAULT.pillars).map(
      (p: any, i: number) => ({
        ...LIT_DEFAULT.pillars[i],
        ...p,
      }),
    ),
  });
  const events = $derived(data.events || []);
  const archives = $derived(data.archives || []);
  const partners = $derived(data.partners || []);

  let activeTab = $state("upcoming");

  const filteredEvents = $derived(
    events.filter((event) =>
      activeTab === "upcoming"
        ? event.status === "upcoming"
        : event.status === "past",
    ),
  );

  const sponsorLogos = $derived(
    partners.map((p) => p.logo?.url).filter(Boolean),
  );
</script>

<svelte:head>
  <title>{data.page.title}</title>
  <meta name="description" content={data.page.description} />
</svelte:head>

<div
  class="bg-background min-h-screen text-foreground relative overflow-hidden pb-20"
>
  <MeshGradient />

  <!-- Grid Pattern -->
  <div
    class="fixed inset-0 pointer-events-none opacity-5 -z-20 [mask-image:linear-gradient(180deg,var(--foreground),transparent)]"
    style="background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, currentColor 39px, currentColor 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, currentColor 39px, currentColor 40px);"
  ></div>

  <!-- Hero Section -->
  <section
    class="relative aspect-[340/640] w-full overflow-hidden sm:aspect-[340/488] md:aspect-[768/472] lg:aspect-[1024/520] xl:aspect-[1440/520]"
  >
    <!-- Background Image Container -->
    <div class="absolute inset-0 z-0">
      <!-- Desktop Banner -->
      <img
        src={page.hero.desktopImage}
        alt="Ladies In Tech & Leadership Banner"
        class="hidden md:block w-full h-full object-cover"
      />
      <!-- Mobile Banner -->
      <img
        src={page.hero.mobileImage || page.hero.desktopImage}
        alt="Ladies In Tech & Leadership Banner"
        class="block md:hidden w-full h-full object-cover"
      />
      <!-- Homepage-style overlay -->
      <div class="absolute inset-0 bg-black/50 dark:bg-background/70"></div>
    </div>

    <!-- Content -->
    <div
      class="absolute top-1/2 left-1/2 z-1 mx-auto flex h-full w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
    >
      <div class="flex flex-col gap-4 text-center max-w-5xl">
        <!-- Subtitle badge -->
        <div
          class="rounded-xl inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-primary/20 text-white border border-white/20 self-center backdrop-blur-md animate-in fade-in slide-in-from-bottom-4"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"
            ></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-white"
            ></span>
          </span>
          {page.hero.badge}
        </div>

        <h1
          class="animate-float text-4xl font-bold md:text-6xl lg:text-7xl text-white tracking-tight"
        >
          {page.hero.title}
          <span class="text-primary italic">{page.hero.subtitle}</span>
        </h1>
        <p
          class="mx-auto mb-6 max-w-3xl opacity-90 text-white sm:text-xl leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          {page.hero.description}
        </p>

        <!-- CTA -->
        <div
          class="flex flex-col justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-1000"
        >
          <Button
            href={page.hero.ctaHref}
            class="w-full sm:w-auto shadow-lg shadow-primary/20 group rounded-xl font-bold"
          >
            {page.hero.ctaText}
            <ArrowRight
              class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            />
          </Button>
        </div>
      </div>
    </div>
  </section>

  <!-- Mission & Vision -->
  <section class="py-24 relative">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Card.Root
          class="p-10 border-border/50 bg-card/50 backdrop-blur-sm shadow-xl hover:border-primary/30 transition-all group"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
          >
            <Heart class="w-8 h-8 text-primary" />
          </div>
          <h2 class="text-3xl font-bold mb-4 tracking-tight">Our Mission</h2>
          <p class="text-muted-foreground text-lg leading-relaxed font-medium">
            {page.mission}
          </p>
        </Card.Root>

        <Card.Root
          class="p-10 border-border/50 bg-card/50 backdrop-blur-sm shadow-xl hover:border-primary/30 transition-all group"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
          >
            <ShieldCheck class="w-8 h-8 text-primary" />
          </div>
          <h2 class="text-3xl font-bold mb-4 tracking-tight">
            Executive Policy
          </h2>
          <p class="text-muted-foreground text-lg leading-relaxed font-medium">
            {page.policy}
          </p>
        </Card.Root>
      </div>
    </div>
  </section>

  <!-- Community Impact -->
  <section class="py-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-primary/5 -skew-y-3 -z-10"></div>
    <div class="container mx-auto px-4">
      <div class="text-center mb-16 animate-in fade-in duration-700">
        <h2 class="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
          Our Pillars of Impact
        </h2>
        <p class="text-muted-foreground font-medium max-w-2xl mx-auto">
          We focus on key areas that drive real growth and sustainability for
          women in the technology sector.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {#each page.pillars as pillar, i}
          <div
            class="p-8 rounded-2xl border border-border bg-background group hover:border-primary/30 transition-all"
          >
            <div
              class={cn(
                "w-12 h-12 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 flex items-center justify-center rounded-xl bg-background shadow-sm border border-border/50",
                pillar.color || "text-primary",
              )}
            >
              {#if pillar.icon && iconMap[pillar.icon]}
                {@const Icon = iconMap[pillar.icon]}
                <Icon class="size-6" />
              {:else}
                <Sparkles class="size-6" />
              {/if}
            </div>
            <h3 class="text-xl font-bold mb-2">{pillar.title}</h3>
            <p
              class="text-muted-foreground text-sm font-medium leading-relaxed"
            >
              {pillar.desc}
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Events Section -->
  <section class="py-24 relative overflow-hidden bg-background">
    <div class="container mx-auto px-4">
      <div
        class="flex flex-col md:flex-row items-end justify-between mb-12 gap-6"
      >
        <div class="max-w-2xl">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 text-[10px] font-bold uppercase tracking-widest mb-4 border border-pink-500/20"
          >
            <Calendar class="size-3" /> Event Calendar
          </div>
          <h2 class="text-3xl md:text-5xl font-bold tracking-tight">
            Upcoming & Past <span class="text-pink-600 italic">Gatherings</span>
          </h2>
          <p class="text-muted-foreground font-medium mt-4">
            Join our vibrant community events designed to empower, educate, and
            connect women across the tech ecosystem.
          </p>
        </div>

        <div
          class="flex gap-2 p-1 bg-muted/50 rounded-xl border border-border/50"
        >
          <button
            onclick={() => (activeTab = "upcoming")}
            class="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all {activeTab ===
            'upcoming'
              ? 'bg-background shadow-lg text-primary'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            Upcoming
          </button>
          <button
            onclick={() => (activeTab = "past")}
            class="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all {activeTab ===
            'past'
              ? 'bg-background shadow-lg text-primary'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            Past Events
          </button>
        </div>
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
      >
        {#each filteredEvents as event (event.id)}
          <div class="group relative animate-in fade-in duration-500">
            <Card.Root
              class="overflow-hidden border-border/50 bg-card/30 backdrop-blur-md hover:border-pink-500/50 transition-all shadow-xl h-full flex flex-col group relative pt-0"
            >
              <a
                href="/ladies-in-tech/{event.id}"
                class="absolute inset-0 z-30"
                aria-label="View details for {event.title}"
              ></a>

              <div class="relative aspect-square overflow-hidden bg-muted/20">
                {#if event.imageUrl}
                  <!-- Reflection/Glow Background -->
                  <img
                    src={event.imageUrl}
                    alt=""
                    class="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-150"
                  />
                  <!-- Main Flyer (Perfect Fit) -->
                  <div
                    class="relative w-full h-full p-6 flex items-center justify-center"
                  >
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      class="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-700 group-hover:scale-105 relative z-10 rounded-lg"
                    />
                  </div>
                {:else}
                  <div
                    class="w-full h-full bg-gradient-to-br from-pink-500/10 to-primary/5 flex items-center justify-center"
                  >
                    <Heart class="size-12 text-pink-500/20" />
                  </div>
                {/if}

                <div class="absolute top-4 left-4 z-20">
                  <Badge
                    variant="secondary"
                    class="bg-background/90 backdrop-blur-md font-bold uppercase text-[9px] tracking-widest border-none shadow-lg text-foreground/80"
                  >
                    {event.category?.replace("-", " ") || "Community"}
                  </Badge>
                </div>

                {#if event.status === "upcoming"}
                  <div class="absolute bottom-4 right-4 z-20">
                    <div
                      class="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1.5"
                    >
                      <span class="relative flex h-2 w-2">
                        <span
                          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"
                        ></span>
                        <span
                          class="relative inline-flex rounded-full h-2 w-2 bg-white"
                        ></span>
                      </span>
                      Booking Open
                    </div>
                  </div>
                {/if}
              </div>

              <div class="flex flex-col flex-1 p-6 pt-0 gap-2">
                <div
                  class="flex items-center gap-2 text-[10px] font-bold text-pink-600 uppercase tracking-[0.2em] mt-4"
                >
                  <Clock class="size-3" />
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                <h3
                  class="text-xl font-bold tracking-tight group-hover:text-pink-600 transition-colors line-clamp-2"
                >
                  {event.title}
                </h3>

                <div
                  class="text-muted-foreground text-sm font-medium line-clamp-2 leading-relaxed prose-sm prose-pink"
                >
                  {@html (
                    event.description ||
                    "Join us for this impactful session where we explore new horizons in technology and leadership."
                  )
                    .replace(/<[^>]*>/g, "")
                    .trim()}
                </div>

                <div
                  class="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-auto"
                >
                  <MapPin class="size-3.5 text-pink-500" />
                  {event.location || "Online / To be announced"}
                </div>

                <div class="flex flex-col gap-2 pt-2 relative z-20">
                  {#if event.status === "upcoming"}
                    {#if event.registrationUrl}
                      <Button
                        href={event.registrationUrl}
                        target="_blank"
                        class="w-full shadow-primary/10 rounded-xl font-bold"
                      >
                        Register Now <ArrowRight class="ml-2 size-4" />
                      </Button>
                    {/if}
                    {#if event.paymentUrl}
                      <Button
                        href={event.paymentUrl}
                        target="_blank"
                        variant="outline"
                        class="w-full rounded-xl font-bold border-pink-500/20 text-pink-600 hover:bg-pink-500/5"
                      >
                        Pay for Event <CreditCard class="ml-2 size-4" />
                      </Button>
                    {/if}
                  {:else}
                    <Button
                      variant="outline"
                      disabled
                      class="w-full rounded-xl font-bold opacity-60"
                    >
                      Event Concluded
                    </Button>
                  {/if}
                </div>
              </div>
            </Card.Root>
          </div>
        {:else}
          <div
            class="col-span-full py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border/50"
          >
            <Calendar class="size-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 class="text-xl font-bold text-muted-foreground">
              No events scheduled yet
            </h3>
            <p
              class="text-sm text-muted-foreground/60 max-w-sm mx-auto mt-2 italic font-medium"
            >
              Check back soon for exciting sessions and community gatherings!
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Event Albums Section -->
  {#if archives.length > 0}
    <section class="py-24 relative overflow-hidden">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 text-[10px] font-bold uppercase tracking-widest mb-4 border border-pink-500/20"
          >
            <Camera class="size-3" />
            Visual Archives
          </div>
          <h2 class="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Event Albums
          </h2>
          <p
            class="text-lg text-muted-foreground max-w-2xl mx-auto font-medium"
          >
            Relive the moments from previous Ladies in Tech events through our
            curated photo galleries.
          </p>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {#each archives as archive (archive.id)}
            <a
              href="/ladies-in-tech/archives/{archive.id}"
              class="group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:shadow-xl hover:border-primary/30 flex flex-col"
            >
              <div class="relative overflow-hidden aspect-[4/3]">
                {#if archive.coverImageUrl}
                  <img
                    src={archive.coverImageUrl}
                    alt={archive.title}
                    class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                {:else}
                  <div
                    class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-transparent"
                  >
                    <ImageIcon class="size-16 text-primary/20" />
                  </div>
                {/if}

                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                ></div>

                {#if archive.media && archive.media.length > 0}
                  <div class="absolute top-3 right-3">
                    <span
                      class="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-black/50 text-white backdrop-blur-sm border border-white/10 flex items-center gap-1.5"
                    >
                      <Camera class="size-3" />
                      {archive.media.length} photos
                    </span>
                  </div>
                {/if}

                <div class="absolute bottom-0 left-0 w-full p-5">
                  <div class="flex items-center gap-2 mb-2">
                    <span
                      class="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary text-white"
                    >
                      {archive.year}
                    </span>
                  </div>
                  <h3
                    class="font-bold text-lg leading-tight text-white line-clamp-2"
                  >
                    {archive.title}
                  </h3>
                  {#if archive.location}
                    <p
                      class="text-xs text-white/70 mt-1 flex items-center gap-1"
                    >
                      <MapPin class="size-3" />
                      {archive.location}
                    </p>
                  {/if}
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  <!-- Partners & Sponsors Section -->
  {#if sponsorLogos.length > 0}
    <section
      class="py-24 bg-card border-y border-border overflow-hidden relative"
    >
      <div class="container mx-auto px-4 mb-12 text-center">
        <h2 class="text-3xl font-bold tracking-tight text-foreground">
          Sponsored By
        </h2>
        <div class="h-1 w-20 bg-primary mx-auto mt-4 rounded-full"></div>
      </div>

      <div class="relative w-full">
        <div class="flex overflow-hidden group">
          <div
            class="scroll-container py-4 flex items-center gap-12 lg:gap-24 whitespace-nowrap"
          >
            <!-- First set of logos -->
            {#each sponsorLogos as logo, i}
              <div
                class="flex items-center justify-center size-32 lg:size-48 transition-all duration-300"
              >
                <img
                  src={logo}
                  alt="Sponsor Logo"
                  class="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-500 opacity-70 hover:opacity-100"
                />
              </div>
            {/each}

            <!-- Duplicated set of logos for seamless scroll -->
            {#each sponsorLogos as logo}
              <div
                class="flex items-center justify-center size-32 lg:size-48 transition-all duration-300"
              >
                <img
                  src={logo}
                  alt="Sponsor Logo"
                  class="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-500 opacity-70 hover:opacity-100"
                />
              </div>
            {/each}
          </div>
        </div>

        <!-- Gradient Overlays for smooth edges -->
        <div
          class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"
        ></div>
        <div
          class="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"
        ></div>
      </div>

      <div class="mt-16 text-center">
        <p class="text-muted-foreground mb-8 font-medium italic">
          Interested in partnership opportunities? Reach out to our team.
        </p>
        <Button
          variant="outline"
          class="rounded-xl font-bold px-8 shadow-sm border-primary/20 text-primary hover:bg-primary/5"
          href="/contact"
        >
          Become a Partner
        </Button>
      </div>
    </section>
  {/if}

  <!-- CTA Section -->
  <section class="py-24 container mx-auto px-4">
    <div
      class="glass border-border p-12 rounded-2xl relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 shadow-xl"
    >
      <div
        class="relative z-10 flex flex-col md:flex-row gap-8 items-center text-center md:text-left"
      >
        <div class="flex-1">
          <h2 class="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            {page.ctaSection.title}
          </h2>
          <p
            class="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl"
          >
            {page.ctaSection.description}
          </p>
        </div>
        <div class="shrink-0">
          <Button
            href={page.ctaSection.buttonHref}
            class="font-bold shadow-lg shadow-primary/20 transition-transform hover:scale-105 rounded-xl h-12 px-8"
          >
            {page.ctaSection.buttonText}
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .scroll-container {
    display: flex;
    width: max-content;
    animation: scroll 30s linear infinite;
  }

  .scroll-container:hover {
    animation-play-state: paused;
  }

  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
</style>
