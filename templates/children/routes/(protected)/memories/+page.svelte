<script lang="ts">
  import type { iFetchMeta, iMemory } from "$lib/interface";
  import { Button } from "$lib/components/ui/button";
  import {
    AlertCircleIcon,
    Loader2,
    Search,
    Plus,
    Grid2X2,
    Grid3X3,
    ChartPieIcon,
    MapPin,
    Calendar,
    Image as ImageIcon,
  } from "@lucide/svelte";

  import { Input } from "$lib/components/ui/input";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
  } from "$lib/components/ui/table";
  import MemoryCard from "./components/MemoryCard.svelte";
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
  import { format } from "date-fns";

  const user = page.data.user as User;

  let handleInput = $state(page.url.searchParams.get("search") || "");
  let gridColumns = $state(2); // 1 or 2 columns
  let showDistribution = $state(false);

  let filters = $state<FilterField[]>([
    {
      name: "location",
      label: "Location",
      type: "select",
      value: page.url.searchParams.get("location") || "",
      options: [
        { label: "Apostolic Center", value: "Apostolic Center" },
        { label: "Magodo Church", value: "Magodo Church" },
        { label: "Egbeda Church", value: "Egbeda Church" },
        { label: "Island Church", value: "Island Church" },
      ],
    },
  ]);

  const debouncedHandle = new Debounced(() => handleInput, 500);

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
      field: Fields.MEMORY,
      ...filterParams,
    };
  };

  const memoriesQuery = $derived(
    infiniteScroll.listQueryAlternate<iMemory & { mediaCount: number }>(
      getParams(),
    ),
  );

  const statisticsQuery = createQuery({
    queryKey: ["memories-statistics"],
    queryFn: async () => {
      const response = await fetch("/api/memories/statistics");
      if (!response.ok) throw new Error("Failed to fetch statistics");
      return response.json() as Promise<Record<string, number>>;
    },
  });

  const distributionData = $derived(
    Object.entries($statisticsQuery.data || {}).map(([name, value]) => ({
      group: name,
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
    $memoriesQuery.refetch();
  };

  const handleResetFilters = () => {
    filters.forEach((f) => (f.value = ""));
    const params = new URLSearchParams(page.url.searchParams);
    filters.forEach((f) => params.delete(f.name));
    goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
    $memoriesQuery.refetch();
  };

  const observe = (node: HTMLElement) => {
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        $memoriesQuery.hasNextPage &&
        !$memoriesQuery.isFetchingNextPage
      ) {
        $memoriesQuery.fetchNextPage();
      }
    });
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      },
    };
  };

  const navigateToDetail = (id: string) => {
    window.location.href = `/memories/${id}`;
  };
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col">
    <h1 class="text-2xl font-bold sm:text-3xl">
      Memories ({#if $memoriesQuery.isPending}
        <Loader2 class="inline h-4 w-4 animate-spin" />
      {:else}
        {$memoriesQuery?.data?.total || 0}
      {/if})
    </h1>
    <p class="text-muted-foreground">
      Relive the moments and spiritual experiences
    </p>
  </div>

  <div
    class="sticky top-0 z-30 -mx-2 flex h-16 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:mx-0 sm:px-0 px-2"
  >
    <div class="relative grid w-full flex-1 sm:max-w-md">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
      />
      <Input
        placeholder="Search memories..."
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
        title="View Media Distribution"
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
        href="/memories/new"
        class="flex shrink-0 cursor-pointer items-center gap-2 px-3 sm:w-auto sm:px-4 aspect-square sm:aspect-auto"
      >
        <Plus class="h-5 w-5 sm:h-4 sm:w-4" />
        <span class="hidden sm:inline">Add Memory</span>
      </Button>
    {/if}
  </div>

  {#if $memoriesQuery.isPending}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each Array(6) as _}
        <Skeleton class="aspect-video w-full rounded-xl" />
      {/each}
    </div>
  {/if}

  {#if $memoriesQuery.error}
    <Alert.Root variant="destructive">
      <AlertCircleIcon />
      <Alert.Title>{$memoriesQuery.error.name}</Alert.Title>
      <Alert.Description>
        {$memoriesQuery.error.message}
      </Alert.Description>
    </Alert.Root>
  {/if}

  {#if $memoriesQuery.isSuccess}
    <div>
      <!-- Desktop Table -->
      <div
        class="hidden overflow-x-auto border bg-white lg:block dark:bg-background rounded-lg"
      >
        <Table>
          <TableHeader class="bg-muted/50">
            <TableRow>
              <TableHead>Memory</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Media</TableHead>
              <TableHead class="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each $memoriesQuery.data.results as memory}
              <TableRow
                class="cursor-pointer hover:bg-muted/50"
                onclick={() => navigateToDetail(memory.id)}
              >
                <TableCell>
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-16 rounded overflow-hidden shadow-sm">
                      {#if memory.coverImage && typeof memory.coverImage === "object"}
                        <img
                          src={memory.coverImage.url}
                          alt=""
                          class="w-full h-full object-cover"
                        />
                      {:else}
                        <div
                          class="w-full h-full bg-muted flex items-center justify-center"
                        >
                          <ImageIcon class="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      {/if}
                    </div>
                    <span class="font-medium text-primary">{memory.name}</span>
                  </div>
                </TableCell>
                <TableCell
                  >{format(new Date(memory.date), "dd MMM, yyyy")}</TableCell
                >
                <TableCell>{memory.location || "N/A"}</TableCell>
                <TableCell>
                  <span
                    class="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold"
                  >
                    {memory.mediaCount} files
                  </span>
                </TableCell>
                <TableCell class="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onclick={(e) => {
                      e.stopPropagation();
                      navigateToDetail(memory.id);
                    }}>View</Button
                  >
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <!-- Mobile Grid -->
      <div
        class="grid gap-3 lg:hidden"
        class:grid-cols-1={gridColumns === 1}
        class:grid-cols-2={gridColumns === 2}
      >
        {#each $memoriesQuery.data.results as memory}
          <MemoryCard
            {memory}
            columns={gridColumns}
            onClick={() => navigateToDetail(memory.id)}
          />
        {/each}
      </div>

      {#if $memoriesQuery.data.results.length === 0}
        <div
          class="flex flex-col items-center justify-center py-24 text-center"
        >
          <ImageIcon class="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 class="text-lg font-medium">No memories found</h3>
          <p class="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      {/if}
    </div>

    <div>
      {#if $memoriesQuery.isFetching}
        <div class="flex items-center justify-center py-8">
          <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
          <span class="ml-2 text-muted-foreground"
            >Reliving more moments...</span
          >
        </div>
      {/if}

      <div use:observe class="h-4 w-full"></div>

      {#if !$memoriesQuery.hasNextPage && !$memoriesQuery.isFetching && $memoriesQuery.data.results.length > 0}
        <p
          class="text-center text-sm text-muted-foreground py-8 italic opacity-50"
        >
          That's all the memories for now. Keep making more!
        </p>
      {/if}
    </div>
  {/if}

  <Dialog.Root bind:open={showDistribution}>
    <Dialog.Content class="sm:max-w-[600px]">
      <Dialog.Header>
        <Dialog.Title>Memory Media Distribution</Dialog.Title>
        <Dialog.Description>
          Count of pictures and videos per event.
        </Dialog.Description>
      </Dialog.Header>
      <DistributionChart data={distributionData} />
    </Dialog.Content>
  </Dialog.Root>
</div>
