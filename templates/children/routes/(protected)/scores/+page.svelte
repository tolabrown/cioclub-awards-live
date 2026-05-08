<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Plus,
    Search,
    Filter,
    Loader2,
    Trophy,
    ChartPieIcon,
    Grid2X2,
    Grid3X3,
    Check,
  } from "@lucide/svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { ScoreTypes, editors, Role } from "$lib/constants";
  import ScoreGridCard from "./components/ScoreGridCard.svelte";
  import ScoreTableRow from "./components/ScoreTableRow.svelte";
  import ScoreDrawer from "./components/ScoreDrawer.svelte";
  import ScoreDetailsDialog from "./components/ScoreDetailsDialog.svelte";
  import type { iScore } from "$lib/interface";
  import { useInfiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import { onMount } from "svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import type { User } from "$lib/auth";
  import DistributionChart from "$lib/components/distribution-chart.svelte";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { Skeleton } from "$lib/components/ui/skeleton";

  let { data } = $props();
  const user = page.data.user as User;

  // State
  let scores = $state<iScore[]>([]);
  let meta = $state({ cursor: "", more: false, size: 0 });
  let loading = $state(false);
  let initialLoading = $state(true);
  let searchInput = $state("");
  let selectedType = $state<string>("all");
  let gridColumns = $state(2);

  // Selection State
  let selectedScore = $state<iScore | null>(null);
  let isDrawerOpen = $state(false);
  let isDialogOpen = $state(false);
  let deletingScoreId = $state<string | null>(null);

  // Delete confirmation dialog state
  let isDeleteDialogOpen = $state(false);
  let scoreToDelete = $state<iScore | null>(null);

  let isDesktop = $state(false);
  let showDistribution = $state(false);

  // Fetch statistics from API
  const statisticsQuery = createQuery({
    queryKey: ["scores-statistics"],
    queryFn: async () => {
      const response = await fetch("/api/scores/statistics");
      if (!response.ok) throw new Error("Failed to fetch statistics");
      return response.json() as Promise<Record<string, number>>;
    },
  });

  const distributionData = $derived(
    Object.entries($statisticsQuery.data || {}).map(([group, value]) => ({
      group,
      value,
    })),
  );

  // Initialize data from streamed promise
  $effect(() => {
    data.scores.then((result) => {
      scores = result.data;
      meta = result.meta;
      initialLoading = false;
    });
  });

  // Infinite Scroll
  const loadMore = async () => {
    if (loading || !meta.more) return;
    loading = true;

    const params = new URLSearchParams({
      cursor: meta.cursor,
      ...(searchInput && { search: searchInput }),
      ...(selectedType !== "all" && { scoreType: selectedType }),
    });

    try {
      const res = await fetch(`/api/scores?${params}`);
      const result = await res.json();
      scores = [...scores, ...result.data];
      meta = result.meta;
    } catch (error) {
      console.error(error);
    } finally {
      loading = false;
    }
  };

  const { sentinel } = useInfiniteScroll({
    onLoadMore: loadMore,
    disabled: () => !meta.more || loading,
  });

  // Search & Filter
  let timeout: NodeJS.Timeout;

  const handleSearch = (value: string) => {
    searchInput = value;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      updateUrl();
    }, 500);
  };

  const handleTypeChange = (value: string) => {
    selectedType = value;
    updateUrl();
  };

  const updateUrl = async () => {
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (selectedType !== "all") params.set("scoreType", selectedType);

    await goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });

    // Reset data - await the new promise
    const result = await data.scores;
    scores = result.data;
    meta = result.meta;
  };

  // Sync with URL on load - removed duplicate effect since we handle it above

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    searchInput = params.get("search") || "";
    selectedType = params.get("scoreType") || "all";

    const checkDesktop = () => {
      isDesktop = window.innerWidth >= 768;
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  });

  // Handlers
  const handleScoreClick = (score: iScore) => {
    selectedScore = score;
    if (isDesktop) {
      isDialogOpen = true;
    } else {
      isDrawerOpen = true;
    }
  };

  const handleEdit = () => {
    if (selectedScore) {
      goto(`/scores/${selectedScore.id}`);
    }
  };

  const handleDelete = async (scoreToDeleteParam?: iScore) => {
    const targetScore = scoreToDeleteParam || selectedScore;
    if (!targetScore) return;

    // Open confirmation dialog instead of using confirm()
    scoreToDelete = targetScore;
    isDeleteDialogOpen = true;
  };

  const confirmDelete = async () => {
    if (!scoreToDelete) return;

    const scoreId = scoreToDelete.id;
    deletingScoreId = scoreId;

    try {
      const res = await fetch(`/api/scores/${scoreId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        scores = scores.filter((e) => e.id !== scoreId);
        if (selectedScore?.id === scoreId) {
          isDrawerOpen = false;
          isDialogOpen = false;
          selectedScore = null;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      deletingScoreId = null;
      isDeleteDialogOpen = false;
      scoreToDelete = null;
    }
  };
</script>

<div class="flex flex-col gap-4 overflow-x-hidden">
  <!-- Header -->
  <div
    class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight">
        Scores ({#if initialLoading}
          <Loader2 class="inline h-4 w-4 animate-spin" />
        {:else}
          {meta.size}
        {/if})
      </h1>
      <p class="text-muted-foreground">
        Manage and track children's score performance.
      </p>
    </div>
    {#if editors.includes(user.role as Role)}
      <div class="hidden md:flex gap-2">
        <Button href="/scores/leaderboard" variant="outline">
          <Trophy class="mr-2 h-4 w-4" />
          Leaderboard
        </Button>
        <Button href="/scores/new">
          <Plus class="mr-2 h-4 w-4" />
          Record Score
        </Button>
      </div>
    {:else}
      <div class="hidden md:flex gap-2">
        <Button href="/scores/leaderboard" variant="outline">
          <Trophy class="mr-2 h-4 w-4" />
          Leaderboard
        </Button>
      </div>
    {/if}
  </div>

  <!-- Filters -->
  <div
    class="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-4 px-4 md:-mx-6 md:px-6 flex flex-col gap-4 md:flex-row md:items-center border-b mb-4"
  >
    <div class="relative flex-1 w-full">
      <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search by child name or notes..."
        class="pl-9"
        value={searchInput}
        oninput={(e) => handleSearch(e.currentTarget.value)}
      />
    </div>

    <!-- Mobile Toolbar & Desktop Filters -->
    <div
      class="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto"
    >
      <!-- Mobile Extra Actions -->
      <div class="flex items-center gap-2 md:hidden">
        <Button
          href="/scores/leaderboard"
          variant="outline"
          size="icon"
          title="Leaderboard"
        >
          <Trophy class="h-4 w-4" />
        </Button>
        {#if editors.includes(user.role as Role)}
          <Button
            href="/scores/new"
            variant="default"
            size="icon"
            title="Record Score"
          >
            <Plus class="h-4 w-4" />
          </Button>
        {/if}
      </div>

      <!-- Common Tools (Chart, Filter, Toggle) -->
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          class="shrink-0"
          onclick={() => (showDistribution = true)}
          title="View Distribution"
        >
          <ChartPieIcon class="h-4 w-4" />
        </Button>

        <div class="w-px h-6 bg-border mx-1 shrink-0 hidden md:block"></div>

        <!-- Filter Dropdown -->
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button
              variant={selectedType === "all" ? "outline" : "default"}
              size="icon"
              class="shrink-0"
            >
              <Filter class="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" class="w-56">
            <DropdownMenu.Label>Filter by Score Type</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onclick={() => handleTypeChange("all")}>
              <div class="flex items-center justify-between w-full">
                All Types
                {#if selectedType === "all"}<Check class="h-4 w-4" />{/if}
              </div>
            </DropdownMenu.Item>
            {#each Object.values(ScoreTypes) as type}
              <DropdownMenu.Item onclick={() => handleTypeChange(type)}>
                <div class="flex items-center justify-between w-full">
                  {type}
                  {#if selectedType === type}<Check class="h-4 w-4" />{/if}
                </div>
              </DropdownMenu.Item>
            {/each}
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <!-- Layout Toggle (Mobile) -->
        <Button
          variant="outline"
          size="icon"
          class="lg:hidden shrink-0"
          onclick={() => (gridColumns = gridColumns === 1 ? 2 : 1)}
        >
          {#if gridColumns === 1}
            <Grid2X2 class="h-4 w-4" />
          {:else}
            <Grid3X3 class="h-4 w-4" />
          {/if}
        </Button>
      </div>
    </div>
  </div>

  <!-- Data Display -->
  {#if initialLoading}
    <!-- Desktop Table Skeleton -->
    <div
      class="hidden lg:block overflow-hidden border bg-white dark:bg-background"
    >
      <Table>
        <TableHeader
          class="sticky top-0 z-10 border-b bg-white dark:bg-secondary"
        >
          <TableRow>
            <TableHead>S/N</TableHead>
            <TableHead>Child</TableHead>
            <TableHead>Score Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Score</TableHead>
            <!-- <TableHead>Notes</TableHead> -->
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each Array(10) as _, i}
            <TableRow>
              <td class="p-4"><Skeleton class="h-4 w-8" /></td>
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <Skeleton class="h-10 w-10 rounded-full" />
                  <Skeleton class="h-4 w-32" />
                </div>
              </td>
              <td class="p-4"><Skeleton class="h-4 w-24" /></td>
              <td class="p-4"><Skeleton class="h-4 w-20" /></td>
              <td class="p-4"><Skeleton class="h-4 w-12" /></td>
              <td class="p-4"><Skeleton class="h-4 w-40" /></td>
              <td class="p-4 text-right"
                ><Skeleton class="h-8 w-16 ml-auto" /></td
              >
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </div>

    <!-- Mobile Grid Skeleton -->
    <div
      class="grid gap-4 lg:hidden"
      class:grid-cols-1={gridColumns === 1}
      class:grid-cols-2={gridColumns === 2}
    >
      {#each Array(6) as _}
        <div class="rounded-lg border bg-card p-4 space-y-3">
          <div class="flex items-center gap-3">
            <Skeleton class="h-12 w-12 rounded-full" />
            <div class="space-y-2 flex-1">
              <Skeleton class="h-4 w-3/4" />
              <Skeleton class="h-3 w-1/2" />
            </div>
          </div>
          <div class="space-y-2">
            <Skeleton class="h-3 w-full" />
            <Skeleton class="h-3 w-2/3" />
          </div>
        </div>
      {/each}
    </div>
  {:else if scores.length > 0}
    <!-- Desktop Table -->
    <div
      class="hidden lg:block overflow-hidden border bg-white dark:bg-background"
    >
      <Table>
        <TableHeader
          class="sticky top-0 z-10 border-b bg-white dark:bg-secondary"
        >
          <TableRow>
            <TableHead>S/N</TableHead>
            <TableHead>Child</TableHead>
            <TableHead>Score Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Score</TableHead>
            <!-- <TableHead>Notes</TableHead> -->
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each scores as score, i (score.id)}
            <ScoreTableRow
              {score}
              index={i}
              onClick={() => handleScoreClick(score)}
              onDelete={() => handleDelete(score)}
              isDeleting={deletingScoreId === score.id}
            />
          {/each}
        </TableBody>
      </Table>
    </div>

    <!-- Mobile Grid -->
    <div
      class="grid gap-4 lg:hidden"
      class:grid-cols-1={gridColumns === 1}
      class:grid-cols-2={gridColumns === 2}
    >
      {#each scores as score (score.id)}
        <ScoreGridCard
          {score}
          columns={gridColumns}
          onClick={() => handleScoreClick(score)}
          onDelete={() => handleDelete(score)}
          isDeleting={deletingScoreId === score.id}
        />
      {/each}
    </div>

    <div use:sentinel class="flex justify-center py-4">
      {#if loading}
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      {:else if !meta.more}
        <p class="text-sm text-muted-foreground">No more scores to load</p>
      {/if}
    </div>
  {:else}
    <div
      class="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center-50"
    >
      <div
        class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"
      >
        <Trophy class="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 class="mt-4 text-lg font-semibold">No scores found</h3>
      <p class="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
        {searchInput || selectedType !== "all"
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Get started by recording a new score for a child."}
      </p>
      {#if editors.includes(user.role as Role)}
        <Button href="/scores/new" variant="outline">
          <Plus class="mr-2 h-4 w-4" />
          Record Score
        </Button>
      {/if}
    </div>
  {/if}
</div>

<!-- Details View -->
{#if selectedScore}
  {#if isDesktop}
    <ScoreDetailsDialog
      score={selectedScore}
      bind:open={isDialogOpen}
      onOpenChange={(open) => !open && (selectedScore = null)}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  {:else}
    <ScoreDrawer
      score={selectedScore}
      bind:open={isDrawerOpen}
      onOpenChange={(open) => !open && (selectedScore = null)}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  {/if}
{/if}

<Dialog.Root bind:open={showDistribution}>
  <Dialog.Content class="sm:max-w-[600px]">
    <Dialog.Header>
      <Dialog.Title>Score Type Distribution</Dialog.Title>
      <Dialog.Description>Distribution of scores by type.</Dialog.Description>
    </Dialog.Header>
    <DistributionChart data={distributionData} />
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={isDeleteDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete Score</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete this score? This action cannot be
        undone.
      </Dialog.Description>
    </Dialog.Header>
    {#if scoreToDelete}
      <div class="rounded-lg border bg-muted/50 p-4 space-y-2">
        <p class="text-sm">
          <span class="font-medium">Child:</span>
          {#if typeof scoreToDelete.child === "object" && scoreToDelete.child}
            {scoreToDelete.child.name}
          {:else}
            {scoreToDelete.child}
          {/if}
        </p>
        <p class="text-sm">
          <span class="font-medium">Type:</span>
          {scoreToDelete.scoreType}
        </p>
        <p class="text-sm">
          <span class="font-medium">Points:</span>
          {scoreToDelete.points}
        </p>
      </div>
    {/if}
    <Dialog.Footer class="flex gap-2 sm:justify-end">
      <Button
        variant="outline"
        onclick={() => {
          isDeleteDialogOpen = false;
          scoreToDelete = null;
        }}
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        onclick={confirmDelete}
        disabled={deletingScoreId !== null}
      >
        {#if deletingScoreId}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        {:else}
          Delete
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
