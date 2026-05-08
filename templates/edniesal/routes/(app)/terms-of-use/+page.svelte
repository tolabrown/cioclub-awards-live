<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Scale,
    ChevronRight,
    ListFilter,
    CheckCircle2,
    FileSignature,
    Gavel,
    ShieldAlert,
    ArrowRight,
    Mail,
  } from "@lucide/svelte";

  let { data } = $props();
  const page = $derived(data.page.data);

  // Icon mapping
  const icons: Record<string, any> = {
    Scale,
    CheckCircle2,
    FileSignature,
    Gavel,
    ShieldAlert,
  };

  const sections = $derived(page.sections || []);
</script>

<svelte:head>
  <title>{data.page.title}</title>
  <meta name="description" content={data.page.description} />
</svelte:head>

<div class="min-h-screen">
  <!-- Hero Section -->
  <section class="relative py-24 bg-primary overflow-hidden">
    <div
      class="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
    ></div>
    <div class="container mx-auto px-4 relative z-10 space-y-6 pt-16">
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
      >
        <Scale class="size-4" />
        Legal Framework
      </div>
      <div class="space-y-2">
        <h1 class="text-4xl lg:text-6xl font-bold text-white tracking-tight">
          Terms of Use
        </h1>
        <p class="text-white/80 font-medium whitespace-nowrap">
          Last updated: {page.lastUpdated}
        </p>
      </div>
    </div>
  </section>

  <!-- Content Section -->
  <section class="py-24">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-12 gap-8">
        <!-- Sidebar Navigation -->
        <aside class="lg:col-span-4">
          <div class="sticky top-32 space-y-4">
            <div
              class="p-8 rounded-xl border border-border space-y-6"
            >
              <div class="flex items-center gap-3">
                <ListFilter class="size-5 text-primary" />
                <h3
                  class="text-lg font-bold uppercase tracking-tight text-foreground"
                >
                  Navigation
                </h3>
              </div>
              <nav class="space-y-2">
                {#each sections as section}
                  <a
                    href="#{section.id}"
                    class="flex items-center justify-between p-4 rounded-xl hover:bg-white hover:shadow-md transition-all group border border-transparent hover:border-border"
                  >
                    <span
                      class="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors"
                    >
                      {section.title}
                    </span>
                    <ChevronRight
                      class="size-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </a>
                {/each}
              </nav>
            </div>

            <!-- Governance CTA -->
            <div
              class="p-8 rounded-xl bg-primary text-white space-y-4 shadow-lg relative overflow-hidden"
            >
              <div class="absolute -right-8 -bottom-8 opacity-10">
                <Gavel class="size-40" />
              </div>
              <h3
                class="text-xl font-bold uppercase tracking-tight relative z-10"
              >
                Governance Team
              </h3>
              <p
                class="text-white/80 font-medium leading-relaxed relative z-10"
              >
                Have questions about these terms or our legal framework?
              </p>
              <Button
                variant="secondary"
                class="w-full rounded-xl font-bold uppercase text-xs tracking-widest relative z-10 gap-3"
                href="/contact"
              >
                Contact Us
                <ArrowRight class="size-4" />
              </Button>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="lg:col-span-8 space-y-16 max-w-3xl">
          {#each sections as section, i}
            {@const Icon = icons[section.icon] || Scale}
            <section id={section.id} class="scroll-mt-32 space-y-6">
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <div
                    class="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
                  >
                    <Icon class="size-6" />
                  </div>
                  <h2 class="text-3xl font-bold text-foreground tracking-tight">
                    {section.title}
                  </h2>
                </div>
                <div class="h-1 w-20 bg-primary rounded-full"></div>
              </div>

              {#if section.content}
                <p
                  class="text-lg text-muted-foreground font-medium leading-relaxed"
                >
                  {section.content}
                </p>
              {/if}

              {#if section.items}
                <div class="grid gap-4">
                  {#each section.items as item}
                    <div
                      class="flex gap-4 items-start p-6 rounded-xl border border-border shadow-sm"
                    >
                      <CheckCircle2 class="size-6 text-primary mt-1 shrink-0" />
                      <div>
                        <h4
                          class="font-bold text-foreground uppercase text-xs tracking-widest mb-1"
                        >
                          {item.title}
                        </h4>
                        <p class="text-base text-muted-foreground font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </section>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- Legal Footer -->
  <footer class="border-t border-border py-20">
    <div class="container mx-auto px-4 text-center space-y-4">
      <p class="text-sm font-bold uppercase tracking-widest text-foreground">
        More Information
      </p>
      <div class="flex flex-wrap gap-4 justify-center">
        <Button
          variant="outline"
          href="/privacy"
          class="rounded-xl uppercase text-xs tracking-widest border-2"
        >
          Privacy Policy
        </Button>
        <Button
          variant="outline"
          href="/cookie-policy"
          class="rounded-xl uppercase text-xs tracking-widest border-2"
        >
          Cookie Policy
        </Button>
      </div>
      <p class="text-xs text-muted-foreground pt-4">
        © {new Date().getFullYear()} Edniesal Consulting. All Rights Reserved.
      </p>
    </div>
  </footer>
</div>
