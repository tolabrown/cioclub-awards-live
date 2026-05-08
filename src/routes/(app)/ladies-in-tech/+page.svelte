<script lang="ts">
  import { Heart } from "@lucide/svelte"

  import MeshGradient from "$lib/components/widgets/MeshGradient.svelte";
  import * as Icons from "@lucide/svelte";
  import { ArrowRight } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";

  let { data } = $props();

  const content = $derived({
    hero: {
      title: "Ladies In Tech",
      description: "Empowering Women in Tech",
      bannerImage: "/ladies_in_tech_1920x720.webp",
      mobileBannerImage: "/ladies_in_tech_1920x1080.webp",
    },
    mission: "",
    policy: "",
    pillars: [],
    ...data.page.data,
  });

  function getIcon(name: string) {
    return (Icons as any)[name] || Icons.Shield;
  }
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

  <!-- Hero Section (Matches Homepage Carousel Frame) -->
  <section
    class="relative aspect-[340/640] w-full overflow-hidden sm:aspect-[340/488] md:aspect-[768/472] lg:aspect-[1024/520] xl:aspect-[1440/520]"
  >
    <!-- Background Image Container -->
    <div class="absolute inset-0 z-0">
      <!-- Desktop Banner -->
      <img
        src={content.hero.bannerImage}
        alt="Ladies In Tech Banner"
        class="hidden md:block w-full h-full object-cover"
      />
      <!-- Mobile Banner -->
      <img
        src={content.hero.mobileBannerImage}
        alt="Ladies In Tech Banner"
        class="block md:hidden w-full h-full object-cover"
      />
      <!-- Homepage-style overlay -->
      <div class="absolute inset-0 bg-black/50 dark:bg-background/70"></div>
    </div>

    <!-- Content (Centered like homepage) -->
    <div
      class="absolute top-1/2 left-1/2 z-1 mx-auto flex h-full w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
    >
      <div class="flex flex-col gap-4 text-center max-w-5xl">
        <!-- Subtitle badge (Matches homepage) -->
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
          Empowering Women in Tech
        </div>

        <h1
          class="animate-float text-4xl font-bold md:text-6xl lg:text-7xl text-white tracking-tight"
        >
          {content.hero.title.split(" ")[0]}
          <span class="text-primary italic"
            >{content.hero.title.split(" ").slice(1).join(" ")}</span
          >
        </h1>
        <p
          class="mx-auto mb-6 max-w-3xl opacity-90 text-white sm:text-xl leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          {content.hero.description}
        </p>

        <!-- CTA like homepage -->
        <div
          class="flex flex-col justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-1000"
        >
          <Button
            href="/contact"
            class="w-full sm:w-auto shadow-lg shadow-primary/20 group rounded-xl font-bold"
          >
            Join the Community
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
            {content.mission}
          </p>
        </Card.Root>

        <Card.Root
          class="p-10 border-border/50 bg-card/50 backdrop-blur-sm shadow-xl hover:border-primary/30 transition-all group"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
          >
            <Icons.ShieldCheck class="w-8 h-8 text-primary" />
          </div>
          <h2 class="text-3xl font-bold mb-4 tracking-tight">
            Executive Policy
          </h2>
          <p class="text-muted-foreground text-lg leading-relaxed font-medium">
            {content.policy}
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
        {#each content.pillars as pillar, i}
          {@const Icon = getIcon(pillar.iconName)}
          <div
            class="p-8 rounded-2xl border border-border bg-background group hover:border-primary/30 transition-all"
          >
            <Icon
              class="w-10 h-10 text-primary mb-6 group-hover:rotate-12 transition-transform"
            />
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
            Be Part of the Innovation
          </h2>
          <p
            class="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl"
          >
            Join the Ladies In Tech community and access exclusive mentorship,
            networking events, and career opportunities tailored for tech-driven
            women.
          </p>
        </div>
        <div class="shrink-0">
          <Button
            href="/contact"
            class="font-bold shadow-lg shadow-primary/20 transition-transform hover:scale-105 rounded-xl h-12 px-8"
          >
            Join the Community <ArrowRight class="ml-2 h-4 w-4" />
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
</style>
