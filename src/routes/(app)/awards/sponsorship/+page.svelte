<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
  } from "$lib/components/ui/card";
  import {
    CheckCircle,
    Crown,
    Medal,
    Award,
    Star,
    Globe,
    Users,
    Megaphone,
    Handshake,
    ArrowRight,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import SponsorshipInquiryForm from "$lib/components/awards/SponsorshipInquiryForm.svelte";
  import SponsorshipModal from "$lib/components/awards/SponsorshipModal.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";

  let { data, form } = $props();

  let isModalOpen = $state(false);
  let selectedPackage = $state("");

  function openSponsorshipModal(pkgId: string) {
    selectedPackage = pkgId;
    isModalOpen = true;
  }

  const packageIcons: Record<string, any> = {
    platinum: Crown,
    gold: Medal,
    silver: Award,
    bronze: Star,
  };

  $effect(() => {
    if (form?.message) {
      toast.error(form.message);
    }
  });

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

<svelte:head>
  <title>Sponsorship | CIO Awards Africa</title>
  <meta
    name="description"
    content="Partner with CIO Awards Africa. Explore sponsorship packages and connect your brand with Africa's top IT leaders and decision-makers."
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Hero Section -->
  <section
    class="relative py-24 bg-primary text-primary-foreground overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-background/20"
    ></div>
    <div
      class="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
    ></div>

    <div class="container mx-auto px-4 relative z-10 pt-16">
      <div class="max-w-4xl mx-auto text-center space-y-6">
        <Badge
          variant="outline"
          class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-primary-foreground/30 text-primary-foreground"
        >
          <Handshake class="size-3 mr-2 text-accent" />
          Partnership Opportunities
        </Badge>
        <h1 class="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Become a <span class="text-accent-foreground/80 italic">Sponsor</span>
        </h1>
        <p
          class="text-lg md:text-xl text-primary-foreground/80 font-medium max-w-2xl mx-auto"
        >
          Align your brand with Africa's most prestigious IT leadership
          recognition platform. Connect with 500+ C-suite executives and
          technology decision-makers.
        </p>
      </div>
    </div>
  </section>

  <!-- Why Sponsor Section -->
  <section class="py-16 bg-muted/30">
    <div class="container mx-auto px-4">
      <div class="text-center space-y-4 mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-foreground">
          Why Partner With Us?
        </h2>
        <p class="text-muted-foreground max-w-2xl mx-auto">
          Position your brand at the forefront of Africa's technology leadership
          community
        </p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        <div
          class="p-6 rounded-xl bg-card border border-border/50 text-center space-y-4"
        >
          <div
            class="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto"
          >
            <Users class="size-7" />
          </div>
          <h3 class="font-bold text-foreground">500+ Executives</h3>
          <p class="text-sm text-muted-foreground">
            Direct access to CIOs, CTOs, and IT directors
          </p>
        </div>
        <div
          class="p-6 rounded-xl bg-card border border-border/50 text-center space-y-4"
        >
          <div
            class="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto"
          >
            <Globe class="size-7" />
          </div>
          <h3 class="font-bold text-foreground">11 Countries</h3>
          <p class="text-sm text-muted-foreground">
            Pan-African reach across major economies
          </p>
        </div>
        <div
          class="p-6 rounded-xl bg-card border border-border/50 text-center space-y-4"
        >
          <div
            class="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto"
          >
            <Megaphone class="size-7" />
          </div>
          <h3 class="font-bold text-foreground">Media Coverage</h3>
          <p class="text-sm text-muted-foreground">
            Extensive press and social media exposure
          </p>
        </div>
        <div
          class="p-6 rounded-xl bg-card border border-border/50 text-center space-y-4"
        >
          <div
            class="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto"
          >
            <Star class="size-7" />
          </div>
          <h3 class="font-bold text-foreground">Brand Prestige</h3>
          <p class="text-sm text-muted-foreground">
            Association with IT excellence
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Packages Section -->
  <section class="py-16">
    <div class="container mx-auto px-4">
      <div class="text-center space-y-4 mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-foreground">
          Sponsorship Packages
        </h2>
        <p class="text-muted-foreground">
          Choose the partnership level that aligns with your objectives
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {#each data.packages as pkg}
          {@const Icon = packageIcons[pkg.id]}
          <Card class="relative overflow-hidden">
            <div
              class="absolute top-0 inset-x-0 h-2 bg-gradient-to-r {pkg.color}"
            ></div>
            <CardHeader class="text-center pt-6">
              <div
                class="size-14 rounded-xl bg-gradient-to-br {pkg.color} flex items-center justify-center mx-auto mb-4"
              >
                <Icon class="size-7 text-white" />
              </div>
              <CardTitle class="text-xl">{pkg.name}</CardTitle>
              <Button
                onclick={() => openSponsorshipModal(pkg.id)}
                variant="outline"
                class="w-full mt-4 border-primary/20 hover:bg-primary/5"
              >
                Contact Us
              </Button>
            </CardHeader>
            <CardContent>
              <ul class="space-y-2">
                {#each pkg.benefits as benefit}
                  <li class="flex items-start gap-2 text-sm">
                    <CheckCircle class="size-4 text-primary shrink-0 mt-0.5" />
                    <span class="text-muted-foreground">{benefit}</span>
                  </li>
                {/each}
              </ul>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <SponsorshipModal
    bind:open={isModalOpen}
    initialPackage={selectedPackage}
    packages={data.packages}
  />

  <!-- Partners & Sponsors Section (Moved from Awards Page) -->
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
          href="/awards/sponsorship#top"
          onclick={() => {
            const el = document.getElementById('sponsorship-form');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
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
</div>
