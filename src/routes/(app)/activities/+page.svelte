<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import {
    Trophy,
    Heart,
    Users,
    Mic,
    BookOpen,
    Calendar,
    Lightbulb,
    Handshake,
    Award,
    Podcast,
    GraduationCap,
    ArrowRight,
  } from "@lucide/svelte";

  const activities = [
    {
      title: "Conference and Awards",
      fullTitle: "The CIO and C-Suite Conference and Awards",
      description:
        "Africa's premier technology leadership gathering — celebrating excellence, innovation, and strategic impact across the continent's digital landscape.",
      icon: Trophy,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-500",
      borderColor: "border-amber-500/20",
      link: "/gallery/"
    },
    {
      title: "CSV Initiatives",
      fullTitle: "The CIO and C-Suite CSVs",
      description:
        "Driving meaningful social impact through corporate social responsibility programs that leverage technology for community upliftment.",
      icon: Heart,
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-500/10",
      textColor: "text-rose-500",
      borderColor: "border-rose-500/20",
      link: "/gallery/"
    },
    {
      title: "Panel Discussions",
      fullTitle: "The CIO and C-Suite Panel Discussion",
      description:
        "Thought-provoking discourse featuring Africa's most influential technology leaders tackling pressing digital transformation challenges.",
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-500",
      borderColor: "border-blue-500/20",
      link: "/gallery/"
    },
    {
      title: "Sponsors & Partners Roundtable",
      fullTitle:
        "The CIO and C-Suite Closed Door Sponsors and Partners Roundtable",
      description:
        "An exclusive, invite-only strategic dialogue connecting sponsors, partners, and C-suite executives for high-impact collaboration.",
      icon: Handshake,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
      link: "/gallery/"
    },
    {
      title: "Workshops & Masterclasses",
      fullTitle: "The CIO and C-Suite Exclusive Workshops and Masterclasses",
      description:
        "Intensive, hands-on learning experiences led by world-class facilitators, designed to sharpen executive skills and strategic thinking.",
      icon: GraduationCap,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-500",
      borderColor: "border-violet-500/20",
      link: "/gallery/"
    },
    {
      title: "First Friday Initiative",
      fullTitle: "The CIO and C-Suite First Friday Initiative",
      description:
        "A signature monthly engagement bringing together technology leaders on the first Friday for networking, insights, and collaborative innovation.",
      icon: Calendar,
      color: "from-cyan-500 to-sky-600",
      bgColor: "bg-cyan-500/10",
      textColor: "text-cyan-500",
      borderColor: "border-cyan-500/20",
      link: "/gallery/"
    },
    {
      title: "Founders Circle & Advisory Council",
      fullTitle: "The CIO and C-Suite Founders Circle & Advisory Council",
      description:
        "The pinnacle of CIO Club membership — a select cohort of founding members and senior advisors shaping the organization's strategic direction.",
      icon: Award,
      color: "from-yellow-500 to-amber-600",
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-500",
      borderColor: "border-yellow-500/20",
      link: "/gallery/"
    },
    {
      title: "Ladies in Tech & Leadership",
      fullTitle: "The CIO and C-Suite Ladies in Tech and Leadership (LITL)",
      description:
        "Championing gender diversity in African tech — empowering women leaders through mentorship, visibility, and transformative opportunities.",
      icon: Heart,
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-500",
      borderColor: "border-pink-500/20",
      link: "/gallery/"
    },
    {
      title: "Leadership Unscripted Podcast",
      fullTitle: "The CIO and C-Suite Leadership Unscripted Podcast",
      description:
        "Raw, unfiltered conversations with Africa's top CIOs and C-suite executives — sharing real stories, hard lessons, and visionary insights.",
      icon: Podcast,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-500",
      borderColor: "border-orange-500/20",
      link: "/gallery/"
    },
    {
      title: "Annual Summit",
      fullTitle: "The CIO and C-Suite Summit",
      description:
        "The flagship annual convening of Africa's technology elite — a transformative experience featuring keynotes, masterminds, and strategic networking.",
      icon: Lightbulb,
      color: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-500/10",
      textColor: "text-indigo-500",
      borderColor: "border-indigo-500/20",
      link: "/gallery/"
    },
    {
      title: "Webinars",
      fullTitle:
        "The CIO and C-Suite Strategic Leadership and Management Webinars",
      description:
        "Expert-led virtual sessions delivering cutting-edge insights on digital strategy, governance, and technology management best practices.",
      icon: BookOpen,
      color: "from-teal-500 to-emerald-600",
      bgColor: "bg-teal-500/10",
      textColor: "text-teal-500",
      borderColor: "border-teal-500/20",
      link: "/gallery/"
    },
  ];
</script>

<svelte:head>
  <title>Activities | CIO Club Africa</title>
  <meta
    name="description"
    content="Explore the programs and activities of CIO Club Africa — conferences, workshops, roundtables, podcasts, and more."
  />
</svelte:head>

<div class="min-h-screen">
  <!-- Hero Section -->
  <section
    class="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-primary text-primary-foreground"
  >
    <div class="absolute inset-0 bg-grid-white opacity-5"></div>
    <div
      class="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"
    ></div>
    <div
      class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"
    ></div>
    <div
      class="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center space-y-6"
    >
      <Badge
        variant="outline"
        class="text-primary-foreground border-primary-foreground/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
        >Our Programs</Badge
      >
      <h1
        class="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight"
      >
        Activities & Programs
      </h1>
      <p
        class="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto font-medium leading-relaxed"
      >
        Discover the initiatives that make CIO Club Africa the continent's
        premier platform for technology leadership excellence.
      </p>
    </div>
  </section>

  <!-- Activities Grid -->
  <section class="py-16 md:py-24 bg-background">
    <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each activities as activity, i}
          <a href={activity.link}
            class="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 overflow-hidden"
          >
            <!-- Gradient accent line -->
            <div
              class="absolute top-0 left-0 right-0 h-1 bg-linear-to-r {activity.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>

            <!-- Subtle gradient glow on hover -->
            <div
              class="absolute -bottom-20 -right-20 w-40 h-40 bg-linear-to-br {activity.color} rounded-full opacity-0 group-hover:opacity-[0.06] blur-3xl transition-opacity duration-700 pointer-events-none"
            ></div>

            <div class="relative z-10 space-y-4">
              <!-- Icon -->
              <div
                class="{activity.bgColor} size-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
              >
                <activity.icon class="size-6 {activity.textColor}" />
              </div>

              <!-- Content -->
              <div class="space-y-2">
                <h3
                  class="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-snug"
                >
                  {activity.fullTitle}
                </h3>
                <p class="text-sm text-muted-foreground leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-16 md:py-24 bg-muted/30">
    <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
      <div
        class="bg-primary text-primary-foreground rounded-2xl p-10 lg:p-16 text-center space-y-6 relative overflow-hidden shadow-xl"
      >
        <div class="absolute inset-0 bg-grid-white opacity-5"></div>
        <div
          class="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"
        ></div>
        <div class="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2
            class="text-3xl lg:text-4xl font-bold text-primary-foreground tracking-tight"
          >
            Ready to Lead the Future?
          </h2>
          <p class="text-lg text-primary-foreground/80 font-medium">
            Join CIO Club Africa and gain access to all our exclusive programs,
            events, and a network of the continent's top technology leaders.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <Button
              variant="secondary"
              href="/membership"
              class="font-bold shadow-lg shadow-primary/30 transition-all active:scale-95"
            >
              Become a Member
              <ArrowRight class="ml-2 size-4" />
            </Button>
            <Button
              variant="outline"
              href="/contact"
              class="font-bold border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 transition-all"
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  :global(.bg-grid-white) {
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    );
    background-size: 24px 24px;
  }
</style>
