<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "$lib/components/ui/card";
  import {
    Trophy,
    Award,
    Users,
    Star,
    ChevronRight,
    ArrowRight,
    Globe,
    Zap,
    Shield,
    Lightbulb,
    Handshake,
    HelpCircle,
    Calendar,
    MapPin,
    Clock,
    Ticket,
    CheckCircle2,
    Sparkles,
    Building2,
    GraduationCap,
    Laptop,
    PartyPopper,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import AwardsHero from "$lib/components/sections/awards-hero.svelte";

  let { data } = $props();

  const stats = [
    { value: "7th", label: "Edition", desc: "Years of Continental Impact", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
    { value: "1,000+", label: "Executives", desc: "CIOs, CTOs & Leaders", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { value: "13", label: "Countries", desc: "Pan-African Representation", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { value: "1", label: "Night of Recognition", desc: "Gala & Awards Celebration", icon: Star, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const whyAttendItems = [
    "Connect with 1,000+ verified members of Africa's technology leadership community",
    "Sit in on conference sessions and breakout rooms built for deeper industry conversations",
    "Explore exhibitions from leading technology brands and solution providers",
    "Celebrate the achievements of this year's honorees",
    "Network with peers, partners, and decision makers shaping enterprise tech across the continent",
  ];

  const day2Highlights = [
    {
      title: "Conference",
      desc: "Keynotes and panel discussions on the trends shaping enterprise technology in Africa.",
      icon: Users,
      badge: "Main Stage",
    },
    {
      title: "Breakout Rooms",
      desc: "Focused sessions for deeper conversations on specific industry topics. Participants of this get a certification.",
      icon: GraduationCap,
      badge: "Certification Included",
      highlight: true,
    },
    {
      title: "Exhibitions",
      desc: "Technology brands and solution providers showcasing their cutting-edge offerings.",
      icon: Building2,
      badge: "Tech Expo",
    },
    {
      title: "Awards Night",
      desc: "The evening celebration honoring this year's honorees across Africa.",
      icon: PartyPopper,
      badge: "Gala Dinner",
    },
  ];
</script>

<svelte:head>
  <title>The CIO & C-Suite Awards Africa 2026 | Awards Hub</title>
  <meta
    name="description"
    content="Join over 1,000 CIOs, C-Suite executives, and innovators for the 7th edition of the CIO & C-Suite Awards Africa on October 27, 2026 at Balmoral Convention Center."
  />
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
  <!-- Hero Section -->
  <AwardsHero items={data.content.hero} />

  <!-- Subheadline & Quick Banner Section -->
  <section class="py-12 bg-muted/30 border-b border-border/40">
    <div class="container mx-auto px-4 text-center max-w-4xl space-y-6">
      <div class="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
        <Calendar class="size-4" />
        <span>October 27, 2026</span>
        <span class="text-primary/40">•</span>
        <MapPin class="size-4" />
        <span>Balmoral Convention Center, Victoria Island, Lagos</span>
      </div>

      <h2 class="text-2xl md:text-4xl font-bold tracking-tight leading-snug">
        Join over <span class="text-primary italic">1,000 CIOs, C-Suite executives</span>, and innovators as we celebrate the <span class="text-amber-500 underline decoration-amber-500/40 underline-offset-8">7th edition</span> of the CIO & C-Suite Awards Africa.
      </h2>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Button
          href="/awards/tickets"
          size="lg"
          class="rounded-xl shadow-lg shadow-primary/20 font-bold px-8 h-12 gap-2 text-base"
        >
          <Ticket class="size-5" />
          Get Your Tickets
          <ArrowRight class="size-4" />
        </Button>

        <Button
          href="#schedule"
          variant="outline"
          size="lg"
          class="rounded-xl font-bold px-8 h-12 gap-2 text-base border-border hover:bg-muted"
        >
          See Event Details
          <ChevronRight class="size-4" />
        </Button>
      </div>
    </div>
  </section>

  <!-- Stats Bar -->
  <section class="py-16 bg-background">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {#each stats as stat}
          <div class="p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-3 group">
            <div class={cn("size-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", stat.bg, stat.color)}>
              <stat.icon class="size-7" />
            </div>
            <div class="space-y-1">
              <span class="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground block">
                {stat.value}
              </span>
              <span class="text-sm font-bold uppercase tracking-wider text-primary block">
                {stat.label}
              </span>
              <span class="text-xs text-muted-foreground font-medium block">
                {stat.desc}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Leading The Next Africa & Highlights -->
  <section class="py-20 bg-muted/20 relative overflow-hidden">
    <div class="container mx-auto px-4">
      <div class="flex flex-col lg:flex-row gap-12 items-center">
        <div class="lg:w-1/2 space-y-6">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <Star class="size-4" />
            Leading The Next Africa
          </div>
          <h2 class="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Continental <span class="text-primary italic">Excellence</span>
          </h2>
          <p class="text-lg text-muted-foreground leading-relaxed font-medium">
            The CIO & C-Suite Conference & Awards Africa stands as the continent’s premier platform, celebrating visionary leadership and technological excellence. Now in its seventh year, this pan-African awards platform honors the brightest minds across 13+ countries, celebrating the IT leaders shaping the future of African technology and business.
          </p>
          <div class="pt-2">
            <Button
              href="/awards/tickets"
              variant="default"
              class="rounded-xl shadow-lg shadow-primary/20 font-bold px-6 h-12"
            >
              Get Your Tickets
              <ArrowRight class="ml-2 size-4" />
            </Button>
          </div>
        </div>

        <a
          href="/awards/winners/{data.latestWinnerYear}"
          class="lg:w-1/2 w-full group block transition-transform active:scale-[0.98]"
        >
          <div class="aspect-video rounded-2xl overflow-hidden shadow-xl border-border border relative">
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div class="rounded-full size-16 bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                <ChevronRight class="size-8" />
              </div>
            </div>
            <img
              src={data.highlightWinner?.image?.url || "/images/awards_placeholder.webp"}
              alt={data.highlightWinner?.name || "Awards Highlight"}
              class="w-full h-full object-cover"
            />
            <div class="absolute bottom-6 left-6 z-20 space-y-2">
              <Badge class="bg-primary/90 text-primary-foreground font-bold px-4 py-1 rounded-lg">
                See Highlight
              </Badge>
              {#if data.highlightWinner}
                <div class="bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                  <p class="text-white font-bold text-sm tracking-tight">
                    {data.highlightWinner.name}
                  </p>
                  <p class="text-white/70 text-[10px] font-medium uppercase tracking-wider">
                    {data.highlightWinner.awardType}
                  </p>
                </div>
              {/if}
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- Event Schedule Section -->
  <section id="schedule" class="py-24 bg-background border-t border-border/40">
    <div class="container mx-auto px-4">
      <div class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <Badge variant="outline" class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-primary/30 text-primary">
          <Calendar class="size-3.5 mr-2" />
          Event Schedule
        </Badge>
        <h2 class="text-3xl md:text-5xl font-bold tracking-tight">
          Two Days of Leadership, Innovation & Celebration
        </h2>
        <p class="text-lg text-muted-foreground font-medium">
          A packed two-day itinerary designed for technical minds, industry leaders, and decision makers.
        </p>
      </div>

      <div class="space-y-12 max-w-5xl mx-auto">
        <!-- Day 1 Card -->
        <Card class="rounded-3xl border-2 border-primary/20 bg-card overflow-hidden shadow-lg hover:shadow-xl transition-all">
          <CardHeader class="bg-primary/5 p-8 border-b border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <Badge class="bg-primary text-primary-foreground font-bold px-3 py-1 text-xs uppercase tracking-wider rounded-md">
                Day 1
              </Badge>
              <h3 class="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight pt-2">
                October 26, 2026
              </h3>
            </div>
            <div class="inline-flex items-center gap-2 text-sm font-bold text-primary bg-background px-4 py-2 rounded-xl border border-primary/20">
              <Laptop class="size-4" />
              Pan-African Hackathon
            </div>
          </CardHeader>
          <CardContent class="p-8 space-y-4">
            <h4 class="text-xl font-bold text-foreground flex items-center gap-2">
              <Zap class="size-5 text-amber-500" />
              Hackathon
            </h4>
            <p class="text-base text-muted-foreground leading-relaxed font-medium">
              A day for Africa's brightest technical minds to build, compete, and showcase solutions to real industry challenges.
            </p>
          </CardContent>
        </Card>

        <!-- Day 2 Card -->
        <Card class="rounded-3xl border-2 border-amber-500/30 bg-card overflow-hidden shadow-xl hover:shadow-2xl transition-all">
          <CardHeader class="bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent p-8 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <Badge class="bg-amber-500 text-slate-950 font-bold px-3 py-1 text-xs uppercase tracking-wider rounded-md">
                Day 2 (Main Event)
              </Badge>
              <h3 class="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight pt-2">
                October 27, 2026
              </h3>
              <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest pt-1">
                Balmoral Convention Center, Victoria Island, Lagos
              </p>
            </div>
            <div class="inline-flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 bg-background px-4 py-2 rounded-xl border border-amber-500/30">
              <Trophy class="size-4" />
              Conference, Exhibitions & Awards Night
            </div>
          </CardHeader>
          <CardContent class="p-8 space-y-8">
            <p class="text-base text-muted-foreground leading-relaxed font-medium">
              A full day at the Balmoral Convention Center, Victoria Island, opening with a conference and breakout room sessions, running alongside exhibitions from leading technology brands, and closing with the awards night honoring the leaders driving digital transformation across Africa.
            </p>

            <div class="grid md:grid-cols-2 gap-6 pt-4">
              {#each day2Highlights as item}
                <div class={cn("p-6 rounded-2xl border transition-all space-y-3", item.highlight ? "border-amber-500/50 bg-amber-500/5 shadow-md" : "border-border/60 bg-muted/30")}>
                  <div class="flex items-center justify-between">
                    <div class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <item.icon class="size-6" />
                    </div>
                    <Badge variant={item.highlight ? "default" : "outline"} class={cn("font-bold text-[10px] uppercase tracking-wider", item.highlight && "bg-amber-500 text-slate-950 border-0")}>
                      {item.badge}
                    </Badge>
                  </div>
                  <h5 class="text-lg font-bold text-foreground">{item.title}</h5>
                  <p class="text-sm text-muted-foreground leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              {/each}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>

  <!-- Why Attend Section -->
  <section class="py-24 bg-muted/20 border-t border-border/40">
    <div class="container mx-auto px-4">
      <div class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <Badge variant="outline" class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-primary/30 text-primary">
          <Sparkles class="size-3.5 mr-2" />
          Event Benefits
        </Badge>
        <h2 class="text-3xl md:text-5xl font-bold tracking-tight">
          Why Attend?
        </h2>
        <p class="text-lg text-muted-foreground font-medium">
          Experience an unparalleled ecosystem of technology leadership, insights, and celebration.
        </p>
      </div>

      <!-- 5 Benefit Buckets Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {#each whyAttendItems as benefit, index}
          <div class="p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4 flex flex-col justify-between group">
            <div class="space-y-4">
              <div class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg group-hover:scale-110 transition-transform">
                0{index + 1}
              </div>
              <p class="text-base text-foreground font-semibold leading-relaxed">
                {benefit}
              </p>
            </div>
            <div class="pt-2 flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <CheckCircle2 class="size-4 text-emerald-500" />
              <span>Verified Participant</span>
            </div>
          </div>
        {/each}
      </div>

      <!-- Distinct CTA Standout Banner Underneath the 5 Points -->
      <div class="mt-12 max-w-6xl mx-auto">
        <div class="p-8 lg:p-10 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div class="space-y-2 text-center md:text-left z-10">
            <Badge class="bg-slate-950 text-amber-400 font-bold px-3 py-1 text-[10px] uppercase tracking-wider">
              Limited Seats Available
            </Badge>
            <h3 class="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950">
              Reserve Your Place
            </h3>
            <p class="text-base text-slate-900 font-medium max-w-xl">
              Join 1,000+ technology decision-makers for Africa's most prestigious tech gathering.
            </p>
          </div>

          <div class="z-10 shrink-0">
            <Button href="/awards/tickets" size="lg" class="bg-slate-950 hover:bg-slate-900 text-white font-extrabold px-8 h-14 rounded-2xl gap-3 shadow-lg text-base">
              <Ticket class="size-5" />
              Get Your Tickets
              <ArrowRight class="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Venue Section -->
  <section class="py-24 bg-background border-t border-border/40">
    <div class="container mx-auto px-4 max-w-5xl">
      <Card class="rounded-3xl border-2 border-primary/20 bg-card overflow-hidden shadow-2xl">
        <div class="grid lg:grid-cols-12 items-center">
          <div class="lg:col-span-7 p-8 lg:p-12 space-y-6">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              <MapPin class="size-4" />
              Event Venue
            </div>
            <div class="space-y-2">
              <h3 class="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                Balmoral Convention Center
              </h3>
              <p class="text-xl font-bold text-primary">
                Victoria Island, Lagos
              </p>
            </div>
            <p class="text-base text-muted-foreground leading-relaxed font-medium">
              A landmark venue for a landmark night. Full address and access details will be shared upon registration.
            </p>
            <div class="pt-2">
              <Button href="/awards/tickets" size="lg" class="rounded-xl shadow-lg shadow-primary/20 font-bold px-8 h-12 gap-2">
                <Ticket class="size-5" />
                GET YOUR TICKETS
                <ArrowRight class="size-4" />
              </Button>
            </div>
          </div>

          <div class="lg:col-span-5 relative min-h-[300px] lg:h-full bg-muted">
            <img
              src="/awards_hero_backgrounds/awards-0_1920x1080.webp"
              alt="Balmoral Convention Center"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-8">
              <div class="text-white space-y-1">
                <p class="font-extrabold text-lg">Victoria Island, Lagos</p>
                <p class="text-xs text-white/80 uppercase tracking-widest font-medium">October 27, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </section>

  <!-- Final CTA Section -->
  <section class="py-24 bg-muted/30 border-t border-border/40">
    <div class="container mx-auto px-4">
      <div class="rounded-3xl bg-primary shadow-2xl p-12 lg:p-20 text-center relative overflow-hidden text-primary-foreground">
        <div class="absolute -right-20 -top-20 size-80 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute -left-20 -bottom-20 size-80 bg-white/10 rounded-full blur-3xl"></div>

        <div class="relative z-10 max-w-3xl mx-auto space-y-6">
          <Badge class="bg-amber-500 text-slate-950 font-bold px-4 py-1 text-xs uppercase tracking-widest">
            7th Edition • October 27, 2026
          </Badge>
          <h2 class="text-3xl lg:text-5xl font-bold tracking-tight">
            Be Part of Africa's Premier Tech Leadership Night
          </h2>
          <p class="text-xl text-primary-foreground/90 font-medium leading-relaxed">
            Join 1,000+ CIOs, C-Suite executives, and innovators for a night of recognition, networking, and celebration.
          </p>
          <div class="pt-6">
            <Button
              href="/awards/tickets"
              variant="secondary"
              size="lg"
              class="rounded-xl shadow-xl font-extrabold px-10 h-14 text-base gap-3"
            >
              <Ticket class="size-5" />
              GET YOUR TICKETS
              <ArrowRight class="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
