<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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
    Scale,
    Shield,
    Lightbulb,
    Network,
    Handshake,
    HelpCircle,
    Calendar,
    MapPin,
    Clock,
    Send,
    CheckCircle,
  } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { cn } from "$lib/utils";
  import AwardsHero from "$lib/components/sections/awards-hero.svelte";

  let { data } = $props();

  // Countdown state
  let now = $state(new Date());
  let countdownInterval: ReturnType<typeof setInterval>;

  onMount(() => {
    countdownInterval = setInterval(() => {
      now = new Date();
    }, 1000);
    return () => clearInterval(countdownInterval);
  });

  const period = $derived(data.nominationPeriod);
  const periodStatus = $derived(period?.status || "not_set");

  const countdownTarget = $derived.by(() => {
    if (periodStatus === "upcoming" && period?.startDate)
      return new Date(period.startDate);
    if (periodStatus === "active" && period?.endDate)
      return new Date(period.endDate);
    return null;
  });

  const timeRemaining = $derived.by(() => {
    if (!countdownTarget) return null;
    const diff = countdownTarget.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  });

  const coreValues = [
    {
      title: "Innovation",
      desc: "Championing groundbreaking technological advancements that solve uniquely African challenges.",
      icon: Lightbulb,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Collaboration",
      desc: "Fostering a unified ecosystem where public and private sectors synergize for growth.",
      icon: Handshake,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Integrity",
      desc: "Upholding the highest standards of transparency and governance in digital leadership.",
      icon: Shield,
      color: "text-accent-gold",
      bg: "bg-accent-gold/10",
    },
    {
      title: "Excellence",
      desc: "Recognizing outstanding achievements that set new benchmarks for the entire continent.",
      icon: Trophy,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  const sponsorCategories = [
    {
      name: "Silver Sponsors",
      items: ["Previous Partner A", "Previous Partner B"],
    },
    { name: "Gold Sponsors", items: ["Elite Tech Group", "Global Systems"] },
    { name: "Official Communication Partner", items: ["Main Media House"] },
    {
      name: "Media Partners",
      items: ["Tech Africa", "Business Daily", "Digital Times"],
    },
  ];
  const sponsorshipLevels = ["Platinum", "Gold", "Silver", "Bronze"];

  const groupedPartners = $derived(() => {
    const groups: Record<string, any[]> = {};

    data.partners.forEach((partner) => {
      let type = partner.type || "Partners";
      const isSponsorship = sponsorshipLevels.some((level) =>
        type.toLowerCase().includes(level.toLowerCase()),
      );

      if (isSponsorship) {
        type = "Sponsors";
      }

      if (!groups[type]) groups[type] = [];
      groups[type].push(partner);
    });

    return Object.entries(groups).sort(([a], [b]) => {
      if (a === "Strategic Partner") return -1;
      if (b === "Strategic Partner") return 1;
      if (a === "Sponsors") return -1;
      if (b === "Sponsors") return 1;
      return a.localeCompare(b);
    });
  });
</script>

<div class="min-h-screen bg-background">
  <AwardsHero items={data.content.hero} />

  <!-- Leading The Next Africa & Highlights -->
  <section class="py-24 relative overflow-hidden">
    <div class="container mx-auto px-4">
      <!-- Countdown Banner -->
      {#if timeRemaining}
        <div class="max-w-4xl mx-auto mb-12">
          <Card class="border-primary/20 bg-primary/5 rounded-xl shadow-md">
            <CardContent class="py-6">
              <div
                class="flex flex-col sm:flex-row items-center justify-between gap-6"
              >
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock class="size-5 text-primary" />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-foreground"
                      >Nominations Closing In</span
                    >
                    <span class="text-xs text-muted-foreground font-medium">Secure your recognition today</span>
                  </div>
                </div>
                <div class="flex gap-4">
                  {#each [{ value: timeRemaining.days, label: "Days" }, { value: timeRemaining.hours, label: "Hours" }, { value: timeRemaining.minutes, label: "Mins" }, { value: timeRemaining.seconds, label: "Secs" }] as unit}
                    <div class="flex flex-col items-center min-w-[60px]">
                      <span
                        class="text-2xl font-bold text-primary tabular-nums"
                      >
                        {String(unit.value).padStart(2, "0")}
                      </span>
                      <span class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider"
                        >{unit.label}</span
                      >
                    </div>
                  {/each}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      {/if}

      <div class="flex flex-col lg:flex-row gap-12 items-center">
        <div class="lg:w-1/2 space-y-6">
          <div
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
          >
            <Star class="size-4" />
            Leading The Next Africa
          </div>
          <h2
            class="text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
          >
            Continental <span class="text-primary italic">Excellence</span>
          </h2>
          <p class="text-lg text-muted-foreground leading-relaxed font-medium">
            The CIO & C-Suite Conference & Awards Africa stands as the
            continent’s premier platform, celebrating visionary leadership and
            technological excellence. Now in its seventh year, this pan-African
            awards platform honors the brightest minds across 15 countries, celebrating the IT leaders shaping the future of African technology and business.
          </p>
          <div class="pt-4">
            <Button
              href="https://zfrmz.com/ehOL2qeENHenXNdwxiLi"
              target="_blank"
              variant="default"
              class="rounded-xl shadow-lg shadow-primary/20 font-bold"
            >
              Nominate Now
              <ArrowRight class="ml-2 size-4" />
            </Button>
          </div>
        </div>
        <a
          href="/awards/winners/{data.latestWinnerYear}"
          class="lg:w-1/2 w-full group block transition-transform active:scale-[0.98]"
        >
          <div
            class="aspect-video rounded-xl overflow-hidden shadow-lg border-border border relative"
          >
            <div
              class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <div
                class="rounded-full size-16 bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110"
              >
                <ChevronRight class="size-8" />
              </div>
            </div>
            <img
              src={data.highlightWinner?.image?.url ||
                "/images/awards_placeholder.webp"}
              alt={data.highlightWinner?.name || "Awards Highlight"}
              class="w-full h-full object-cover"
            />
            <div class="absolute bottom-6 left-6 z-20 space-y-2">
              <Badge
                class="bg-primary/90 text-primary-foreground font-bold px-4 py-1 rounded-lg"
                >See Highlight</Badge
              >
              {#if data.highlightWinner}
                <div
                  class="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10"
                >
                  <p class="text-white font-bold text-sm tracking-tight">
                    {data.highlightWinner.name}
                  </p>
                  <p
                    class="text-white/70 text-[10px] font-medium uppercase tracking-wider"
                  >
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

  <!-- About Section Detailed -->
  <section class="py-24 bg-muted/20">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-2 gap-12">
        <div class="space-y-4">
          <h3
            class="text-2xl font-bold text-foreground uppercase tracking-tight"
          >
            Beyond Individual Excellence
          </h3>
          <p class="text-muted-foreground leading-relaxed font-medium text-lg">
            Beyond individual excellence, the Awards spotlight forward-thinking
            organizations that have embedded innovation at their core. These
            enterprises are redefining business models, nurturing digital-first
            cultures, and creating measurable value and impact across
            industries.
          </p>
        </div>
        <div class="space-y-4">
          <h3
            class="text-2xl font-bold text-foreground uppercase tracking-tight"
          >
            A Platform for Dialogue
          </h3>
          <p class="text-muted-foreground leading-relaxed font-medium text-lg">
            Complementing the Awards is the CIO & C-Suite Conference, a premier
            gathering of Africa’s top business and technology leaders. Through
            keynote sessions, panel discussions, breakout workshops, and
            exhibitions, participants explore the future of technology,
            leadership, and enterprise transformation.
          </p>
        </div>
      </div>

      <div
        class="mt-20 p-8 rounded-xl bg-card border border-border shadow-sm flex flex-col md:flex-row items-center gap-8"
      >
        <div
          class="size-20 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
        >
          <Globe class="size-10 text-primary" />
        </div>
        <div>
          <h4 class="text-xl font-bold text-foreground mb-2">
            Pan-African Reach
          </h4>
          <p class="text-muted-foreground font-medium">
            Spanning 15 countries including Kenya, Uganda, Togo, Rwanda,
            Nigeria, Ghana, Tunisia, Egypt, Angola, Morocco, Senegal, South
            Africa, Zambia, Cameroon, and Côte d’Ivoire.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Core Values Section -->
  <section class="py-24">
    <div class="container mx-auto px-4 text-center space-y-4 mb-16">
      <h2 class="text-4xl font-bold tracking-tight text-foreground">
        Core Values
      </h2>
      <p
        class="text-xl text-muted-foreground max-w-2xl mx-auto font-medium italic"
      >
        The pillars that define our search for excellence across the African digital landscape.
      </p>
    </div>

    <div class="container mx-auto px-4">
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {#each coreValues as item}
          <div
            class="p-8 rounded-xl bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300 group"
          >
            <div
              class={cn(
                "size-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                item.bg,
                item.color,
              )}
            >
              <item.icon class="size-7" />
            </div>
            <h3 class="text-xl font-bold text-foreground mb-3">{item.title}</h3>
            <p
              class="text-muted-foreground leading-relaxed font-medium text-sm"
            >
              {item.desc}
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Partners & Sponsors Section -->
  <section
    class="py-24 bg-card border-y border-border overflow-hidden relative"
  >
    <div class="container mx-auto px-4 mb-16 text-center relative z-20">
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700"
      >
        <Handshake class="size-3.5" />
        Our Ecosystem
      </div>
      <h2 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        2025 <span class="text-primary italic">Partners</span>
      </h2>
      <p class="text-muted-foreground mt-4 max-w-2xl mx-auto font-medium">
        Collaborating with industry leaders to drive technological
        transformation across the continent.
      </p>
    </div>

    <!-- Grouped Infinite Motion Containers -->
    <div class="space-y-12">
      {#each groupedPartners() as [category, partners]}
        <div class="relative w-full overflow-hidden">
          <div class="container mx-auto px-4 mb-6">
            <div class="flex items-center gap-4">
              <h3
                class="text-sm font-bold uppercase tracking-[0.2em] text-primary/80 whitespace-nowrap"
              >
                {category}
              </h3>
              <div
                class="h-px w-full bg-linear-to-r from-primary/20 to-transparent"
              ></div>
            </div>
          </div>

          <div class="relative py-4">
            <div
              class="flex whitespace-nowrap loop-container py-4"
              style="animation-duration: {Math.max(20, partners.length * 6)}s"
            >
              {#each [1, 2, 3] as _}
                <div class="flex items-center gap-12 lg:gap-20 px-6 lg:px-10">
                  {#each partners as partner}
                    <a
                      href={partner.websiteUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="relative group flex flex-col items-center"
                    >
                      <div
                        class="flex items-center justify-center size-40 lg:size-48 p-2 transition-all duration-500 bg-background/50 rounded-xl border border-border/50 shadow-sm group-hover:border-primary/50 group-hover:shadow-md"
                      >
                        <img
                          src={partner.logo?.url}
                          alt={partner.name}
                          class="max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-110"
                        />
                      </div>
                    </a>
                  {/each}
                </div>
              {/each}
            </div>

            <!-- Masking Gradient -->
            <div
              class="absolute inset-y-0 left-0 w-40 bg-linear-to-r from-card via-card/80 to-transparent z-20 pointer-events-none"
            ></div>
            <div
              class="absolute inset-y-0 right-0 w-40 bg-linear-to-l from-card via-card/80 to-transparent z-20 pointer-events-none"
            ></div>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-16 text-center relative z-20">
      <div class="inline-flex flex-col items-center gap-6">
        <p class="text-muted-foreground font-medium italic text-sm">
          Join the elite circle of African tech enablers
        </p>
        <Button
          href="/awards/sponsorship"
          variant="outline"
          class="rounded-xl shadow-md border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 group"
        >
          Become a Partner
          <ArrowRight
            class="size-4 ml-2 group-hover:translate-x-1 transition-transform"
          />
        </Button>
      </div>
    </div>
  </section>

  <style>
    .loop-container {
      width: max-content;
      animation: loop-marquee 60s linear infinite;
      will-change: transform;
    }

    @keyframes loop-marquee {
      0% {
        transform: translateX(0);
      }
      100% {
        /* Translating by exactly 1/3 since we have 3 identical sets */
        transform: translateX(calc(-100% / 3));
      }
    }

    /* Adjust speed on smaller screens */
    @media (max-width: 768px) {
      .loop-container {
        animation-duration: 40s;
      }
    }
  </style>

  <!-- FAQ Preview -->
  <section class="py-24">
    <div class="container mx-auto px-4">
      <div
        class="max-w-4xl mx-auto rounded-xl border border-border bg-card p-12 text-center space-y-6 shadow-md shadow-primary/5"
      >
        <div
          class="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4"
        >
          <HelpCircle class="size-8" />
        </div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <p class="text-lg text-muted-foreground font-medium">
          Find answers to common questions about the CIO & C-Suite Conference &
          Awards Africa.
        </p>
        <div class="pt-4">
          <Button variant="outline" class="rounded-xl group" href="/faq">
            Read the FAQ
            <ChevronRight
              class="size-4 ml-2 group-hover:translate-x-1 transition-transform"
            />
          </Button>
        </div>
      </div>
    </div>
  </section>

  <!-- Final CTA Section -->
  <section class="py-24">
    <div class="container mx-auto px-4">
      <div
        class="rounded-xl bg-primary shadow-lg p-12 lg:p-20 text-center relative overflow-hidden"
      >
        <div
          class="absolute -right-20 -top-20 size-80 bg-white/10 rounded-full blur-3xl"
        ></div>
        <div
          class="absolute -left-20 -bottom-20 size-80 bg-white/10 rounded-full blur-3xl"
        ></div>

        <div class="relative z-10 max-w-3xl mx-auto space-y-6">
          <h2
            class="text-3xl lg:text-5xl font-bold text-primary-foreground tracking-tight"
          >
            Still have questions?
          </h2>
          <p class="text-xl text-primary-foreground/80 font-medium">
            If you can’t find the answer you’re looking for, please don’t
            hesitate to reach out.
          </p>
          <div
            class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              variant="secondary"
              class="rounded-xl shadow-md font-bold px-8"
              href="mailto:info@thecioclubafrica.com"
            >
              Email Us
            </Button>
          </div>
          <p class="text-primary-foreground/60 text-sm font-medium pt-4">
            Nominations close soon. Secure your place at Africa's elite tech
            gathering.
          </p>
        </div>
      </div>
    </div>
  </section>
</div>
