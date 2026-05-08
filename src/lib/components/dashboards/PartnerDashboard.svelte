<script lang="ts">
  import type { Component } from "svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { scaleUtc, scaleBand } from "d3-scale";
  import { BarChart, LineChart } from "layerchart";
  import { curveNatural } from "d3-shape";
  import { cubicInOut } from "svelte/easing";
  import {
    Handshake,
    Calendar,
    ArrowRight,
    TrendingUp,
    Users,
    FileText,
    MessageSquare,
    Award,
    Globe,
    Mail,
    Trophy,
    Newspaper,
    Crown,
    HelpCircle,
    Briefcase,
    Sparkles,
    Zap
  } from "@lucide/svelte";

  // Props
  interface Props {
    stats?: {
      totalUsers: number;
      totalEvents: number;
      totalNews: number;
      totalResources: number;
    };
    upcomingEvents?: any[];
    recentNews?: any[];
  }

  let { stats, upcomingEvents = [], recentNews = [] }: Props = $props();

  // Partnership activities
  const partnershipActivities = [
    { activity: "Co-Events", count: 8 },
    { activity: "Content", count: 12 },
    { activity: "Referrals", count: 5 },
    { activity: "Training", count: 3 },
  ];

  // Growth data
  const growthData = [
    { date: new Date("2024-04-01"), value: 45 },
    { date: new Date("2024-04-15"), value: 58 },
    { date: new Date("2024-05-01"), value: 72 },
    { date: new Date("2024-05-15"), value: 85 },
    { date: new Date("2024-06-01"), value: 98 },
    { date: new Date("2024-06-15"), value: 115 },
    { date: new Date("2024-06-30"), value: 128 },
  ];

  const barConfig = {
    count: { label: "Activities", color: "var(--chart-1)" },
  } satisfies Chart.ChartConfig;

  const lineConfig = {
    value: { label: "Growth Index", color: "var(--chart-2)" },
  } satisfies Chart.ChartConfig;

  interface StatItem {
    label: string;
    value: string;
    icon: Component<{ class?: string }>;
    trend: string;
    color: string;
    bgColor: string;
  }

  const partnerStats: StatItem[] = [
    { label: "Partner Since", value: "2022", icon: Award, trend: "Level 3", color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { label: "Joint Initiatives", value: "28", icon: Handshake, trend: "+4", color: "text-primary", bgColor: "bg-primary/10" },
    { label: "Referrals", value: "45", icon: Users, trend: "+12", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { label: "Co-Branded", value: "12", icon: FileText, trend: "+2", color: "text-sky-500", bgColor: "bg-sky-500/10" },
  ];

  const quickLinks = [
    { label: "Awards Hub", href: "/awards", icon: Trophy, color: "text-amber-500" },
    { label: "Latest News", href: "/news", icon: Newspaper, color: "text-sky-500" },
    { label: "Events", href: "/events", icon: Calendar, color: "text-primary" },
    { label: "Our Team", href: "/team", icon: Users, color: "text-violet-500" },
    { label: "Resources", href: "/resources", icon: Briefcase, color: "text-emerald-500" },
    { label: "Membership", href: "/membership", icon: Crown, color: "text-rose-500" },
  ];

  const partnerBenefits = [
    { title: "Co-Marketing", description: "Boost your brand visibility", icon: Globe },
    { title: "Talent Access", description: "Direct pipeline to IT leaders", icon: Users },
    { title: "Event Hosting", description: "Lead exclusive gatherings", icon: Calendar },
    { title: "Insights Feed", description: "Market data and reports", icon: Newspaper },
  ];
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
  <!-- Partner Hero Section -->
  <div class="relative overflow-hidden rounded-xl border border-primary/20 bg-[#0A0A0A] shadow-lg">
    <div class="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
    <div class="relative p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
      <div class="space-y-6 text-center md:text-left z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          <Handshake class="size-4" />
          <span class="text-[10px] font-bold uppercase tracking-widest text-white">Strategic Partnership Active</span>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          Partner <span class="text-amber-500 italic">Dashboard</span>
        </h1>
        <p class="text-xl text-gray-400 max-w-xl leading-relaxed">
          Monitor joint initiatives, track referral growth, and leverage co-branding opportunities with the most influential tech club in Africa.
        </p>
        <div class="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
          <Button href="/contact" class="rounded-xl px-10 bg-amber-500 hover:bg-amber-600 text-black shadow-xl shadow-amber-500/20">
            Collaborate
          </Button>
          <Button variant="outline" href="/resources" class="rounded-xl px-10 text-white border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm">
            Portal Access
          </Button>
        </div>
      </div>
      <div class="relative size-64 hidden lg:flex items-center justify-center">
        <div class="absolute inset-0 bg-amber-500/10 blur-[100px] rounded-full"></div>
        <div class="relative animate-float">
          <Globe class="size-48 text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]" />
        </div>
      </div>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-4">
    {#each partnerStats as stat}
      <Card.Root>
        <Card.Content class="p-6">
          <div class="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            <div class="space-y-1">
              <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <p class="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
            <div class="size-12 rounded-xl {stat.bgColor} flex items-center justify-center {stat.color}">
              <stat.icon class="size-6" />
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp class="size-4 text-emerald-500" />
            <span class="font-medium text-emerald-500">{stat.trend}</span>
            <span class="text-muted-foreground">Status OK</span>
          </div>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>

  <!-- Quick Access Grid -->
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
      <h2 class="text-2xl font-bold text-foreground tracking-tight">Quick Access</h2>
      <p class="text-sm text-muted-foreground font-medium">Shortcuts to key platform areas</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {#each quickLinks as link}
        <a 
          href={link.href}
          class="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-all group hover:scale-[1.03] hover:shadow-xl"
        >
          <div class="size-16 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-border {link.color}">
            <link.icon class="size-8 stroke-[1.5]" />
          </div>
          <span class="text-[11px] font-black text-foreground text-center uppercase tracking-[0.15em] opacity-80 group-hover:opacity-100 transition-opacity">{link.label}</span>
        </a>
      {/each}
    </div>
  </div>

  <!-- Charts Row -->
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
    <!-- Partnership Activities -->
    {#if partnershipActivities.length > 0}
      <Card.Root>
        <Card.Header>
          <Card.Title class="flex items-center gap-2">
            <Handshake class="size-5 text-muted-foreground" />
            Activities Breakdown
          </Card.Title>
          <Card.Description>Collaboration initiatives analysis</Card.Description>
        </Card.Header>
        <Card.Content>
          <ScrollArea class="w-full">
            <Chart.Container config={barConfig} class="h-[250px] w-full min-w-[400px]">
              <BarChart
                data={partnershipActivities}
                x="activity"
                xScale={scaleBand()}
                axis="x"
                series={[{ key: "count", label: "Activities", color: barConfig.count.color }]}
                props={{
                  bars: { stroke: "none", rounded: "all", insetScale: 0.2 },
                  highlight: { area: { fill: "none" } },
                }}
              />
            </Chart.Container>
          </ScrollArea>
        </Card.Content>
      </Card.Root>
    {/if}

    <!-- Growth Trend -->
    {#if growthData.length > 0}
      <Card.Root>
        <Card.Header>
          <Card.Title class="flex items-center gap-2">
            <TrendingUp class="size-5 text-primary" />
            Growth Index
          </Card.Title>
          <Card.Description>Partnership impact over time</Card.Description>
        </Card.Header>
        <Card.Content>
          <ScrollArea class="w-full">
            <Chart.Container config={lineConfig} class="h-[250px] w-full min-w-[400px]">
              <LineChart
                data={growthData}
                x="date"
                xScale={scaleUtc()}
                axis="x"
                series={[{ key: "value", label: "Index", color: lineConfig.value.color }]}
                props={{
                  spline: { curve: curveNatural, strokeWidth: 3 },
                  xAxis: {
                    format: (v: any) => v.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  },
                  highlight: { points: { r: 5, fill: "white", strokeWidth: 2 } },
                }}
                let:tooltip={tooltipData}
              >
                <Chart.Tooltip tooltip={tooltipData} hideLabel />
              </LineChart>
            </Chart.Container>
          </ScrollArea>
        </Card.Content>
      </Card.Root>
    {/if}
  </div>

  <!-- News & Events Row -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-8">
      <!-- Latest News -->
      <Card.Root class="overflow-hidden border-border/50 shadow-md">
        <Card.Header class="bg-muted/30 pb-4 border-b text-foreground">
          <div class="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            <div class="space-y-1">
              <Card.Title class="flex items-center gap-2">
                <Newspaper class="size-5 text-sky-500" />
                Partner Insights
              </Card.Title>
              <Card.Description>Market updates and ecosystem news</Card.Description>
            </div>
            <Button variant="secondary" size="sm" href="/news" class="rounded-lg font-bold">View All</Button>
          </div>
        </Card.Header>
        <Card.Content class="p-0">
          <div class="divide-y divide-border">
            {#each recentNews.slice(0, 4) as article}
              <a href="/news/{article.id}" class="flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors group">
                <div class="size-16 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border">
                  {#if article.thumbnail}
                    <img src={article.thumbnail} alt={article.title} class="size-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {:else}
                    <div class="size-full flex items-center justify-center bg-sky-500/10 text-sky-500">
                      <Newspaper class="size-6" />
                    </div>
                  {/if}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <Badge variant="outline" class="text-[10px] uppercase tracking-tighter px-1.5 py-0 bg-sky-500/5 text-sky-500 border-sky-500/20">{article.category || 'News'}</Badge>
                    <span class="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{new Date(article.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p class="font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">{article.title}</p>
                </div>
                <ArrowRight class="size-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </a>
            {:else}
              <div class="p-12 text-center space-y-3">
                <div class="size-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                   <Newspaper class="size-6 text-muted-foreground" />
                </div>
                <p class="text-muted-foreground font-medium">No recent news available</p>
              </div>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Upcoming Events -->
      <Card.Root class="overflow-hidden border-border/50 shadow-md">
        <Card.Header class="bg-muted/30 pb-4 border-b text-foreground">
          <div class="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            <div class="space-y-1">
              <Card.Title class="flex items-center gap-2">
                <Calendar class="size-5 text-primary" />
                Collaboration Opportunities
              </Card.Title>
              <Card.Description>Co-hosting and sponsorship openings</Card.Description>
            </div>
            <Button variant="secondary" size="sm" href="/events" class="rounded-lg font-bold">Browse All</Button>
          </div>
        </Card.Header>
        <Card.Content class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each upcomingEvents.slice(0, 4) as event}
              <div class="group relative overflow-hidden rounded-xl border border-border p-4 transition-all bg-card shadow-sm">
                <div class="flex items-start gap-4">
                  <div class="flex flex-col items-center justify-center size-14 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                    <span class="text-sm font-bold uppercase">{new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                    <span class="text-xl font-bold leading-none">{new Date(event.date).getDate()}</span>
                  </div>
                  <div class="flex-1 min-w-0 text-foreground">
                    <h4 class="font-bold text-foreground line-clamp-1">{event.title}</h4>
                    <p class="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Briefcase class="size-3" /> {event.location || 'Online'}</p>
                    <div class="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center justify-between"><Badge variant="secondary" class="text-[10px] font-bold tracking-tighter uppercase">{event.type}</Badge></div>
                  </div>
                </div>
              </div>
            {:else}
              <div class="col-span-full p-12 text-center space-y-3">
                <div class="size-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                   <Calendar class="size-6 text-muted-foreground" />
                </div>
                <p class="text-muted-foreground font-medium">Stay tuned for new collaboration opportunities!</p>
              </div>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>
    </div>

    <div class="space-y-8">
      <!-- Partner Status Card -->
      <Card.Root class="bg-primary/5 border-primary/10 shadow-lg overflow-hidden relative">
        <div class="absolute top-0 right-0 p-4 opacity-10"><Handshake class="size-24 rotate-12" /></div>
        <Card.Header>
          <Card.Title class="text-xl font-bold">Partnership Value</Card.Title>
          <Card.Description>Maximize your collaboration</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-6">
          <div class="space-y-4">
            {#each partnerBenefits as benefit}
              <div class="flex items-start gap-3 group">
                <div class="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform"><benefit.icon class="size-4" /></div>
                <div class="space-y-0.5">
                  <p class="text-sm font-bold text-foreground">{benefit.title}</p>
                  <p class="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            {/each}
          </div>
          <Button href="/resources" class="w-full font-bold shadow-md shadow-primary/20 rounded-xl">Partner Portal</Button>
        </Card.Content>
      </Card.Root>

      <!-- Connection Points -->
      <Card.Root class="border-border/50">
        <Card.Header>
          <Card.Title class="text-lg">Need Assistance?</Card.Title>
          <Card.Description>Dedicated partner support</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <p class="text-sm text-muted-foreground">Contact your partnership manager for direct support and custom initiatives.</p>
          <div class="flex flex-col gap-2">
             <Button variant="outline" size="sm" href="/contact" class="justify-start gap-2 h-11 border-border/60 hover:bg-muted font-medium text-foreground">
               <Mail class="size-4" /> Partnership Manager
             </Button>
             <Button variant="outline" size="sm" href="/news" class="justify-start gap-2 h-11 border-border/60 hover:bg-muted font-medium text-foreground">
               <Globe class="size-4" /> Media Relations
             </Button>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Live Pulse -->
      <div class="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
         <div class="absolute top-0 right-0 p-2">
            <span class="flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
         </div>
         <div class="space-y-1">
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Live Pulse</p>
            <p class="text-sm font-bold text-foreground">Partner Network Active</p>
            <p class="text-xs text-muted-foreground">Collaboration channels are currently buzzing.</p>
         </div>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(2deg); }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
</style>
