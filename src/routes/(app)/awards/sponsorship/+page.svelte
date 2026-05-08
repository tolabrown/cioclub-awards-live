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
</div>
