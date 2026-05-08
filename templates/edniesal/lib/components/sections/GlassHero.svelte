<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { ArrowRight } from "@lucide/svelte";
  import GlassCard from "$lib/components/widgets/GlassCard.svelte";
  import MeshGradient from "$lib/components/widgets/MeshGradient.svelte";

  let {
    title = "ECL Advantage",
    subtitle = "World-Class Governance",
    description = "Empowering Corporate Boards and C-Suite Executives with strategic excellence.",
    primaryCtaText = "Discover the Advantage",
    primaryCtaHref = "#advantage",
    secondaryCtaText = "Our Services",
    secondaryCtaHref = "/services",
  } = $props();
</script>

<section
  class="relative min-h-[60vh] flex items-center justify-center overflow-hidden py-4"
>
  <MeshGradient />

  <div class="container relative z-10 mx-auto px-4">
    <div class="flex flex-col items-center text-center">
      <GlassCard
        class="max-w-3xl animate-in fade-in slide-in-from-bottom-5 duration-700 p-4 border-border shadow-md"
      >
        <div
          class="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 mb-4"
        >
          <span
            class="text-xs font-semibold text-primary tracking-wide uppercase"
            >{subtitle}</span
          >
        </div>

        <h1
          class="font-heading text-4xl md:text-5xl font-bold mb-4 text-foreground leading-tight"
        >
          {title}
        </h1>

        <p
          class="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-4 leading-relaxed"
        >
          {description}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            href={primaryCtaHref}
            class="font-bold shadow-md transition-all hover:scale-105"
          >
            {primaryCtaText}
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>

          <Button
            href={secondaryCtaHref}
            variant="outline"
            class="text-foreground backdrop-blur-md"
          >
            {secondaryCtaText}
          </Button>
        </div>
      </GlassCard>

      <!-- Scroll Indicator (Reduced height and opacity) -->
      <div
        class="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce opacity-30"
      >
        <div
          class="w-5 h-8 border border-muted/30 rounded-full flex justify-center p-1"
        >
          <div class="w-1 h-1 bg-primary rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
</section>
