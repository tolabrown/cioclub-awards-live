<script lang="ts">
  import GlassCard from "$lib/components/widgets/GlassCard.svelte";
  import { Shield, ShieldCheck } from "@lucide/svelte";
  import * as Icons from "@lucide/svelte";

  let { services = [] } = $props();

  const getIcon = (name: string) => {
    // @ts-ignore
    return Icons[name] || Shield;
  };
</script>

<section id="services" class="py-4 relative overflow-hidden bg-background">
  <div class="container mx-auto px-4 relative z-10">
    <div class="max-w-3xl mb-4">
      <h2
        class="font-heading text-3xl md:text-4xl font-bold mb-4 text-foreground"
      >
        Elevating Governance Standards
      </h2>
      <p class="text-base text-muted-foreground font-sans">
        Our specialized consultancy services are designed to address the unique
        challenges of corporate boards and scaling businesses.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each services as service, i}
        {@const Icon = getIcon(service.iconName)}
        <GlassCard
          class="group p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm"
          style="animation-delay: {i * 100}ms"
        >
          <div
            class="w-12 h-12 rounded-xl bg-primary/5 border border-border flex items-center justify-center mb-4 group-hover:border-primary/30 transition-all duration-300"
          >
            <Icon class="w-6 h-6 text-primary" />
          </div>
          <h3
            class="font-heading text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors"
          >
            {service.title}
          </h3>
          <p class="text-sm text-muted-foreground leading-relaxed font-sans">
            {service.description}
          </p>

          <div
            class="mt-4 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300"
          >
            Learn More <ShieldCheck class="ml-1 w-3 h-3" />
          </div>
        </GlassCard>
      {/each}
    </div>
  </div>

  <!-- Subtle Background Decorations (Themed) -->
  <div
    class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"
  ></div>
</section>
