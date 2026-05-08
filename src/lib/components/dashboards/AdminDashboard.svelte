<script lang="ts">
  import type { Component } from "svelte";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Badge } from "$lib/components/ui/badge";
  import { scaleUtc, scaleBand } from "d3-scale";
  import {
    Area,
    AreaChart,
    ChartClipPath,
    BarChart,
    LineChart,
    PieChart,
    Text,
  } from "layerchart";

  import { curveNatural, curveLinearClosed } from "d3-shape";
  import { cubicInOut } from "svelte/easing";
  import {
    Users,
    FileEdit,
    Calendar,
    TrendingUp,
    ShieldCheck,
    Settings,
    LayoutDashboard,
    Activity,
    DollarSign,
    UserPlus,
    Eye,
    ArrowRight,
    Trophy,
    Newspaper,
    Briefcase,
    Crown,
    Sparkles,
    HelpCircle,
    Award,
    Building2
  } from "@lucide/svelte";

  // Props from server
  interface Props {
    stats?: {
      totalUsers: number;
      totalEvents: number;
      totalNews: number;
      totalResources: number;
    };
    adminData?: {
      usersByRole: { role: string; count: number }[];
      awardEntries: number;
      nominations: number;
      tickets: number;
      sponsorships: number;
      contacts: number;
    } | null;
    upcomingEvents?: any[];
    recentNews?: any[];
  }

  let {
    stats,
    adminData,
    upcomingEvents = [],
    recentNews = [],
  }: Props = $props();

  // Derived stats with fallbacks
  const totalUsers = $derived(stats?.totalUsers || 0);
  const totalEvents = $derived(stats?.totalEvents || 0);
  const totalNews = $derived(stats?.totalNews || 0);
  const totalResources = $derived(stats?.totalResources || 0);

  // Chart data - generate from real data or use sample
  const trafficData = [
    { date: new Date("2024-04-01"), desktop: 222, mobile: 150 },
    { date: new Date("2024-04-15"), desktop: 320, mobile: 280 },
    { date: new Date("2024-05-01"), desktop: 450, mobile: 350 },
    { date: new Date("2024-05-15"), desktop: 380, mobile: 420 },
    { date: new Date("2024-06-01"), desktop: 520, mobile: 480 },
    { date: new Date("2024-06-15"), desktop: 610, mobile: 550 },
    { date: new Date("2024-06-30"), desktop: 580, mobile: 520 },
  ];

  const userSignupData = [
    { month: "Jan", signups: 45 },
    { month: "Feb", signups: 62 },
    { month: "Mar", signups: 78 },
    { month: "Apr", signups: 93 },
    { month: "May", signups: 110 },
    { month: "Jun", signups: 125 },
  ];

  // Role distribution from real data
  const roleDistribution = $derived(
    adminData?.usersByRole?.map((r, i) => ({
      role: r.role,
      count: r.count,
      color: `var(--chart-${(i % 5) + 1})`,
    })) || [],
  );

  const engagementData = [
    { metric: "Events", value: 85 },
    { metric: "Content", value: 72 },
    { metric: "Networking", value: 68 },
    { metric: "Resources", value: 90 },
    { metric: "Support", value: 78 },
    { metric: "Community", value: 65 },
  ];

  const areaConfig = {
    desktop: { label: "Desktop", color: "var(--chart-1)" },
    mobile: { label: "Mobile", color: "var(--chart-2)" },
  } satisfies Chart.ChartConfig;

  const barConfig = {
    signups: { label: "New Signups", color: "var(--chart-1)" },
  } satisfies Chart.ChartConfig;

  const pieConfig = {
    count: { label: "Users" },
    user: { label: "Users", color: "var(--chart-1)" },
    member_free: { label: "Free Members", color: "var(--chart-2)" },
    member_individual: { label: "Individual", color: "var(--chart-3)" },
    member_corporate: { label: "Corporate", color: "var(--chart-4)" },
    executive: { label: "Executive", color: "var(--chart-5)" },
  } satisfies Chart.ChartConfig;

  const radarConfig = {
    value: { label: "Score", color: "var(--chart-1)" },
  } satisfies Chart.ChartConfig;

  // Stats with real data
  type IconComponent = Component<{ class?: string }>;
  type StatItem = {
    label: string;
    value: string;
    icon: IconComponent;
    trend: string;
    color: string;
  };

  const displayStats: StatItem[] = $derived([
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      trend: "+12%",
      color: "text-primary",
    },
    {
      label: "Active Events",
      value: totalEvents.toLocaleString(),
      icon: Calendar,
      trend: "+8%",
      color: "text-emerald-500",
    },
    {
      label: "News Articles",
      value: totalNews.toLocaleString(),
      icon: FileEdit,
      trend: "+15%",
      color: "text-amber-500",
    },
    {
      label: "Resources",
      value: totalResources.toLocaleString(),
      icon: Eye,
      trend: "+22%",
      color: "text-blue-500",
    },
  ]);

  const quickLinks = [
    { label: "Awards Hub", href: "/awards", icon: Trophy, color: "text-amber-500" },
    { label: "Latest News", href: "/news", icon: Newspaper, color: "text-sky-500" },
    { label: "Events", href: "/events", icon: Calendar, color: "text-primary" },
    { label: "Corporations", href: "/corporate", icon: Building2, color: "text-amber-500" },
    { label: "Resources", href: "/resources", icon: Briefcase, color: "text-emerald-500" },
    { label: "Membership", href: "/membership", icon: Crown, color: "text-rose-500" },
  ];

  const memberBenefits = [
    { title: "Exclusive Events", description: "Access member-only gatherings", icon: Calendar },
    { title: "Elite Insights", description: "Expert reports and analysis", icon: Sparkles },
    { title: "Networking", description: "Connect with IT leaders", icon: Users },
    { title: "Awards Access", description: "Nominate and vote", icon: Award },
  ];
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
  <!-- Admin Hero Section -->
  <div class="relative overflow-hidden rounded-xl border border-primary/20 bg-[#0A0A0A] shadow-lg">
    <div class="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
    <div class="relative p-4 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
      <div class="space-y-6 text-center md:text-left z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          <ShieldCheck class="size-4" />
          <span class="text-[10px] font-bold uppercase tracking-widest text-white">Administrator Hub</span>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          System <span class="text-amber-500 italic">Overview</span>
        </h1>
        <p class="text-xl text-gray-400 max-w-xl leading-relaxed">
          Complete visibility across all platform metrics. Manage users, track engagement, and lead the future of African IT.
        </p>
        <div class="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
          <Button href="/admin" class="rounded-xl bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/20">
            <LayoutDashboard class="size-5 mr-2" />
            Admin Panel
          </Button>
          <Button variant="outline" href="/admin/pages" class="rounded-xl text-white border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm">
            <Settings class="size-5 mr-2" />
            Manage Pages
          </Button>
        </div>
      </div>
      <div class="relative size-64 hidden lg:flex items-center justify-center">
        <div class="absolute inset-0 bg-amber-500/10 blur-[100px] rounded-full"></div>
        <div class="relative animate-float">
          <ShieldCheck class="size-48 text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]" />
        </div>
      </div>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each displayStats as stat}
      <Card.Root>
        <Card.Content class="p-6">
          <div class="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            <div class="space-y-1">
              <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <p class="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
            <div class="size-12 rounded-xl bg-primary/10 flex items-center justify-center {stat.color}">
              <stat.icon class="size-6" />
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp class="size-4 text-emerald-500" />
            <span class="font-medium text-emerald-500">{stat.trend}</span>
            <span class="text-muted-foreground">vs last month</span>
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

  <!-- Charts Section (Conditional) -->
  {#if trafficData.length > 0 || (adminData && adminData.usersByRole && adminData.usersByRole.length > 0)}
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {#if trafficData.length > 0}
        <Card.Root>
          <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <Card.Title>Platform Traffic</Card.Title>
              <Card.Description>Desktop vs Mobile visitors</Card.Description>
            </div>
            <Activity class="size-5 text-muted-foreground" />
          </Card.Header>
          <Card.Content>
            <ScrollArea class="w-full">
              <Chart.Container config={areaConfig} class="h-[250px] w-full min-w-[400px]">
                <AreaChart
                  legend
                  data={trafficData}
                  x="date"
                  xScale={scaleUtc()}
                  series={[
                    { key: "mobile", label: "Mobile", color: areaConfig.mobile.color },
                    { key: "desktop", label: "Desktop", color: areaConfig.desktop.color },
                  ]}
                  seriesLayout="stack"
                  props={{
                    area: { curve: curveNatural, "fill-opacity": 0.4, line: { class: "stroke-1" } },
                    xAxis: {
                      format: (v: any) =>
                        v.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    },
                    yAxis: { format: () => "" },
                  }}
                  let:tooltip
                >
                  <svelte:fragment slot="marks" let:series let:getAreaProps>
                    <defs>
                      <linearGradient id="fillDesktopAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stop-color="var(--color-desktop)" stop-opacity={1.0} />
                        <stop offset="95%" stop-color="var(--color-desktop)" stop-opacity={0.1} />
                      </linearGradient>
                      <linearGradient id="fillMobileAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stop-color="var(--color-mobile)" stop-opacity={0.8} />
                        <stop offset="95%" stop-color="var(--color-mobile)" stop-opacity={0.1} />
                      </linearGradient>
                    </defs>
                    <ChartClipPath initialWidth={0} motion={{ width: { type: "tween", duration: 1000, easing: cubicInOut } }}>
                      {#each series as s, i (s.key)}
                        <Area {...getAreaProps(s, i)} fill={s.key === "desktop" ? "url(#fillDesktopAdmin)" : "url(#fillMobileAdmin)"} />
                      {/each}
                    </ChartClipPath>
                  </svelte:fragment>
                  <Chart.Tooltip {tooltip} indicator="line" />
                </AreaChart>
              </Chart.Container>
            </ScrollArea>
          </Card.Content>
        </Card.Root>
      {/if}

      {#if userSignupData.length > 0}
        <Card.Root>
          <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <Card.Title>User Signups</Card.Title>
              <Card.Description>New registrations per month</Card.Description>
            </div>
            <UserPlus class="size-5 text-muted-foreground" />
          </Card.Header>
          <Card.Content>
            <ScrollArea class="w-full">
              <Chart.Container config={barConfig} class="h-[250px] w-full min-w-[400px]">
                <BarChart
                  data={userSignupData}
                  x="month"
                  xScale={scaleBand().padding(0.25)}
                  axis="x"
                  series={[{ key: "signups", label: "Signups", color: barConfig.signups.color }]}
                  props={{
                    bars: {
                      stroke: "none",
                      rounded: "all",
                      insetScale: 0.2,
                      motion: {
                        x: { type: "tween", duration: 500, easing: cubicInOut },
                        width: { type: "tween", duration: 500, easing: cubicInOut },
                        height: { type: "tween", duration: 500, easing: cubicInOut },
                        y: { type: "tween", duration: 500, easing: cubicInOut },
                      },
                    },
                    highlight: { area: { fill: "none" } },
                  }}
                />
              </Chart.Container>
            </ScrollArea>
          </Card.Content>
        </Card.Root>
      {/if}

      {#if roleDistribution.length > 0}
        <Card.Root>
          <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <Card.Title>Role Distribution</Card.Title>
              <Card.Description>User breakdown by role</Card.Description>
            </div>
            <Users class="size-5 text-muted-foreground" />
          </Card.Header>
          <Card.Content class="flex justify-center">
            <Chart.Container config={pieConfig} class="aspect-square max-h-[250px]">
              <PieChart data={roleDistribution} key="role" value="count" c="color" innerRadius={60} padding={{ top: 20, right: 20, bottom: 20, left: 20 }} props={{ pie: { } }} />
            </Chart.Container>
          </Card.Content>
        </Card.Root>
      {/if}

      {#if engagementData.length > 0}
        <Card.Root>
          <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <Card.Title>Platform Engagement</Card.Title>
              <Card.Description>Activity across key metrics</Card.Description>
            </div>
            <Activity class="size-5 text-muted-foreground" />
          </Card.Header>
          <Card.Content class="flex justify-center">
            <Chart.Container config={radarConfig} class="aspect-square max-h-[250px]">
              <LineChart
                data={engagementData}
                series={[{ key: "value", label: "Score", color: radarConfig.value.color, props: { fill: radarConfig.value.color, fillOpacity: 0.5 } }]}
                radial x="metric" y="value" xScale={scaleBand()} padding={{ top: 20, right: 20, bottom: 20, left: 20 }}
                props={{
                  spline: { curve: curveLinearClosed, strokeWidth: 2, fill: "var(--color-value)", fillOpacity: 0.5 },
                  xAxis: { tickLength: 0 }, yAxis: { format: () => "" }, grid: { radialY: "linear" }, highlight: { lines: false, points: { r: 4 } },
                }}
              />
            </Chart.Container>
          </Card.Content>
        </Card.Root>
      {/if}
    </div>
  {/if}

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
                Latest Insights
              </Card.Title>
              <Card.Description>Fresh updates from the African tech ecosystem</Card.Description>
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
                Featured Events
              </Card.Title>
              <Card.Description>High-impact gatherings you shouldn't miss</Card.Description>
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
                <p class="text-muted-foreground font-medium">Ready for the next event? Stay tuned!</p>
              </div>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>
    </div>

    <div class="space-y-8">
      <!-- Member Benefits Card -->
      <Card.Root class="bg-primary/5 border-primary/10 shadow-lg overflow-hidden relative">
        <div class="absolute top-0 right-0 p-4 opacity-10"><Trophy class="size-24 rotate-12" /></div>
        <Card.Header>
          <Card.Title class="text-xl font-bold">Member Benefits</Card.Title>
          <Card.Description>Why upgrade today?</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-6">
          <div class="space-y-4">
            {#each memberBenefits as benefit}
              <div class="flex items-start gap-3 group">
                <div class="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform"><benefit.icon class="size-4" /></div>
                <div class="space-y-0.5">
                  <p class="text-sm font-bold text-foreground">{benefit.title}</p>
                  <p class="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            {/each}
          </div>
          <Button href="/membership" class="w-full font-bold shadow-md shadow-primary/20 rounded-xl">Explore All Benefits</Button>
        </Card.Content>
      </Card.Root>

      <!-- Community Support -->
      <Card.Root class="border-border/50">
        <Card.Header>
          <Card.Title class="text-lg">Need Help?</Card.Title>
          <Card.Description>We're here for you</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <p class="text-sm text-muted-foreground">Our community managers are available 24/7 to assist with your journey.</p>
          <div class="flex flex-col gap-2">
             <Button variant="outline" size="sm" href="/contact" class="justify-start gap-2 h-11 border-border/60 hover:bg-muted font-medium text-foreground">
               <Settings class="size-4" /> Support Center
             </Button>
             <Button variant="outline" size="sm" href="/faq" class="justify-start gap-2 h-11 border-border/60 hover:bg-muted font-medium text-foreground">
               <HelpCircle class="size-4" /> View FAQs
             </Button>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Live Notification/Stat -->
      <div class="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
         <div class="absolute top-0 right-0 p-2">
            <span class="flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
         </div>
         <div class="space-y-1">
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Live Status</p>
            <p class="text-sm font-bold text-foreground">Community is Active</p>
            <p class="text-xs text-muted-foreground">{totalUsers || 'Significant'} leaders are currently networking.</p>
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
