<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import * as Icons from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { ScrollArea } from "$lib/components/ui/scroll-area";

  let { data } = $props();
  let isCommitmentOpen = $state(false);
  let isMobile = $state(false);

  $effect(() => {
    isMobile = window.innerWidth < 768;
    const handleResize = () => (isMobile = window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  const content = $derived(data.content);

  function getIcon(name: string) {
    return (Icons as any)[name] || Icons.Handshake;
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
      return type === "text" ? `text-${base}` : `bg-${base}/20`;
    }
    return type === "text" ? `text-${color}` : `bg-${color}/20`;
  }
</script>

<div class="min-h-screen pt-20">
  <!-- Header -->
  <section
    class="py-24 bg-primary text-primary-foreground relative overflow-hidden"
  >
    <div class="absolute inset-0 bg-grid-white opacity-5"></div>
    <div class="container mx-auto px-4 relative z-10 text-center space-y-4">
      <Badge
        variant="outline"
        class="text-primary-foreground border-primary-foreground/20"
        >{content.hero.badge}</Badge
      >
      <h1 class="text-4xl lg:text-6xl font-bold tracking-tight">
        {content.hero.title}
      </h1>
      <p class="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
        {content.hero.description}
      </p>
    </div>
  </section>

  <!-- Value Props -->
  <section class="py-24 bg-background">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-2 gap-4 items-center">
        <div class="space-y-4">
          <h2 class="text-4xl font-bold">{content.advantage.title}</h2>
          <p class="text-lg text-muted-foreground">
            {content.advantage.description}
          </p>
          <ul class="space-y-4">
            {#each content.advantage.props as prop}
              <li class="flex items-center gap-4">
                <div class="w-2 h-2 rounded-full bg-primary shrink-0"></div>
                <span class="text-lg font-medium">{prop}</span>
              </li>
            {/each}
          </ul>
        </div>

        <div class="p-4 md:p-12 rounded-xl bg-muted border border-border space-y-4">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm uppercase"
          >
            {content.prospectus.tag}
          </div>
          <h3 class="text-2xl font-bold">{content.prospectus.title}</h3>
          <p class="text-muted-foreground">
            {content.prospectus.description}
          </p>
          <div class="space-y-4">
            <Button
              size="lg"
              class="w-full font-bold"
              onclick={() => (isCommitmentOpen = true)}
            >
              {content.prospectus.cta}
            </Button>
            <div
              class="pt-6 border-t border-border/50 text-sm text-muted-foreground space-y-4"
            >
              <p class="font-bold text-foreground">
                For more information, sponsorship and partnership please
                contact:
              </p>
              <div class="space-y-4">
                <p class="font-medium text-primary">
                  <a
                    href="https://wa.me/2347069432878"
                    target="_blank"
                    class="hover:underline"
                  >
                    Dr. Cordelia Ilori
                  </a>
                </p>
                <div class="flex flex-wrap gap-4 pt-1">
                  <a
                    href="mailto:cordelia@edniesalconsulting.com"
                    class="hover:underline text-foreground"
                    >cordelia@edniesalconsulting.com</a
                  >
                  <a
                    href="https://www.thecioclubafrica.com"
                    target="_blank"
                    class="hover:underline text-foreground"
                    >www.thecioclubafrica.com</a
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Partner Levels -->
  <section class="py-24 bg-muted/30">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16 space-y-4">
        <h2 class="text-4xl font-bold">Partnership Tiers</h2>
        <p class="text-muted-foreground max-w-2xl mx-auto">
          Scalable options designed to meet your strategic engagement
          objectives.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-4">
        {#each content.tiers as type}
          {@const Icon = getIcon(type.iconName)}
          <Card
            class="rounded-xl border-border/50 hover:shadow-lg transition-all duration-300 bg-card overflow-hidden"
          >
            <CardHeader class="space-y-4">
              <div
                class={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
                  getColorClass(type.bg || type.color, "bg"),
                )}
              >
                <Icon
                  class={cn("h-8 w-8", getColorClass(type.color, "text"))}
                />
              </div>
              <CardTitle class="text-2xl">{type.level} Partner</CardTitle>
              <CardDescription class="text-base leading-relaxed"
                >{type.description}</CardDescription
              >
            </CardHeader>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Brands Marquee -->
  <section class="py-24 border-y border-border overflow-hidden bg-background">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <p
          class="text-sm font-bold text-muted-foreground uppercase tracking-widest"
        >
          Meet Our Sponsors
        </p>
      </div>
      <div
        class="flex flex-wrap justify-center items-center gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-500"
      >
        {#each data.partners as partner}
          <a
            href={partner.website}
            target="_blank"
            class="group flex flex-col items-center gap-2"
          >
            <div
              class="h-12 w-32 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                class="max-h-full max-w-full object-contain"
              />
            </div>
            <span
              class="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors"
              >{partner.name}</span
            >
          </a>
        {:else}
          <p class="text-muted-foreground italic">
            Current partners will be listed here soon.
          </p>
        {/each}
      </div>
    </div>
  </section>
</div>

<!-- Partnership Commitment Modal -->
{#if !isMobile}
  <Dialog.Root bind:open={isCommitmentOpen}>
    <Dialog.Content
      class="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
    >
      <Dialog.Header>
        <Dialog.Title class="text-3xl font-bold"
          >Partnership Commitment</Dialog.Title
        >
      </Dialog.Header>
      <ScrollArea class="flex-1 pr-4">
        <div class="space-y-8 py-4">
          <div class="space-y-4">
            <p class="text-lg leading-relaxed text-foreground">
              The CIO & C-Suite Club Africa is committed to building mutually
              beneficial partnerships that create value for both our members and
              our partners, while advancing Africa’s digital transformation
              agenda.
            </p>
            <p class="text-lg leading-relaxed text-foreground">
              By partnering with the CIO & C-Suite Club Africa, organizations
              are not only gaining market access; they are also contributing to
              the development of Africa’s digital leadership ecosystem and
              supporting initiatives that strengthen technology governance,
              innovation, and capacity across the continent.
            </p>
          </div>

          <div class="space-y-6">
            <h4 class="text-xl font-bold flex items-center gap-2 text-primary">
              <Icons.Star class="size-5" />
              Strategic Benefits
            </h4>
            <ul class="grid md:grid-cols-2 gap-4">
              {#each ["Engagement with senior executives who control or influence major technology budgets", "Opportunities to present innovative solutions directly to industry leaders", "Strong relationship-building with key institutional stakeholders", "Speaking opportunities at executive roundtables, summits, and panel discussions", "Visibility through research reports, policy dialogues, and industry publications", "Brand association with Africa’s leading technology leadership community", "Participation in policy discussions and public-private engagements", "Contribution to thought leadership on AI adoption, cybersecurity, digital infrastructure, and emerging technologies", "Opportunity to influence industry direction through collaborative dialogue", "Access to exclusive research reports and industry insights", "Direct feedback from CIOs on enterprise technology priorities", "Understanding of sector-specific digital transformation challenges", "Opportunities to co-develop pilot initiatives or innovation projects", "Collaboration with industry leaders to solve real business and technology challenges", "Participation in innovation-driven initiatives across sectors"] as benefit}
                <li
                  class="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border/50"
                >
                  <Icons.CheckCircle2
                    class="size-5 text-primary shrink-0 mt-0.5"
                  />
                  <span class="text-sm font-medium leading-tight"
                    >{benefit}</span
                  >
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </ScrollArea>
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root bind:open={isCommitmentOpen}>
    <Drawer.Content class="h-[85vh]">
      <div class="mx-auto w-full max-w-sm overflow-hidden flex flex-col h-full">
        <Drawer.Header class="text-left py-6">
          <Drawer.Title class="text-2xl font-bold"
            >Partnership Commitment</Drawer.Title
          >
        </Drawer.Header>
        <div class="flex-1 overflow-y-auto px-4 pb-10">
          <div class="space-y-8">
            <div class="space-y-4">
              <p class="text-base leading-relaxed text-foreground">
                The CIO & C-Suite Club Africa is committed to building mutually
                beneficial partnerships that create value for both our members
                and our partners, while advancing Africa’s digital
                transformation agenda.
              </p>
              <p class="text-base leading-relaxed text-foreground">
                By partnering with the CIO & C-Suite Club Africa, organizations
                are not only gaining market access; they are also contributing
                to the development of Africa’s digital leadership ecosystem and
                supporting initiatives that strengthen technology governance,
                innovation, and capacity across the continent.
              </p>
            </div>

            <div class="space-y-6">
              <h4
                class="text-lg font-bold flex items-center gap-2 text-primary"
              >
                <Icons.Star class="size-5" />
                Strategic Benefits
              </h4>
              <ul class="space-y-3">
                {#each ["Engagement with senior executives who control or influence major technology budgets", "Opportunities to present innovative solutions directly to industry leaders", "Strong relationship-building with key institutional stakeholders", "Speaking opportunities at executive roundtables, summits, and panel discussions", "Visibility through research reports, policy dialogues, and industry publications", "Brand association with Africa’s leading technology leadership community", "Participation in policy discussions and public-private engagements", "Contribution to thought leadership on AI adoption, cybersecurity, digital infrastructure, and emerging technologies", "Opportunity to influence industry direction through collaborative dialogue", "Access to exclusive research reports and industry insights", "Direct feedback from CIOs on enterprise technology priorities", "Understanding of sector-specific digital transformation challenges", "Opportunities to co-develop pilot initiatives or innovation projects", "Collaboration with industry leaders to solve real business and technology challenges", "Participation in innovation-driven initiatives across sectors"] as benefit}
                  <li
                    class="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border/50"
                  >
                    <Icons.CheckCircle2
                      class="size-4 text-primary shrink-0 mt-0.5"
                    />
                    <span class="text-sm font-medium leading-tight"
                      >{benefit}</span
                  >
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}
