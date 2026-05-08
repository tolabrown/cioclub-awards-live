<script lang="ts">
  import {
    Users,
    Baby,
    GraduationCap,
    UserCircle,
    Calendar,
    UserCheck,
    Trophy,
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
  } from "@lucide/svelte";
  import { fade, fly } from "svelte/transition";
  import StatCard from "$lib/components/dashboard/stat-card.svelte";
  import AreaChartAttendance from "$lib/components/dashboard/area-chart-attendance.svelte";
  import PieChartLabeled from "$lib/components/dashboard/pie-chart-labeled.svelte";
  import BarChartInteractive from "$lib/components/dashboard/bar-chart-interactive.svelte";
  import BarChartMeetingType from "$lib/components/dashboard/bar-chart-meeting-type.svelte";
  import RadialChartStacked from "$lib/components/dashboard/radial-chart-stacked.svelte";
  import RecentActivityCard from "./components/RecentActivityCard.svelte";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "$lib/components/ui/card";
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "$lib/components/ui/avatar";
  import { Badge } from "$lib/components/ui/badge";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import { ScoreTypes, AgeGroups } from "$lib/constants";
  import { Crown, Medal } from "@lucide/svelte";

  import { Skeleton } from "$lib/components/ui/skeleton";
  import type { iActivityLog } from "$lib/interface";
  import { Separator } from "$lib/components/ui/separator";
  import { Hash } from "@lucide/svelte";
  import { browser } from "$app/environment";

  // Define leaderboard item type
  interface LeaderboardItem {
    childId: string;
    childName: string;
    childAgeGroup: string | null;
    childImage: string | null;
    totalScore: number;
    scoreCount: number;
  }

  let { data } = $props();

  // Client-side state for stats and charts
  let stats = $state<Record<string, number>>({});
  let charts = $state<Record<string, any[]>>({});
  let statsLoading = $state(true);
  let chartsLoading = $state(true);

  // Get current year and generate year options
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const yearOptions = [
    { label: "All Years", value: "all" },
    ...Array.from({ length: currentYear - startYear + 1 }, (_, i) => {
      const year = currentYear - i;
      return { label: year.toString(), value: year.toString() };
    }),
  ];

  // Leaderboard state
  let selectedScoreType = $state("all");
  let selectedAgeGroup = $state("all");
  let selectedYear = $state(currentYear.toString()); // Default to current year
  let leaderboardData = $state<LeaderboardItem[]>([]);
  let leaderboardLoading = $state(false);

  // Fetch stats from API
  const fetchStats = async () => {
    statsLoading = true;
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        stats = await response.json();
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      statsLoading = false;
    }
  };

  // Fetch charts from API
  const fetchCharts = async () => {
    chartsLoading = true;
    try {
      const response = await fetch("/api/dashboard/charts");
      if (response.ok) {
        charts = await response.json();
      }
    } catch (error) {
      console.error("Failed to fetch charts:", error);
    } finally {
      chartsLoading = false;
    }
  };

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    leaderboardLoading = true;
    try {
      const params = new URLSearchParams({
        scoreType: selectedScoreType,
        ageGroup: selectedAgeGroup,
        year: selectedYear,
      });
      const response = await fetch(`/api/scores/leaderboard?${params}`);
      const result = await response.json();
      leaderboardData = (result.data?.data || []).slice(0, 12); // Top 12 only
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      leaderboardData = [];
    } finally {
      leaderboardLoading = false;
    }
  };

  // Fetch stats and charts on mount
  $effect(() => {
    fetchStats();
    fetchCharts();
  });

  // Fetch leaderboard when filters change
  $effect(() => {
    // Track dependencies
    selectedScoreType;
    selectedAgeGroup;
    selectedYear;

    fetchLeaderboard();
  });

  // Helper function for initials
  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  // Dialog/Drawer state
  let selectedChild = $state<any>(null);
  let isOpen = $state(false);
  let isDesktop = $state(
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : true,
  );

  // Dynamic imports for Dialog and Drawer (client-side only to avoid SSR errors)
  let Dialog: any = $state(null);
  let Drawer: any = $state(null);

  // Load Dialog and Drawer components on client-side only
  if (browser) {
    import("$lib/components/ui/dialog").then((module) => {
      Dialog = module;
    });
    import("$lib/components/ui/drawer").then((module) => {
      Drawer = module;
    });
  }

  const handleRowClick = (child: any) => {
    selectedChild = child;
    isOpen = true;
  };

  const getTestLabel = (scoreType: string) => {
    if (
      scoreType === ScoreTypes.BIBLE_WRITING ||
      scoreType === "Bible Writing"
    ) {
      return "Submissions";
    }
    return "Tests Taken";
  };

  // Helper function for rank icons
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return { icon: Crown, color: "text-yellow-500 fill-yellow-500" };
      case 1:
        return { icon: Medal, color: "text-gray-400 fill-gray-400" };
      case 2:
        return { icon: Medal, color: "text-amber-700 fill-amber-700" };
      default:
        return null;
    }
  };

  // Prepare options for SelectComponent
  const scoreTypeOptions = [
    { label: "All Types", value: "all" },
    ...Object.values(ScoreTypes).map((type) => ({ label: type, value: type })),
  ];

  const ageGroupOptions = [
    { label: "All Ages", value: "all" },
    ...Object.values(AgeGroups).map((group) => ({
      label: group,
      value: group,
    })),
  ];

  const getAgeGroupWithRange = (ageGroup: string): string => {
    const ageRanges: Record<string, string> = {
      Nursery: "Nursery (0 - 2 yrs)",
      Toddlers: "Toddlers (3 - 4 yrs)",
      Beginners: "Beginners (5 - 6 yrs)",
      Primary: "Primary (7 - 9 yrs)",
      Juniors: "Juniors (10 - 12 yrs)",
      Teenagers: "Teenagers (13 - 17 yrs)",
      "Young Adults": "Young Adults (18 - 24 yrs)",
      Adults: "Adults (25+ yrs)",
    };
    return ageRanges[ageGroup] || ageGroup;
  };
</script>

<div class="w-full animate-in space-y-8 duration-500 fade-in">
  <!-- Header -->
  <div class="space-y-2">
    <h1
      class="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent"
    >
      Dashboard
    </h1>
    <p class="text-muted-foreground">
      Welcome back! Here's your comprehensive platform overview.
    </p>
  </div>

  <div in:fade={{ duration: 300, delay: 100 }}>
    <!-- Stats Grid -->
    <div class="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {#if statsLoading}
        {#each Array(8) as _}
          <div class="rounded-xl border bg-card text-card-foreground shadow">
            <div
              class="p-6 flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <Skeleton class="h-4 w-[100px]" />
              <Skeleton class="h-4 w-4" />
            </div>
            <div class="p-6 pt-0">
              <Skeleton class="h-8 w-[60px] mb-2" />
              <Skeleton class="h-3 w-[140px]" />
            </div>
          </div>
        {/each}
      {:else}
        {#if stats.children !== undefined}
          <div in:fly={{ y: 20, duration: 400, delay: 100 }}>
            <StatCard
              title="Total Children"
              value={stats.children}
              icon={Baby}
              iconColor="text-blue-600 dark:text-blue-500"
              description="Registered children"
            />
          </div>
        {/if}

        {#if stats.teachers !== undefined}
          <div in:fly={{ y: 20, duration: 400, delay: 150 }}>
            <StatCard
              title="Total Teachers"
              value={stats.teachers}
              icon={GraduationCap}
              iconColor="text-purple-600 dark:text-purple-500"
              description="Active teachers"
            />
          </div>
        {/if}

        {#if stats.parents !== undefined}
          <div in:fly={{ y: 20, duration: 400, delay: 200 }}>
            <StatCard
              title="Total Parents"
              value={stats.parents}
              icon={UserCircle}
              iconColor="text-green-600 dark:text-green-500"
              description="Registered parents"
            />
          </div>
        {/if}

        {#if stats.meetings !== undefined}
          <div in:fly={{ y: 20, duration: 400, delay: 250 }}>
            <StatCard
              title="Total Meetings"
              value={stats.meetings}
              icon={Calendar}
              iconColor="text-orange-600 dark:text-orange-500"
              description="Scheduled meetings"
            />
          </div>
        {/if}

        {#if stats.attendees !== undefined}
          <div in:fly={{ y: 20, duration: 400, delay: 300 }}>
            <StatCard
              title="Total Attendees"
              value={stats.attendees}
              icon={UserCheck}
              iconColor="text-pink-600 dark:text-pink-500"
              description="Total attendance records"
            />
          </div>
        {/if}

        {#if stats.scores !== undefined}
          <div in:fly={{ y: 20, duration: 400, delay: 350 }}>
            <StatCard
              title="Total Scores"
              value={stats.scores}
              icon={Trophy}
              iconColor="text-yellow-600 dark:text-yellow-500"
              description="Performance records"
            />
          </div>
        {/if}

        {#if stats.users !== undefined}
          <div in:fly={{ y: 20, duration: 400, delay: 400 }}>
            <StatCard
              title="Total Users"
              value={stats.users}
              icon={Users}
              iconColor="text-indigo-600 dark:text-indigo-500"
              description="Platform users"
            />
          </div>
        {/if}
      {/if}
    </div>

    <!-- Charts Section -->
    {#if chartsLoading}
      <div class="space-y-8">
        <!-- Primary Chart Skeleton -->
        <div class="mb-8">
          <div class="mb-4 flex items-center gap-2">
            <Skeleton class="h-5 w-5" />
            <Skeleton class="h-8 w-48" />
          </div>
          <Skeleton class="h-[350px] w-full rounded-xl" />
        </div>

        <!-- Grid Charts Skeleton -->
        <div class="grid gap-4 lg:grid-cols-2">
          <Skeleton class="h-[300px] w-full rounded-xl" />
          <Skeleton class="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    {:else}
      <!-- Primary Chart Section - Attendance by Meeting -->
      {#if charts.attendanceByMeeting && charts.attendanceByMeeting.length > 0}
        <div class="mb-8" in:fly={{ y: 20, duration: 400, delay: 450 }}>
          <div class="mb-4 flex items-center gap-2">
            <Activity class="h-5 w-5 text-primary" />
            <h2 class="text-2xl font-semibold">Attendance Analytics</h2>
          </div>
          <AreaChartAttendance
            data={charts.attendanceByMeeting}
            title="Attendance by Meeting"
            description="Number of attendees for each meeting over the last 6 months"
          />
        </div>
      {/if}

      <!-- Distribution Charts Section -->
      <div class="mb-8">
        <div class="mb-4 flex items-center gap-2">
          <PieChartIcon class="h-5 w-5 text-primary" />
          <h2 class="text-2xl font-semibold">Distribution Analysis</h2>
        </div>
        <div class="grid gap-4 lg:grid-cols-2">
          {#if charts.childrenByAgeGroup && charts.childrenByAgeGroup.length > 0}
            <div in:fly={{ y: 20, duration: 400, delay: 500 }}>
              <PieChartLabeled
                data={charts.childrenByAgeGroup.map((item) => ({
                  ...item,
                  group: getAgeGroupWithRange(item.group),
                }))}
                title="Children by Age Group"
                description="Age distribution across all registered children"
              />
            </div>
          {/if}

          {#if charts.childrenByGender && charts.childrenByGender.length > 0}
            <div in:fly={{ y: 20, duration: 400, delay: 550 }}>
              <RadialChartStacked
                data={charts.childrenByGender}
                title="Gender Distribution"
                description="Breakdown by gender"
              />
            </div>
          {/if}

          {#if charts.usersByRole && charts.usersByRole.length > 0}
            <div in:fly={{ y: 20, duration: 400, delay: 600 }}>
              <PieChartLabeled
                data={charts.usersByRole}
                title="Users by Role"
                description="Platform user distribution by role"
              />
            </div>
          {/if}

          {#if charts.teachersByLocation && charts.teachersByLocation.length > 0}
            <div in:fly={{ y: 20, duration: 400, delay: 650 }}>
              <PieChartLabeled
                data={charts.teachersByLocation}
                title="Teacher Distribution"
                description="Active teachers by location"
              />
            </div>
          {/if}
        </div>
      </div>

      <!-- Leaderboard Section -->
      <div class="mb-8">
        <div class="mb-4 flex items-center gap-2">
          <Trophy class="h-5 w-5 text-primary" />
          <h2 class="text-2xl font-semibold">Leaders</h2>
        </div>
        <div in:fly={{ y: 20, duration: 400, delay: 700 }}>
          <Card>
            <CardHeader>
              <div
                class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <CardTitle>Leaderboard</CardTitle>
                  <CardDescription
                    >Top 12 performers across all competitions</CardDescription
                  >
                </div>
                <div class="flex flex-col gap-2 sm:flex-row">
                  <SelectComponent
                    options={scoreTypeOptions}
                    bind:value={selectedScoreType}
                    name="scoreType"
                    placeholder="Score Type"
                    class="w-full sm:w-[180px]"
                  />
                  <SelectComponent
                    options={ageGroupOptions}
                    bind:value={selectedAgeGroup}
                    name="ageGroup"
                    placeholder="Age Group"
                    class="w-full sm:w-[150px]"
                  />
                  <SelectComponent
                    options={yearOptions}
                    bind:value={selectedYear}
                    name="year"
                    placeholder="Year"
                    class="w-full sm:w-[130px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {#if leaderboardLoading}
                <div class="space-y-3">
                  {#each Array(12) as _}
                    <div class="flex items-center gap-3 p-3 rounded-lg border">
                      <Skeleton class="h-10 w-10 rounded-full" />
                      <div class="flex-1 space-y-2">
                        <Skeleton class="h-4 w-32" />
                        <Skeleton class="h-3 w-24" />
                      </div>
                      <Skeleton class="h-6 w-16" />
                    </div>
                  {/each}
                </div>
              {:else if leaderboardData.length === 0}
                <div class="text-center py-12 text-muted-foreground">
                  <Trophy class="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leaderboard data available</p>
                  <p class="text-sm">Start recording scores to see rankings</p>
                </div>
              {:else}
                <div class="space-y-2">
                  {#each leaderboardData as child, i}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                      class="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      onclick={() => handleRowClick(child)}
                    >
                      <!-- Rank -->
                      <div class="w-8 flex justify-center">
                        {#if i < 3}
                          {@const rank = getRankIcon(i)}
                          {#if rank}
                            <rank.icon class="h-5 w-5 {rank.color}" />
                          {/if}
                        {:else}
                          <span
                            class="text-sm font-medium text-muted-foreground"
                            >#{i + 1}</span
                          >
                        {/if}
                      </div>

                      <!-- Avatar & Name -->
                      <Avatar class="h-10 w-10 border">
                        <AvatarImage
                          src={child.childImage}
                          alt={child.childName}
                        />
                        <AvatarFallback
                          class="text-xs bg-primary/10 text-primary"
                        >
                          {getInitials(child.childName)}
                        </AvatarFallback>
                      </Avatar>

                      <!-- Details -->
                      <div class="flex-1 min-w-0">
                        <p class="font-medium truncate">{child.childName}</p>
                        <div
                          class="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <Badge variant="outline" class="text-xs">
                            {child.childAgeGroup}
                          </Badge>
                          <div class="items-center gap-2 hidden sm:flex">
                            <span>•</span>
                            <span
                              >{child.scoreCount} test{child.scoreCount !== 1
                                ? "s"
                                : ""}</span
                            >
                          </div>
                        </div>
                      </div>

                      <!-- Score -->
                      <div class="text-right">
                        <p class="font-bold text-lg tabular-nums">
                          {child.totalScore.toFixed(2)}
                        </p>
                        <p
                          class="text-[10px] text-muted-foreground uppercase tracking-wider"
                        >
                          Points
                        </p>
                      </div>
                    </div>
                  {/each}
                </div>

                <!-- View Full Leaderboard Link -->
                <div class="mt-4 text-center">
                  <a
                    href="/scores/leaderboard"
                    class="text-sm text-primary hover:underline"
                  >
                    View Full Leaderboard →
                  </a>
                </div>
              {/if}
            </CardContent>
          </Card>
        </div>
      </div>
    {/if}

    <!-- Recent Activity Section -->
    {#await data.logs}
      <div class="mb-8">
        <div class="rounded-xl border bg-card text-card-foreground shadow">
          <div class="flex flex-col space-y-1.5 p-6">
            <Skeleton class="h-6 w-48" />
            <Skeleton class="h-4 w-72" />
          </div>
          <div class="p-6 pt-0 space-y-4">
            {#each Array(5) as _}
              <div class="flex items-center gap-4">
                <Skeleton class="h-9 w-9 rounded-full" />
                <div class="space-y-2 flex-1">
                  <Skeleton class="h-4 w-full" />
                  <Skeleton class="h-3 w-2/3" />
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {:then logs}
      <div class="mb-8" in:fly={{ y: 20, duration: 400, delay: 800 }}>
        <RecentActivityCard logs={logs as iActivityLog[]} />
      </div>
    {/await}
  </div>

  <!-- No stats available (only show if stats loaded and empty) -->
  {#if !statsLoading && stats && Object.keys(stats).length === 0}
    <div in:fade={{ duration: 300 }}>
      <Card>
        <CardContent class="p-12 text-center">
          <div class="text-muted-foreground">
            <TrendingUp class="mx-auto mb-4 h-16 w-16 opacity-50" />
            <h3 class="mb-2 text-lg font-semibold">No Data Available</h3>
            <p>Start using the platform to see your dashboard statistics.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  {/if}

  <!-- Child Details Dialog (Desktop) / Drawer (Mobile) -->
  {#if Dialog && Drawer}
    {#if isDesktop}
      <Dialog.Root bind:open={isOpen}>
        <Dialog.Content class="max-w-2xl">
          <Dialog.Header>
            <Dialog.Title class="flex items-center gap-2">
              <Trophy class="h-5 w-5 text-primary" />
              Leaderboard Details
            </Dialog.Title>
            <Dialog.Description>
              Performance breakdown for {selectedChild?.childName}
            </Dialog.Description>
          </Dialog.Header>

          {#if selectedChild}
            <div class="space-y-6 py-4">
              <!-- Child Info -->
              <div class="flex items-center gap-4">
                <Avatar class="h-16 w-16 border-2 border-primary">
                  <AvatarImage
                    src={selectedChild.childImage}
                    alt={selectedChild.childName}
                  />
                  <AvatarFallback class="text-lg bg-primary/10 text-primary">
                    {getInitials(selectedChild.childName)}
                  </AvatarFallback>
                </Avatar>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold">
                    {selectedChild.childName}
                  </h3>
                  <div class="flex items-center gap-2 mt-1">
                    <Badge variant="outline"
                      >{selectedChild.childAgeGroup}</Badge
                    >
                  </div>
                </div>
              </div>

              <Separator />

              <!-- Score Breakdown -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <div
                    class="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Trophy class="h-4 w-4" />
                    <span>Total Score</span>
                  </div>
                  <p class="text-3xl font-bold text-primary">
                    {selectedChild.totalScore.toFixed(2)}
                  </p>
                  <p class="text-xs text-muted-foreground">Normalized points</p>
                </div>

                <div class="space-y-1">
                  <div
                    class="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Hash class="h-4 w-4" />
                    <span>{getTestLabel(selectedScoreType)}</span>
                  </div>
                  <p class="text-3xl font-bold">{selectedChild.scoreCount}</p>
                  <p class="text-xs text-muted-foreground">
                    {selectedScoreType === "all"
                      ? "All score types"
                      : selectedScoreType}
                  </p>
                </div>
              </div>

              <Separator />

              <!-- Additional Info -->
              <div class="space-y-3">
                <h4 class="font-semibold text-sm">Score Calculation</h4>
                <div class="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p class="text-sm text-muted-foreground">
                    The total score is calculated by summing all normalized
                    scores.
                  </p>
                  <p class="text-sm text-muted-foreground">
                    <strong>Normalized Score</strong> = Points ÷ Age at Submission
                  </p>
                  <p class="text-sm text-muted-foreground">
                    This ensures fair comparison across different age groups.
                  </p>
                </div>
              </div>
            </div>
          {/if}
        </Dialog.Content>
      </Dialog.Root>
    {:else}
      <Drawer.Root bind:open={isOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title class="flex items-center gap-2">
              <Trophy class="h-5 w-5 text-primary" />
              Leaderboard Details
            </Drawer.Title>
            <Drawer.Description>
              Performance breakdown for {selectedChild?.childName}
            </Drawer.Description>
          </Drawer.Header>

          {#if selectedChild}
            <div class="space-y-6 px-4 pb-8">
              <!-- Child Info -->
              <div class="flex items-center gap-4">
                <Avatar class="h-16 w-16 border-2 border-primary">
                  <AvatarImage
                    src={selectedChild.childImage}
                    alt={selectedChild.childName}
                  />
                  <AvatarFallback class="text-lg bg-primary/10 text-primary">
                    {getInitials(selectedChild.childName)}
                  </AvatarFallback>
                </Avatar>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold">
                    {selectedChild.childName}
                  </h3>
                  <div class="flex items-center gap-2 mt-1">
                    <Badge variant="outline"
                      >{selectedChild.childAgeGroup}</Badge
                    >
                  </div>
                </div>
              </div>

              <Separator />

              <!-- Score Breakdown -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <div
                    class="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Trophy class="h-4 w-4" />
                    <span>Total Score</span>
                  </div>
                  <p class="text-3xl font-bold text-primary">
                    {selectedChild.totalScore.toFixed(2)}
                  </p>
                  <p class="text-xs text-muted-foreground">Normalized points</p>
                </div>

                <div class="space-y-1">
                  <div
                    class="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Hash class="h-4 w-4" />
                    <span>{getTestLabel(selectedScoreType)}</span>
                  </div>
                  <p class="text-3xl font-bold">{selectedChild.scoreCount}</p>
                  <p class="text-xs text-muted-foreground">
                    {selectedScoreType === "all"
                      ? "All score types"
                      : selectedScoreType}
                  </p>
                </div>
              </div>

              <Separator />

              <!-- Additional Info -->
              <div class="space-y-3">
                <h4 class="font-semibold text-sm">Score Calculation</h4>
                <div class="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p class="text-sm text-muted-foreground">
                    The total score is calculated by summing all normalized
                    scores.
                  </p>
                  <p class="text-sm text-muted-foreground">
                    <strong>Normalized Score</strong> = Points ÷ Age at Submission
                  </p>
                  <p class="text-sm text-muted-foreground">
                    This ensures fair comparison across different age groups.
                  </p>
                </div>
              </div>
            </div>
          {/if}
        </Drawer.Content>
      </Drawer.Root>
    {/if}
  {/if}
</div>
