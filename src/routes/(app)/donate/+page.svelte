<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import {
    Heart,
    Copy,
    Check,
    Building2,
    CreditCard,
    User,
    ArrowRight,
    Sparkles,
    Globe,
    GraduationCap,
    Users,
    BookOpen,
  } from "@lucide/svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const content = $derived(data.content);
  let copied = $state("");

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    copied = field;
    setTimeout(() => (copied = ""), 2000);
  }

  const impactIcons = [Sparkles, Globe, BookOpen, Users];
</script>

<svelte:head>
  {#if data.meta?.title}
    <title>{data.meta.title}</title>
    <meta name="title" content={data.meta.title} />
    <meta property="og:title" content={data.meta.title} />
  {:else}
    <title>Donate - The CIO Club Africa</title>
  {/if}
  {#if data.meta?.description}
    <meta name="description" content={data.meta.description} />
    <meta property="og:description" content={data.meta.description} />
  {/if}
  {#if data.meta?.ogImage}
    <meta property="og:image" content={data.meta.ogImage} />
  {/if}
</svelte:head>

<div class="min-h-screen">
  <!-- Hero Section -->
  <section
    class="relative py-32 bg-primary text-primary-foreground overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(#135bec22_1px,transparent_1px)] bg-size-[24px_24px] opacity-40"
    ></div>
    <!-- Animated orbs -->
    <div
      class="absolute top-20 left-1/4 w-72 h-72 bg-primary-foreground/5 rounded-full blur-[100px] animate-pulse"
    ></div>
    <div
      class="absolute bottom-10 right-1/4 w-96 h-96 bg-primary-foreground/5 rounded-full blur-[120px] animate-pulse delay-1000"
    ></div>

    <div
      class="container mx-auto px-4 relative z-10 text-center space-y-6 pt-20"
    >
      <div
        class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-xs font-bold uppercase tracking-[0.25em] backdrop-blur-sm"
      >
        <Heart class="size-4" />
        {content.hero.badge}
      </div>
      <h1
        class="text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight tracking-tight"
      >
        {content.hero.title}
      </h1>
      <p
        class="text-xl text-primary-foreground/80 max-w-2xl mx-auto font-medium leading-relaxed"
      >
        {content.hero.description}
      </p>
      <div class="flex justify-center pt-8">
        <Button
          href="/events"
          variant="secondary"
          class="font-bold uppercase text-xs tracking-widest gap-2 rounded-xl transition-all shadow-lg"
        >
          View Projects & Events
          <ArrowRight class="size-4" />
        </Button>
      </div>
    </div>
  </section>

  <!-- Bank Details Card -->
  <section class="py-20 bg-background relative -mt-16 z-20">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto">
        <div
          class="relative bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
        >
          <!-- Card Header Accent -->
          <div class="h-1.5 bg-primary"></div>

          <div class="p-8 md:p-12 space-y-8">
            <!-- Card Title -->
            <div class="text-center space-y-3">
              <div
                class="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 text-primary mx-auto"
              >
                <CreditCard class="size-8" />
              </div>
              <h2
                class="text-2xl font-bold uppercase tracking-tight text-foreground"
              >
                Bank Transfer Details
              </h2>
              <p class="text-sm text-muted-foreground font-medium">
                Make a direct bank transfer using the details below
              </p>
            </div>

            <!-- Details Grid -->
            <div class="space-y-4">
              <!-- Account Name -->
              <div
                class="group flex items-center gap-4 p-5 rounded-2xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all"
              >
                <div
                  class="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                >
                  <User class="size-5 text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Account Name
                  </p>
                  <p class="text-base font-bold text-foreground truncate">
                    {content.bankDetails.accountName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="shrink-0 h-10 w-10 rounded-xl hover:bg-primary/10 transition-all"
                  onclick={() =>
                    copyToClipboard(
                      content.bankDetails.accountName,
                      "accountName",
                    )}
                >
                  {#if copied === "accountName"}
                    <Check class="size-4 text-green-500" />
                  {:else}
                    <Copy class="size-4 text-muted-foreground" />
                  {/if}
                </Button>
              </div>

              <!-- Bank Name -->
              <div
                class="group flex items-center gap-4 p-5 rounded-2xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all"
              >
                <div
                  class="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                >
                  <Building2 class="size-5 text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Bank Name
                  </p>
                  <p class="text-base font-bold text-foreground truncate">
                    {content.bankDetails.bankName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="shrink-0 h-10 w-10 rounded-xl hover:bg-primary/10 transition-all"
                  onclick={() =>
                    copyToClipboard(
                      content.bankDetails.bankName,
                      "bankName",
                    )}
                >
                  {#if copied === "bankName"}
                    <Check class="size-4 text-green-500" />
                  {:else}
                    <Copy class="size-4 text-muted-foreground" />
                  {/if}
                </Button>
              </div>

              <!-- Account Number -->
              <div
                class="group flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border-2 border-primary/20 hover:border-primary/40 transition-all"
              >
                <div
                  class="size-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0"
                >
                  <CreditCard class="size-5 text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-primary/70"
                  >
                    Account Number ({content.bankDetails.accountType})
                  </p>
                  <p
                    class="text-2xl font-black text-primary tracking-wider font-mono"
                  >
                    {content.bankDetails.accountNumber}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  class="shrink-0 h-12 w-12 rounded-xl border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
                  onclick={() =>
                    copyToClipboard(
                      content.bankDetails.accountNumber,
                      "accountNumber",
                    )}
                >
                  {#if copied === "accountNumber"}
                    <Check class="size-5" />
                  {:else}
                    <Copy class="size-5" />
                  {/if}
                </Button>
              </div>
            </div>

            <!-- Note -->
            {#if content.bankDetails.additionalNote}
              <div
                class="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
              >
                <Sparkles class="size-5 text-amber-500 shrink-0 mt-0.5" />
                <p class="text-sm text-amber-700 dark:text-amber-400 font-medium">
                  {content.bankDetails.additionalNote}
                </p>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Impact Section -->
  {#if content.impact}
    <section class="py-24 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="text-center space-y-4 mb-16">
          <h2
            class="text-3xl lg:text-4xl font-bold uppercase tracking-tight text-foreground"
          >
            {content.impact.title}
          </h2>
          <p
            class="text-lg text-muted-foreground font-medium max-w-2xl mx-auto"
          >
            {content.impact.description}
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {#each content.impact.items as item, i}
            {@const Icon = impactIcons[i % impactIcons.length]}
            <div
              class="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 text-center space-y-4"
            >
              <div
                class="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500"
              >
                <Icon class="size-6 text-primary" />
              </div>
              <h3 class="text-lg font-bold tracking-tight text-foreground">
                {item.label}
              </h3>
              <p class="text-sm text-muted-foreground font-medium leading-relaxed">
                {item.description}
              </p>
            </div>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  <!-- CTA Section -->
  {#if content.cta}
    <section class="py-24 bg-background">
      <div class="container mx-auto px-4">
        <div
          class="max-w-3xl mx-auto text-center bg-card border border-border rounded-3xl p-12 lg:p-16 shadow-lg space-y-6"
        >
          <div
            class="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto"
          >
            <Heart class="size-8 text-primary" />
          </div>
          <h2
            class="text-3xl font-bold uppercase tracking-tight text-foreground"
          >
            {content.cta.title}
          </h2>
          <p class="text-lg text-muted-foreground font-medium leading-relaxed">
            {content.cta.description}
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <Button
              href={content.cta.buttonLink || "/contact"}
              class="font-bold uppercase text-xs tracking-widest gap-2 rounded-xl transition-all"
            >
              {content.cta.buttonText}
              <ArrowRight class="size-4" />
            </Button>
            <Button
              href="/events"
              variant="outline"
              class="font-bold uppercase text-xs tracking-widest gap-2 rounded-xl transition-all"
            >
              Explore Our Projects
            </Button>
          </div>
        </div>
      </div>
    </section>
  {/if}
</div>
