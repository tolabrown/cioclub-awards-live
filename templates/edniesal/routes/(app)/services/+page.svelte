<script lang="ts">
  import MeshGradient from "$lib/components/widgets/MeshGradient.svelte";
  import {
    Shield,
    CheckCircle2,
    ArrowRight,
    Search,
    Users,
    Briefcase,
    Zap,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Icons from "@lucide/svelte";

  let { data } = $props();
  const page = $derived(data.page.data);

  const getIcon = (name: string) => {
    // @ts-ignore
    return Icons[name] || Shield;
  };
</script>

<svelte:head>
  <title>{data.page.title}</title>
  <meta name="description" content={data.page.description} />
</svelte:head>

<div
  class="bg-background min-h-screen text-foreground relative overflow-hidden"
>
  <!-- Grid Pattern -->
  <div
    class="fixed inset-0 pointer-events-none opacity-5 -z-20 [mask-image:linear-gradient(180deg,var(--foreground),transparent)]"
    style="background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, currentColor 39px, currentColor 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, currentColor 39px, currentColor 40px);"
  ></div>

  <!-- Hero Section -->
  <section
    class="relative py-32 overflow-hidden flex items-center justify-center min-h-[50vh]"
  >
    <MeshGradient />
    <div class="container mx-auto px-4 relative z-10 text-center">
      <div
        class="inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 mb-6 animate-in fade-in slide-in-from-bottom-4"
      >
        <Zap class="w-4 h-4 text-primary mr-2" />
        <span class="text-xs font-bold text-primary tracking-widest uppercase"
          >World-Class Solutions</span
        >
      </div>
      <h1
        class="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        Strategic Excellence for <br /><span class="text-primary italic"
          >Global Impact</span
        >
      </h1>
      <p
        class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        Empowering organizations with robust governance frameworks and strategic
        advisory to navigate complex business landscapes in Africa and beyond.
      </p>
    </div>
  </section>

  <!-- Detailed Services Grid -->
  <section class="py-24 relative">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {#each page.list || [] as service, i}
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
                  href="/contact"
                  variant="outline"
                  class="group/btn rounded-xl font-bold w-full transition-all hover:bg-primary hover:text-white"
                >
                  Consult With Experts
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

  <!-- CTA Section -->
  <section class="py-24 relative">
    <div class="container mx-auto px-4">
      <div
        class="glass border-border p-12 rounded-2xl text-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 shadow-xl"
      >
        <h2 class="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
          Not sure which service you need?
        </h2>
        <p
          class="text-lg text-muted-foreground mb-10 max-w-xl mx-auto font-medium"
        >
          Our experts are ready to conduct a preliminary assessment and guide
          you toward the best strategic path for your organization.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            href="/contact"
            class="rounded-xl shadow-lg shadow-primary/20 transition-transform hover:scale-105"
          >
            Initial Assessment <ArrowRight class="ml-2 w-4 h-4" />
          </Button>
          <Button
            href="/about"
            variant="outline"
            class="rounded-xl backdrop-blur-md"
          >
            Learn About Our Hub
          </Button>
        </div>
      </div>
    </div>
  </section>
</div>
