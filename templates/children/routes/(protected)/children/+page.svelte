<script lang="ts">
  import type { iChild } from "$lib/interface";
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
  import ChildGridCard from "./components/ChildGridCard.svelte";
  import ChildDrawer from "./components/ChildDrawer.svelte";
  import ChildDetailsDialog from "./components/ChildDetailsDialog.svelte";
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
  const user = page.data.user as User;

  let handleInput = $state(page.url.searchParams.get("search") || "");

  let filters = $state<FilterField[]>([
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
    {
      name: "hasImage",
      label: "Has Image",
      type: "select",
      value: page.url.searchParams.get("hasImage") || "",
      options: [
        { label: "With Image", value: "true" },
        { label: "Without Image", value: "false" },
      ],
    },
    {
      name: "active",
      label: "Active Status",
      type: "select",
      value: page.url.searchParams.get("active") || "true",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
  ]);

  const getParams = () => {
    const filterParams: Record<string, any> = {};
    filters.forEach((f) => {
      if (f.value !== "" && f.value !== undefined) {
        filterParams[f.name] = f.value;
      }
    });

    switch (user.role) {
      case Role.USER:
        return {
          host: page.url.origin,
          search: debouncedHandle.current,
          field: Fields.CHILDREN,
          ...filterParams,
        };
      case Role.PARENT:
        return {
          host: page.url.origin,
          search: debouncedHandle.current,
          field: Fields.CHILDREN,
          ...filterParams,
        };
      case Role.EDITOR:
      default:
        return {
          host: page.url.origin,
          search: debouncedHandle.current,
          field: Fields.CHILDREN,
          ...filterParams,
        };
    }
  };
  const debouncedHandle = new Debounced(() => handleInput, 500);
  const childrenQuery = $derived(
    infiniteScroll.listQueryAlternate<iChild>(getParams()),
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
      if (f.name === "active") f.value = "true";
      else f.value = "";
    });

    const params = new URLSearchParams(page.url.searchParams);
    filters.forEach((f) => {
      if (f.name === "active") params.set("active", "true");
      else params.delete(f.name);
    });
    goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });

    $childrenQuery.refetch();
  };

  let deletingChild = $state<iChild | null>(null);
  let selectedChild = $state<iChild | null>(null);
  let viewingChild = $state<iChild | null>(null);
  let drawerOpen = $state(false);
  let detailsOpen = $state(false);
  let showDistribution = $state(false);

  // Fetch statistics from API
  const statisticsQuery = createQuery({
    queryKey: ["children-statistics"],
    queryFn: async () => {
      const response = await fetch("/api/children/statistics");
      if (!response.ok) throw new Error("Failed to fetch statistics");
      return response.json() as Promise<Record<string, number>>;
    },
  });

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

  const distributionData = $derived(
    Object.entries($statisticsQuery.data || {}).map(([group, value]) => ({
      group: getAgeGroupWithRange(group),
      value,
    })),
  );

  const onDelete = async (child: iChild) => (deletingChild = child);

  const openDrawer = (child: iChild) => {
    selectedChild = child;
    drawerOpen = true;
  };

  const handleView = (child: iChild) => {
    viewingChild = child;
    detailsOpen = true;
  };

  const handleDrawerOpenChange = (open: boolean) => {
    drawerOpen = open;
    if (!open) {
      setTimeout(() => (selectedChild = null), 300);
    }
  };

  const handleDetailsOpenChange = (open: boolean) => {
    detailsOpen = open;
    if (!open) {
      setTimeout(() => (viewingChild = null), 300);
    }
  };

  const handleEdit = () => {
    if (selectedChild) {
      location.href = `/children/${selectedChild.id}`;
    }
  };

  const handleDelete = () => {
    if (selectedChild) {
      deletingChild = selectedChild;
      drawerOpen = false;
    }
  };

  let gridColumns = $state(2); // 1 or 2 columns

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

<div class="flex flex-col gap-4">
  <div class="flex flex-col">
    <h1 class="text-2xl font-bold sm:text-3xl">
      Children ({#if $childrenQuery.isPending}
        <Loader2 class="inline h-4 w-4 animate-spin" />
      {:else}
        {$childrenQuery?.data?.total ?? 0}
      {/if})
    </h1>
    <p class="text-muted-foreground">Manage children in the department</p>
  </div>

  <div
    class="sticky top-0 z-30 -mx-2 flex h-16 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:mx-0 sm:px-0 px-2"
  >
    <div class="relative grid w-full flex-1 sm:max-w-md">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
      />
      <Input
        placeholder="Search children..."
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
      href="/children/new"
      class="flex shrink-0 cursor-pointer items-center gap-2 px-3 sm:w-auto sm:px-4 aspect-square sm:aspect-auto"
    >
      <Plus class="h-5 w-5 sm:h-4 sm:w-4" />
      <span class="hidden sm:inline">Add Child</span>
    </Button>
    {/if}
  </div>

  {#if $childrenQuery.isPending}
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
            <TableHead>Child</TableHead>
            <TableHead>Age Group</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each Array(10) as _}
            <TableRow>
              <td class="p-4"><Skeleton class="h-4 w-8" /></td>
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <Skeleton class="h-10 w-10 rounded-full" />
                  <div class="space-y-2">
                    <Skeleton class="h-4 w-32" />
                    <Skeleton class="h-3 w-20" />
                  </div>
                </div>
              </td>
              <td class="p-4"><Skeleton class="h-4 w-24" /></td>
              <td class="p-4"><Skeleton class="h-4 w-28" /></td>
              <td class="p-4"><Skeleton class="h-4 w-24" /></td>
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
  {/if}

  {#if $childrenQuery.error}
    <Alert.Root variant="destructive">
      <AlertCircleIcon />
      <Alert.Title>{$childrenQuery.error.name}</Alert.Title>
      <Alert.Description>
        {$childrenQuery.error.cause}<br />
        {$childrenQuery.error.message}
      </Alert.Description>
    </Alert.Root>
  {/if}

  {#if $childrenQuery.isSuccess}
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
              <TableHead>Child</TableHead>
              <TableHead>Age Group</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each $childrenQuery.data.results as child, i}
              <ListCard
                {onDelete}
                onView={handleView}
                screen="desktop"
                {i}
                {child}
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
        {#each $childrenQuery.data.results as child}
          <ChildGridCard
            {child}
            columns={gridColumns}
            onClick={() => openDrawer(child)}
          />
        {/each}
      </div>
    </div>

    <div>
      {#if $childrenQuery.isFetching}
        <div class="flex items-center justify-center py-4">
          <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
          <span class="ml-2 text-muted-foreground">Loading more...</span>
        </div>
      {/if}

      <!-- Sentinel element for infinite scroll -->
      <div use:observe class="h-4 w-full"></div>

      {#if !$childrenQuery.hasNextPage && !$childrenQuery.isFetching}
        <p class="text-center text-sm text-muted-foreground py-4">
          Nothing more to load
        </p>
      {/if}
    </div>
  {/if}

  {#if deletingChild}
    <DeleteDialog
      child={deletingChild}
      open={!!deletingChild}
      onOpenChange={(open) => !open && (deletingChild = null)}
    />
  {/if}

  {#if selectedChild}
    <ChildDrawer
      child={selectedChild}
      bind:open={drawerOpen}
      onOpenChange={handleDrawerOpenChange}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  {/if}

  {#if viewingChild}
    <ChildDetailsDialog
      child={viewingChild}
      bind:open={detailsOpen}
      onOpenChange={handleDetailsOpenChange}
      onEdit={() => {
        if (viewingChild) {
          location.href = `/children/${viewingChild.id}`;
        }
      }}
      onDelete={() => {
        if (viewingChild) {
          deletingChild = viewingChild;
          detailsOpen = false;
        }
      }}
    />
  {/if}

  <Dialog.Root bind:open={showDistribution}>
    <Dialog.Content class="sm:max-w-[600px]">
      <Dialog.Header>
        <Dialog.Title>Age Group Distribution</Dialog.Title>
        <Dialog.Description>
          Distribution of children by age group.
        </Dialog.Description>
      </Dialog.Header>
      <DistributionChart data={distributionData} />
    </Dialog.Content>
  </Dialog.Root>
</div>
