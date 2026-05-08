<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Trophy,
    Target,
    Globe,
    Users,
    Shield,
    Star,
    CalendarDays,
    ArrowRight,
    CheckCircle,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  const timeline = [
    {
      year: "2021",
      milestone: "Inaugural CIO Awards Nigeria launched with 500+ attendees",
    },
    {
      year: "2022",
      milestone: "Expanded to recognize leaders across 5 African countries",
    },
    {
      year: "2023",
      milestone:
        "Pan-African reach extended to 8 countries with 1,200+ nominations",
    },
    {
      year: "2024",
      milestone: "Celebrating 11 African nations with record-breaking entries",
    },
    {
      year: "2025",
      milestone: "Continental excellence recognized across all major economies",
    },
  ];

  const values = [
    {
      icon: Shield,
      title: "Integrity",
      description:
        "Every entry is evaluated with the highest standards of transparency and fairness.",
    },
    {
      icon: Target,
      title: "Excellence",
      description:
        "We celebrate only the most impactful innovations that transform organizations.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Building a network of visionary leaders shaping Africa's digital future.",
    },
    {
      icon: Globe,
      title: "Pan-African",
      description:
        "Recognizing talent across 11 African nations without borders or limitations.",
    },
  ];

  const countries = [
    "Nigeria",
    "Kenya",
    "South Africa",
    "Ghana",
    "Rwanda",
    "Tanzania",
    "Uganda",
    "Egypt",
    "Morocco",
    "Senegal",
    "Côte d'Ivoire",
  ];
</script>

<svelte:head>
  <title>About | CIO Awards Africa</title>
  <meta
    name="description"
    content="Learn about The CIO & C-Suite Awards Africa - the premier recognition platform celebrating excellence in IT leadership and digital transformation across the continent."
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Hero Section -->
  <section class="relative py-24 md:py-32 overflow-hidden">
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10"
    ></div>
    <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-4xl mx-auto text-center space-y-8">
        <Badge
          variant="secondary"
          class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
        >
          <Trophy class="size-3 mr-2" />
          Celebrating Excellence Since 2021
        </Badge>
        <h1
          class="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
        >
          About the <span class="text-primary">CIO Awards Africa</span>
        </h1>
        <p
          class="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
        >
          The CIO & C-Suite Awards Africa is the premier recognition platform
          celebrating visionary IT leaders and their transformative
          contributions to digital innovation across the African continent.
        </p>
      </div>
    </div>
  </section>

  <!-- Mission & Vision Section -->
  <section class="py-24 bg-muted/30">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-2 gap-16">
        <div class="space-y-6">
          <div
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
          >
            <Target class="size-4" />
            Our Mission
          </div>
          <h2 class="text-3xl font-bold tracking-tight text-foreground">
            Elevating IT Leadership Excellence
          </h2>
          <p class="text-lg text-muted-foreground leading-relaxed">
            We are committed to identifying, recognizing, and celebrating the
            outstanding achievements of Chief Information Officers and
            technology leaders who are driving digital transformation and
            innovation across African organizations.
          </p>
          <ul class="space-y-4">
            {#each ["Recognize exceptional IT leadership", "Promote digital transformation best practices", "Build a community of technology visionaries"] as item}
              <li class="flex items-center gap-3">
                <div
                  class="size-6 rounded-full bg-primary flex items-center justify-center shrink-0"
                >
                  <CheckCircle class="size-3 text-primary-foreground" />
                </div>
                <span class="text-muted-foreground font-medium">{item}</span>
              </li>
            {/each}
          </ul>
        </div>

        <div class="space-y-6">
          <div
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
          >
            <Star class="size-4" />
            Our Vision
          </div>
          <h2 class="text-3xl font-bold tracking-tight text-foreground">
            Africa's Premier IT Recognition Platform
          </h2>
          <p class="text-lg text-muted-foreground leading-relaxed">
            To be the most respected and influential platform for recognizing IT
            excellence in Africa, inspiring the next generation of technology
            leaders and fostering innovation that drives continental growth and
            global competitiveness.
          </p>
          <Card class="border-primary/20">
            <CardContent class="p-6">
              <div class="flex items-center gap-4">
                <div
                  class="size-12 rounded-xl bg-primary/10 flex items-center justify-center"
                >
                  <Globe class="size-6 text-primary" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-foreground">11 Countries</p>
                  <p class="text-sm text-muted-foreground">
                    Pan-African Recognition
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </section>

  <!-- Timeline Section -->
  <section class="py-24">
    <div class="container mx-auto px-4">
      <div class="text-center space-y-4 mb-16">
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
        >
          <CalendarDays class="size-4" />
          Our Journey
        </div>
        <h2
          class="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
        >
          A Legacy of Excellence
        </h2>
      </div>

      <div class="relative max-w-4xl mx-auto">
        <!-- Timeline line -->
        <div
          class="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2"
        ></div>

        {#each timeline as event, i}
          <div
            class="relative flex items-center mb-12 {i % 2 === 0
              ? 'md:flex-row-reverse'
              : ''}"
          >
            <!-- Dot -->
            <div
              class="absolute left-8 md:left-1/2 size-4 rounded-full bg-primary md:-translate-x-1/2 z-10"
            ></div>

            <!-- Content -->
            <div
              class="ml-20 md:ml-0 md:w-1/2 {i % 2 === 0
                ? 'md:pl-12'
                : 'md:pr-12 md:text-right'}"
            >
              <Card class="inline-block">
                <CardContent class="p-6">
                  <Badge variant="outline" class="mb-3 font-bold"
                    >{event.year}</Badge
                  >
                  <p class="text-muted-foreground">{event.milestone}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Values Section -->
  <section class="py-24 bg-muted/30">
    <div class="container mx-auto px-4">
      <div class="text-center space-y-4 mb-16">
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
        >
          <Shield class="size-4" />
          Our Values
        </div>
        <h2
          class="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
        >
          What We Stand For
        </h2>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {#each values as value}
          <div
            class="group p-8 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all"
          >
            <div
              class="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
            >
              <value.icon class="size-7" />
            </div>
            <h3 class="text-xl font-bold text-foreground mb-3">
              {value.title}
            </h3>
            <p class="text-muted-foreground leading-relaxed">
              {value.description}
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Countries Section -->
  <section class="py-24">
    <div class="container mx-auto px-4">
      <div class="text-center space-y-4 mb-16">
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
        >
          <Globe class="size-4" />
          Pan-African Reach
        </div>
        <h2
          class="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
        >
          Celebrating Leaders Across 11 Nations
        </h2>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Our awards recognize IT excellence across the African continent's most
          dynamic economies.
        </p>
      </div>

      <div class="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
        {#each countries as country}
          <Badge variant="secondary" class="px-6 py-2 text-sm font-medium">
            {country}
          </Badge>
        {/each}
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-24 bg-primary">
    <div class="container mx-auto px-4 text-center">
      <div class="max-w-3xl mx-auto space-y-8">
        <h2
          class="text-3xl md:text-5xl font-bold text-primary-foreground tracking-tight"
        >
          Ready to Showcase Your Excellence?
        </h2>
        <p class="text-lg text-primary-foreground/80">
          Join the ranks of Africa's most distinguished IT leaders. Submit your
          entry today.
        </p>
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button variant="secondary" href="/awards/entry" class="font-bold">
            Submit Entry
            <ArrowRight class="ml-2 size-4" />
          </Button>
          <Button
            variant="outline"
            href="/awards/categories"
            class="font-bold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            View Categories
          </Button>
        </div>
      </div>
    </div>
  </section>
</div>
