<script lang="ts">
  import type { iMeeting } from "$lib/interface";
  import { Button } from "$lib/components/ui/button";
  import {
    AlertCircleIcon,
    Loader2,
    Search,
    Plus,
    Grid2X2,
    Grid3X3,
    ChartPieIcon,
  } from "@lucide/svelte";
  import { Input } from "$lib/components/ui/input";
  import DeleteDialog from "./components/DeleteDialog.svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import ListCard from "./components/ListCard.svelte";
  import MeetingGridCard from "./components/MeetingGridCard.svelte";
  import MeetingDrawer from "./components/MeetingDrawer.svelte";
  import MeetingDetailsDialog from "./components/MeetingDetailsDialog.svelte";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { Debounced } from "runed";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { editors, Fields, Role } from "$lib/constants";
  import type { User } from "$lib/auth";
  import FilterButton, {
    type FilterField,
  } from "$lib/components/ui/filter/FilterButton.svelte";
  import DistributionChart from "$lib/components/distribution-chart.svelte";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton";

  // Filter options
  const meetingTypes = [
    "Teaching Weekend",
    "Community Bible Study",
    "Island Bible Study",
    "Threshing Floor",
    "The Convergence",
    "The Voice of One Conference",
    "Sisters Retreat",
    "Daughters of Zion",
    "Women of Fire Conference",
    "Prayers",
    "Prayer & Fasting",
    "Apostolic Teaching",
    "Sisters Breakfast",
    "Cross Over Service",
    "Carol Service",
    "General Assembly",
  ];

  let filters = $state<FilterField[]>([
    {
      name: "type",
      label: "Meeting Type",
      type: "select",
      value: page.url.searchParams.get("type") || "",
      options: meetingTypes.map((t) => ({ label: t, value: t })),
    },
  ]);

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
    $meetingsQuery.refetch();
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

    $meetingsQuery.refetch();
  };

  let deletingMeeting = $state<iMeeting | null>(null);
  let selectedMeeting = $state<iMeeting | null>(null);
  let viewingMeeting = $state<iMeeting | null>(null);
  let drawerOpen = $state(false);
  let detailsOpen = $state(false);
  let showDistribution = $state(false);

  const user = page.data.user as User;

  const onDelete = async (meeting: iMeeting) => (deletingMeeting = meeting);

  const openDrawer = (meeting: iMeeting) => {
    selectedMeeting = meeting;
    drawerOpen = true;
  };

  const handleView = (meeting: iMeeting) => {
    viewingMeeting = meeting;
    detailsOpen = true;
  };

  const handleDrawerOpenChange = (open: boolean) => {
    drawerOpen = open;
    if (!open) {
      setTimeout(() => (selectedMeeting = null), 300);
    }
  };

  const handleDetailsOpenChange = (open: boolean) => {
    detailsOpen = open;
    if (!open) {
      setTimeout(() => (viewingMeeting = null), 300);
    }
  };

  const handleEdit = () => {
    if (selectedMeeting) {
      location.href = `/meetings/${selectedMeeting.id}`;
    }
  };

  const handleDelete = () => {
    if (selectedMeeting) {
      deletingMeeting = selectedMeeting;
      drawerOpen = false;
    }
  };

  let gridColumns = $state(2); // 1 or 2 columns

  let handleInput = $state(page.url.searchParams.get("search") || "");

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
      field: `${Fields.MEETING}s`,
      ...filterParams,
    };
  };

  const debouncedHandle = new Debounced(() => handleInput, 500);
  const meetingsQuery = $derived(
    infiniteScroll.listQueryAlternate<iMeeting>(getParams()),
  );

  const observe = (node: HTMLElement) => {
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        $meetingsQuery.hasNextPage &&
        !$meetingsQuery.isFetchingNextPage
      ) {
        $meetingsQuery.fetchNextPage();
      }
    });
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      },
    };
  };

  // Fetch statistics from API
  const statisticsQuery = createQuery({
    queryKey: ["meetings-statistics"],
    queryFn: async () => {
      const response = await fetch("/api/meetings/statistics");
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
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col">
    <h1 class="text-2xl font-bold sm:text-3xl">
      Meetings ({#if $meetingsQuery.isPending}
        <Loader2 class="inline h-4 w-4 animate-spin" />
      {:else}
        {$meetingsQuery?.data?.total ?? 0}
      {/if})
    </h1>
    <p class="text-muted-foreground">Manage ministry meetings</p>
  </div>

  <div
    class="sticky top-0 z-30 -mx-2 flex h-16 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:mx-0 sm:px-0 px-2"
  >
    <div class="relative grid w-full flex-1 sm:max-w-md">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
      />
      <Input
        placeholder="Search meetings..."
        bind:value={handleInput}
        class="pl-9"
      />
    </div>
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
      <FilterButton
        bind:filters
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
    <!-- Column toggle (mobile only) -->
    <Button
      variant="outline"
      size="icon"
      class="lg:hidden"
      onclick={() => (gridColumns = gridColumns === 1 ? 2 : 1)}
    >
      {#if gridColumns === 1}
        <Grid2X2 class="h-4 w-4" />
      {:else}
        <Grid3X3 class="h-4 w-4" />
      {/if}
    </Button>
    {#if editors.includes(user.role as Role)}
      <Button
        href="/meetings/new"
        class="flex shrink-0 cursor-pointer items-center gap-2 px-3 sm:w-auto sm:px-4 aspect-square sm:aspect-auto"
      >
        <Plus class="h-5 w-5 sm:h-4 sm:w-4" />
        <span class="hidden sm:inline">Add Meeting</span>
      </Button>
    {/if}
  </div>

  {#if $meetingsQuery.isPending}
    <!-- Desktop Table Skeleton -->
    <div
      class="hidden overflow-x-auto border bg-white lg:block dark:bg-background"
    >
      <Table>
        <TableHeader
          class="sticky top-0 z-10 border-b bg-white dark:bg-secondary"
        >
          <TableRow>
            <TableHead>S/N</TableHead>
            <TableHead>Meeting</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each Array(10) as _}
            <TableRow>
              <td class="p-4"><Skeleton class="h-4 w-8" /></td>
              <td class="p-4"><Skeleton class="h-4 w-48" /></td>
              <td class="p-4"><Skeleton class="h-4 w-32" /></td>
              <td class="p-4"><Skeleton class="h-4 w-24" /></td>
              <td class="p-4"><Skeleton class="h-4 w-20" /></td>
              <td class="p-4 text-right"
                ><Skeleton class="h-8 w-20 ml-auto" /></td
              >
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </div>

    <!-- Mobile Grid Skeleton -->
    <div
      class="grid gap-2 lg:hidden"
      class:grid-cols-1={gridColumns === 1}
      class:grid-cols-2={gridColumns === 2}
      class:sm:grid-cols-4={gridColumns === 2}
    >
      {#each Array(8) as _}
        <div class="rounded-lg border bg-card p-3 space-y-3">
          <div class="space-y-2">
            <Skeleton class="h-5 w-3/4" />
            <Skeleton class="h-4 w-1/2" />
          </div>
          <div class="space-y-2">
            <Skeleton class="h-3 w-full" />
            <Skeleton class="h-3 w-2/3" />
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if $meetingsQuery.error}
    <Alert.Root variant="destructive">
      <AlertCircleIcon />
      <Alert.Title>{$meetingsQuery.error.name}</Alert.Title>
      <Alert.Description>
        {$meetingsQuery.error.cause}<br />
        {$meetingsQuery.error.message}
      </Alert.Description>
    </Alert.Root>
  {/if}

  {#if $meetingsQuery.isSuccess}
    <div>
      <!-- desktop table -->
      <div
        class="hidden overflow-x-auto border bg-white lg:block dark:bg-background"
      >
        <Table>
          <TableHeader
            class="sticky top-0 z-10 border-b bg-white dark:bg-secondary"
          >
            <TableRow>
              <TableHead>S/N</TableHead>
              <TableHead>Meeting</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each $meetingsQuery.data.results as meeting, i}
              <ListCard
                {onDelete}
                onView={handleView}
                screen="desktop"
                {i}
                {meeting}
              />
            {/each}
          </TableBody>
        </Table>
      </div>

      <!-- mobile grid -->
      <div
        class="grid gap-2 lg:hidden"
        class:grid-cols-1={gridColumns === 1}
        class:grid-cols-2={gridColumns === 2}
        class:sm:grid-cols-4={gridColumns === 2}
      >
        {#each $meetingsQuery.data.results as meeting}
          <MeetingGridCard
            {meeting}
            columns={gridColumns}
            onClick={() => openDrawer(meeting)}
          />
        {/each}
      </div>
    </div>

    <div>
      {#if $meetingsQuery.isFetching}
        <div class="flex items-center justify-center py-4">
          <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
          <span class="ml-2 text-muted-foreground">Loading more...</span>
        </div>
      {/if}

      <!-- Sentinel element for infinite scroll -->
      <div use:observe class="h-4 w-full"></div>

      {#if !$meetingsQuery.hasNextPage && !$meetingsQuery.isFetching}
        <p class="text-center text-sm text-muted-foreground py-4">
          Nothing more to load
        </p>
      {/if}
    </div>
  {/if}

  {#if deletingMeeting}
    <DeleteDialog
      meeting={deletingMeeting}
      open={!!deletingMeeting}
      onOpenChange={(open) => !open && (deletingMeeting = null)}
    />
  {/if}

  {#if selectedMeeting}
    <MeetingDrawer
      meeting={selectedMeeting}
      bind:open={drawerOpen}
      onOpenChange={handleDrawerOpenChange}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  {/if}

  {#if viewingMeeting}
    <MeetingDetailsDialog
      meeting={viewingMeeting}
      bind:open={detailsOpen}
      onOpenChange={handleDetailsOpenChange}
      onEdit={() => {
        if (viewingMeeting) {
          location.href = `/meetings/${viewingMeeting.id}`;
        }
      }}
      onDelete={() => {
        if (viewingMeeting) {
          deletingMeeting = viewingMeeting;
          detailsOpen = false;
        }
      }}
    />
  {/if}

  <Dialog.Root bind:open={showDistribution}>
    <Dialog.Content class="sm:max-w-[600px]">
      <Dialog.Header>
        <Dialog.Title>Meeting Type Distribution</Dialog.Title>
        <Dialog.Description>Distribution of meetings by type.</Dialog.Description>
      </Dialog.Header>
      <DistributionChart data={distributionData} />
    </Dialog.Content>
  </Dialog.Root>
</div>
