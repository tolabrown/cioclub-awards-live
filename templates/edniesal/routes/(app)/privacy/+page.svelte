<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    ShieldCheck,
    ChevronRight,
    ListFilter,
    Search,
    FileText,
    Lock,
    Scale,
    Mail,
    Verified,
  } from "@lucide/svelte";

  let { data } = $props();
  const page = $derived(data.page.data);

  // Icon mapping
  const icons: Record<string, any> = {
    ShieldCheck,
    Search,
    FileText,
    Lock,
    Scale,
    Verified,
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
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/30 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
      >
        <ShieldCheck class="size-4" />
        Governance & Transparency
      </div>
      <div class="space-y-2">
        <h1 class="text-4xl lg:text-6xl font-bold text-white tracking-tight">
          Privacy Policy
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
                  Table of Contents
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

            <!-- Compliance CTA -->
            <div
              class="p-8 rounded-xl bg-primary text-white space-y-4 shadow-lg relative overflow-hidden"
            >
              <div class="absolute -right-8 -bottom-8 opacity-10">
                <ShieldCheck class="size-40" />
              </div>
              <h3
                class="text-xl font-bold uppercase tracking-tight relative z-10"
              >
                Compliance Support
              </h3>
              <p
                class="text-white/80 font-medium leading-relaxed relative z-10"
              >
                Have specific questions about how your data is handled?
              </p>
              <Button
                variant="secondary"
                class="w-full rounded-xl font-bold uppercase text-xs tracking-widest relative z-10 gap-3"
                href="/contact"
              >
                Contact Compliance
                <Mail class="size-4" />
              </Button>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="lg:col-span-8 space-y-16 max-w-3xl">
          {#each sections as section}
            {@const Icon = icons[section.icon] || Lock}
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

              {#if section.points}
                <div
                  class="p-8 rounded-xl border border-border space-y-4"
                >
                  <h4
                    class="font-bold uppercase text-xs tracking-widest text-primary"
                  >
                    Primary Data Points
                  </h4>
                  <ul class="grid sm:grid-cols-2 gap-4">
                    {#each section.points as point}
                      <li
                        class="flex items-center gap-2 text-sm font-bold text-foreground"
                      >
                        <Verified class="size-4 text-primary" />
                        {point}
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}

              {#if section.items}
                <div class="grid gap-6">
                  {#each section.items as item}
                    <div class="flex gap-6 items-start">
                      <div
                        class="size-4 rounded-full bg-primary mt-2.5 shrink-0 shadow-sm"
                      ></div>
                      <div>
                        <span
                          class="block font-bold text-foreground uppercase text-xs tracking-widest mb-1"
                        >
                          {item.label}
                        </span>
                        <p
                          class="text-muted-foreground font-medium leading-relaxed"
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}

              {#if section.highlight}
                <div
                  class="p-10 rounded-xl border border-border flex gap-4 items-center shadow-sm"
                >
                  <Lock class="size-16 text-primary shrink-0 opacity-20" />
                  <div class="space-y-2">
                    <h4 class="text-xl font-bold text-foreground">
                      {section.highlight.title}
                    </h4>
                    <p
                      class="text-muted-foreground font-medium leading-relaxed"
                    >
                      {section.highlight.content}
                    </p>
                  </div>
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
          href="/cookie-policy"
          class="rounded-xl uppercase text-xs tracking-widest border-2"
        >
          Cookie Policy
        </Button>
        <Button
          variant="outline"
          href="/terms-of-use"
          class="rounded-xl uppercase text-xs tracking-widest border-2"
        >
          Terms of Use
        </Button>
      </div>
      <p class="text-xs text-muted-foreground pt-4">
        © {new Date().getFullYear()} Edniesal Consulting. All Rights Reserved.
      </p>
    </div>
  </footer>
</div>
