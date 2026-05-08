<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Scale,
    Gavel,
    ShieldAlert,
    FileSignature,
    ArrowLeft,
    ChevronRight,
    Search,
    Lock,
    Globe,
    ExternalLink,
    Mail,
    CheckCircle2,
    ArrowRight,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  const sections = [
    { id: "acceptance", title: "Acceptance of Terms", icon: CheckCircle2 },
    { id: "membership", title: "Membership Obligations", icon: FileSignature },
    { id: "property", title: "Intellectual Property", icon: Gavel },
    { id: "liability", title: "Limitation of Liability", icon: ShieldAlert },
  ];

  const lastUpdated = "October 24, 2023";
</script>

<div class="min-h-screen bg-white dark:bg-slate-950">
  <!-- Hero Section -->
  <section
    class="relative py-24 bg-primary text-primary-foreground overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(#135bec22_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
    ></div>
    <div class="container mx-auto px-4 relative z-10 space-y-4 pt-16">
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
      >
        <Scale class="size-4" />
        Legal Framework
      </div>
      <div class="space-y-2">
        <h1
          class="text-4xl lg:text-6xl font-bold text-primary-foreground tracking-tight"
        >
          Terms of Use
        </h1>
        <p class="text-primary-foreground/80 font-medium">
          Last updated: {lastUpdated}
        </p>
      </div>
    </div>
  </section>

  <!-- Content Section -->
  <section class="py-24">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-12 gap-4">
        <!-- Sidebar Navigation -->
        <aside class="lg:col-span-4 space-y-4">
          <div class="sticky top-32 space-y-4">
            <div
              class="p-8 rounded-xl bg-card border border-border shadow-md space-y-6"
            >
              <div class="flex items-center gap-3">
                <Gavel class="size-5 text-primary" />
                <h3
                  class="text-lg font-bold uppercase tracking-tight text-foreground"
                >
                  Navigation
                </h3>
              </div>
              <nav class="space-y-4">
                {#each sections as section}
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

            <!-- Download PDF CTA -->
            <div
              class="p-8 rounded-xl bg-card border border-border shadow-md space-y-6"
            >
              <h3
                class="text-lg font-bold uppercase tracking-tight text-foreground"
              >
                Offline Review
              </h3>
              <p class="text-sm text-muted-foreground font-medium">
                Download a PDF version of our full institutional terms.
              </p>
              <Button
                variant="outline"
                class="w-full font-bold transition-all gap-3"
              >
                Download PDF
                <Globe class="size-4" />
              </Button>
            </div>
          </div>
        </aside>

        <!-- Main Body Text -->
        <div class="lg:col-span-8 space-y-4 max-w-3xl">
          <section id="acceptance" class="scroll-mt-32 space-y-4">
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
              <div class="h-1 w-20 bg-accent-gold rounded-full"></div>
            </div>

            <div
              class="space-y-4 text-lg text-muted-foreground font-medium leading-relaxed font-display"
            >
              <p>
                By accessing or using the CIO & C-Suite Club Africa digital
                portal, website, and associated services, you agree to be bound
                by these Terms of Use and our Privacy Policy.
              </p>
              <p>
                As a professional executive organization, we require all users
                to maintain the highest standards of integrity. If you do not
                agree with any part of these terms, you must immediately
                discontinue use of the platform and cancel your membership
                request.
              </p>
            </div>
          </section>

          <section id="membership" class="scroll-mt-32 space-y-4">
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
              <div class="h-1 w-20 bg-accent-gold rounded-full"></div>
            </div>

            <div
              class="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed"
            >
              <p>
                Membership in the Club is granted based on verified executive
                status. Members are responsible for maintaining the
                confidentiality of their credentials.
              </p>
              <div class="grid gap-4">
                {#each [{ title: "Credential Security", desc: "You are solely responsible for all activities that occur under your institutional account." }, { title: "Data Accuracy", desc: "Members must provide truthful, current, and complete professional information during the registration process." }, { title: "Community Conduct", desc: "Interactions within the portal must remain professional and respectful of peer confidentiality." }] as item}
                  <div
                    class="flex gap-4 items-start p-6 rounded-xl bg-card border border-border shadow-sm"
                  >
                    <CheckCircle2 class="size-6 text-primary mt-1 shrink-0" />
                    <div>
                      <h4
                        class="font-bold text-foreground uppercase text-xs tracking-widest mb-1"
                      >
                        {item.title}
                      </h4>
                      <p class="text-base">{item.desc}</p>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </section>

          <section id="property" class="scroll-mt-32 space-y-4">
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
              <div class="h-1 w-20 bg-accent-gold rounded-full"></div>
            </div>

            <div
              class="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed"
            >
              <p>
                All content included on this portal, such as text, graphics,
                logos, images, and reports, is the property of the CIO & C-Suite
                Club Africa or its content suppliers and is protected by
                international copyright laws.
              </p>
              <div
                class="p-10 rounded-xl bg-primary text-primary-foreground space-y-4 relative overflow-hidden shadow-lg border border-primary-foreground/5"
              >
                <Lock
                  class="size-16 text-primary-foreground opacity-10 absolute -top-4 -right-4"
                />
                <h4 class="text-xl font-bold uppercase tracking-tight italic">
                  Proprietary Research Access
                </h4>
                <p class="text-primary-foreground/80">
                  Reports and white papers downloaded from the Resource Library
                  are for personal professional use only. Redistributing these
                  assets without written consent constitutes a violation of
                  these terms.
                </p>
              </div>
            </div>
          </section>

          <section id="liability" class="scroll-mt-32 space-y-4">
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
              <div class="h-1 w-20 bg-accent-gold rounded-full"></div>
            </div>

            <div
              class="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed"
            >
              <p>
                The CIO & C-Suite Club Africa shall not be liable for any
                direct, indirect, incidental, or consequential damages resulting
                from the use or inability to use our services.
              </p>
              <p>
                While we strive for 100% accuracy in our research and data, all
                insights provided are for informational purposes and do not
                constitute financial or legal advice for your organization.
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
    <div class="container mx-auto px-4 text-center space-y-4">
      <p class="text-sm font-bold uppercase tracking-widest text-foreground">
        Have questions about these terms?
      </p>
      <Button class="font-bold shadow-lg transition-all gap-3">
        Contact Governance Team
        <ArrowRight class="size-4" />
      </Button>
      <p class="text-xs text-muted-foreground pt-4">
        © 2024 CIO & C-Suite Club Africa. All Rights Reserved.
      </p>
    </div>
  </section>
</div>
