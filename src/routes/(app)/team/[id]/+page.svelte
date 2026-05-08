<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    ArrowLeft,
    Linkedin,
    Twitter,
    Globe,
    Mail,
    Award,
    Briefcase,
    GraduationCap,
    TrendingUp,
    Shield,
    CheckCircle2,
    Calendar,
    User,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  let { data } = $props();
  const trustee = $derived(data.member);
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950">
  <!-- Nav / Back Button -->
  <div
    class="sticky top-20 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border py-4"
  >
    <div class="container mx-auto px-4">
      <a
        href="/team"
        class="inline-flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest group"
      >
        <ArrowLeft
          class="size-4 group-hover:-translate-x-1 transition-transform"
        />
        Back to Leadership
      </a>
    </div>
  </div>

  <main class="py-20 lg:py-32">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-12 gap-20">
        <!-- Left Column: Profile Card & Quick Info -->
        <div class="lg:col-span-5 space-y-12">
          <div class="relative group">
            <div
              class="absolute -inset-4 bg-primary/5 rounded-xl blur-2xl group-hover:bg-primary/10 transition-colors"
            ></div>
            <div
              class="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg border-2 border-primary/10 bg-card"
            >
              <img
                src={trustee.image}
                alt={trustee.name}
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent"
              ></div>

              <div class="absolute bottom-12 left-12 right-12 space-y-4">
                <Badge
                  class="bg-primary-foreground text-primary border-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md"
                >
                  {trustee.shortRole}
                </Badge>
                <h1
                  class="text-4xl font-bold text-primary-foreground tracking-tight"
                >
                  {trustee.name}
                </h1>
              </div>
            </div>
          </div>

          <!-- Quick Stats Grid -->
          <div class="grid grid-cols-2 gap-6">
            {#each trustee.stats as stat}
              <div
                class="bg-card border border-border rounded-xl p-8 space-y-2 shadow-sm"
              >
                <p
                  class="text-[10px] font-bold uppercase tracking-widest text-primary italic"
                >
                  {stat.label}
                </p>
                <p class="text-2xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </p>
              </div>
            {/each}
          </div>

          <!-- Connect Card -->
          <div
            class="bg-primary rounded-xl p-10 text-primary-foreground space-y-8 shadow-lg"
          >
            <h3 class="text-xl font-bold uppercase tracking-tight">
              Direct Connection
            </h3>
            <div class="grid gap-4">
              <Button
                class="w-full h-14 bg-primary-foreground text-primary font-bold transition-all gap-3 shadow-md"
              >
                <Linkedin class="size-5" />
                LinkedIn Profile
              </Button>
              <Button
                variant="outline"
                class="w-full h-14 border-primary-foreground/20 text-primary-foreground font-bold transition-all gap-3 hover:bg-primary-foreground/10"
              >
                <Twitter class="size-5" />
                Twitter (X)
              </Button>
            </div>
          </div>
        </div>

        <!-- Right Column: Biography & Expertise -->
        <div class="lg:col-span-7 space-y-16">
          <div class="space-y-8">
            <div class="space-y-4">
              <div
                class="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-sm"
              >
                <Shield class="size-5" />
                Executive Profile
              </div>
              <h2
                class="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground"
              >
                Visionary Catalyst for Africa's <span
                  class="text-primary italic">Digital Frontier</span
                >
              </h2>
            </div>

            <div
              class="space-y-6 text-xl text-muted-foreground font-medium leading-relaxed"
            >
              {#each trustee.bio as paragraph}
                <p>{paragraph}</p>
              {/each}
            </div>
          </div>

          <!-- Expertise Chips -->
          <div class="space-y-8">
            <h3
              class="text-2xl font-bold uppercase tracking-tight flex items-center gap-3"
            >
              <Award class="size-6 text-accent-gold" />
              Core Expertise
            </h3>
            <div class="flex flex-wrap gap-4">
              {#each trustee.expertise as item}
                <div
                  class="px-8 py-4 rounded-xl bg-card border border-border shadow-sm font-bold uppercase text-xs tracking-widest text-foreground flex items-center gap-3"
                >
                  <CheckCircle2 class="size-4 text-primary" />
                  {item}
                </div>
              {/each}
            </div>
          </div>

          <!-- Accomplishments / Recognition -->
          <div
            class="p-12 lg:p-16 rounded-xl bg-card border border-border shadow-lg space-y-10"
          >
            <div class="space-y-2 text-center lg:text-left">
              <h3
                class="text-3xl font-bold uppercase tracking-tight text-foreground"
              >
                Institutional Impact
              </h3>
              <p
                class="text-muted-foreground font-medium underline underline-offset-8 decoration-accent-gold/30"
              >
                Strategic roles and recognized leadership initiatives.
              </p>
            </div>

            <div class="grid gap-12 pt-4">
              {#each [{ icon: Briefcase, title: "CDO, Polaris Bank", year: "2021 - Present", desc: "Spearheading the bank's digital transition and zero-trust security framework implementation." }, { icon: Award, title: "Top 50 Women in Tech Africa", year: "2023", desc: "Recognized for outstanding contributions to pan-African financial inclusion." }] as honor}
                <div
                  class="flex flex-col lg:flex-row gap-8 items-center lg:items-start text-center lg:text-left"
                >
                  <div
                    class="size-16 rounded-xl bg-muted flex items-center justify-center text-primary shrink-0 shadow-sm"
                  >
                    <honor.icon class="size-8" />
                  </div>
                  <div class="space-y-2">
                    <div
                      class="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4"
                    >
                      <h4 class="text-2xl font-bold text-foreground">
                        {honor.title}
                      </h4>
                      <Badge
                        variant="secondary"
                        class="w-fit mx-auto lg:mx-0 bg-muted rounded-lg text-xs font-bold uppercase tracking-widest"
                        >{honor.year}</Badge
                      >
                    </div>
                    <p
                      class="text-lg text-muted-foreground font-medium leading-relaxed"
                    >
                      {honor.desc}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Message CTA -->
  <section class="py-32 bg-primary text-primary-foreground">
    <div class="container mx-auto px-4 text-center space-y-10">
      <div
        class="size-20 lg:size-24 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto border border-primary-foreground/20"
      >
        <Mail class="size-10 text-primary-foreground" />
      </div>
      <h2
        class="text-4xl lg:text-5xl font-bold uppercase tracking-tight max-w-2xl mx-auto"
      >
        Engage with Our Governance Team
      </h2>
      <p
        class="text-xl text-primary-foreground/80 max-w-2xl mx-auto font-medium leading-relaxed"
      >
        For strategic inquiries, speaking engagements, or professional feedback
        regarding the club's direction.
      </p>
      <Button
        class="px-12 h-18 text-lg font-bold transition-all shadow-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90"
      >
        Send Secure Message
      </Button>
    </div>
  </section>
</div>
