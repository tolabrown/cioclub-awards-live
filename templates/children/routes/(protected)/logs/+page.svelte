<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import SelectComponent, {
    type iSelect,
  } from "$lib/components/ui/select/select-component.svelte";
  import type { iActivityLog } from "$lib/interface";
  import { formatDate } from "$lib/fxns";
  import { Search, Filter, RefreshCw, Loader2 } from "@lucide/svelte";
  import LogCard from "./components/LogCard.svelte";
  import LogDetailsDialog from "./components/LogDetailsDialog.svelte";

  let logs = $state<iActivityLog[]>([]);
  let filteredLogs = $state<iActivityLog[]>([]);
  let loading = $state(true);

  // Filter states
  let searchQuery = $state("");
  let selectedAction = $state<string>("all");
  let selectedEntity = $state<string>("all");

  onMount(async () => {
    await fetchLogs();
  });

  const fetchLogs = async () => {
    loading = true;
    try {
      const response = await fetch("/api/logs");
      logs = await response.json();
      applyFilters();
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      loading = false;
    }
  };

  const applyFilters = () => {
    filteredLogs = logs.filter((log) => {
      const matchesSearch =
        !searchQuery ||
        log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof log.user === "string" ? log.user : log.user?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesAction =
        selectedAction === "all" || log.action === selectedAction;
      const matchesEntity =
        selectedEntity === "all" || log.entity === selectedEntity;

      return matchesSearch && matchesAction && matchesEntity;
    });
  };

  $effect(() => {
    applyFilters();
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
      case "UPDATE":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950";
      case "DELETE":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
      default:
        return "";
    }
  };

  const uniqueEntities = $derived([
    "all",
    ...new Set(logs.map((l) => l.entity)),
  ]);

  // Dialog state
  let selectedLog = $state<iActivityLog | null>(null);
  let dialogOpen = $state(false);

  const getUserName = (user: any) => {
    if (!user) return "System";
    return typeof user === "string" ? user : user.name || "Unknown";
  };

  const openLogDetails = (log: iActivityLog) => {
    selectedLog = log;
    dialogOpen = true;
  };
</script>

<div class="flex flex-col gap-4">
  <div
    class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight">
        Activity Logs ({#if loading}
          <Loader2 class="inline h-4 w-4 animate-spin" />
        {:else}
          {logs.length}
        {/if})
      </h1>
      <p class="text-muted-foreground">
        Track all system activities and user actions.{#if !loading}
          {filteredLogs.length} of {logs.length} logs{/if}
      </p>
    </div>
    <Button variant="outline" size="sm" onclick={fetchLogs} disabled={loading}>
      <RefreshCw class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
      Refresh
    </Button>
  </div>

  <!-- Filters -->
  <div
    class="flex flex-col gap-3 md:flex-row md:items-center bg-muted/50 p-4 rounded-lg"
  >
    <div class="relative flex-1">
      <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search by user, entity, or ID..."
        class="pl-9"
        bind:value={searchQuery}
      />
    </div>

    <SelectComponent
      bind:value={selectedAction}
      placeholder="All Actions"
      name="action-filter"
      class="w-full md:w-[180px]"
      options={[
        { label: "All Actions", value: "all" },
        { label: "Create", value: "CREATE" },
        { label: "Update", value: "UPDATE" },
        { label: "Delete", value: "DELETE" },
      ]}
    />

    <SelectComponent
      bind:value={selectedEntity}
      placeholder="All Entities"
      name="entity-filter"
      class="w-full md:w-[180px]"
      options={uniqueEntities.map((entity) => ({
        label: entity === "all" ? "All Entities" : entity,
        value: entity,
      }))}
    />
  </div>

  {#if loading}
    <div class="flex justify-center py-8">
      <p class="text-muted-foreground">Loading logs...</p>
    </div>
  {:else if filteredLogs.length > 0}
    <!-- Mobile: Cards -->
    <div class="md:hidden space-y-3">
      {#each filteredLogs as log (log.id)}
        <LogCard {log} onclick={() => openLogDetails(log)} />
      {/each}
    </div>

    <!-- Desktop: Table -->
    <div
      class="hidden md:block overflow-x-auto border rounded-lg bg-white dark:bg-background"
    >
      <Table>
        <TableHeader
          class="sticky top-0 z-10 border-b bg-white dark:bg-secondary"
        >
          <TableRow>
            <TableHead class="w-[180px]">Date/Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead class="w-[100px]">Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead class="w-[120px]">Entity ID</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each filteredLogs as log (log.id)}
            <TableRow
              class="hover:bg-muted/50 cursor-pointer"
              onclick={() => openLogDetails(log)}
            >
              <TableCell class="whitespace-nowrap font-mono text-xs">
                {formatDate(log.createdAt, "YYYY-MM-DD HH:mm:ss")}
              </TableCell>
              <TableCell class="font-medium">
                {getUserName(log.user)}
              </TableCell>
              <TableCell>
                <span
                  class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}
                >
                  {log.action}
                </span>
              </TableCell>
              <TableCell class="font-medium">{log.entity}</TableCell>
              <TableCell
                class="font-mono text-xs text-muted-foreground truncate max-w-[120px]"
                title={log.entityId}
              >
                {log.entityId}
              </TableCell>
              <TableCell class="max-w-md">
                <div
                  class="text-sm text-muted-foreground truncate"
                  title={log.details || "-"}
                >
                  {log.details || "-"}
                </div>
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </div>
  {:else}
    <div
      class="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
    >
      <Filter class="h-12 w-12 text-muted-foreground mb-4" />
      <h3 class="mt-4 text-lg font-semibold">No logs found</h3>
      <p class="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
        {logs.length > 0
          ? "Try adjusting your filters to find what you're looking for."
          : "Activity logs will appear here as users perform actions in the system."}
      </p>
    </div>
  {/if}
</div>

<!-- Log Details Dialog/Drawer -->
<LogDetailsDialog log={selectedLog} bind:open={dialogOpen} />
