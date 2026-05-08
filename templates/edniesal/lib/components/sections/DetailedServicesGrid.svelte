<script lang="ts">
  import { Shield, CheckCircle2, ArrowRight } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Icons from "@lucide/svelte";

  let { services = [] } = $props();

  const getIcon = (name: string) => {
    // @ts-ignore
    return Icons[name] || Shield;
  };
</script>

<section class="py-24 relative overflow-hidden bg-background">
  <div class="container mx-auto px-4">
    <div class="text-center max-w-3xl mx-auto mb-16">
      <h2 class="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
        Our Core <span class="text-primary italic">Expertise</span>
      </h2>
      <p class="text-muted-foreground font-medium text-lg">
        Comprehensive strategic advisory and governance solutions tailored for
        the African business landscape.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {#each services as service, i}
        {@const Icon = getIcon(service.iconName || "Shield")}
        <div
          class="group relative animate-in fade-in slide-in-from-bottom-8 duration-700"
          style="animation-delay: {i * 100}ms"
        >
          <div
            class="absolute -inset-2 bg-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
          ></div>
          <div
            class="relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:border-primary/30 transition-all h-full flex flex-col"
          >
            <div
              class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
            >
              <Icon class="w-7 h-7" />
            </div>

            <h2
              class="text-2xl font-bold mb-4 tracking-tight group-hover:text-primary transition-colors"
            >
              {service.title}
            </h2>

            <p
              class="text-muted-foreground leading-relaxed mb-6 flex-grow font-medium"
            >
              {service.description}
            </p>

            {#if service.features && service.features.length > 0}
              <div class="grid grid-cols-1 gap-3 mb-8">
                {#each service.features as feature}
                  <div
                    class="flex items-center gap-2 text-sm text-foreground/80 font-medium"
                  >
                    <CheckCircle2 class="w-4 h-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </div>
                {/each}
              </div>
            {/if}

            <div class="mt-auto pt-6 border-t border-border/30">
              <Button
                href="/consultation"
                variant="outline"
                class="group/btn rounded-xl font-bold w-full transition-all hover:bg-primary hover:text-white"
              >
                Discuss with Experts
                <ArrowRight
                  class="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                />
              </Button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
