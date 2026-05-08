<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import * as Icons from "@lucide/svelte";
  import {
    Check,
    ChevronRight,
    Loader2,
    Send,
    GraduationCap,
    Briefcase,
    Crown,
    Building2,
    Globe,
  } from "@lucide/svelte";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { cn } from "$lib/utils";

  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import { onMount, tick } from "svelte";
  import { page } from "$app/state";

  let { data } = $props();
  const content = $derived(data.content);

  let showLegacyDialog = $state(false);

  function getIcon(name: string) {
    return (Icons as any)[name] || Icons.Info;
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
    if (color === "primary")
      return type === "text" ? "text-primary" : "bg-primary/20";
    return type === "text" ? `text-${color}` : `bg-${color}/20`;
  }

  // Simple markdown-style link parser for step descriptions
  function parseLinks(text: string) {
    const parts = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        });
      }
      parts.push({ type: "link", text: match[1], href: match[2] });
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.slice(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: "text", content: text }];
  }
</script>

<div class="min-h-screen">
  <!-- Header -->
  <section
    class="relative py-32 bg-primary text-primary-foreground overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(#135bec22_1px,transparent_1px)] bg-size-[24px_24px] opacity-40"
    ></div>
    <div
      class="container mx-auto px-4 relative z-10 text-center space-y-4 pt-20"
    >
      <Badge
        variant="outline"
        class="text-primary-foreground border-primary-foreground/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
        >{content.hero.badge}</Badge
      >
      <h1
        class="text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight tracking-tight"
      >
        {content.hero.title}
      </h1>
      <p
        class="text-xl text-primary-foreground/80 max-w-2xl mx-auto font-medium"
      >
        {content.hero.description}
      </p>
    </div>
  </section>

  <!-- Individual Tiers -->
  <section id="tiers" class="py-32 bg-background relative -mt-16 z-20">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each content.tiers as tier}
          {@const Icon = getIcon(tier.iconName)}
          <Card
            class={cn(
              "relative flex flex-col rounded-xl overflow-hidden border-2 transition-all duration-500 group",
              tier.popular
                ? "border-primary shadow-lg bg-card lg:scale-105 z-10"
                : "border-border/50 bg-card hover:border-primary/30 hover:shadow-lg",
            )}
          >
            {#if tier.popular}
              <div
                class="absolute top-0 right-0 bg-primary text-primary-foreground px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-bl-xl"
              >
                Most Popular
              </div>
            {/if}

            <CardHeader class="pt-12 space-y-4">
              <div class="space-y-4">
                <div
                  class={cn(
                    "size-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
                    getColorClass(tier.color, "bg"),
                  )}
                >
                  <Icon
                    class={cn("size-6", getColorClass(tier.color, "text"))}
                  />
                </div>
                <div class="space-y-4">
                  <span
                    class={cn(
                      "text-xs font-bold uppercase tracking-[0.2em]",
                      getColorClass(tier.color, "text"),
                    )}
                  >
                    {tier.tagline}
                  </span>
                  <CardTitle class="text-4xl font-bold">{tier.name}</CardTitle>
                </div>
              </div>

              <div class="flex items-baseline gap-1">
                <span class="text-5xl font-bold">{tier.price}</span>
                <span class="text-muted-foreground font-bold"
                  >{tier.period}</span
                >
              </div>

              <CardDescription class="text-base font-medium leading-relaxed">
                {tier.description}
              </CardDescription>
            </CardHeader>

            <CardContent class="flex-1 space-y-4 py-8">
              <div class="h-px bg-border/50 w-full"></div>
              <ul class="space-y-4">
                {#each tier.features as feature}
                  <li
                    class={cn(
                      "flex items-center gap-4 text-sm font-medium transition-colors",
                      feature.included
                        ? "text-foreground"
                        : "text-muted-foreground line-through opacity-50",
                    )}
                  >
                    <div
                      class={cn(
                        "size-6 rounded-full flex items-center justify-center shrink-0",
                        feature.included
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Check class="size-3.5" strokeWidth={3} />
                    </div>
                    <span>{feature.text}</span>
                  </li>
                {/each}
              </ul>
            </CardContent>

            <CardFooter class="pb-12 pt-6">
              {#if tier.id === "legacy"}
                <Button
                  onclick={() => (showLegacyDialog = true)}
                  class="w-full font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  variant="outline"
                >
                  View Requirements
                  <Icons.Info class="size-4" />
                </Button>
              {:else}
                <Button
                  href="/membership/register?tierId={tier.id}"
                  class={cn(
                    "w-full font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2",
                    tier.popular
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary hover:text-primary-foreground",
                  )}
                  variant={tier.popular ? "default" : "outline"}
                >
                  {tier.cta}
                  <ChevronRight
                    class="size-4 group-hover/btn:translate-x-1 transition-transform"
                  />
                </Button>
              {/if}
            </CardFooter>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Comparison Section -->
  <section class="py-32 bg-slate-50 dark:bg-slate-900/50">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="text-center mb-16 space-y-4">
        <h2
          class="text-3xl lg:text-4xl font-bold tracking-tight uppercase text-foreground"
        >
          {content.comparison.title}
        </h2>
        <div class="h-1 w-20 bg-primary mx-auto rounded-full"></div>
      </div>

      <div
        class="bg-card rounded-xl border border-border/50 shadow-lg overflow-hidden"
      >
        <div class="divide-y divide-border/50">
          {#each content.comparison.rows as row}
            <div
              class="flex justify-between items-center p-8 hover:bg-muted/30 transition-colors"
            >
              <span class="text-lg font-bold">{row.label}</span>
              <Badge
                class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              >
                {row.value}
              </Badge>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- Join Process -->
  <section id="join" class="py-32 bg-background relative overflow-hidden">
    <div class="container mx-auto px-4">
      <div class="text-center mb-24 space-y-4">
        <h2
          class="text-4xl lg:text-5xl font-bold tracking-tight uppercase text-foreground"
        >
          How to Join
        </h2>
        <p class="text-xl text-muted-foreground font-medium">
          A structured process to ensure continental leadership standards.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-12 relative">
        {#each content.joinSteps as step, i}
          <div class="group relative space-y-4">
            <div class="flex items-center gap-6">
              <div
                class="size-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg group-hover:scale-110 transition-all duration-500 relative z-10"
              >
                {i + 1}
              </div>
              <div class="h-px bg-border flex-1 relative hidden lg:block">
                {#if i < content.joinSteps.length - 1}
                  <div
                    class="absolute right-0 top-1/2 -translate-y-1/2 size-2 rounded-full bg-border"
                  ></div>
                {/if}
              </div>
            </div>
            <div class="space-y-4">
              <h3 class="text-2xl font-bold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p class="text-muted-foreground font-medium leading-relaxed">
                {#each parseLinks(step.desc) as part}
                  {#if part.type === "link"}
                    <a
                      href={part.href}
                      class="text-primary hover:underline font-bold"
                      >{part.text}</a
                    >
                  {:else}
                    {part.content}
                  {/if}
                {/each}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Corporate Section -->
  <section class="py-32 bg-background">
    <div class="container mx-auto px-4">
      <div
        class="bg-primary text-primary-foreground rounded-xl p-12 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-lg border border-primary-foreground/5"
      >
        <div class="absolute inset-0 bg-grid-white opacity-5"></div>
        <div class="max-w-xl space-y-4 relative z-10">
          <h2
            class="text-4xl lg:text-6xl font-bold text-primary-foreground leading-tight"
          >
            {content.corporate.title}
          </h2>
          <p
            class="text-xl text-primary-foreground/80 font-medium leading-relaxed"
          >
            {content.corporate.description}
          </p>
          <div
            class="pt-6 border-t border-primary-foreground/20 text-sm text-primary-foreground/70 space-y-2"
          >
            <p class="font-bold">
              For corporate sponsorship and partnership please contact:
            </p>
            <div class="space-y-4">
              <p class="font-medium">{content.corporate.contact.phone}</p>
              <div class="flex flex-wrap gap-4 pt-1">
                <a
                  href="mailto:{content.corporate.contact.email}"
                  class="hover:underline text-primary-foreground"
                  >{content.corporate.contact.email}</a
                >
                <a
                  href="https://www.{content.corporate.contact.website}"
                  target="_blank"
                  class="hover:underline text-primary-foreground"
                  >{content.corporate.contact.website}</a
                >
              </div>
            </div>
          </div>
        </div>
        <div class="shrink-0 relative z-10">
          <Button
            size="lg"
            variant="secondary"
            href="mailto:{content.corporate.contact.email}"
            class="font-bold shadow-lg transition-all"
          >
            {content.corporate.cta}
            <ChevronRight
              class="ml-2 size-6 group-hover:translate-x-1 transition-transform"
            />
          </Button>
        </div>
      </div>
    </div>
  </section>

  <!-- Final CTA Section -->
  <section class="py-32 bg-slate-50 dark:bg-slate-900/50">
    <div class="container mx-auto px-4 text-center">
      <div class="max-w-3xl mx-auto space-y-8">
        <h2 class="text-4xl lg:text-5xl font-bold tracking-tight">
          Ready to Elevate Your Leadership?
        </h2>
        <p class="text-xl text-muted-foreground font-medium">
          Join the elite network of CIOs and C-Suite executives driving Africa's
          digital agenda.
        </p>
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            href="/membership/register"
            class="w-full sm:w-auto font-bold px-12 py-8 text-lg rounded-xl shadow-xl hover:scale-105 transition-all"
          >
            Join the Club Now
            <Icons.UserPlus class="ml-2 size-6" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            href="/contact"
            class="w-full sm:w-auto font-bold px-12 py-8 text-lg rounded-xl hover:bg-primary/5 transition-all"
          >
            Speak to a Consultant
          </Button>
        </div>
      </div>
    </div>
  </section>
</div>

<!-- Legacy Membership Dialog -->
<Dialog
  open={showLegacyDialog}
  onOpenChange={(open) => (showLegacyDialog = open)}
>
  <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle class="text-3xl font-bold">Legacy Membership</DialogTitle>
      <DialogDescription class="text-lg">
        The highest recognition granted by the Club for distinguished technology
        leaders.
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-8 py-6">
      <div class="space-y-4">
        <div class="flex items-center gap-2 text-primary">
          <Icons.ShieldCheck class="size-6" />
          <h3 class="text-xl font-bold">Key Requirements</h3>
        </div>
        <ul class="grid gap-3 list-none p-0">
          <li
            class="flex gap-3 text-sm font-medium bg-muted/50 p-3 rounded-lg border border-border/50"
          >
            <Check class="size-5 text-primary shrink-0" strokeWidth={3} />
            C-Suite executive (CIO, CTO, CDO or equivalent) with distinguished leadership.
          </li>
          <li
            class="flex gap-3 text-sm font-medium bg-muted/50 p-3 rounded-lg border border-border/50"
          >
            <Check class="size-5 text-primary shrink-0" strokeWidth={3} />
            10–15 years of senior leadership experience in technology or innovation.
          </li>
          <li
            class="flex gap-3 text-sm font-medium bg-muted/50 p-3 rounded-lg border border-border/50"
          >
            <Check class="size-5 text-primary shrink-0" strokeWidth={3} />
            3–5 consecutive years of active membership and commitment to the Club's
            mission.
          </li>
          <li
            class="flex gap-3 text-sm font-medium bg-muted/50 p-3 rounded-lg border border-border/50"
          >
            <Check class="size-5 text-primary shrink-0" strokeWidth={3} />
            Proven contributions to enterprise transformation, innovation, or governance.
          </li>
          <li
            class="flex gap-3 text-sm font-medium bg-muted/50 p-3 rounded-lg border border-border/50"
          >
            <Check class="size-5 text-primary shrink-0" strokeWidth={3} />
            Contribution to thought leadership, research, or mentorship.
          </li>
        </ul>
      </div>

      <div class="space-y-4">
        <div class="flex items-center gap-2 text-indigo-600">
          <Icons.Star class="size-6" />
          <h3 class="text-xl font-bold">Exclusive Privileges</h3>
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <Card
            class="p-4 bg-indigo-50/30 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30"
          >
            <p class="font-bold flex items-center gap-2">
              <Icons.Infinity class="size-4 text-indigo-600" />
              Lifetime Status
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Permanent membership with no annual renewal fees.
            </p>
          </Card>
          <Card
            class="p-4 bg-indigo-50/30 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30"
          >
            <p class="font-bold flex items-center gap-2">
              <Icons.Award class="size-4 text-indigo-600" />
              High Recognition
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Founding or Distinguished Member status.
            </p>
          </Card>
          <Card
            class="p-4 bg-indigo-50/30 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30"
          >
            <p class="font-bold flex items-center gap-2">
              <Icons.Users class="size-4 text-indigo-600" />
              Board Eligibility
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Eligible to serve on the Leadership Advisory Board.
            </p>
          </Card>
          <Card
            class="p-4 bg-indigo-50/30 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30"
          >
            <p class="font-bold flex items-center gap-2">
              <Icons.Mic2 class="size-4 text-indigo-600" />
              Public Recognition
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Special acknowledgement at major Club events.
            </p>
          </Card>
        </div>
      </div>

      <div class="p-6 bg-slate-900 text-white rounded-xl space-y-4">
        <h4 class="font-bold flex items-center gap-2">
          <Icons.FileSearch class="size-5" />
          Approval Process
        </h4>
        <div class="grid gap-4 text-sm opacity-90">
          <div class="flex gap-4">
            <span
              class="size-6 rounded-full bg-white/20 flex items-center justify-center shrink-0"
              >1</span
            >
            <p>
              Nomination by two existing members or the Executive Leadership
              Council.
            </p>
          </div>
          <div class="flex gap-4">
            <span
              class="size-6 rounded-full bg-white/20 flex items-center justify-center shrink-0"
              >2</span
            >
            <p>Rigorous review by the Membership or Governance Committee.</p>
          </div>
          <div class="flex gap-4">
            <span
              class="size-6 rounded-full bg-white/20 flex items-center justify-center shrink-0"
              >3</span
            >
            <p>Final approval by the Board of Trustees or Governing Council.</p>
          </div>
        </div>
      </div>

      <div class="flex justify-center pt-4">
        <Button
          size="lg"
          class="font-bold px-8 shadow-lg"
          href="/contact?subject=Legacy%20Membership%20Inquiry"
        >
          Contact for Inquiries
          <Icons.Mail class="ml-2 size-4" />
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

<style>
  :global(.bg-grid-white) {
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    );
    background-size: 24px 24px;
  }
</style>
