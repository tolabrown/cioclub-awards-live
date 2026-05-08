<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Check,
    Star,
    Crown,
    Users,
    ChevronRight,
    Search,
    Lock,
    Globe,
    ExternalLink,
    Mail,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    ShieldCheck,
    Zap,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  let selectedTier = $state("gold");

  const tiers = [
    {
      id: "individual",
      name: "Individual",
      description:
        "Ideal for individual tech leaders and professionals looking to connect.",
      price: "$250",
      badge: "Standard",
      features: ["Event Access", "Member Directory", "Resource Hub"],
    },
    {
      id: "corporate",
      name: "Corporate",
      description:
        "Designed for organizations to empower their tech leadership teams.",
      price: "$1,500",
      badge: "Institutional",
      features: [
        "Team Access (5 seats)",
        "Corporate Branding",
        "Priority Support",
      ],
    },
    {
      id: "executive",
      name: "Executive",
      description: "Premium access for C-suite leaders and decision-makers.",
      price: "$2,500",
      badge: "Elite",
      highlight: true,
      features: [
        "VIP Gala Access",
        "Executive Mentorship",
        "Private Networking Events",
      ],
    },
    {
      id: "sponsor",
      name: "Sponsor",
      description:
        "Maximum visibility and strategic alignment with CIO Club events.",
      price: "Enquire",
      badge: "Strategic",
      features: [
        "Brand Placement",
        "Speaking Opportunities",
        "Strategic Partnerships",
      ],
    },
    {
      id: "partner",
      name: "Partner",
      description:
        "Deep integration and collaboration on industry initiatives.",
      price: "Custom",
      badge: "Collaborative",
      features: [
        "Joint Initiatives",
        "Industry Representation",
        "Co-branded Content",
      ],
    },
  ];
</script>

<div class="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
  <!-- Progress Header -->
  <header
    class="sticky top-16 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-border py-8"
  >
    <div class="container max-w-4xl mx-auto px-4 space-y-6">
      <div class="flex justify-between items-center px-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-foreground">
          Membership Selection
        </h2>
        <span class="text-xs font-bold text-primary">STEP 3 OF 3</span>
      </div>
      <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-primary transition-all duration-1000"
          style="width: 100%;"
        ></div>
      </div>
    </div>
  </header>

  <main class="flex-1 py-20 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
    <div class="container max-w-5xl mx-auto px-4 space-y-16">
      <!-- Title Section -->
      <div class="text-center space-y-6">
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
        >
          <Crown class="size-4" />
          Elite Access
        </div>
        <h1
          class="text-4xl lg:text-5xl font-bold text-foreground tracking-tight"
        >
          Choose Your Path to <span class="text-primary italic">Leadership</span
          >
        </h1>
        <p
          class="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Select the tier that best fits your professional needs and networking
          goals within the pan-African C-Suite community.
        </p>
      </div>

      <!-- Tier Selection Cards -->
      <div class="grid lg:grid-cols-2 gap-8">
        {#each tiers as tier}
          <button
            onclick={() => (selectedTier = tier.id)}
            class={cn(
              "relative text-left p-10 rounded-xl border-2 transition-all duration-500 group flex flex-col justify-between overflow-hidden",
              selectedTier === tier.id
                ? "bg-primary border-primary shadow-lg text-primary-foreground transform scale-[1.02]"
                : "bg-card border-border text-foreground hover:border-primary/30 hover:shadow-md",
            )}
          >
            <!-- Decorative Icon -->
            <div
              class={cn(
                "absolute -right-8 -top-8 size-48 opacity-5 transition-transform duration-700",
                selectedTier === tier.id
                  ? "group-hover:scale-125 group-hover:rotate-12"
                  : "",
              )}
            >
              <ShieldCheck class="size-full" />
            </div>

            <div class="space-y-8 relative z-10">
              <div class="flex justify-between items-start">
                <div class="space-y-2">
                  <Badge
                    class={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      selectedTier === tier.id
                        ? "bg-primary-foreground text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tier.badge}
                  </Badge>
                  <h3 class="text-3xl font-bold tracking-tight">
                    {tier.name}
                  </h3>
                </div>
                <div class="text-right">
                  <p
                    class={cn(
                      "text-3xl font-bold tracking-tight",
                      selectedTier === tier.id
                        ? "text-primary-foreground"
                        : "text-primary",
                    )}
                  >
                    {tier.price}
                  </p>
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest opacity-60"
                  >
                    Per Annum
                  </p>
                </div>
              </div>

              <p
                class={cn(
                  "text-lg font-medium leading-relaxed",
                  selectedTier === tier.id
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground",
                )}
              >
                {tier.description}
              </p>

              <!-- Features List -->
              <div class="space-y-4 pt-4">
                {#each tier.features as feature}
                  <div class="flex items-center gap-3">
                    <CheckCircle2
                      class={cn(
                        "size-5",
                        selectedTier === tier.id
                          ? "text-primary-foreground"
                          : "text-primary",
                      )}
                    />
                    <span class="text-sm font-bold">{feature}</span>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Radio Indicator -->
            <div class="mt-10 flex justify-end">
              <div
                class={cn(
                  "size-10 rounded-full border-2 flex items-center justify-center transition-all",
                  selectedTier === tier.id
                    ? "bg-primary-foreground border-primary-foreground shadow-md"
                    : "border-border",
                )}
              >
                {#if selectedTier === tier.id}
                  <Check class="size-6 text-primary stroke-[4]" />
                {/if}
              </div>
            </div>
          </button>
        {/each}
      </div>

      <!-- Info Card -->
      <div
        class="max-w-3xl mx-auto p-8 rounded-xl bg-primary/5 border border-primary/10 flex gap-8 items-center text-primary"
      >
        <Zap class="size-10 shrink-0" />
        <p class="text-base font-bold leading-relaxed">
          Membership tiers are billed annually. You can upgrade or modify your
          institutional plan at any time through your executive dashboard
          settings.
        </p>
      </div>
    </div>
  </main>

  <!-- Bottom Action Bar -->
  <footer
    class="sticky bottom-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-border py-8"
  >
    <div
      class="container max-w-4xl mx-auto px-4 flex flex-col sm:flex-row gap-6 items-center justify-between"
    >
      <Button
        variant="ghost"
        class="font-bold uppercase text-xs tracking-widest text-muted-foreground hover:text-primary transition-all gap-2"
      >
        <ArrowLeft class="size-4" />
        Corporate Details
      </Button>
      <Button
        class="w-full sm:w-auto px-20 h-16 rounded-xl font-bold uppercase text-sm tracking-widest shadow-lg hover:bg-primary/90 transition-all active:scale-95 gap-3"
      >
        Complete Registration
        <ArrowRight class="size-4" />
      </Button>
    </div>
  </footer>
</div>
