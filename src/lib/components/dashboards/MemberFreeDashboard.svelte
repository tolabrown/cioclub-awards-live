<script lang="ts">
  import type { Component } from "svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Crown,
    Calendar,
    ArrowRight,
    Newspaper,
    Users,
    Award,
    Sparkles,
    Star,
    BookOpen,
    Rocket,
    Trophy,
    Briefcase,
    Settings,
    HelpCircle,
    TrendingUp
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

  const quickLinks = [
    { label: "Awards Hub", href: "/awards", icon: Trophy, color: "text-amber-500" },
    { label: "Latest News", href: "/news", icon: Newspaper, color: "text-sky-500" },
    { label: "Events", href: "/events", icon: Calendar, color: "text-primary" },
    { label: "Our Team", href: "/team", icon: Users, color: "text-violet-500" },
    { label: "Resources", href: "/resources", icon: Briefcase, color: "text-emerald-500" },
    { label: "Membership", href: "/membership", icon: Crown, color: "text-rose-500" },
  ];

  type IconComponent = Component<{ class?: string }>;
  type BenefitItem = {
    title: string;
    description: string;
    icon: IconComponent;
    available: boolean;
  };

  const memberBenefits: BenefitItem[] = [
    { title: "Exclusive Events", description: "Access member-only gatherings", icon: Calendar, available: false },
    { title: "Elite Insights", description: "Expert reports and analysis", icon: Sparkles, available: false },
    { title: "Networking", description: "Connect with IT leaders", icon: Users, available: true },
    { title: "Awards Access", description: "Nominate and vote", icon: Award, available: false },
  ];
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
  <!-- Free Member Hero Section -->
  <div class="relative overflow-hidden rounded-xl border border-primary/20 bg-[#0A0A0A] shadow-lg">
    <div class="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
    <div class="relative p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
      <div class="space-y-6 text-center md:text-left z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          <Star class="size-4" />
          <span class="text-[10px] font-bold uppercase tracking-widest text-white">Free Membership Active</span>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          Welcome to the <span class="text-amber-500 italic">Club</span>
        </h1>
        <p class="text-xl text-gray-400 max-w-xl leading-relaxed">
          Unlock the full potential of African IT leadership. Your journey has just begun. Upgrade to access executive whitepapers and VIP networking.
        </p>
        <div class="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
          <Button href="/membership" class="rounded-xl px-10 bg-amber-500 hover:bg-amber-600 text-black shadow-xl shadow-amber-500/20">
            Upgrade Membership
          </Button>
          <Button variant="outline" href="/about" class="rounded-xl px-10 text-white border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm">
             Club Guidelines
          </Button>
        </div>
      </div>
      <div class="relative size-64 hidden lg:flex items-center justify-center">
        <div class="absolute inset-0 bg-amber-500/10 blur-[100px] rounded-full"></div>
        <div class="relative animate-float">
          <Rocket class="size-48 text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]" />
        </div>
      </div>
    </div>
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
          <Card.Description>Unlock your potential</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-6">
          <div class="space-y-4">
            {#each memberBenefits as benefit}
              <div class="flex items-start gap-3 group {benefit.available ? '' : 'opacity-50'}">
                <div class="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform"><benefit.icon class="size-4" /></div>
                <div class="space-y-0.5">
                  <p class="text-sm font-bold text-foreground">{benefit.title}</p>
                  <p class="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            {/each}
          </div>
          <Button href="/membership" class="w-full font-bold shadow-md shadow-primary/20 rounded-xl">Upgrade Today</Button>
        </Card.Content>
      </Card.Root>

      <!-- Community Support -->
      <Card.Root class="border-border/50">
        <Card.Header>
          <Card.Title class="text-lg">Need Help?</Card.Title>
          <Card.Description>We're here for you</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <p class="text-sm text-muted-foreground">Our community managers are available to assist with your journey.</p>
          <div class="flex flex-col gap-2">
             <Button variant="outline" size="sm" href="/contact" class="justify-start gap-2 h-11 border-border/60 hover:bg-muted font-medium text-foreground">
               <Settings class="size-4" /> Help Center
             </Button>
             <Button variant="outline" size="sm" href="/faq" class="justify-start gap-2 h-11 border-border/60 hover:bg-muted font-medium text-foreground">
               <HelpCircle class="size-4" /> Member FAQs
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
            <p class="text-xs text-muted-foreground">African IT leaders are currently networking.</p>
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
