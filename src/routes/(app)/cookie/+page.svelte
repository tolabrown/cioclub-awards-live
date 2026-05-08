<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Cookie,
    ListFilter,
    ArrowRight,
    Settings,
    ShieldCheck,
    BarChart3,
    Clock,
    ChevronRight,
    Verified,
    Mail,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import * as CookieConsent from "vanilla-cookieconsent";

  const sections = [
    { id: "what", title: "What Are Cookies?", icon: Cookie },
    { id: "types", title: "Types of Cookies We Use", icon: Settings },
    { id: "analytics", title: "Analytics & Performance", icon: BarChart3 },
    { id: "manage", title: "Managing Your Preferences", icon: ShieldCheck },
  ];

  const lastUpdated = "October 24, 2023";
</script>

<div class="min-h-screen bg-white dark:bg-slate-950">
  <!-- Hero Section -->
  <section class="relative py-24 bg-[#002B5B] overflow-hidden">
    <div
      class="absolute inset-0 bg-[radial-gradient(#135bec22_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
    ></div>
    <div class="container mx-auto px-4 relative z-10 space-y-6 pt-16">
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
      >
        <Cookie class="size-4" />
        Cookie Policy
      </div>
      <div class="space-y-2">
        <h1 class="text-4xl lg:text-6xl font-bold text-white tracking-tight">
          Cookie Policy
        </h1>
        <p class="text-slate-300 font-medium">Last updated: {lastUpdated}</p>
      </div>
    </div>
  </section>

  <!-- Content Section -->
  <section class="py-24">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-12 gap-16">
        <!-- Sidebar Navigation -->
        <aside class="lg:col-span-4 space-y-8">
          <div class="sticky top-32 space-y-8">
            <div
              class="p-8 rounded-xl bg-card border border-border shadow-sm space-y-6"
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
                {#each sections as section, i}
                  <a
                    href="#{section.id}"
                    class="flex items-center justify-between p-4 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all group"
                  >
                    <span
                      class="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors"
                      >{section.title}</span
                    >
                    <ChevronRight
                      class="size-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </a>
                {/each}
              </nav>
            </div>

            <!-- Cookie Settings CTA -->
            <div
              class="p-8 rounded-xl bg-primary text-primary-foreground space-y-6 shadow-lg relative overflow-hidden"
            >
              <div class="absolute -right-8 -bottom-8 opacity-10">
                <Cookie class="size-40" />
              </div>
              <h3
                class="text-xl font-bold uppercase tracking-tight relative z-10"
              >
                Cookie Preferences
              </h3>
              <p
                class="text-primary-foreground/80 font-medium leading-relaxed relative z-10"
              >
                Manage your cookie settings and preferences at any time through
                our consent manager.
              </p>
              <Button
                variant="secondary"
                onclick={CookieConsent.showPreferences}
                class="w-full h-12 rounded-xl font-bold uppercase text-xs tracking-widest transition-all relative z-10 gap-3"
              >
                Manage Cookies
                <Settings class="size-4" />
              </Button>
            </div>
          </div>
        </aside>

        <!-- Main Body Text -->
        <div class="lg:col-span-8 space-y-20 max-w-3xl">
          <section id="what" class="scroll-mt-32 space-y-8">
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div
                  class="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
                >
                  <svelte:component this={sections[0].icon} class="size-6" />
                </div>
                <h2 class="text-3xl font-bold text-foreground tracking-tight">
                  {sections[0].title}
                </h2>
              </div>
              <div class="h-1 w-20 bg-primary rounded-full"></div>
            </div>

            <div
              class="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed"
            >
              <p>
                Cookies are small text files that are stored on your device when
                you visit our website. They help us provide you with a better
                experience by remembering your preferences and understanding how
                you interact with our platform.
              </p>
              <div
                class="p-8 rounded-xl bg-muted/50 border border-border space-y-4"
              >
                <h4
                  class="font-bold uppercase text-xs tracking-widest text-primary"
                >
                  Key Benefits
                </h4>
                <ul class="grid sm:grid-cols-2 gap-4">
                  {#each ["Remember your login status", "Store your preferences", "Analyze site performance", "Improve user experience", "Secure authentication", "Personalized content"] as item, i}
                    <li
                      class="flex items-center gap-2 text-sm font-bold text-foreground"
                    >
                      <Verified class="size-4 text-primary" />
                      {item}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          </section>

          <section id="types" class="scroll-mt-32 space-y-8">
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div
                  class="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
                >
                  <svelte:component this={sections[1].icon} class="size-6" />
                </div>
                <h2 class="text-3xl font-bold text-foreground tracking-tight">
                  {sections[1].title}
                </h2>
              </div>
              <div class="h-1 w-20 bg-primary rounded-full"></div>
            </div>

            <div
              class="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed"
            >
              <p>
                We use different types of cookies on our website, each serving a
                specific purpose to enhance your browsing experience.
              </p>
              <ul class="space-y-6">
                {#each [{ label: "Essential Cookies", desc: "Required for basic site functionality, authentication, and security. These cannot be disabled." }, { label: "Functional Cookies", desc: "Remember your preferences like language, region, and display settings for a personalized experience." }, { label: "Analytics Cookies", desc: "Help us understand how visitors interact with our site to improve our services and content." }] as item}
                  <li class="flex gap-6 items-start">
                    <div
                      class="size-4 rounded-full bg-primary mt-2.5 shrink-0 shadow-sm"
                    ></div>
                    <div>
                      <span
                        class="block font-bold text-foreground uppercase text-xs tracking-widest mb-1"
                        >{item.label}</span
                      >
                      {item.desc}
                    </div>
                  </li>
                {/each}
              </ul>
            </div>
          </section>

          <section id="analytics" class="scroll-mt-32 space-y-8">
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div
                  class="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
                >
                  <svelte:component this={sections[2].icon} class="size-6" />
                </div>
                <h2 class="text-3xl font-bold text-foreground tracking-tight">
                  {sections[2].title}
                </h2>
              </div>
              <div class="h-1 w-20 bg-primary rounded-full"></div>
            </div>

            <div
              class="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed"
            >
              <div
                class="p-10 rounded-xl bg-muted/50 border border-border flex gap-8 items-center shadow-sm"
              >
                <BarChart3 class="size-16 text-primary shrink-0" />
                <div class="space-y-2">
                  <h4 class="text-xl font-bold text-foreground">
                    Anonymous Analytics
                  </h4>
                  <p class="text-base">
                    We use analytics cookies to gather aggregated, anonymous
                    data about site usage. This helps us improve navigation,
                    content, and overall user experience without identifying
                    individual users.
                  </p>
                </div>
              </div>
              <p>
                Our analytics partners comply with GDPR and other data
                protection regulations. You can opt out of analytics tracking at
                any time through the cookie preferences panel.
              </p>
            </div>
          </section>

          <section id="manage" class="scroll-mt-32 space-y-8">
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div
                  class="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
                >
                  <svelte:component this={sections[3].icon} class="size-6" />
                </div>
                <h2 class="text-3xl font-bold text-foreground tracking-tight">
                  {sections[3].title}
                </h2>
              </div>
              <div class="h-1 w-20 bg-primary rounded-full"></div>
            </div>

            <div
              class="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed"
            >
              <p>
                You have full control over the cookies stored on your device.
                You can manage your preferences through our cookie consent panel
                or your browser settings.
              </p>
              <div class="grid sm:grid-cols-2 gap-8 pt-4">
                <div
                  class="p-8 rounded-xl bg-card border border-border space-y-4"
                >
                  <h5 class="font-bold text-foreground">Browser Settings</h5>
                  <p class="text-base font-medium">
                    Most browsers allow you to block or delete cookies through
                    their settings menu.
                  </p>
                </div>
                <div
                  class="p-8 rounded-xl bg-card border border-border space-y-4"
                >
                  <h5 class="font-bold text-foreground">Cookie Retention</h5>
                  <p class="text-base font-medium">
                    Session cookies are deleted when you close your browser.
                    Persistent cookies remain for up to 12 months.
                  </p>
                </div>
              </div>
              <p>
                Please note that disabling certain cookies may affect the
                functionality of our website and your ability to access certain
                features.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>

  <!-- Final Legal Footer CTA -->
  <section
    class="border-t border-border py-20 bg-slate-50 dark:bg-slate-900/50"
  >
    <div class="container mx-auto px-4 text-center space-y-6">
      <p class="text-sm font-bold uppercase tracking-widest text-foreground">
        Need full legal documentation?
      </p>
      <div class="flex flex-wrap gap-4 justify-center">
        <Button
          variant="outline"
          href="/terms"
          class="rounded-xl px-10 h-12 font-bold uppercase text-xs tracking-widest transition-all"
        >
          Terms of Use
        </Button>
        <Button
          variant="outline"
          href="/privacy"
          class="rounded-xl px-10 h-12 font-bold uppercase text-xs tracking-widest transition-all"
        >
          Privacy Policy
        </Button>
      </div>
      <p class="text-xs text-muted-foreground pt-4">
        © 2024 CIO & C-Suite Club Africa. All Rights Reserved.
      </p>
    </div>
  </section>
</div>
