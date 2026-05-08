<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    ShieldCheck,
    ListFilter,
    ArrowRight,
    Search,
    Lock,
    ExternalLink,
    Mail,
    Scale,
    FileText,
    ChevronRight,
    Verified,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  const sections = [
    { id: "collect", title: "Information We Collect", icon: Search },
    { id: "use", title: "How We Use Your Data", icon: FileText },
    { id: "security", title: "Data Security & Encryption", icon: Lock },
    { id: "rights", title: "Your Executive Rights", icon: Scale },
  ];

  const lastUpdated = "October 24, 2023";
</script>

<div class="min-h-screen bg-white dark:bg-slate-950">
  <!-- Hero Section -->
  <section class="relative py-24 bg-[#002B5B] overflow-hidden">
    <div
      class="absolute inset-0 bg-[radial-gradient(#135bec22_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
    ></div>
    <div class="container mx-auto px-4 relative z-10 space-y-4 pt-16">
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
      >
        <ShieldCheck class="size-4" />
        Governance & Transparency
      </div>
      <div class="space-y-2">
        <h1 class="text-4xl lg:text-6xl font-bold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p class="text-slate-300 font-medium">Last updated: {lastUpdated}</p>
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
              class="p-8 rounded-xl bg-card border border-border shadow-sm space-y-4"
            >
              <div class="flex items-center gap-3">
                <ListFilter class="size-5 text-primary" />
                <h3
                  class="text-lg font-bold uppercase tracking-tight text-foreground"
                >
                  Table of Contents
                </h3>
              </div>
              <nav class="space-y-4">
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

            <!-- Legal Support CTA -->
            <div
              class="p-8 rounded-xl bg-primary text-primary-foreground space-y-4 shadow-lg relative overflow-hidden"
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
                class="text-primary-foreground/80 font-medium leading-relaxed relative z-10"
              >
                Have specific questions about how your data is handled at an
                institutional level?
              </p>
              <Button
                variant="secondary"
                class="w-full h-12 rounded-xl font-bold uppercase text-xs tracking-widest transition-all relative z-10 gap-3"
              >
                Contact Compliance
                <Mail class="size-4" />
              </Button>
            </div>
          </div>
        </aside>

        <!-- Main Body Text -->
        <div class="lg:col-span-8 space-y-4 max-w-3xl">
          <section id="collect" class="scroll-mt-32 space-y-4">
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
                We collect information that you provide directly to us when you
                join the CIO & C-Suite Club Africa. As an elite professional
                organization, the quality and accuracy of our data are paramount
                to the networking value we provide.
              </p>
              <div
                class="p-8 rounded-xl bg-muted/50 border border-border space-y-4"
              >
                <h4
                  class="font-bold uppercase text-xs tracking-widest text-primary"
                >
                  Primary Data Points
                </h4>
                <ul class="grid sm:grid-cols-2 gap-4">
                  {#each ["Full Professional Name", "Current Executive Role", "Company & Sector", "LinkedIn Professional URL", "Corporate Email Address", "Industry Specialization"] as item, i}
                    <li
                      class="flex items-center gap-2 text-sm font-bold text-foreground"
                    >
                      <Verified class="size-4 text-primary" />
                      {item}
                    </li>
                  {/each}
                </ul>
              </div>
              <p>
                Additionally, we may collect technical data such as your IP
                address, device type, and application usage patterns to optimize
                the performance of our digital portal and ensure the security of
                our community.
              </p>
            </div>
          </section>

          <section id="use" class="scroll-mt-32 space-y-4">
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
                The information we collect is strictly used to enhance the
                member experience and facilitate high-value connections. We
                never sell or lease member data to third-party marketers.
              </p>
              <ul class="space-y-4">
                {#each [{ label: "Executive Networking", desc: "Enabling members to discover and connect with peers based on shared challenges and seniority." }, { label: "Exclusive Access", desc: "Validating tier-based access to research, white papers, and the Annual Summits." }, { label: "Strategic Communication", desc: "Delivering curated newsletters and club alerts that align with your professional interests." }] as item}
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

          <section id="security" class="scroll-mt-32 space-y-4">
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
                class="p-10 rounded-xl bg-muted/50 border border-border flex gap-4 items-center shadow-sm"
              >
                <Verified class="size-16 text-primary shrink-0" />
                <div class="space-y-2">
                  <h4 class="text-xl font-bold text-foreground">
                    Zero-Trust Standards
                  </h4>
                  <p class="text-base">
                    We implement industry-standard AES-256 encryption and
                    multi-factor authentication (MFA) to protect all executive
                    data, ensuring that your professional footprint remains
                    secure.
                  </p>
                </div>
              </div>
              <p>
                As an organization built on IT leadership, we understand the
                criticality of data protection. Our systems undergo regular
                independent security audits to ensure compliance with global
                data protection regulations.
              </p>
            </div>
          </section>

          <section id="rights" class="scroll-mt-32 space-y-4">
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
                As a member of the Club, you have complete sovereignty over your
                data. This includes the right to access, rectify, or request the
                deletion of your personal data at any time.
              </p>
              <div class="grid sm:grid-cols-2 gap-4 pt-4">
                <div
                  class="p-8 rounded-xl bg-card border border-border space-y-4"
                >
                  <h5 class="font-bold text-foreground">Data Access</h5>
                  <p class="text-base font-medium">
                    Download a complete archive of your profile and
                    participation data at any time.
                  </p>
                </div>
                <div
                  class="p-8 rounded-xl bg-card border border-border space-y-4"
                >
                  <h5 class="font-bold text-foreground">Right to Forget</h5>
                  <p class="text-base font-medium">
                    Request permanent deletion of your account and all
                    associated data records.
                  </p>
                </div>
              </div>
              <p>
                To exercise these rights, you can manage your settings directly
                in your Profile Dashboard or reach out to our legal compliance
                unit.
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
          href="/cookie"
          class="rounded-xl px-10 h-12 font-bold uppercase text-xs tracking-widest transition-all"
        >
          Cookie Policy
        </Button>
      </div>
      <p class="text-xs text-muted-foreground pt-4">
        © 2024 CIO & C-Suite Club Africa. All Rights Reserved.
      </p>
    </div>
  </section>
</div>
