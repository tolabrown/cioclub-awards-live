<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Plus,
    Search,
    Loader2,
    Users,
    ChartPieIcon,
    Grid2X2,
    Grid3X3,
  } from "@lucide/svelte";
  import { adminAndTeachersRoles, Role, MeetingTypes } from "$lib/constants";
  import AttendeeGridCard from "./components/AttendeeGridCard.svelte";
  import AttendeeTableRow from "./components/AttendeeTableRow.svelte";
  import AttendeeDrawer from "./components/AttendeeDrawer.svelte";
  import AttendeeDetailsDialog from "./components/AttendeeDetailsDialog.svelte";
  import type { iAttendee } from "$lib/interface";
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
  import type { iSelect } from "$lib/components/ui/select/select-component.svelte";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import { Skeleton } from "$lib/components/ui/skeleton";

  let { data } = $props();
  const user = page.data.user as User;

  const meetingTypeOptions: iSelect[] = [
    { label: "All Types", value: "all" },
    ...Object.values(MeetingTypes).map((type) => ({
      label: type,
      value: type,
    })),
  ];

  // State
  let attendees = $state<iAttendee[]>([]);
  let meta = $state({ cursor: "", more: false, size: 0 });
  let totalAttendees = $state(0);
  let loading = $state(false);
  let initialLoading = $state(true);
  let searchInput = $state("");
  let selectedType = $state<string>("all");
  let gridColumns = $state(2); // 1 or 2 columns for mobile

  // Selection State
  let selectedAttendee = $state<iAttendee | null>(null);
  let isDrawerOpen = $state(false);
  let isDialogOpen = $state(false);
  let isDesktop = $state(false);
  let showDistribution = $state(false);

  // Fetch statistics from API
  const statisticsQuery = createQuery({
    queryKey: ["attendees-statistics"],
    queryFn: async () => {
      const response = await fetch("/api/attendees/statistics");
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
    data.attendees.then((result) => {
      attendees = result.data;
      meta = result.meta;
      totalAttendees = result.total || 0;
      initialLoading = false;
    });
  });

  // Infinite Scroll
  const loadMore = async () => {
    if (loading || !meta.more) return;
    loading = true;

    const params = new URLSearchParams({
      offset: attendees.length.toString(),
      ...(searchInput && { search: searchInput }),
      ...(selectedType !== "all" && { meetingType: selectedType }),
    });

    try {
      const res = await fetch(`/api/attendees?${params}`);
      const result = await res.json();
      if (result.status === "success" && result.data) {
        attendees = [...attendees, ...result.data.data];
        meta = result.data.meta;
      }
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

  // Search
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
    if (selectedType !== "all") params.set("meetingType", selectedType);

    await goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });

    // Reset data - await the new promise
    const result = await data.attendees;
    attendees = result.data;
    meta = result.meta;
  };

  // Sync with URL on load - removed duplicate effect since we handle it above

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    searchInput = params.get("search") || "";
    selectedType = params.get("meetingType") || "all";

    const checkDesktop = () => {
      isDesktop = window.innerWidth >= 768;
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  });

  // Handlers
  const handleAttendeeClick = (attendee: iAttendee) => {
    selectedAttendee = attendee;
    if (isDesktop) {
      isDialogOpen = true;
    } else {
      isDrawerOpen = true;
    }
  };

  const handleEdit = () => {
    if (selectedAttendee) {
      goto(`/attendees/${selectedAttendee.id}`);
    }
  };

  const handleDelete = async () => {
    if (
      !selectedAttendee ||
      !confirm("Are you sure you want to delete this attendance record?")
    )
      return;

    try {
      const res = await fetch(`/api/attendees/${selectedAttendee.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        attendees = attendees.filter((e: any) => e.id !== selectedAttendee?.id);
        isDrawerOpen = false;
        isDialogOpen = false;
        selectedAttendee = null;
      }
    } catch (error) {
      console.error(error);
    }
  };
</script>

<div class="flex flex-col gap-4">
  <!-- Header -->
  <div
    class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight">
        Attendance ({#if initialLoading}
          <Loader2 class="inline h-4 w-4 animate-spin" />
        {:else}
          {totalAttendees}
        {/if})
      </h1>
      <p class="text-muted-foreground">
        Track and manage meeting attendance records.
      </p>
    </div>
  </div>

  <!-- Sticky Header & Controls -->
  <div
    class="sticky top-0 z-30 -mx-4 flex flex-col gap-4 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:mx-0 md:px-0 md:grid md:grid-cols-[1fr_1fr_auto]"
  >
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <Search
          class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Search by child name, meeting type, or notes..."
          class="pl-9"
          value={searchInput}
          oninput={(e) => handleSearch(e.currentTarget.value)}
        />
      </div>

      {#if adminAndTeachersRoles.includes(user.role as Role)}
        <Button
          href="/attendees/new"
          class="shrink-0 aspect-square sm:aspect-auto"
        >
          <Plus class="h-5 w-5 sm:mr-2 sm:h-4 sm:w-4" />
          <span class="hidden sm:inline">Record Attendance</span>
        </Button>
      {/if}
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-2 w-full md:w-auto">
      <SelectComponent
        options={meetingTypeOptions}
        value={selectedType}
        onValueChange={handleTypeChange}
        placeholder="Select Meeting Type"
        name="meetingType"
        class="flex-1 md:w-[240px]"
      />

      <!-- Column toggle (mobile only) -->
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

  <!-- Data Display -->
  {#if initialLoading}
    <!-- Desktop Table Skeleton -->
    <div
      class="hidden lg:block overflow-x-auto border bg-white dark:bg-background"
    >
      <Table>
        <TableHeader
          class="sticky top-0 z-10 border-b bg-white dark:bg-secondary"
        >
          <TableRow>
            <TableHead>S/N</TableHead>
            <TableHead>Child</TableHead>
            <TableHead>Meeting Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Notes</TableHead>
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
              <td class="p-4"><Skeleton class="h-4 w-28" /></td>
              <td class="p-4"><Skeleton class="h-4 w-20" /></td>
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
  {:else if attendees.length > 0}
    <!-- Desktop Table -->
    <div
      class="hidden lg:block overflow-x-auto border bg-white dark:bg-background"
    >
      <Table>
        <TableHeader
          class="sticky top-0 z-10 border-b bg-white dark:bg-secondary"
        >
          <TableRow>
            <TableHead>S/N</TableHead>
            <TableHead>Child</TableHead>
            <TableHead>Meeting Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each attendees as attendee, i (attendee.id)}
            <AttendeeTableRow
              {attendee}
              index={i}
              onClick={() => handleAttendeeClick(attendee)}
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
      {#each attendees as attendee (attendee.id)}
        <AttendeeGridCard
          {attendee}
          columns={gridColumns}
          onClick={() => handleAttendeeClick(attendee)}
        />
      {/each}
    </div>

    <!-- Infinite Scroll Sentinel -->
    <div use:sentinel class="flex justify-center py-4">
      {#if loading}
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      {:else if !meta.more}
        <p class="text-sm text-muted-foreground">No more records to load</p>
      {/if}
    </div>
  {:else}
    <div
      class="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center-50"
    >
      <div
        class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"
      >
        <Users class="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 class="mt-4 text-lg font-semibold">No attendance records found</h3>
      <p class="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
        {searchInput || selectedType !== "all"
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Get started by recording attendance for a meeting."}
      </p>
      {#if adminAndTeachersRoles.includes(user.role as Role)}
        <Button href="/attendees/new" variant="outline">
          <Plus class="mr-2 h-4 w-4" />
          Record Attendance
        </Button>
      {/if}

      <Dialog.Root bind:open={showDistribution}>
        <Dialog.Content class="sm:max-w-[600px]">
          <Dialog.Header>
            <Dialog.Title>Attendance Distribution</Dialog.Title>
            <Dialog.Description>
              Distribution of attendees by meeting type.
            </Dialog.Description>
          </Dialog.Header>
          <DistributionChart data={distributionData} />
        </Dialog.Content>
      </Dialog.Root>
    </div>
  {/if}
</div>

<!-- Details View -->
{#if selectedAttendee}
  {#if isDesktop}
    <AttendeeDetailsDialog
      attendee={selectedAttendee}
      bind:open={isDialogOpen}
      onOpenChange={(open) => !open && (selectedAttendee = null)}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  {:else}
    <AttendeeDrawer
      attendee={selectedAttendee}
      bind:open={isDrawerOpen}
      onOpenChange={(open) => !open && (selectedAttendee = null)}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  {/if}
{/if}
