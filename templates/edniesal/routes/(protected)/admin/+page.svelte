<script lang="ts">
  import StatsOverview from "$lib/components/dashboard/StatsOverview.svelte";
  import UserGrowthChart from "$lib/components/dashboard/UserGrowthChart.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    FileText,
    Settings,
    LayoutGrid,
    MessageSquare,
    Users,
    ChevronRight,
  } from "@lucide/svelte";

  let { data } = $props();
</script>

<div class="flex-1 space-y-4 pt-4">
  <!-- Header -->
  <div
    class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
  >
    <div>
      <h2
        class="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2"
      >
        <LayoutGrid class="size-8 text-primary" />
        Admin Dashboard
      </h2>
      <p
        class="text-sm font-bold text-muted-foreground uppercase tracking-wider"
      >
        Platform performance and content overview
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        href="/admin/pages"
        class="gap-2 font-bold shadow-sm"
      >
        <FileText class="size-4" /> Edit Content
      </Button>
      <Button
        variant="outline"
        href="/admin/contacts"
        class="gap-2 font-bold shadow-sm"
      >
        <MessageSquare class="size-4" /> Inquiries
      </Button>
      <Button
        variant="outline"
        href="/admin/applications"
        class="gap-2 font-bold shadow-sm"
      >
        <FileText class="size-4" /> Applications
      </Button>
      <Button variant="outline" href="/users" class="gap-2 font-bold shadow-sm">
        <Users class="size-4" /> Users
      </Button>
      <Button href="/admin/settings" class="gap-2 font-bold shadow-lg">
        <Settings class="size-4" /> Settings
      </Button>
    </div>
  </div>

  <!-- Key Metrics -->
  <StatsOverview stats={data.stats} />

  <!-- Charts Layout -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
    <div class="md:col-span-1 lg:col-span-4 space-y-4">
      <UserGrowthChart data={data.charts.userGrowth} />
    </div>

    <div class="md:col-span-1 lg:col-span-3 space-y-4">
      <!-- Quick Links / Recent Activity Placeholder -->
      <div
        class="rounded-xl border border-border bg-card/50 backdrop-blur-md p-6 space-y-4 shadow-lg min-h-[300px] flex flex-col justify-between"
      >
        <div>
          <h3
            class="text-xs font-bold uppercase tracking-widest text-primary mb-4"
          >
            Recent Inquiries
          </h3>
          <div class="space-y-4">
            <p class="text-sm text-muted-foreground italic">
              Overview of recently received inquiries will appear here.
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <Button
            href="/admin/contacts"
            variant="ghost"
            class="w-full text-xs font-bold uppercase tracking-widest gap-2 text-muted-foreground hover:text-primary justify-between"
          >
            View Contact Inquiries <ChevronRight class="size-4" />
          </Button>
          <Button
            href="/admin/applications"
            variant="ghost"
            class="w-full text-xs font-bold uppercase tracking-widest gap-2 text-muted-foreground hover:text-primary justify-between"
          >
            View Job Applications <ChevronRight class="size-4" />
          </Button>
          <Button
            href="/admin/pages/edit/ladies-in-tech"
            variant="ghost"
            class="w-full text-xs font-bold uppercase tracking-widest gap-2 text-muted-foreground hover:text-primary justify-between"
          >
            Ladies in Tech Events <ChevronRight class="size-4" />
          </Button>
          <Button
            href="/admin/ladies-in-tech/registrations"
            variant="ghost"
            class="w-full text-xs font-bold uppercase tracking-widest gap-2 text-muted-foreground hover:text-primary justify-between"
          >
            Event Registrations <ChevronRight class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :global(.layerchart-container) {
    --chart-1: hsl(var(--primary));
    --chart-2: #f59e0b;
    --chart-3: #10b981;
    --chart-4: #8b5cf6;
    --chart-5: #ec4899;
  }
</style>
