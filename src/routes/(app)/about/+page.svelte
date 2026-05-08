<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as Icons from "@lucide/svelte";
  import { Target, Lightbulb, Shield, Zap } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  let { data } = $props();

  // Robust fallback for content structure
  const content = $derived({
    hero: { title: "", subtitle: "", description: "" },
    mission: { title: "", description: "" },
    vision: { title: "", description: "" },
    coreValues: [],
    objectives: [],
    ...data.content,
  });

  function getIcon(name: string) {
    return (Icons as any)[name] || Icons.Shield;
  }

  // Helper to normalize color to tailwind class
  function getColorClass(color: string, type: "text" | "bg") {
    if (!color) return type === "text" ? "text-primary" : "bg-primary/20";
    if (color.startsWith("text-") || color.startsWith("bg-")) {
      const base = color
        .split("-")
        .slice(1)
        .join("-")
        .replace("/10", "")
        .replace("/20", "");
      const toReturn = type === "text" ? `text-${base}` : `bg-${base}/20`;
      return toReturn;
    }
    const toReturn = type === "text" ? `text-${color}` : `bg-${color}/20`;
    return toReturn;
  }
</script>

<div class="min-h-screen">
  <!-- Hero Section -->
  <section
    class="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-primary text-primary-foreground"
  >
    <div class="absolute inset-0 bg-grid-white opacity-5"></div>
    <div class="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center space-y-4">
      <Badge
        variant="outline"
        class="text-primary-foreground border-primary-foreground/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
        >{content.hero.subtitle}</Badge
      >
      <h1 class="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
        {content.hero.title}
      </h1>
      <p
        class="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto font-medium leading-relaxed"
      >
        {content.hero.description}
      </p>
    </div>
  </section>

  <!-- Mission & Vision -->
  <section class="py-16 md:py-24 bg-background overflow-x-hidden">
    <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
      <div class="grid md:grid-cols-2 gap-4">
        <div
          class="space-y-6 group p-8 lg:p-12 rounded-2xl bg-muted/30 border border-border hover:border-primary/20 transition-all duration-500"
        >
          <div
            class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
          >
            <Target class="size-6" />
          </div>
          <h2 class="text-3xl font-bold tracking-tight">
            {content.mission.title}
          </h2>
          <p class="text-lg text-muted-foreground leading-relaxed">
            {content.mission.description}
          </p>
        </div>

        <div
          class="space-y-4 group p-8 lg:p-12 rounded-2xl bg-muted/30 border border-border hover:border-primary/20 transition-all duration-500"
        >
          <div
            class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
          >
            <Lightbulb class="size-6" />
          </div>
          <h2 class="text-3xl font-bold tracking-tight">
            {content.vision.title}
          </h2>
          <p class="text-lg text-muted-foreground leading-relaxed">
            {content.vision.description}
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Core Values -->
  <section class="py-24 bg-muted/50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16 space-y-4">
        <h2 class="text-4xl font-bold tracking-tight">OUR CORE VALUES</h2>
        <div class="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {#each content.coreValues as value, i}
          {@const Icon = getIcon(value.iconName)}
          <div
            class="bg-card p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4 group"
          >
            <div
              class={cn(
                "size-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                getColorClass(value.color, "bg"),
              )}
            >
              <Icon class={cn("size-7", getColorClass(value.color, "text"))} />
            </div>
            <div class="space-y-4">
              <h3 class="text-xl font-bold">{value.title}</h3>
              <p class="text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Key Objectives -->
  <section class="py-32 bg-background relative overflow-hidden">
    <!-- Abstract background element -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none"
    ></div>

    <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-xl mb-20 space-y-4">
        <h2 class="text-4xl font-bold tracking-tight uppercase">
          Key Objectives
        </h2>
        <p class="text-xl text-muted-foreground font-medium">
          Through advocacy, thought leadership, empowerment, and research, the CIO & C-Suite Club Africa aims to strengthen collaboration among Africa’s technology leaders and accelerate sustainable digital transformation across the continent.
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-4">
        {#each content.objectives as objective, i}
          {@const Icon = getIcon(objective.iconName)}
          <div class="flex gap-4 group">
            <div class="flex flex-col items-center">
              <div
                class="size-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500"
              >
                <Icon class="size-8" />
              </div>
              <!-- {#if i < 2}
                <div
                  class="w-px h-full bg-border/50 my-6 hidden lg:block"
                ></div>
              {/if} -->
            </div>
            <div class="space-y-4 pt-2">
              <h3
                class="text-2xl font-bold tracking-tight uppercase group-hover:text-primary transition-colors"
              >
                {objective.title}
              </h3>
              <p
                class="text-lg text-muted-foreground leading-relaxed font-medium"
              >
                {objective.description}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Community Impact -->
  <section class="py-32 bg-slate-950 text-white overflow-hidden relative">
    <div class="absolute inset-0 bg-primary/20 bg-grid-white opacity-5"></div>
    <div class="container mx-auto px-4 relative z-10">
      <div class="grid lg:grid-cols-2 gap-20 items-center">
        <div class="space-y-4">
          <div class="space-y-4">
            <h2 class="text-4xl lg:text-6xl font-bold leading-tight">
              Empowering Africa's <span class="text-primary italic"
                >Top Tier</span
              > Tech Talent
            </h2>
            <p
              class="text-xl text-gray-400 font-medium max-w-xl leading-relaxed"
            >
              We provide the framework for professional excellence, ensuring
              African technology leaders are equipped for the global stage.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-4">
              <p class="text-5xl font-bold text-primary">500+</p>
              <p
                class="text-sm font-bold uppercase tracking-widest text-gray-500"
              >
                Active Members
              </p>
            </div>
            <div class="space-y-4">
              <p class="text-5xl font-bold text-primary">15+</p>
              <p
                class="text-sm font-bold uppercase tracking-widest text-gray-500"
              >
                African Nations
              </p>
            </div>
            <div class="space-y-4">
              <p class="text-5xl font-bold text-primary">120M</p>
              <p
                class="text-sm font-bold uppercase tracking-widest text-gray-500"
              >
                Combined OpEx Managed
              </p>
            </div>
            <div class="space-y-4">
              <p class="text-5xl font-bold text-primary">1k+</p>
              <p
                class="text-sm font-bold uppercase tracking-widest text-gray-500"
              >
                Annual Engagements
              </p>
            </div>
          </div>
        </div>

        <div class="relative group">
          <div
            class="absolute -inset-4 bg-primary/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"
          ></div>
          <div
            class="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2006&auto=format&fit=crop"
              alt="Impact"
              class="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-32 bg-background">
    <div class="container mx-auto px-4 space-y-4">
      <div
        class="bg-primary text-primary-foreground rounded-xl p-12 lg:p-24 text-center space-y-4 relative overflow-hidden shadow-lg"
      >
        <div class="absolute inset-0 bg-grid-white opacity-5"></div>
        <div class="max-w-3xl mx-auto space-y-4 relative z-10">
          <h2 class="text-4xl lg:text-5xl font-bold text-primary-foreground">
            Be Part of the Leadership Journey
          </h2>
          <p class="text-xl text-primary-foreground/80 font-medium">
            Join Africa's most elite circle of digital innovators and strategic
            decision-makers.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <Button
              variant="secondary"
              href="/membership"
              class="font-bold shadow-lg shadow-primary/30 transition-all active:scale-95"
            >
              Membership Plans
            </Button>
            <Button
              variant="outline"
              href="/contact"
              class="font-bold border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 transition-all"
            >
              Consult with Us
            </Button>
          </div>
        </div>
      </div>

      <!-- Team CTA Section -->
      <div
        class="relative p-8 lg:p-12 rounded-xl bg-gradient-to-br from-muted/50 via-background to-muted/30 border border-border shadow-md group overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-[radial-gradient(#135bec11_1px,transparent_1px)] [background-size:20px:20px] opacity-40 rounded-xl"
        ></div>
        <div
          class="relative flex flex-col md:flex-row items-center justify-between gap-8 z-10"
        >
          <div class="space-y-4 text-center md:text-left">
            <h3 class="text-3xl font-bold tracking-tight text-foreground">
              Meet the Visionaries
            </h3>
            <p class="text-lg text-muted-foreground font-medium max-w-xl">
              Discover the strategic leaders and dedicated stakeholders driving
              our pan-African technology agenda.
            </p>
          </div>
          <Button
            href="/team"
            variant="outline"
            class="group/btn h-12 px-8 rounded-lg font-bold border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-primary-foreground dark:hover:text-primary transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95"
          >
            Our Team
            <Icons.Users
              class="ml-2 size-5 group-hover/btn:scale-110 transition-transform"
            />
          </Button>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  :global(.bg-grid-white) {
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    );
    background-size: 24px 24px;
  }
</style>
