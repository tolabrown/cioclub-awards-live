<script lang="ts">
  import { ShieldCheck, Search, Activity, Trash2, Edit, Plus, Eye, History, Clock, User as UserIcon, Download, ChevronRight, Filter, Loader2 } from "@lucide/svelte";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { fade } from "svelte/transition";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { enhance } from "$app/forms";

  let { data=$bindable() } = $props();
  
  // Svelte 5 State
  let logs = $state([...(data.logs ?? [])]);
  let currentPage = $state(data.page ?? 1);
  let hasMore = $state(data.hasMore ?? false);
  let isLoading = $state(false);
  let isExporting = $state(false);
  let selectedLog = $state<any>(null);
  let isDetailOpen = $state(false);
  let isMobile = $state(false);

  // Sync state with data when search/op changes (resets list)
  $effect(() => {
    logs = [...(data.logs ?? [])];
    currentPage = data.page ?? 1;
    hasMore = data.hasMore ?? false;
  });

  // Viewport detection for Dialog vs Drawer
  $effect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    isMobile = mq.matches;
    const onChange = (e: MediaQueryListEvent) => { isMobile = e.matches; };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  });

  function handleSearch(e: Event) {
    const target = e.target as HTMLInputElement;
    const url = new URL(page.url);
    url.searchParams.set("search", target.value);
    url.searchParams.set("page", "1");
    goto(url.toString(), { replaceState: true, keepFocus: true });
  }

  function handleOpFilter(val: string) {
    const url = new URL(page.url);
    if (val && val !== "ALL") {
      url.searchParams.set("op", val);
    } else {
      url.searchParams.delete("op");
    }
    url.searchParams.set("page", "1");
    goto(url.toString(), { replaceState: true });
  }

  async function handleLoadMore() {
    if (isLoading || !hasMore) return;
    isLoading = true;
    const nextPage = currentPage + 1;
    const searchParams = new URLSearchParams(page.url.searchParams);
    searchParams.set('page', nextPage.toString());
    
    try {
      const response = await fetch(`${page.url.pathname}/__data.json?${searchParams.toString()}`);
      const result = await response.json();
      
      const newLogs = result.nodes.find((n: any) => n?.type === 'data')?.data?.logs || [];
      const newHasMore = result.nodes.find((n: any) => n?.type === 'data')?.data?.hasMore ?? false;
      
      logs = [...logs, ...newLogs];
      currentPage = nextPage;
      hasMore = newHasMore;
    } catch (e) {
      console.error("Load more failed", e);
    } finally {
      isLoading = false;
    }
  }

  function downloadCSV(data: any[]) {
    const headers = ["Timestamp", "User", "Email", "Operation", "Action", "Entity", "ID", "Metadata"];
    const rows = data.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.user?.name || "System",
      log.user?.email || "N/A",
      log.operation,
      log.action,
      log.entityType || "",
      log.entityId || "",
      JSON.stringify(log.metadata || {})
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function openDetail(log: any) {
    selectedLog = log;
    isDetailOpen = true;
  }

  function getOperationBadge(op: string) {
    switch (op) {
      case "CREATE": return "gsgreen";
      case "UPDATE": return "gsblue";
      case "DELETE": return "gsred";
      case "AUTH": return "purple";
      case "READ": return "muted";
      default: return "default";
    }
  }

  function getOperationIcon(op: string) {
    switch (op) {
      case "CREATE": return Plus;
      case "UPDATE": return Edit;
      case "DELETE": return Trash2;
      case "AUTH": return ShieldCheck;
      case "READ": return Eye;
      default: return History;
    }
  }

  function formatTime(date: string | Date) {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(date));
  }

  function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  }
</script>

<svelte:head>
  <title>Activity Log | Admin Central</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
  {#if data.authorized === false}
    <div class="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <ShieldCheck class="size-20 text-muted-foreground/30" />
      <h2 class="text-2xl font-black">{data.message || 'Access Denied'}</h2>
      <p class="text-muted-foreground">You do not have the required permissions to view system logs.</p>
      <Button variant="outline" href="/">Return to HQ</Button>
    </div>
  {:else}
    <!-- Header Section -->
  <div class="relative overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-xl shadow-primary/5">
    <div class="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
    <div class="relative p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div class="space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          <Activity class="size-3.5" />
          <span class="text-[10px] font-bold uppercase tracking-[0.2em]">Audit Intelligence</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          System <span class="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Activity Log</span>
        </h1>
        <p class="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
          Platform-wide audit trail monitoring all critical operations. Ensuring full accountability and session integrity.
        </p>
      </div>
      
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Search & Filter Controls -->
        <div class="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border/50">
          <div class="relative flex-1 sm:w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search actions..." 
              class="pl-9 h-10 border-none bg-transparent focus-visible:ring-0"
              value={data.search ?? ""}
              oninput={handleSearch}
            />
          </div>
          
          <div class="h-6 w-px bg-border/50 mx-1"></div>
          
          <Select.Root type="single" value={data.op || "ALL"} onValueChange={handleOpFilter}>
            <Select.Trigger class="h-10 w-[140px] border-none bg-transparent hover:bg-muted/50 transition-colors">
              <Select.Value placeholder="Operation" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="ALL">All Operations</Select.Item>
              <Select.Item value="CREATE">CREATE</Select.Item>
              <Select.Item value="UPDATE">UPDATE</Select.Item>
              <Select.Item value="DELETE">DELETE</Select.Item>
              <Select.Item value="AUTH">AUTH</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <form 
          method="POST" 
          action="?/export" 
          use:enhance={() => {
            isExporting = true;
            return async ({ result }) => {
              isExporting = false;
              if (result.type === 'success') {
                const logsToExport = (result.data?.allLogs as any[]) ?? [];
                if (logsToExport.length > 0) {
                  downloadCSV(logsToExport);
                }
              }
            };
          }}
        >
          <Button 
            variant="outline" 
            class="h-12 w-full sm:w-auto font-bold gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            type="submit"
            disabled={isExporting}
          >
            {#if isExporting}
              <Loader2 class="size-4 animate-spin" />
              Exporting...
            {:else}
              <Download class="size-4" />
              Export CSV
            {/if}
          </Button>
        </form>
      </div>
    </div>
  </div>

  <!-- Logs Content Area -->
  <div class="space-y-4">
    <!-- Desktop View (Table) -->
    <div class="hidden md:block overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
      <Table.Root>
        <Table.Header class="bg-muted/50">
          <Table.Row class="hover:bg-transparent border-border/50">
            <Table.Head class="w-[200px] font-bold uppercase tracking-tighter text-[10px] py-4">User</Table.Head>
            <Table.Head class="w-[120px] font-bold uppercase tracking-tighter text-[10px] py-4">Operation</Table.Head>
            <Table.Head class="font-bold uppercase tracking-tighter text-[10px] py-4">Action Detail</Table.Head>
            <Table.Head class="w-[150px] font-bold uppercase tracking-tighter text-[10px] py-4">Entity</Table.Head>
            <Table.Head class="w-[180px] font-bold uppercase tracking-tighter text-[10px] text-right py-4">Timestamp</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each logs as log (log.id)}
            <Table.Row 
              class="group hover:bg-primary/3 transition-colors cursor-pointer border-border/40" 
              onclick={() => openDetail(log)}
            >
              <Table.Cell>
                <div class="flex items-center gap-3">
                  <Avatar.Root class="size-9 border border-border/50 shadow-sm transition-transform group-hover:scale-105">
                    <Avatar.Image src={log.user?.image} alt={log.user?.name} />
                    <Avatar.Fallback class="bg-primary/5 text-primary text-[10px] font-bold">
                      {log.user?.name?.charAt(0) || 'S'}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-foreground leading-none">{log.user?.name || 'System'}</span>
                    <span class="text-[10px] text-muted-foreground mt-1 lowercase font-medium">{log.user?.email || 'automated-task@system'}</span>
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell>
                <Badge variant={getOperationBadge(log.operation)} class="rounded-full h-6 px-2.5 font-bold flex items-center gap-1.5 w-fit text-[9px] tracking-wider border-none shadow-sm">
                  {@const OpIcon = getOperationIcon(log.operation)}
                  <OpIcon class="size-3" />
                  {log.operation}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <div class="flex flex-col max-w-[400px]">
                  <span class="text-sm text-foreground font-semibold line-clamp-1">{log.action}</span>
                  {#if log.metadata}
                    <span class="text-[10px] text-muted-foreground font-mono mt-0.5 line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      {typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata)}
                    </span>
                  {/if}
                </div>
              </Table.Cell>
              <Table.Cell>
                {#if log.entityType}
                  <div class="flex items-center gap-2">
                    <Badge variant="outline" class="text-[9px] font-bold uppercase tracking-widest bg-muted/30 border-border/50 px-1.5 h-5">
                      {log.entityType}
                    </Badge>
                    <span class="text-[9px] text-muted-foreground font-mono">#{log.entityId?.slice(0, 8)}</span>
                  </div>
                {:else}
                  <span class="text-muted-foreground text-xs opacity-30">—</span>
                {/if}
              </Table.Cell>
              <Table.Cell class="text-right">
                <div class="flex flex-col items-end gap-0.5">
                  <span class="text-xs font-bold text-foreground flex items-center gap-1.5 leading-none">
                    <Clock class="size-3 text-primary/70" />
                    {formatTime(log.createdAt)}
                  </span>
                  <span class="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-none">{formatDate(log.createdAt)}</span>
                </div>
              </Table.Cell>
            </Table.Row>
          {:else}
            <Table.Row>
              <Table.Cell colspan={5} class="h-[400px]">
                <div class="flex flex-col items-center justify-center space-y-4">
                  <div class="size-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground animate-pulse">
                    <History class="size-8" />
                  </div>
                  <div class="text-center space-y-1">
                    <p class="text-lg font-bold">No activity found</p>
                    <p class="text-sm text-muted-foreground">Adjust filters or search query</p>
                  </div>
                </div>
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>

    <!-- Mobile View (Cards) -->
    <div class="md:hidden space-y-4">
      {#each logs as log (log.id)}
        <button 
          class="w-full text-left p-5 rounded-2xl border border-border/50 bg-card shadow-sm hover:border-primary/50 transition-all active:scale-[0.98] relative overflow-hidden group"
          onclick={() => openDetail(log)}
        >
          <div class="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
            <ChevronRight class="size-4" />
          </div>
          <div class="flex items-center gap-4 mb-4">
            <Avatar.Root class="size-10 border border-border/50">
              <Avatar.Image src={log.user?.image} alt={log.user?.name} />
              <Avatar.Fallback class="bg-primary/5 text-primary font-bold">
                {log.user?.name?.charAt(0) || 'S'}
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="flex-1 min-w-0">
               <div class="flex items-center justify-between gap-2">
                 <span class="text-sm font-bold truncate">{log.user?.name || 'System'}</span>
                 <span class="text-[10px] text-muted-foreground font-bold tracking-widest">{formatTime(log.createdAt)}</span>
               </div>
               <Badge variant={getOperationBadge(log.operation)} class="mt-1 rounded-full text-[8px] px-2 h-5 font-bold uppercase tracking-tighter border-none">
                 {log.operation}
               </Badge>
            </div>
          </div>
          <div class="space-y-1.5">
            <p class="text-sm font-semibold text-foreground line-clamp-2 leading-relaxed">{log.action}</p>
            {#if log.entityType}
               <div class="flex items-center gap-2 mt-2">
                 <span class="text-[10px] font-bold text-muted-foreground uppercase">{log.entityType}</span>
                 <div class="size-1 rounded-full bg-border"></div>
                 <span class="text-[10px] font-mono text-muted-foreground">#{log.entityId?.slice(0, 8)}</span>
               </div>
            {/if}
          </div>
        </button>
      {:else}
        <div class="p-12 text-center rounded-2xl border border-dashed border-border flex flex-col items-center gap-4">
            <History class="size-10 text-muted-foreground/30" />
            <p class="text-sm font-bold text-muted-foreground">No logs found</p>
        </div>
      {/each}
    </div>

    <!-- Infinite Scroll / Load More -->
    {#if hasMore}
      <div class="flex justify-center pt-4 pb-8" in:fade>
        <Button 
          variant="outline" 
          class="rounded-full px-8 h-12 font-bold gap-2 border-primary/20 hover:bg-primary/5 transition-all w-full max-w-xs"
          onclick={handleLoadMore}
          disabled={isLoading}
        >
          {#if isLoading}
            <Loader2 class="size-4 animate-spin" />
            Synchronizing...
          {:else}
            <Plus class="size-4" />
            Load More Activity
          {/if}
        </Button>
      </div>
    {/if}
  </div>

  <div class="flex items-center justify-between px-2 text-muted-foreground pb-10">
    <p class="text-[10px] font-bold uppercase tracking-widest opacity-50">
      Visualizing {logs.length} of {data.totalCount ?? 0} operational events
    </p>
  </div>

  <!-- Details Dialog (Desktop) -->
  <Dialog.Root open={isDetailOpen && !!selectedLog && !isMobile} onOpenChange={(v) => !v && (isDetailOpen = false)}>
    <Dialog.Content class="sm:max-w-[600px] gap-0 p-0 overflow-hidden rounded-2xl border-primary/20 bg-card shadow-2xl">
      {#if selectedLog}
        <div class="relative h-32 bg-linear-to-br from-primary/20 via-primary/5 to-transparent border-b border-border/50">
          <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div class="absolute bottom-0 left-0 p-6 flex items-end gap-4 translate-y-1/2">
            <Avatar.Root class="size-20 border-4 border-card shadow-xl">
              <Avatar.Image src={selectedLog.user?.image} alt={selectedLog.user?.name} />
              <Avatar.Fallback class="bg-primary/10 text-primary text-xl font-bold">
                {selectedLog.user?.name?.charAt(0) || 'U'}
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="pb-2 space-y-0.5">
              <h2 class="text-xl font-black text-foreground drop-shadow-sm">{selectedLog.user?.name || 'System'}</h2>
              <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">{selectedLog.user?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        <Dialog.Header class="px-6 pt-16 pb-6 border-b border-border/30 bg-muted/20">
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <Dialog.Title class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Operation Intelligence</Dialog.Title>
              <p class="text-lg font-extrabold leading-tight">{selectedLog.action}</p>
            </div>
            <Badge variant={getOperationBadge(selectedLog.operation)} class="rounded-full px-4 h-8 font-black border-none shadow-md">
              {selectedLog.operation}
            </Badge>
          </div>
        </Dialog.Header>

        <ScrollArea class="max-h-[40vh] px-6 py-8">
          <div class="grid grid-cols-2 gap-8">
            <div class="space-y-1.5">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entity Signature</p>
              <div class="flex items-center gap-2">
                <Badge variant="outline" class="font-bold bg-muted/50 border-border/50">{selectedLog.entityType || 'SYSTEM'}</Badge>
                <code class="text-[10px] font-mono text-primary/70">{selectedLog.entityId || 'N/A'}</code>
              </div>
            </div>
            <div class="space-y-1.5">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Chronology</p>
              <div class="flex flex-col">
                <span class="text-sm font-black text-foreground">{formatTime(selectedLog.createdAt)}</span>
                <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{formatDate(selectedLog.createdAt)}</span>
              </div>
            </div>
            <div class="col-span-2 space-y-4 pt-4">
              <div class="p-4 rounded-xl bg-muted/40 border border-border/40 font-mono text-xs overflow-auto max-h-64 leading-relaxed group relative">
                <div class="absolute top-3 right-3 text-[10px] font-bold text-muted-foreground uppercase opacity-30">Metadata Payload</div>
                <pre class="whitespace-pre-wrap break-all text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <Dialog.Footer class="p-6 bg-muted/10 border-t border-border/30">
          <Button variant="ghost" class="font-bold text-xs uppercase tracking-widest" onclick={() => isDetailOpen = false}>Close Analysis</Button>
          <Button class="font-bold gap-2 shadow-lg shadow-primary/20" onclick={() => window.print()}>
            <Download class="size-4" />
            Print Report
          </Button>
        </Dialog.Footer>
      {/if}
    </Dialog.Content>
  </Dialog.Root>

  <!-- Mobile Detail Drawer (Mobile) -->
  <Drawer.Root open={isDetailOpen && !!selectedLog && isMobile} onOpenChange={(v) => !v && (isDetailOpen = false)}>
    <Drawer.Content class="bg-card border-t-primary/20">
      {#if selectedLog}
        <div class="mx-auto w-12 h-1.5 rounded-full bg-muted mt-4"></div>
        <div class="p-6 pb-12 space-y-8">
          <div class="flex items-center gap-4">
            <Avatar.Root class="size-14 border-2 border-primary/20">
              <Avatar.Image src={selectedLog.user?.image} alt={selectedLog.user?.name} />
              <Avatar.Fallback class="bg-primary/5 text-primary text-lg font-bold">
                {selectedLog.user?.name?.charAt(0) || 'U'}
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="flex-1 min-w-0">
               <h3 class="text-lg font-extrabold truncate leading-tight">{selectedLog.user?.name || 'System'}</h3>
               <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest line-clamp-1">{selectedLog.user?.email || 'N/A'}</p>
            </div>
            <Badge variant={getOperationBadge(selectedLog.operation)} class="rounded-full shadow-sm border-none">
                {selectedLog.operation}
            </Badge>
          </div>

          <div class="space-y-4">
             <div class="space-y-1">
                <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Action Profile</p>
                <p class="text-base font-black leading-snug">{selectedLog.action}</p>
             </div>

             <div class="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                <div class="space-y-1">
                   <p class="text-[10px] font-bold text-muted-foreground uppercase">Target</p>
                   <p class="text-xs font-bold">{selectedLog.entityType || 'System'}</p>
                </div>
                <div class="space-y-1">
                   <p class="text-[10px] font-bold text-muted-foreground uppercase text-right">Moment</p>
                   <p class="text-xs font-bold text-right">{formatTime(selectedLog.createdAt)}</p>
                </div>
             </div>

             <div class="space-y-2">
                <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Metadata Context</p>
                <div class="p-4 rounded-xl bg-muted/50 border border-border/50 font-mono text-[10px] whitespace-pre-wrap break-all max-h-48 overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                </div>
             </div>
          </div>

          <Button class="w-full rounded-2xl shadow-xl shadow-primary/20" onclick={() => isDetailOpen = false}>
            Acknowledge Information
          </Button>
        </div>
      {/if}
    </Drawer.Content>
  </Drawer.Root>
  {/if}
</div>

<style>
  :global(.bg-grid-pattern) {
    background-image: 
      linear-gradient(to right, currentColor 1px, transparent 1px),
      linear-gradient(to bottom, currentColor 1px, transparent 1px);
    background-size: 40px 40px;
    color: var(--primary);
  }
</style>
