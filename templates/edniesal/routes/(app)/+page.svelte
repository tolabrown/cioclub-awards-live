<script lang="ts">
  import HeroCarousel from "$lib/components/sections/HeroCarousel.svelte";
  import * as Icons from "@lucide/svelte";
  import ConsultationForm from "$lib/components/sections/ConsultationForm.svelte";
  import ExecutiveProfiles from "$lib/components/sections/ExecutiveProfiles.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    ArrowRight,
    Globe,
    Zap,
    Heart,
    Shield,
    Sparkles,
    MessageSquare,
    CheckCircle2,
  } from "@lucide/svelte";
  import { Constants, SiteMeta } from "$lib/constants";
  import * as Card from "$lib/components/ui/card";
  import SEO from "$lib/components/widgets/SEO.svelte";

  let { data } = $props();
  // page content with fallbacks
  const page = $derived(data.page.data);
  const services = $derived(data.services);
  const leadership = $derived(data.leadership);

  const getIcon = (name: string) => {
    // @ts-ignore
    return Icons[name] || Shield;
  };
</script>

<SEO
  title={data.page.title}
  description={data.page.description}
  ogimage={data.page.ogimage}
/>

<div
  class="relative bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-hidden"
>
  <!-- Grid Background Overlay (Themed) -->
  <div
    class="fixed inset-0 pointer-events-none opacity-5 -z-20 [mask-image:linear-gradient(180deg,var(--foreground),transparent)]"
    style="background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, currentColor 39px, currentColor 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, currentColor 39px, currentColor 40px);"
  ></div>

  <HeroCarousel items={page.hero?.slides || []} />

  <!-- Core Expertise & Consultation Section -->
  <section id="expertise-consultation" class="py-16 md:py-24 relative overflow-hidden bg-background">
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10"
    ></div>

    <div class="container mx-auto px-4">
      <!-- Section header -->
      <div class="text-center max-w-3xl mx-auto mb-12">
        <div
          class="inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 mb-6"
        >
          <Sparkles class="size-4 text-primary mr-2" />
          <span class="text-xs font-bold text-primary tracking-widest uppercase"
            >What We Do</span
          >
        </div>
        <h2 class="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
          Our Core <span class="text-primary italic">Expertise</span> &
          <span class="text-primary italic">Consultation</span>
        </h2>
        <p class="text-muted-foreground font-medium">
          Comprehensive strategic advisory tailored for the African business
          landscape. Ready to start? Book a free consultation.
        </p>
      </div>

      <!-- 2-Column Grid: Services (left) + Form (right) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- Left Column: Core Expertise Services -->
        <div class="space-y-6">
          {#each services as service, i}
            {@const Icon = getIcon(service.iconName || 'Shield')}
            <div
              class="group relative"
            >
              <div
                class="relative p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow hover:border-primary/30 hover:shadow-md transition-all flex gap-4"
              >
                <div
                  class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                >
                  <Icon class="w-6 h-6" />
                </div>

                <div class="flex-1 min-w-0">
                  <h3
                    class="text-lg font-bold mb-2 tracking-tight group-hover:text-primary transition-colors"
                  >
                    {service.title}
                  </h3>

                  <p
                    class="text-sm text-muted-foreground leading-relaxed mb-3 font-medium"
                  >
                    {service.description}
                  </p>

                  {#if service.features && service.features.length > 0}
                    <div class="flex flex-wrap gap-2">
                      {#each service.features.slice(0, 4) as feature}
                        <span
                          class="inline-flex items-center gap-1 text-xs font-medium text-foreground/70 bg-muted/50 px-2 py-1 rounded-lg"
                        >
                          <CheckCircle2 class="w-3 h-3 text-primary shrink-0" />
                          {feature}
                        </span>
                      {/each}
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}

          <div class="pt-2">
            <Button href="/services" variant="outline" class="w-full">
              View All Services <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Right Column: Consultation Form (sticky) -->
        <div class="lg:sticky lg:top-24">
          <ConsultationForm />
        </div>
      </div>
    </div>
  </section>

  <!-- Our Commitment to Excellence Section -->
  <div id="mission-vision" class="py-24 bg-background relative overflow-hidden">
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"
    ></div>

    <div class="container mx-auto px-4 relative z-10">
      <div class="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight">
          Our Commitment to Excellence
        </h2>
        <p class="text-muted-foreground font-medium">
          Join our mission to transform African enterprises through world-class
          advisory and strategic governance.
        </p>
        <div class="flex justify-center gap-1">
          <Sparkles class="size-4 text-primary/40 animate-pulse" />
          <Sparkles class="size-3 text-primary/20 animate-pulse delay-700" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <!-- Card 1: Foundations (Mission & Vision) -->
        <Card.Root
          class="border-border/40 bg-card/40 backdrop-blur-md shadow-lg overflow-hidden group hover:border-primary/30 transition-all duration-500 rounded-xl relative"
        >
          <div
            class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <Heart class="size-32 text-primary floating-icon" />
          </div>

          <Card.Content class="p-10 space-y-10 relative z-10">
            <div class="space-y-6">
              <div class="flex items-start gap-5 group/item">
                <div
                  class="size-12 rounded-xl gsorange flex items-center justify-center shadow-sm border border-orange-500/10 group-hover/item:bg-orange-500 group-hover/item:text-white transition-all duration-300 shrink-0"
                >
                  <Zap class="size-6" />
                </div>
                <div>
                  <h3
                    class="text-xs font-bold text-orange-600 dark:text-orange-500 tracking-widest uppercase mb-2"
                  >
                    {page.mission?.title || "Our Mission"}
                  </h3>
                  <p class="text-muted-foreground">
                    {page.mission?.content || "No mission content available."}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-5 group/item">
                <div
                  class="size-12 rounded-xl gsgreen flex items-center justify-center shadow-sm border border-green-500/10 group-hover/item:bg-green-600 group-hover/item:text-white transition-all duration-300 shrink-0"
                >
                  <Globe class="size-6" />
                </div>
                <div>
                  <h3
                    class="text-xs font-bold text-green-700 dark:text-green-500 tracking-widest uppercase mb-2"
                  >
                    {page.vision?.title || "Our Vision"}
                  </h3>
                  <p class="text-muted-foreground">
                    {page.vision?.content || "No vision content available."}
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-6 border-t border-border/40 flex items-center gap-3">
              <div class="flex -space-x-2">
                <div
                  class="size-6 rounded-full border-2 border-background gsorange flex items-center justify-center shadow-sm"
                >
                  <Sparkles class="size-3" />
                </div>
                <div
                  class="size-6 rounded-full border-2 border-background gsgreen flex items-center justify-center shadow-sm"
                >
                  <Heart class="size-3" />
                </div>
                <div
                  class="size-6 rounded-full border-2 border-background bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-sm"
                >
                  <Shield class="size-3" />
                </div>
              </div>
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mt-0.5"
              >
                Driving African Innovation
              </p>
            </div>
          </Card.Content>
        </Card.Root>

        <!-- Card 2: Value & Impact (ECL Edge & Stats) -->
        <Card.Root
          class="border-border/40 bg-card/40 backdrop-blur-md shadow-lg overflow-hidden group hover:border-blue-500/30 transition-all duration-500 rounded-xl relative"
        >
          <div
            class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <Shield class="size-32 text-blue-500 floating-icon-delayed" />
          </div>

          <Card.Content class="p-10 flex flex-col h-full relative z-10">
            <div class="mb-8">
              <div
                class="inline-flex items-center rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-1 mb-4"
              >
                <span
                  class="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase"
                  >The ECL Edge</span
                >
              </div>
              <h3 class="text-2xl font-bold mb-4 tracking-tight">
                {page.eclEdge?.title || "ECL Edge"}
              </h3>
              <p class="text-muted-foreground">
                {page.eclEdge?.content || "No ECL Edge content available."}
              </p>
            </div>

            <div class="mt-auto pt-8 border-t border-border/40">
              <div class="grid grid-cols-3 gap-4">
                {#if page.stats && page.stats.length > 0}
                  <div class="text-center group/stat">
                    <div
                      class="text-2xl md:text-3xl font-bold text-blue-500 mb-1 group-hover/stat:scale-110 transition-transform"
                    >
                      {page.stats[0]?.value}
                    </div>
                    <div
                      class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 leading-tight"
                    >
                      {page.stats[0]?.label}
                    </div>
                  </div>
                  <div class="text-center group/stat">
                    <div
                      class="text-2xl md:text-3xl font-bold text-orange-500 mb-1 group-hover/stat:scale-110 transition-transform"
                    >
                      {page.stats[1]?.value}
                    </div>
                    <div
                      class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 leading-tight"
                    >
                      {page.stats[1]?.label}
                    </div>
                  </div>
                  <div class="text-center group/stat">
                    <div
                      class="text-2xl md:text-3xl font-bold text-emerald-500 mb-1 group-hover/stat:scale-110 transition-transform"
                    >
                      {page.stats[2]?.value}
                    </div>
                    <div
                      class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 leading-tight"
                    >
                      {page.stats[2]?.label}
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </Card.Content>
          <div
            class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/40 via-orange-500/40 to-emerald-500/40 opacity-30"
          ></div>
        </Card.Root>
      </div>
    </div>
  </div>

  <ExecutiveProfiles leaders={leadership} />

  <!-- Premium CTA Section -->
  <section class="py-20 relative overflow-hidden">
    <div class="container mx-auto px-4 relative z-10">
      <div
        class="glass border-border p-4 lg:p-12 rounded-xl text-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 shadow-lg"
      >
        <div class="relative z-10 max-w-3xl mx-auto">
          <h2 class="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Ready to <span class="text-primary">Transform</span> Your Organization?
          </h2>
          <p
            class="text-lg text-muted-foreground mb-8 font-medium leading-relaxed"
          >
            Join the elite circle of African enterprises guided by world-class
            governance and strategy.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/contact"
              variant="default"
              class="shadow-lg shadow-primary/20 transition-all hover:scale-105"
            >
              Work With Us <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
            <Button href="/services" variant="outline" class="backdrop-blur-md">
              Explore Services
            </Button>
          </div>

          <div
            class="mt-12 pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left"
          >
            <div class="space-y-1">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-primary/60"
              >
                Direct Support
              </p>
              <div class="flex flex-col gap-2">
                <div
                  class="flex items-center justify-between md:justify-start gap-4"
                >
                  <a
                    href="tel:{Constants.ADESEWA_PHONE}"
                    class="text-sm font-bold hover:text-primary transition-colors"
                  >
                    Adesewa Jethro
                  </a>
                  <a
                    href={Constants.ADESEWA_WHATSAPP as string}
                    target="_blank"
                    class="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                  >
                    <MessageSquare class="size-4" />
                  </a>
                </div>
                <div
                  class="flex items-center justify-between md:justify-start gap-4"
                >
                  <a
                    href="tel:{Constants.CORDELIA_PHONE}"
                    class="text-sm font-bold hover:text-primary transition-colors"
                  >
                    Dr. Cordelia Ilori
                  </a>
                  <a
                    href={Constants.CORDELIA_WHATSAPP as string}
                    target="_blank"
                    class="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                  >
                    <MessageSquare class="size-4" />
                  </a>
                </div>
              </div>
            </div>

            <div class="w-px h-12 bg-primary/10 hidden md:block"></div>

            <div class="space-y-1">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-primary/60"
              >
                Email Support
              </p>
              <a
                href="mailto:{Constants.SUPPORTEMAIL}"
                class="text-sm font-bold hover:text-primary transition-colors block"
              >
                {Constants.SUPPORTEMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
