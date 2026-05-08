<script lang="ts">
  import type { iFetchMeta, iParent } from "$lib/interface";
  import { Button } from "$lib/components/ui/button";
  import {
    AlertCircleIcon,
    Loader2,
    Search,
    Plus,
    Phone,
    Pencil,
    Grid2X2,
    Grid3X3,
    ChartPieIcon,
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
  } from "$lib/components/ui/table";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { Debounced } from "runed";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { editors, Fields, Role } from "$lib/constants";
  import FilterButton, {
    type FilterField,
  } from "$lib/components/ui/filter/FilterButton.svelte";
  import ParentDetailsDialog from "./components/ParentDetailsDialog.svelte";
  import ParentDrawer from "./components/ParentDrawer.svelte";
  import DeleteDialog from "./components/DeleteDialog.svelte";
  import WhatsApp from "$lib/components/icons/WhatsApp.svelte";
  import DistributionChart from "$lib/components/distribution-chart.svelte";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import type { User } from "$lib/auth";

  let filters = $state<FilterField[]>([
    {
      name: "parentType",
      label: "Parent Type",
      type: "select",
      value: page.url.searchParams.get("parentType") || "",
      options: [
        { label: "Father", value: "father" },
        { label: "Mother", value: "mother" },
        { label: "Guardian", value: "guardian" },
      ],
    },
  ]);

  const user = page.data.user as User;

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
    $parentsQuery.refetch();
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

    $parentsQuery.refetch();
  };

  let handleInput = $state(page.url.searchParams.get("search") || "");

  let viewingParent = $state<iParent | null>(null);
  let detailsOpen = $state(false);

  const handleView = (parent: iParent) => {
    viewingParent = parent;
    detailsOpen = true;
  };

  const handleDetailsOpenChange = (open: boolean) => {
    detailsOpen = open;
    if (!open) {
      setTimeout(() => (viewingParent = null), 300);
    }
  };

  const handleEditFromDialog = () => {
    if (viewingParent) {
      location.href = `/parents/${viewingParent.id}`;
    }
  };

  let selectedParent = $state<iParent | null>(null);
  let drawerOpen = $state(false);
  let showDistribution = $state(false);
  let deleteDialogOpen = $state(false);
  let parentToDelete = $state<iParent | null>(null);

  const openDrawer = (parent: iParent) => {
    selectedParent = parent;
    drawerOpen = true;
  };

  const handleDrawerOpenChange = (open: boolean) => {
    drawerOpen = open;
    if (!open) {
      setTimeout(() => (selectedParent = null), 300);
    }
  };

  const handleEditFromDrawer = () => {
    if (selectedParent) {
      location.href = `/parents/${selectedParent.id}`;
    }
  };

  const handleDeleteFromDialog = () => {
    if (viewingParent) {
      parentToDelete = viewingParent;
      detailsOpen = false;
      deleteDialogOpen = true;
    }
  };

  const handleDeleteFromDrawer = () => {
    if (selectedParent) {
      parentToDelete = selectedParent;
      drawerOpen = false;
      deleteDialogOpen = true;
    }
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    deleteDialogOpen = open;
    if (!open) {
      setTimeout(() => (parentToDelete = null), 300);
    }
  };

  let gridColumns = $state(2); // 1 or 2 columns

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
      field: `${Fields.PARENT}s`,
      ...filterParams,
    };
  };

  const debouncedHandle = new Debounced(() => handleInput, 500);
  const parentsQuery = $derived(
    infiniteScroll.listQueryAlternate<iParent>(getParams()),
  );

  const observe = (node: HTMLElement) => {
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        $parentsQuery.hasNextPage &&
        !$parentsQuery.isFetchingNextPage
      ) {
        $parentsQuery.fetchNextPage();
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
    queryKey: ["parents-statistics"],
    queryFn: async () => {
      const response = await fetch("/api/parents/statistics");
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
      Parents ({#if $parentsQuery.isPending}
        <Loader2 class="inline h-4 w-4 animate-spin" />
      {:else}
        {$parentsQuery?.data?.total ?? 0}
      {/if})
    </h1>
    <p class="text-muted-foreground">Manage parents in the department</p>
  </div>

  <div
    class="sticky top-0 z-30 -mx-2 flex h-16 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:mx-0 sm:px-0 px-2"
  >
    <div class="relative grid w-full flex-1 sm:max-w-md">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
      />
      <Input
        placeholder="Search parents..."
        bind:value={handleInput}
        class="pl-9"
      />
    </div>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
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
        href="/parents/new"
        class="flex shrink-0 cursor-pointer items-center gap-2 px-3 sm:w-auto sm:px-4 aspect-square sm:aspect-auto"
      >
        <Plus class="h-5 w-5 sm:h-4 sm:w-4" />
        <span class="hidden sm:inline">Add Parent</span>
      </Button>
    {/if}
  </div>

  {#if $parentsQuery.isPending}
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
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Children</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each Array(10) as _}
            <TableRow>
              <td class="p-4"><Skeleton class="h-4 w-8" /></td>
              <td class="p-4"><Skeleton class="h-4 w-32" /></td>
              <td class="p-4"><Skeleton class="h-4 w-20" /></td>
              <td class="p-4">
                <div class="space-y-2">
                  <Skeleton class="h-4 w-28" />
                  <Skeleton class="h-3 w-36" />
                </div>
              </td>
              <td class="p-4">
                <div class="flex -space-x-2">
                  {#each Array(3) as _}
                    <Skeleton class="h-8 w-8 rounded-full" />
                  {/each}
                </div>
              </td>
              <td class="p-4 text-right"
                ><Skeleton class="h-8 w-24 ml-auto" /></td
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
    >
      {#each Array(8) as _}
        <div class="rounded-lg border bg-card p-3 space-y-3">
          <div class="flex items-start justify-between">
            <div class="space-y-2 flex-1">
              <Skeleton class="h-5 w-3/4" />
              <Skeleton class="h-4 w-1/2" />
            </div>
          </div>
          <div class="space-y-2">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-3 w-2/3" />
          </div>
          <div class="pt-2 border-t space-y-2">
            <Skeleton class="h-3 w-20" />
            <div class="flex -space-x-2">
              {#each Array(4) as _}
                <Skeleton class="h-9 w-9 rounded-full" />
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if $parentsQuery.error}
    <Alert.Root variant="destructive">
      <AlertCircleIcon />
      <Alert.Title>{$parentsQuery.error.name}</Alert.Title>
      <Alert.Description>
        {$parentsQuery.error.cause}<br />
        {$parentsQuery.error.message}
      </Alert.Description>
    </Alert.Root>
  {/if}

  {#if $parentsQuery.isSuccess}
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
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Children</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each $parentsQuery.data.results as parent, i}
              <TableRow
                class="cursor-pointer hover:bg-muted/50"
                onclick={() => handleView(parent)}
              >
                <td class="px-4 py-2">{i + 1}</td>
                <td class="px-4 py-2 font-medium">{parent.name}</td>
                <td class="px-4 py-2 capitalize">{parent.parentType}</td>
                <td class="px-4 py-2">
                  <div class="text-sm">
                    <div>{parent.phone}</div>
                    {#if parent.email}
                      <div class="text-muted-foreground">{parent.email}</div>
                    {/if}
                  </div>
                </td>
                <td class="px-4 py-2">
                  {#if parent.children && parent.children.length > 0}
                    <div class="flex -space-x-2">
                      {#each parent.children.slice(0, 3) as child}
                        {#if child.image && typeof child.image === "object"}
                          <img
                            src={child.image.url}
                            alt={child.name}
                            class="h-8 w-8 rounded-full border-2 border-background object-cover"
                            title={child.name}
                          />
                        {:else}
                          <div
                            class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-xs font-medium"
                            title={child.name}
                          >
                            {child.name.charAt(0)}
                          </div>
                        {/if}
                      {/each}
                      {#if parent.children.length > 3}
                        <div
                          class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium"
                        >
                          +{parent.children.length - 3}
                        </div>
                      {/if}
                    </div>
                  {:else}
                    <span class="text-sm text-muted-foreground"
                      >No children</span
                    >
                  {/if}
                </td>
                <td class="px-4 py-2 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      onclick={(e) => {
                        e.stopPropagation();
                        handleView(parent);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      View
                    </Button>
                    {#if editors.includes(user.role as Role)}
                      <Button
                        href="/parents/{parent.id}"
                        onclick={(e) => e.stopPropagation()}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                    {/if}
                  </div>
                </td>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <!-- mobile grid -->
      <div
        class="grid gap-2 lg:hidden"
        class:grid-cols-1={gridColumns === 1}
        class:grid-cols-2={gridColumns === 2}
      >
        {#each $parentsQuery.data.results as parent}
          <button
            onclick={() => openDrawer(parent)}
            class="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-card/50 p-2 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <!-- Decorative gradient overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>

            <div class="relative space-y-3">
              <!-- Header -->
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-lg leading-tight line-clamp-1">
                    {parent.name}
                  </h3>
                  <p class="text-sm text-muted-foreground capitalize mt-0.5">
                    {parent.parentType}
                  </p>
                </div>
              </div>

              <!-- Contact Info -->
              <div class="space-y-1.5 text-sm">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <Phone class="h-3.5 w-3.5" />
                  <span>{parent.phone}</span>
                </div>
                {#if parent.email}
                  <div
                    class="flex items-center gap-2 text-muted-foreground text-xs"
                  >
                    <span class="ml-5">{parent.email}</span>
                  </div>
                {/if}
              </div>

              <!-- Children Avatars -->
              {#if parent.children && parent.children.length > 0}
                <div class="pt-2 border-t">
                  <p class="text-xs font-medium text-muted-foreground mb-2">
                    Children ({parent.children.length})
                  </p>
                  <div class="flex -space-x-2">
                    {#each parent.children.slice(0, 4) as child}
                      {#if child.image && typeof child.image === "object"}
                        <img
                          src={child.image.url}
                          alt={child.name}
                          class="h-9 w-9 rounded-full border-2 border-background object-cover ring-1 ring-primary/20"
                          title={child.name}
                        />
                      {:else}
                        <div
                          class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-medium ring-1 ring-primary/20"
                          title={child.name}
                        >
                          {child.name.charAt(0)}
                        </div>
                      {/if}
                    {/each}
                    {#if parent.children.length > 4}
                      <div
                        class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium ring-1 ring-primary/20"
                      >
                        +{parent.children.length - 4}
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}

              <!-- Quick Actions -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div class="flex gap-2 pt-2" onclick={(e) => e.stopPropagation()}>
                <Button
                  href="tel:{parent.phone}"
                  variant="outline"
                  size="icon"
                  class="flex-1 h-8"
                >
                  <Phone class="size-3.5" />
                </Button>
                <Button
                  href="https://wa.me/{parent.phone.replace(/[^0-9]/g, '')}"
                  target="_blank"
                  variant="outline"
                  size="icon"
                  class="flex-1 h-8"
                >
                  <WhatsApp class="size-3.5" />
                </Button>
                {#if editors.includes(user.role as Role)}
                  <Button
                    href="/parents/{parent.id}"
                    variant="outline"
                    size="icon"
                    class="flex-1 h-8"
                  >
                    <Pencil class="size-3.5" />
                  </Button>
                {/if}
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <div>
      {#if $parentsQuery.isFetching}
        <div class="flex items-center justify-center py-4">
          <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
          <span class="ml-2 text-muted-foreground">Loading more...</span>
        </div>
      {/if}

      <!-- Sentinel element for infinite scroll -->
      <div use:observe class="h-4 w-full"></div>

      {#if !$parentsQuery.hasNextPage && !$parentsQuery.isFetching}
        <p class="text-center text-sm text-muted-foreground py-4">
          Nothing more to load
        </p>
      {/if}
    </div>
  {/if}
</div>

{#if viewingParent}
  <ParentDetailsDialog
    parent={viewingParent}
    bind:open={detailsOpen}
    onOpenChange={handleDetailsOpenChange}
    onEdit={handleEditFromDialog}
    onDelete={handleDeleteFromDialog}
  />
{/if}

{#if selectedParent}
  <ParentDrawer
    parent={selectedParent}
    bind:open={drawerOpen}
    onOpenChange={handleDrawerOpenChange}
    onEdit={handleEditFromDrawer}
    onDelete={handleDeleteFromDrawer}
  />
{/if}

{#if parentToDelete}
  <DeleteDialog
    parent={parentToDelete}
    bind:open={deleteDialogOpen}
    onOpenChange={handleDeleteDialogOpenChange}
  />
{/if}

<Dialog.Root bind:open={showDistribution}>
  <Dialog.Content class="sm:max-w-[600px]">
    <Dialog.Header>
      <Dialog.Title>Parent Type Distribution</Dialog.Title>
      <Dialog.Description>Distribution of parents by type.</Dialog.Description>
    </Dialog.Header>
    <DistributionChart data={distributionData} />
  </Dialog.Content>
</Dialog.Root>
