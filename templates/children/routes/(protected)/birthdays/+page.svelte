<script lang="ts">
  import type { iChild } from "$lib/interface";
  import {
    AlertCircleIcon,
    Loader2,
    Search,
    Calendar,
    Cake,
    Sparkles,
    ChartPieIcon,
    Grid2X2,
    Grid3X3,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import FilterButton, {
    type FilterField,
  } from "$lib/components/ui/filter/FilterButton.svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import ChildGridCard from "../children/components/ChildGridCard.svelte";
  import ChildDetailsDialog from "../children/components/ChildDetailsDialog.svelte";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { Debounced } from "runed";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { Fields, Role } from "$lib/constants";
  import type { User } from "$lib/auth";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import * as Select from "$lib/components/ui/select/index.js";
  import DistributionChart from "$lib/components/distribution-chart.svelte";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { cn } from "$lib/utils";

  const user = page.data.user as User;

  const ageGroups = [
    "Nursery",
    "Toddlers",
    "Beginners",
    "Primary",
    "Juniors",
    "Teenagers",
    "Young Adults",
    "Adults",
  ];

  const months = [
    { label: "January", value: "1" },
    { label: "February", value: "2" },
    { label: "March", value: "3" },
    { label: "April", value: "4" },
    { label: "May", value: "5" },
    { label: "June", value: "6" },
    { label: "July", value: "7" },
    { label: "August", value: "8" },
    { label: "September", value: "9" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  let handleInput = $state(page.url.searchParams.get("search") || "");
  let showDistribution = $state(false);
  let gridColumns = $state(2); // 1 or 2 columns for mobile

  let filters = $state<FilterField[]>([
    {
      name: "month",
      label: "Birthday Month",
      type: "select",
      value: page.url.searchParams.get("month") || "",
      options: months,
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      value: page.url.searchParams.get("gender") || "",
      options: [
        { label: "Boy", value: "boy" },
        { label: "Girl", value: "girl" },
      ],
    },
    {
      name: "ageGroup",
      label: "Age Group",
      type: "select",
      value: page.url.searchParams.get("ageGroup") || "",
      options: ageGroups.map((g) => ({ label: g, value: g })),
    },
  ]);

  const getParams = () => {
    const filterParams: Record<string, any> = {};
    filters.forEach((f) => {
      if (f.value !== "" && f.value !== undefined) {
        filterParams[f.name] = f.value;
      }
    });

    return {
      host: page.url.origin,
      search: debouncedHandle.current,
      field: Fields.CHILDREN,
      sortBy: "birthday",
      active: "true",
      ...filterParams,
    };
  };

  const debouncedHandle = new Debounced(() => handleInput, 500);
  const childrenQuery = $derived(
    infiniteScroll.listQueryAlternate<iChild>(getParams()),
  );

  const statsQuery = createQuery({
    queryKey: ["birthday-statistics"],
    queryFn: async () => {
      const response = await fetch(
        `${page.url.origin}/api/children/birthday-statistics`,
      );
      if (!response.ok) throw new Error("Failed to fetch statistics");
      return response.json();
    },
  });

  const distributionData = $derived(
    Object.entries($statsQuery.data || {}).map(([group, value]) => ({
      group,
      value,
    })),
  );

  const handleApplyFilters = () => {
    const params = new URLSearchParams(page.url.searchParams);
    filters.forEach((f) => {
      if (f.value !== "" && f.value !== undefined) {
        params.set(f.name, f.value);
      } else {
        params.delete(f.name);
      }
    });
    goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
    $childrenQuery.refetch();
  };

  const handleResetFilters = () => {
    filters.forEach((f) => {
      f.value = "";
    });

    const params = new URLSearchParams(page.url.searchParams);
    filters.forEach((f) => {
      params.delete(f.name);
    });
    goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });

    $childrenQuery.refetch();
  };

  let viewingChild = $state<iChild | null>(null);
  let detailsOpen = $state(false);

  const handleView = (child: iChild) => {
    viewingChild = child;
    detailsOpen = true;
  };

  const handleDetailsOpenChange = (open: boolean) => {
    detailsOpen = open;
    if (!open) {
      setTimeout(() => (viewingChild = null), 300);
    }
  };

  const observe = (node: HTMLElement) => {
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        $childrenQuery.hasNextPage &&
        !$childrenQuery.isFetchingNextPage
      ) {
        $childrenQuery.fetchNextPage();
      }
    });
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      },
    };
  };
</script>

<div class="flex flex-col gap-6 pb-10">
  <div
    class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 border"
  >
    <div class="absolute top-0 right-0 p-4 opacity-10">
      <Cake class="w-32 h-32" />
    </div>
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-2">
        <Sparkles class="w-5 h-5 text-primary animate-pulse" />
        <span
          class="text-sm font-semibold uppercase tracking-wider text-primary"
          >Celebrations</span
        >
      </div>
      <h1 class="text-3xl font-bold sm:text-4xl mb-2">
        Birthday Calendar
        {#if $childrenQuery.isSuccess}
          <span class="text-muted-foreground font-normal text-xl ml-2">
            ({$childrenQuery?.data?.total ?? 0})
          </span>
        {/if}
      </h1>
      <p class="text-muted-foreground max-w-xl text-lg">
        Celebrating the milestones of our children. Upcoming birthdays are
        prioritized to help us prepare.
      </p>
    </div>
  </div>

  <div
    class="sticky top-0 z-30 flex items-center gap-2 bg-background/95 backdrop-blur py-4 supports-[backdrop-filter]:bg-background/60 border-b -mx-4 px-4 sm:mx-0 sm:px-0"
  >
    <div class="relative grid w-full flex-1 sm:max-w-md">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
      />
      <Input
        placeholder="Search names or month..."
        bind:value={handleInput}
        class="pl-9 border-primary/10 bg-background/50 focus:bg-background transition-colors"
      />
    </div>

    <div class="flex items-center gap-1.5 sm:gap-2">
      <FilterButton
        {filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <Button
        variant="outline"
        size="icon"
        class="shrink-0 lg:hidden"
        onclick={() => (gridColumns = gridColumns === 1 ? 2 : 1)}
      >
        {#if gridColumns === 1}
          <Grid2X2 class="h-4 w-4 text-primary" />
        {:else}
          <Grid3X3 class="h-4 w-4 text-primary" />
        {/if}
      </Button>

      <Button
        variant="outline"
        size="icon"
        class="shrink-0"
        onclick={() => (showDistribution = true)}
        title="View Birthday Distribution"
      >
        <ChartPieIcon class="h-4 w-4 text-primary" />
      </Button>
    </div>
  </div>

  {#if $childrenQuery.isPending}
    <!-- Skeleton Loading -->
    <div class="hidden lg:block border rounded-xl overflow-hidden bg-card">
      <Table>
        <TableHeader class="bg-muted/50">
          <TableRow>
            <TableHead class="w-[80px]">S/N</TableHead>
            <TableHead>Child</TableHead>
            <TableHead>Birthday</TableHead>
            <TableHead>Age Group</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each Array(8) as _}
            <TableRow>
              <TableCell><Skeleton class="h-4 w-8" /></TableCell>
              <TableCell>
                <div class="flex items-center gap-3">
                  <Skeleton class="h-10 w-10 rounded-full" />
                  <Skeleton class="h-4 w-32" />
                </div>
              </TableCell>
              <TableCell><Skeleton class="h-4 w-24" /></TableCell>
              <TableCell><Skeleton class="h-4 w-20" /></TableCell>
              <TableCell class="text-right"
                ><Skeleton class="h-8 w-16 ml-auto" /></TableCell
              >
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </div>
    <div class="grid grid-cols-2 lg:hidden gap-3 sm:gap-4">
      {#each Array(6) as _}
        <div
          class="aspect-square rounded-2xl border bg-card p-4 flex flex-col justify-end relative overflow-hidden"
        >
          <Skeleton class="absolute inset-0 h-full w-full" />
          <div class="relative z-10 space-y-2">
            <Skeleton class="h-5 w-3/4 bg-white/20" />
            <Skeleton class="h-4 w-1/2 bg-white/20" />
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if $childrenQuery.error}
    <Alert.Root variant="destructive">
      <AlertCircleIcon />
      <Alert.Title>{$childrenQuery.error.name}</Alert.Title>
      <Alert.Description>
        {$childrenQuery.error.message}
      </Alert.Description>
    </Alert.Root>
  {/if}

  {#if $childrenQuery.isSuccess}
    <!-- Desktop Table View -->
    <div
      class="hidden lg:block border rounded-xl overflow-hidden bg-card shadow-sm"
    >
      <Table>
        <TableHeader class="bg-muted/30">
          <TableRow>
            <TableHead class="w-[80px]">S/N</TableHead>
            <TableHead>Child</TableHead>
            <TableHead>Birthday</TableHead>
            <TableHead>Age Group</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each $childrenQuery.data.results as child, i}
            <TableRow
              class="group cursor-pointer hover:bg-muted/50 transition-colors"
              onclick={() => handleView(child)}
            >
              <TableCell class="font-medium text-muted-foreground"
                >{i + 1}</TableCell
              >
              <TableCell>
                <div class="flex items-center gap-3">
                  {#if (child as any).image?.url}
                    <img
                      src={(child as any).image.url}
                      alt={child.name}
                      class="h-10 w-10 rounded-full object-cover"
                    />
                  {:else}
                    <div
                      class="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg"
                    >
                      👤
                    </div>
                  {/if}
                  <span
                    class="font-semibold group-hover:text-primary transition-colors"
                    >{child.name}</span
                  >
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Cake class="w-4 h-4 text-primary" />
                  <span
                    >{child.dateOfBirth
                      ? new Date(child.dateOfBirth).toLocaleDateString(
                          "en-US",
                          { day: "numeric", month: "long" },
                        )
                      : "N/A"}</span
                  >
                </div>
              </TableCell>
              <TableCell>
                <span
                  class="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/5"
                >
                  {child.ageGroup}
                </span>
              </TableCell>
              <TableCell class="text-right">
                <button
                  class="text-sm font-medium text-primary hover:underline"
                  onclick={(e) => {
                    e.stopPropagation();
                    handleView(child);
                  }}
                >
                  View Details
                </button>
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </div>

    <!-- Mobile Grid View -->
    <div
      class={cn(
        "grid gap-3 sm:gap-4 lg:hidden",
        gridColumns === 1 ? "grid-cols-1" : "grid-cols-2",
      )}
    >
      {#each $childrenQuery.data.results as child}
        <ChildGridCard
          {child}
          columns={gridColumns}
          isBirthday={true}
          onClick={() => handleView(child)}
        />
      {/each}
    </div>

    <div>
      {#if $childrenQuery.isFetchingNextPage}
        <div class="flex items-center justify-center py-8">
          <Loader2 class="h-6 w-6 animate-spin text-primary" />
          <span class="ml-2 text-muted-foreground"
            >Loading more milestones...</span
          >
        </div>
      {/if}

      <!-- Sentinel element for infinite scroll -->
      <div use:observe class="h-10 w-full"></div>

      {#if !$childrenQuery.hasNextPage && !$childrenQuery.isFetching && $childrenQuery.data.results.length > 0}
        <div class="flex flex-col items-center justify-center py-10 opacity-50">
          <Cake class="w-8 h-8 mb-2 text-primary" />
          <p class="text-sm text-muted-foreground">
            That's all the birthdays for now!
          </p>
        </div>
      {/if}

      {#if $childrenQuery.data.results.length === 0}
        <div
          class="flex flex-col items-center justify-center py-20 text-center"
        >
          <div class="bg-muted rounded-full p-6 mb-4">
            <Search class="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 class="text-xl font-semibold mb-1">No birthdays found</h3>
          <p class="text-muted-foreground">
            Try adjusting your search or filter
          </p>
        </div>
      {/if}
    </div>
  {/if}

  {#if viewingChild}
    <ChildDetailsDialog
      child={viewingChild}
      bind:open={detailsOpen}
      onOpenChange={handleDetailsOpenChange}
      readonly={true}
    />
  {/if}

  <Dialog.Root bind:open={showDistribution}>
    <Dialog.Content class="sm:max-w-[600px]">
      <Dialog.Header>
        <Dialog.Title>Birthday Distribution</Dialog.Title>
        <Dialog.Description>
          Distribution of celebrants by month.
        </Dialog.Description>
      </Dialog.Header>
      {#if $statsQuery.isSuccess}
        <DistributionChart data={distributionData} />
      {/if}
    </Dialog.Content>
  </Dialog.Root>
</div>

<style>
  :global(.animate-bounce-subtle) {
    animation: bounce-subtle 3s infinite;
  }

  @keyframes bounce-subtle {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
</style>
