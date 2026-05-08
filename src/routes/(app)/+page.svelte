<script lang="ts">
  import { Constants } from "$lib/constants";
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "$lib/components/ui/card";
  import {
    ArrowRight,
    ChevronRight,
    Play,
    CheckCircle2,
    Lightbulb,
    Users,
    Heart,
    Globe,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";
  import { ClubHeroContent } from "$lib/constants";
  import AwardsHero from "$lib/components/sections/awards-hero.svelte";
  import TestimonialSection from "$lib/components/home/testimonial-section.svelte";

  let { data } = $props();
  const content = $derived({
    hero: {
      title: "",
      subtitle: "",
      description: "",
      primaryCta: {},
      secondaryCta: {},
      loggedInCta: {},
    },
    mission: { title: "", tag: "", description: "", imageUrl: "", cta: {} },
    pillars: [],
    stats: [],
    ...data.content,
  });
  const user = $derived(page.data.user as User | undefined);

  const iconMap: Record<string, any> = {
    Users,
    Lightbulb,
    Heart,
    Globe,
    CheckCircle2,
    ArrowRight,
    ChevronRight,
    Play,
  };
</script>

<svelte:head>
  <title>{content.hero.title} | {Constants.BRANDNAME}</title>
  <meta name="description" content={content.hero.description} />
</svelte:head>

<!-- Hero Section -->
<AwardsHero items={ClubHeroContent} />

<!-- Mission Section -->
<section class="py-16 bg-background relative overflow-hidden">
  <div class="container mx-auto px-4">
    <div class="grid lg:grid-cols-2 gap-4 items-center">
      <div class="order-2 lg:order-1 relative">
        <div
          class="aspect-square rounded-xl overflow-hidden shadow-lg relative z-10 border border-border/50"
        >
          <img
            src={content.mission.imageUrl}
            alt="Who We Are"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
        </div>
        <!-- Decorative background -->
        <div
          class="absolute -top-10 -left-10 size-full border-2 border-primary/20 rounded-xl z-0"
        ></div>
      </div>

      <div class="order-1 lg:order-2 space-y-4">
        <div class="space-y-4">
          <p class="text-primary text-sm font-bold uppercase tracking-[0.2em]">
            {content.mission.tag}
          </p>
          <h2
            class="text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
          >
            {content.mission.title}
          </h2>
        </div>
        <p class="text-muted-foreground text-lg leading-relaxed font-medium">
          {content.mission.description}
        </p>
        <Button
          variant="outline"
          href={content.mission.cta.href}
          class="rounded-xl px-8 h-12 text-sm font-bold border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
        >
          {content.mission.cta.text}
        </Button>
      </div>
    </div>
  </div>
</section>

<!-- Strategic Pillars -->
<section class="py-16 bg-slate-50 dark:bg-slate-900/50">
  <div class="container mx-auto px-4 text-center mb-20">
    <div class="space-y-4 max-w-2xl mx-auto">
      <h2 class="text-4xl font-bold tracking-tight uppercase">
        Strategic Pillars
      </h2>
      <div class="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
    </div>
  </div>

  <div class="container mx-auto px-4">
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each content.pillars as pillar}
        <Card
          class="border-border/40 bg-card/50 backdrop-blur-md hover:border-primary/40 hover:shadow-lg hover:-translate-y-2 transition-all duration-500 rounded-xl p-4 group"
        >
          <CardHeader class="space-y-4">
            <div
              class={cn(
                "size-16 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                pillar.bgColor,
                pillar.color,
              )}
            >
              {#if typeof pillar.icon === "string" || !pillar.icon}
                {@const Icon = iconMap[pillar.icon] || Heart}
                <Icon class="size-8" />
              {:else}
                {@const Icon = pillar.icon}
                <Icon class="size-8" />
              {/if}
            </div>
            <div class="space-y-4">
              <CardTitle class="text-xl font-bold">{pillar.title}</CardTitle>
              <CardDescription class="text-sm font-medium leading-relaxed"
                >{pillar.description}</CardDescription
              >
            </div>
          </CardHeader>
        </Card>
      {/each}
    </div>
  </div>
</section>

<!-- Stats Section -->
<section
  class="py-24 bg-primary text-primary-foreground relative overflow-hidden"
>
  <div class="absolute inset-0 bg-grid-white opacity-10"></div>
  <div
    class="absolute -top-24 -left-24 size-96 bg-white/5 rounded-full blur-3xl"
  ></div>
  <div
    class="absolute -bottom-24 -right-24 size-96 bg-black/10 rounded-full blur-3xl"
  ></div>

  <div class="container mx-auto px-4 relative z-10">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
      {#each content.stats as stat}
        <div class="text-center space-y-4 group relative py-4">
          <!-- Animated Background Glow -->
          <div
            class="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-2xl transition-all duration-500 scale-90 group-hover:scale-100"
          ></div>

          <div class="relative space-y-2">
            {#if stat.emoji}
              <div
                class="text-4xl mb-2 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 inline-block"
              >
                {stat.emoji}
              </div>
            {/if}

            <div
              class="text-5xl lg:text-6xl font-bold text-primary-foreground group-hover:scale-110 transition-transform duration-500 tracking-tighter"
            >
              {stat.value}
            </div>

            <div
              class="text-primary-foreground/80 font-bold uppercase tracking-[0.2em] text-[10px] lg:text-xs max-w-[150px] mx-auto leading-relaxed"
            >
              {stat.label}
            </div>
          </div>

          <!-- Decorative Line -->
          <div
            class="h-1 w-0 bg-white/20 mx-auto rounded-full group-hover:w-12 transition-all duration-500"
          ></div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Testimonials Section -->
<TestimonialSection testimonials={content.testimonials} />

<!-- Membership Engagement -->
<section class="py-16 relative overflow-hidden">
  <div class="container mx-auto px-4 relative z-10">
    <div
      class="bg-primary text-primary-foreground rounded-xl p-12 lg:p-24 relative overflow-hidden border border-primary-foreground/5 shadow-lg"
    >
      <div class="absolute inset-0 bg-grid-white opacity-5"></div>
      <div
        class="absolute -bottom-40 -right-40 size-[500px] bg-primary rounded-full blur-[150px] opacity-20"
      ></div>

      <div class="max-w-3xl space-y-4 relative z-10">
        <h2
          class="text-4xl lg:text-6xl font-bold text-primary-foreground leading-tight"
        >
          Scale Your Impact with Peer Network of Strategic Leaders
        </h2>
        <p
          class="text-xl text-primary-foreground/80 font-medium leading-relaxed"
        >
          Join the elite community of IT leaders in Africa and gain exclusive
          access to research, networking, and leadership development programs.
        </p>
        <div class="flex flex-wrap gap-4 pt-4">
          <Button
            variant="secondary"
            href="/membership"
            class="font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Become a Member
          </Button>
          <Button
            variant="outline"
            href="/contact"
            class="font-bold border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 transition-all"
          >
            Contact Hub
          </Button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Latest News/Activities -->
<section class="py-16 bg-background">
  <div class="container mx-auto px-4">
    <div
      class="flex flex-col md:flex-row items-end justify-between gap-4 mb-20"
    >
      <div class="space-y-4 max-w-xl">
        <p class="text-primary text-sm font-bold uppercase tracking-[0.2em]">
          Latest Activities
        </p>
        <h2 class="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
          Stay ahead in the ecosystem
        </h2>
      </div>
      <Button variant="ghost" href="/news" class="font-bold text-primary group">
        Explore All Insights
        <ChevronRight
          class="ml-2 size-5 group-hover:translate-x-1 transition-transform"
        />
      </Button>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      {#each data.latestNews as activity}
        <a href="/news/{activity.id}" class="group block">
          <div
            class="aspect-16/10 rounded-xl overflow-hidden mb-8 relative border border-border/50"
          >
            <img
              src={activity.image}
              alt={activity.title}
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
          </div>
          <div class="space-y-4 px-2">
            <div
              class={"text-xs font-bold uppercase tracking-[0.2em] text-primary"}
            >
              {activity.category}
            </div>
            <h3
              class="text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2"
            >
              {activity.title}
            </h3>
            <p class="text-sm text-muted-foreground font-bold">
              {activity.readTime ? `Article • ${activity.readTime}` : "Article"}
            </p>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  :global(.bg-grid-white) {
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    );
    background-size: 24px 24px;
  }
</style>
