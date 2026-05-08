<script lang="ts">
  import StatsOverview from "$lib/components/dashboard/StatsOverview.svelte";
  import UserGrowthChart from "$lib/components/dashboard/UserGrowthChart.svelte";
  import AwardStatusChart from "$lib/components/dashboard/AwardStatusChart.svelte";
  import RevenueChart from "$lib/components/dashboard/RevenueChart.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    ScrollArea,
    ScrollAreaScrollbar,
  } from "$lib/components/ui/scroll-area";
  import {
    FileText,
    Plus,
    ExternalLink,
    Settings,
    LayoutGrid,
    MessageSquare,
    Users,
    CreditCard,
  } from "@lucide/svelte";

  let { data } = $props();
</script>

<div class="flex-1 space-y-4 pt-6">
  <!-- Sticky Header -->
  <div
    class="sticky top-16 z-30 bg-background/95 backdrop-blur-sm pb-4 -mx-4 px-4 border-b border-border/30"
  >
    <div class="flex items-start flex-col gap-4">
      <div>
        <h2
          class="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2"
        >
          <LayoutGrid class="size-8 text-primary" />
          Admin Dashboard
        </h2>
        <p class="text-muted-foreground font-medium">
          Welcome back, here's an overview of the platform performance and
          content.
        </p>
      </div>
      <ScrollArea orientation="horizontal" class="w-full">
        <div class="flex items-center gap-3 pb-2 min-w-max">
          <Button
            variant="outline"
            href="/admin/pages"
            class="gap-2 font-bold shadow-sm shrink-0"
          >
            <FileText class="size-4" /> Edit Content
          </Button>
          <Button
            variant="outline"
            href="/admin/contacts"
            class="gap-2 font-bold shadow-sm shrink-0"
          >
            <MessageSquare class="size-4" /> Contact Inquiries
          </Button>
          <Button
            variant="outline"
            href="/admin/members"
            class="gap-2 font-bold shadow-sm shrink-0"
          >
            <Users class="size-4" /> Members
          </Button>
          <Button
            variant="outline"
            href="/admin/payments"
            class="gap-2 font-bold shadow-sm shrink-0"
          >
            <CreditCard class="size-4" /> Payments
          </Button>
          <Button
            href="/admin/settings"
            class="gap-2 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0"
          >
            <Settings class="size-4" /> System Settings
          </Button>
        </div>
        <ScrollAreaScrollbar orientation="horizontal" />
      </ScrollArea>
    </div>
  </div>

  <!-- Key Metrics -->
  <StatsOverview stats={data.stats} />

  <!-- Charts Layout -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
    <div class="md:col-span-1 lg:col-span-4 space-y-4 text-center items-center">
      <UserGrowthChart data={data.charts.userGrowth} />
      <RevenueChart data={data.charts.revenue} />
    </div>

    <div class="md:col-span-1 lg:col-span-3 space-y-4">
      <AwardStatusChart data={data.charts.entryStatus} />

      <!-- Quick Actions / Status -->
      <div
        class="rounded-xl border border-border/50 bg-card/50 backdrop-blur-md p-6 space-y-4"
      >
        <h3 class="text-sm font-bold uppercase tracking-[0.2em] text-primary">
          Nominations Snapshot
        </h3>
        <div class="space-y-4">
          {#each data.charts.nominations as nomination}
            <div class="flex items-center justify-between group">
              <div class="space-y-1">
                <p
                  class="text-sm font-bold group-hover:text-primary transition-colors"
                >
                  {nomination.category}
                </p>
                <div class="w-full bg-muted h-1 rounded-full overflow-hidden">
                  {#if data.charts.nominations.length > 0}
                    {@const maxCount = Math.max(
                      ...data.charts.nominations.map((n) => n.count),
                    )}
                    <div
                      class="bg-primary h-full transition-all duration-1000"
                      style={`width: ${(nomination.count / maxCount) * 100}%`}
                    ></div>
                  {/if}
                </div>
              </div>
              <span
                class="text-xs font-black bg-primary/10 text-primary px-2 py-1 rounded-md ml-4"
                >{nomination.count}</span
              >
            </div>
          {/each}
        </div>
        <Button
          variant="ghost"
          class="w-full text-xs font-bold uppercase tracking-widest gap-2 text-muted-foreground hover:text-primary"
        >
          View Detail Table <ExternalLink class="size-3" />
        </Button>
      </div>
    </div>
  </div>
</div>

<style>
  :global(.layerchart-container) {
    --chart-1: #135bec;
    --chart-2: #f59e0b;
    --chart-3: #10b981;
    --chart-4: #8b5cf6;
    --chart-5: #ec4899;
  }
</style>
