<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll, goto } from "$app/navigation";
  import { page } from "$app/state";


  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import * as Select from "$lib/components/ui/select";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import {
    Users,
    Briefcase,
    Building2,
    Calendar,
    User,
    Mail,
    CheckCircle2,
    Clock,
    MoreVertical,
    Trash2,
    ArrowRight,
    Loader2,
    ExternalLink,
    ShieldCheck,
    XCircle,
    Filter,
    Download,
    Search,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { cn } from "$lib/utils";
  import { format } from "date-fns";
  import { Role } from "$lib/constants";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const user = $derived(data.user);
  const isAdmin = $derived(user?.role === Role.ADMIN);
  const isFreeMember = $derived(user?.role === Role.MEMBER_FREE);

  let selectedMember = $state<any>(null);
  let isDialogOpen = $state(false);
  let isDrawerOpen = $state(false);
  let isLoadingMore = $state(false);
  let processingId = $state<string | null>(null);
  let activeAction = $state<string | null>(null);
  let scrollContainer = $state<HTMLElement | null>(null);
  let observerElement = $state<HTMLElement | null>(null);
  let selectedIds = $state(new Set<string>());
  let isBulkDeleteDialogOpen = $state(false);
  let isBulkDeleting = $state(false);
  let filteringStatus = $state<string | null>(null);
  let search = $state(page.url.searchParams.get("search") || "");
  let searchTimeout = $state<number | null>(null);


  // Combine members for "infinite" list simulation
  let allMembers = $state<any[]>([]);
  let paymentFilter = $state(page.url.searchParams.get("paymentStatus") || "all");
  const exportUrl = $derived(`/admin/members/export?paymentStatus=${paymentFilter}${search ? `&search=${search}` : ""}`);


  // Sync paymentFilter with URL changes (back button, etc)
  $effect(() => {
    paymentFilter = page.url.searchParams.get("paymentStatus") || "all";
    search = page.url.searchParams.get("search") || "";
  });



  // Infinite Scroll Observer
  $effect(() => {
    if (!observerElement || !data.pagination.hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerElement);
    return () => observer.disconnect();
  });

  // Update when data changes
  $effect(() => {
    if (data.pagination.page === 1) {
      allMembers = [...data.members];
    } else {
      const newItems = data.members.filter(
        (newItem: any) => !allMembers.some((item) => item.id === newItem.id),
      );
      allMembers = [...allMembers, ...newItems];
    }
  });

  function openDetails(member: any) {
    selectedMember = member;
    if (window.innerWidth >= 768) {
      isDialogOpen = true;
    } else {
      isDrawerOpen = true;
    }
  }

  async function handleLoadMore() {
    if (isLoadingMore || !data.pagination.hasMore) return;

    isLoadingMore = true;
    const nextPage = data.pagination.page + 1;
    const url = new URL(page.url);
    url.searchParams.set("page", nextPage.toString());

    try {
      const response = await fetch(url.toString(), {
        headers: { "x-sveltekit-load": "true" },
      });
      if (response.ok) {
        // Use replaceState: true for seamless infinite scroll URL update
        await goto(url.toString(), { 
          replaceState: true, 
          noScroll: true, 
          keepFocus: true 
        });
      }
    } catch (e) {
      console.error("Failed to load more:", e);
    } finally {
      isLoadingMore = false;
    }
  }


  async function handleFilterChange(status: string) {
    if (filteringStatus) return;
    
    filteringStatus = status;
    paymentFilter = status; // Optimistic highlight
    selectedIds = new Set();
    
    const url = new URL(page.url);
    if (status === "all") {
      url.searchParams.delete("paymentStatus");
    } else {
      url.searchParams.set("paymentStatus", status);
    }
    url.searchParams.set("page", "1");
    
    try {
      await goto(url.toString(), { 
        keepFocus: true, 
        replaceState: true,
        noScroll: true
      });
    } finally {
      filteringStatus = null;
    }
  }

  function handleSearch(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    search = value;
    
    if (searchTimeout) clearTimeout(searchTimeout);
    
    searchTimeout = window.setTimeout(async () => {
      const url = new URL(page.url);
      if (value) {
        url.searchParams.set("search", value);
      } else {
        url.searchParams.delete("search");
      }
      url.searchParams.set("page", "1");
      
      await goto(url.toString(), { 
        keepFocus: true, 
        replaceState: true,
        noScroll: true
      });
    }, 400);
  }




  function toggleSelectAll() {
    if (selectedIds.size === allMembers.length && allMembers.length > 0) {
      // If ALL are selected, deselect all
      selectedIds = new Set();
    } else {
      // If none or partial selected, select all
      selectedIds = new Set(allMembers.map((m) => m.inquiry.id));
    }
  }

  function toggleSelectMember(id: string) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }
    selectedIds = new Set(selectedIds); // Trigger reactivity
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800";
      case "approved":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800";
      case "processing":
        return "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800";
    }
  };

  const getPaymentStatus = (payment: any) => {
    if (payment?.status === "success")
      return {
        label: "Paid",
        class: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      };
    if (payment?.status === "failed")
      return {
        label: "Failed",
        class: "bg-destructive/10 text-destructive border-destructive/20",
      };
    return {
      label: "Not Paid",
      class: "bg-amber-500/10 text-amber-600 border-amber-200",
    };
  };

  const getDaysRemaining = (endAt: string | null) => {
    if (!endAt) return null;
    const diff = new Date(endAt).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "individual":
      case "student":
      case "entry-level":
      case "executive":
        return "bg-primary/10 text-primary border-primary/20";
      case "corporate":
      case "corporate-sme":
      case "corporate-enterprise":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-200";
      case "free":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };
</script>

<div class="flex flex-col gap-6 w-full pb-20">
  <!-- Header Section -->
  <div class="flex flex-col gap-4 pt-4">
    <div class="space-y-1">
      <h1
        class="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3"
      >
        <div class="bg-primary/10 p-2 rounded-xl text-primary">
          <Users class="size-7" />
        </div>
        Membership Management
      </h1>
      <p class="text-muted-foreground font-medium pl-1">
        Track payments, monitor subscription expiry, and manage applications.
      </p>
    </div>

    <div
      class="flex flex-col gap-4 bg-card/50 backdrop-blur-md border border-border/50 p-3 rounded-xl shadow-sm"
    >
      <div class="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full">
        <!-- Search and Stats -->
        <div class="flex items-center gap-3 w-full lg:w-96 bg-muted/30 p-1 rounded-lg border border-border/40 focus-within:border-primary/50 transition-all">
          <div class="pl-2 text-muted-foreground">
            <Search class="size-4" />
          </div>
          <input
            type="text"
            value={search}
            oninput={handleSearch}
            placeholder="Search name, email or org..."
            class="bg-transparent border-none focus:ring-0 text-sm w-full py-1.5 font-medium placeholder:text-muted-foreground/60"
          />
        </div>

        <div class="hidden sm:flex px-3 py-1 items-center gap-2 border-r border-border/50">
          <span class="size-2 rounded-full bg-primary animate-pulse"></span>
          <span
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0"
          >
            {data.pagination.total} Records
          </span>
        </div>

        <!-- Desktop Payment Filters -->
        <div class="hidden sm:flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0 flex-1">
          <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 shrink-0">Filter By Payment:</span>
          <div class="flex items-center gap-1.5 p-1 bg-muted/30 rounded-lg">
            {#each ["all", "paid", "unpaid"] as status, i}
              <button
                onclick={() => handleFilterChange(status)}
                disabled={filteringStatus !== null}
                class={cn(
                  "px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                  paymentFilter === status
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                  filteringStatus === status && "opacity-80"
                )}
              >
                {#if filteringStatus === status}
                  <Loader2 class="size-3 animate-spin" />
                {/if}
                {status}
              </button>
            {/each}
          </div>
        </div>

        <!-- Desktop Export Button -->
        <div class="hidden sm:flex items-center gap-2 pl-2 border-l border-border/50">
          <Button
            variant="outline"
            size="sm"
            class="h-8 gap-2 rounded-lg font-bold hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
            href={exportUrl}
            target="_blank"
          >
            <Download class="size-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <!-- Mobile Only Filters & Actions -->
      <div class="flex flex-col gap-3 sm:hidden pt-1 w-full">
        <div class="flex items-center justify-between w-full">
          <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Payment Filter:</span>
          <span class="text-[10px] font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">{data.pagination.total} Total</span>
        </div>
        
        <div class="flex items-center gap-1.5 p-1 bg-muted/30 rounded-lg w-full">
          {#each ["all", "paid", "unpaid"] as status, i}
            <button
              onclick={() => handleFilterChange(status)}
              disabled={filteringStatus !== null}
              class={cn(
                "flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                paymentFilter === status
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                filteringStatus === status && "opacity-80"
              )}
            >
              {#if filteringStatus === status}
                <Loader2 class="size-3 animate-spin" />
              {/if}
              {status}
            </button>
          {/each}
        </div>

        <Button
          variant="outline"
          size="sm"
          class="w-full h-10 gap-2 rounded-lg font-bold hover:bg-primary/5 hover:text-primary transition-all active:scale-95 border-dashed"
          href={exportUrl}
          target="_blank"
        >
          <Download class="size-4" />
          Download Membership CSV
        </Button>
      </div>

      {#if selectedIds.size > 0 && isAdmin}
        <div class="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-4 sm:border-l border-border/50 animate-in fade-in slide-in-from-left-4">
          <span class="text-xs font-bold text-primary">{selectedIds.size} Selected</span>
          <Button
            variant="destructive"
            size="sm"
            class="h-8 gap-2 rounded-lg font-bold"
            onclick={() => (isBulkDeleteDialogOpen = true)}
          >
            <Trash2 class="size-3.5" />
            Bulk Delete
          </Button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Main Content -->
  {#if isFreeMember}
    <Card.Root
      class="border-border/60 shadow-lg p-12 text-center space-y-6 bg-card/30 backdrop-blur-sm"
    >
      <div
        class="bg-primary/10 p-4 rounded-full size-20 mx-auto flex items-center justify-center text-primary shadow-inner"
      >
        <ShieldCheck class="size-10" />
      </div>
      <div class="max-w-md mx-auto space-y-2">
        <h2 class="text-2xl font-bold tracking-tight">Access Restricted</h2>
        <p class="text-muted-foreground font-medium">
          The member directory is available exclusively to active paid members.
        </p>
      </div>
      <div class="pt-4">
        <Button
          href="/membership"
          size="lg"
          class="rounded-xl font-bold px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          View Membership Plans <ArrowRight class="ml-2 size-4" />
        </Button>
      </div>
    </Card.Root>
  {:else}
    <Card.Root
      class="border-border/60 shadow-lg overflow-hidden bg-card/30 backdrop-blur-sm"
    >
      <!-- Desktop Table View -->
      <div class="hidden md:block">
        <Table.Root>
          <Table.Header class="bg-muted/50">
            <Table.Row>
              {#if isAdmin}
                <Table.Head class="w-[50px]">
                  <Checkbox
                    checked={selectedIds.size === allMembers.length && allMembers.length > 0
                      ? true
                      : selectedIds.size > 0
                        ? ('indeterminate' as any)
                        : false}
                    onCheckedChange={toggleSelectAll}
                  />
                </Table.Head>
              {/if}
              <Table.Head
                class="w-[180px] font-bold uppercase tracking-widest text-[10px]"
                >Applicant</Table.Head
              >
              <Table.Head
                class="w-[150px] font-bold uppercase tracking-widest text-[10px]"
                >Organization</Table.Head
              >
              <Table.Head
                class="w-[110px] font-bold uppercase tracking-widest text-[10px]"
                >Tier</Table.Head
              >
              <Table.Head
                class="w-[100px] font-bold uppercase tracking-widest text-[10px]"
                >Payment</Table.Head
              >
              <Table.Head
                class="w-[140px] font-bold uppercase tracking-widest text-[10px]"
                >Membership End</Table.Head
              >
              <Table.Head
                class="w-[120px] font-bold uppercase tracking-widest text-[10px]"
                >Remaining</Table.Head
              >
              <Table.Head class="w-[50px] text-right"></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each allMembers as member, i}
              <Table.Row
                class={cn(
                  "group hover:bg-muted/30 transition-colors cursor-pointer border-border/40",
                  selectedIds.has(member.inquiry.id) && "bg-primary/5"
                )}
                onclick={() => openDetails(member)}
              >
                {#if isAdmin}
                  <Table.Cell onclick={(e) => { e.stopPropagation(); }}>
                    <Checkbox
                      checked={selectedIds.has(member.inquiry.id)}
                      onCheckedChange={() => toggleSelectMember(member.inquiry.id)}
                    />
                  </Table.Cell>
                {/if}
                <Table.Cell>
                  <div class="flex items-center gap-3">

                    <div
                      class="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs"
                    >
                      {member.inquiry.fullName.charAt(0)}
                    </div>
                    <div class="flex flex-col">
                      <span
                        class="font-bold text-sm group-hover:text-primary transition-colors"
                        >{member.inquiry.fullName}</span
                      >
                      <span
                        class="text-xs text-muted-foreground font-medium line-clamp-1"
                        >{member.inquiry.email}</span
                      >
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-foreground line-clamp-1"
                      >{member.inquiry.jobTitle}</span
                    >
                    <span
                      class="text-[10px] text-muted-foreground font-medium uppercase tracking-wider line-clamp-1"
                      >{member.inquiry.organization}</span
                    >
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    variant="outline"
                    class={cn(
                      "rounded-lg font-bold text-[10px] uppercase",
                      getTierColor(member.inquiry.tier),
                    )}
                  >
                    {member.inquiry.tier}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {@const payment = getPaymentStatus(member.payment)}
                  <Badge
                    class={cn(
                      "rounded-md font-bold text-[10px] uppercase border",
                      payment.class,
                    )}
                  >
                    {payment.label}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div
                    class="flex items-center gap-2 text-xs text-muted-foreground font-medium"
                  >
                    {#if member.user?.subscriptionEndsAt}
                      <Calendar class="size-3" />
                      {format(
                        new Date(member.user.subscriptionEndsAt),
                        "MMM dd, yyyy",
                      )}
                    {:else}
                      <span class="text-muted-foreground/50 italic text-[10px]"
                        >No subscription</span
                      >
                    {/if}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {#if member.user?.subscriptionEndsAt}
                    {@const days = getDaysRemaining(
                      member.user.subscriptionEndsAt,
                    )}
                    <div class="flex items-center gap-2">
                      <div
                        class={cn(
                          "size-1.5 rounded-full",
                          days && days > 30
                            ? "bg-emerald-500"
                            : days && days > 0
                              ? "bg-amber-500"
                              : "bg-destructive",
                        )}
                      ></div>
                      <span
                        class={cn(
                          "font-bold text-xs",
                          days && days > 30
                            ? "text-emerald-600"
                            : days && days > 0
                              ? "text-amber-600"
                              : "text-destructive",
                        )}
                      >
                        {days && days > 0 ? `${days} days left` : "Expired"}
                      </span>
                    </div>
                  {:else}
                    <span class="text-muted-foreground/50 text-[10px]">-</span>
                  {/if}
                </Table.Cell>
                <Table.Cell class="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ArrowRight class="size-4" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>

      <!-- Mobile Card View -->
      <div class="md:hidden space-y-4 px-2">
        {#each allMembers as member, i}
          {@const payment = getPaymentStatus(member.payment)}
          <Card.Root
            class="border-border/60 hover:border-primary/40 transition-all active:scale-[0.98] overflow-hidden"
            onclick={() => openDetails(member)}
          >
            <Card.Content class="p-4 space-y-4">
              <!-- Top Section: Avatar and Identification -->
              <div class="flex items-start gap-4">
                <div
                  class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0"
                >
                  {member.inquiry.fullName.charAt(0)}
                </div>
                <div class="flex flex-col min-w-0 flex-1 space-y-1">
                  <div class="flex justify-between items-start gap-2">
                    <h3 class="font-bold text-base leading-tight truncate">
                      {member.inquiry.fullName}
                    </h3>
                    <Badge
                      class={cn(
                        "rounded-md font-bold text-[9px] uppercase shrink-0 px-2 py-0.5",
                        payment.class,
                      )}
                    >
                      {payment.label}
                    </Badge>
                  </div>
                  <p class="text-xs text-muted-foreground font-medium truncate">
                    {member.inquiry.email}
                  </p>
                </div>
              </div>

              <!-- Middle Section: Professional Details (Top-Down Format) -->
              <div class="space-y-3 bg-muted/20 p-3 rounded-lg border border-border/10">
                <div class="space-y-0.5">
                  <p class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Organization</p>
                  <p class="text-xs font-bold text-foreground line-clamp-2">
                    {member.inquiry.organization}
                  </p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-0.5">
                    <p class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Job Title</p>
                    <p class="text-xs font-bold truncate">
                      {member.inquiry.jobTitle}
                    </p>
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Tier</p>
                    <Badge
                      variant="outline"
                      class={cn(
                        "rounded-lg font-bold text-[9px] uppercase px-1.5 h-auto",
                        getTierColor(member.inquiry.tier),
                      )}
                    >
                      {member.inquiry.tier}
                    </Badge>
                  </div>
                </div>
              </div>

              <!-- Bottom Section: Status and Action -->
              <div class="flex items-center justify-between pt-1">
                <div
                  class="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider"
                >
                  {#if member.user?.subscriptionEndsAt}
                    <Clock class="size-3.5" />
                    {@const days = getDaysRemaining(
                      member.user.subscriptionEndsAt,
                    )}
                    <span
                      class={cn(
                        "font-black",
                        days && days > 0 ? "text-amber-600" : "text-destructive"
                      )}
                    >
                      {days && days > 0 ? `${days}d left` : "Expired"}
                    </span>
                  {:else}
                    <Calendar class="size-3.5" />
                    <span class="font-black">
                      Applied {format(new Date(member.inquiry.createdAt), "MMM dd, yyyy")}
                    </span>
                  {/if}
                </div>
                <div class="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-widest">
                  View <ArrowRight class="size-3.5" />
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        {/each}
      </div>


      {#if data.pagination.hasMore}
        <div
          bind:this={observerElement}
          class="p-12 flex justify-center border-t border-border/40 bg-muted/20"
        >
          <Button
            variant="outline"
            onclick={handleLoadMore}
            disabled={isLoadingMore}
            class="gap-2 rounded-xl font-bold min-w-[160px] shadow-sm active:scale-95 transition-all"
          >
            {#if isLoadingMore}
              <Loader2 class="size-4 animate-spin" />
              Loading...
            {:else}
              Load More <ArrowRight class="size-4" />
            {/if}
          </Button>
        </div>
      {/if}

      {#if allMembers.length === 0}
        <div class="py-20 text-center space-y-4">
          <div
            class="bg-muted/50 p-4 rounded-full size-16 mx-auto flex items-center justify-center text-muted-foreground/30"
          >
            <Users class="size-8" />
          </div>
          <div class="space-y-1">
            <p class="text-foreground font-bold">No Members Found</p>
            <p class="text-muted-foreground text-sm">
              New membership applications will appear here.
            </p>
          </div>
        </div>
      {/if}
    </Card.Root>
  {/if}
</div>

<!-- Details Dialog (Desktop) -->
<Dialog.Root bind:open={isDialogOpen}>
  <Dialog.Content
    class="sm:max-w-[550px] p-0 overflow-hidden rounded-xl border-border/60 shadow-lg"
  >
    {#if selectedMember}
      <Dialog.Header class="p-6 bg-muted/20 border-b border-border/40">
        <div class="flex items-center justify-between mb-4">
          <Badge
            class={cn(
              "rounded-md font-bold text-[10px] uppercase",
              getPaymentStatus(selectedMember.payment).class,
            )}
          >
            {getPaymentStatus(selectedMember.payment).label}
          </Badge>
          <Badge
            variant="outline"
            class={cn(
              "rounded-md font-bold text-[10px] uppercase",
              getTierColor(selectedMember.inquiry.tier),
            )}
          >
            {selectedMember.inquiry.tier} Membership
          </Badge>
        </div>
        <div class="flex items-center gap-4">
          <div
            class="size-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-md border-2 border-background"
          >
            {selectedMember.inquiry.fullName.charAt(0)}
          </div>
          <div>
            <Dialog.Title class="text-2xl font-bold tracking-tight"
              >{selectedMember.inquiry.fullName}</Dialog.Title
            >
            <Dialog.Description
              class="text-muted-foreground font-medium text-base"
            >
              {selectedMember.inquiry.email}
            </Dialog.Description>
          </div>
        </div>
      </Dialog.Header>

      <div class="p-6 space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-1.5">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
            >
              <Briefcase class="size-3" /> Job Title
            </p>
            <p class="text-sm font-bold text-foreground">
              {selectedMember.inquiry.jobTitle}
            </p>
          </div>
          <div class="space-y-1.5">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
            >
              <Building2 class="size-3" /> Organization
            </p>
            <p class="text-sm font-bold text-foreground">
              {selectedMember.inquiry.organization}
            </p>
          </div>
          <div class="space-y-1.5">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
            >
              <Calendar class="size-3" /> Applied On
            </p>
            <p class="text-sm font-bold text-foreground">
              {format(
                new Date(selectedMember.inquiry.createdAt),
                "MMMM dd, yyyy",
              )}
            </p>
          </div>
          <div class="space-y-1.5">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
            >
              <Clock class="size-3" /> Expiry Status
            </p>
            {#if selectedMember.user?.subscriptionEndsAt}
              {@const days = getDaysRemaining(
                selectedMember.user.subscriptionEndsAt,
              )}
              <p
                class={cn(
                  "text-sm font-bold",
                  days && days > 30
                    ? "text-emerald-600"
                    : days && days > 0
                      ? "text-amber-600"
                      : "text-destructive",
                )}
              >
                {days && days > 0 ? `${days} days remaining` : "Expired"}
              </p>
            {:else}
              <p class="text-sm font-bold text-muted-foreground italic">
                No Active Subscription
              </p>
            {/if}
          </div>
        </div>

        <Separator class="bg-border/40" />

        <div class="space-y-4">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            {isAdmin ? "Application Management" : "Application Details"}
          </p>

          {#if isAdmin && !selectedMember.user?.subscriptionEndsAt}
            <div class="flex flex-wrap gap-2">
              <form
                method="POST"
                action="?/updateStatus"
                use:enhance={() => {
                  processingId = selectedMember.id;
                  activeAction = "processing";
                  return async ({ result }) => {
                    processingId = null;
                    activeAction = null;
                    if (result.type === "success") {
                      toast.success("Inquiry processing...");
                      await invalidateAll();
                      selectedMember = allMembers.find(
                        (m) => m.inquiry.id === selectedMember.inquiry.id,
                      );
                    }
                  };
                }}
              >
                <input
                  type="hidden"
                  name="id"
                  value={selectedMember.inquiry.id}
                />
                <input type="hidden" name="status" value="processing" />
                <Button
                  type="submit"
                  variant="outline"
                  class="gap-2 rounded-lg font-bold"
                  disabled={processingId === selectedMember.id}
                >
                  {#if processingId === selectedMember.id && activeAction === "processing"}
                    <Loader2 class="size-3.5 animate-spin" />
                  {:else}
                    <Clock class="size-3.5" />
                  {/if}
                  Start Processing
                </Button>
              </form>

              <form
                method="POST"
                action="?/updateStatus"
                use:enhance={() => {
                  processingId = selectedMember.id;
                  activeAction = "approving";
                  return async ({ result }) => {
                    processingId = null;
                    activeAction = null;
                    if (result.type === "success") {
                      toast.success("Application Approved!");
                      isDialogOpen = false;
                      await invalidateAll();
                    }
                  };
                }}
              >
                <input
                  type="hidden"
                  name="id"
                  value={selectedMember.inquiry.id}
                />
                <input type="hidden" name="status" value="approved" />
                <Button
                  type="submit"
                  class="gap-2 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={processingId === selectedMember.id}
                >
                  {#if processingId === selectedMember.id && activeAction === "approving"}
                    <Loader2 class="size-3.5 animate-spin" />
                  {:else}
                    <CheckCircle2 class="size-3.5" />
                  {/if}
                  Approve
                </Button>
              </form>

              <form
                method="POST"
                action="?/updateStatus"
                use:enhance={() => {
                  processingId = selectedMember.id;
                  activeAction = "rejecting";
                  return async ({ result }) => {
                    processingId = null;
                    activeAction = null;
                    if (result.type === "success") {
                      toast.success("Application Rejected");
                      isDialogOpen = false;
                      await invalidateAll();
                    }
                  };
                }}
              >
                <input
                  type="hidden"
                  name="id"
                  value={selectedMember.inquiry.id}
                />
                <input type="hidden" name="status" value="rejected" />
                <Button
                  type="submit"
                  variant="outline"
                  class="gap-2 rounded-lg font-bold text-destructive border-destructive/20 hover:bg-destructive/10"
                  disabled={processingId === selectedMember.id}
                >
                  {#if processingId === selectedMember.id && activeAction === "rejecting"}
                    <Loader2 class="size-3.5 animate-spin" />
                  {:else}
                    <XCircle class="size-3.5" />
                  {/if}
                  Reject
                </Button>
              </form>
            </div>
          {:else}
            <div class="bg-muted/30 p-4 rounded-xl border border-border/40">
              <p
                class="text-sm font-medium text-muted-foreground flex items-center gap-2"
              >
                <ShieldCheck class="size-4 text-primary" />
                Application management is restricted to administrators.
              </p>
            </div>
          {/if}
        </div>
      </div>

      <Separator class="bg-border/20" />

      <div class="p-6 bg-muted/20 flex gap-3">
        <Button
          variant="outline"
          href={`mailto:${selectedMember.inquiry.email}`}
          class="flex-1 gap-2 font-bold rounded-lg"
        >
          <Mail class="size-4" />
          Contact Applicant
        </Button>
        {#if isAdmin}
          <form
            method="POST"
            action="?/delete"
            class="shrink-0"
            use:enhance={() => {
              if (!confirm("Are you sure you want to delete this application?"))
                return;
              processingId = selectedMember.id;
              activeAction = "deleting";
              return async ({ result }) => {
                processingId = null;
                activeAction = null;
                if (result.type === "success") {
                  toast.success("Application deleted");
                  isDialogOpen = false;
                  await invalidateAll();
                }
              };
            }}
          >
            <input type="hidden" name="id" value={selectedMember.inquiry.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              class="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              disabled={processingId === selectedMember.id}
            >
              {#if processingId === selectedMember.id && activeAction === "deleting"}
                <Loader2 class="size-4 animate-spin" />
              {:else}
                <Trash2 class="size-5" />
              {/if}
            </Button>
          </form>
        {/if}
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<!-- Details Drawer (Mobile) -->
<Drawer.Root bind:open={isDrawerOpen}>
  <Drawer.Content class="p-0 rounded-t-xl max-h-[90vh]">
    {#if selectedMember}
      <div
        class="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-muted my-4"
      ></div>

      <div class="p-6 space-y-6 overflow-y-auto">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <Badge
              class={cn(
                "rounded-md font-bold text-[10px] uppercase",
                getPaymentStatus(selectedMember.payment).class,
              )}
            >
              {getPaymentStatus(selectedMember.payment).label}
            </Badge>
            <Badge
              variant="outline"
              class={cn(
                "rounded-md font-bold text-[10px] uppercase",
                getTierColor(selectedMember.inquiry.tier),
              )}
            >
              {selectedMember.inquiry.tier}
            </Badge>
          </div>
          <div class="flex items-center gap-4">
            <div
              class="size-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-md border-2 border-background"
            >
              {selectedMember.inquiry.fullName.charAt(0)}
            </div>
            <div>
              <h2 class="text-xl font-bold leading-tight">
                {selectedMember.inquiry.fullName}
              </h2>
              <p class="text-muted-foreground font-medium text-xs">
                {selectedMember.inquiry.email}
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <p
              class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Title
            </p>
            <p class="text-xs font-bold truncate">
              {selectedMember.inquiry.jobTitle}
            </p>
          </div>
          <div class="space-y-1">
            <p
              class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Org
            </p>
            <p class="text-xs font-bold truncate">
              {selectedMember.inquiry.organization}
            </p>
          </div>
        </div>

        <Separator class="bg-border/40" />

        <div class="flex flex-col gap-3 pt-2">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            {isAdmin ? "Update Status" : "Application Details"}
          </p>

          {#if isAdmin && !selectedMember.user?.subscriptionEndsAt}
            <div class="flex flex-col gap-2">
              <form
                method="POST"
                action="?/updateStatus"
                use:enhance={() => {
                  processingId = selectedMember.id;
                  activeAction = "processing";
                  return async ({ result }) => {
                    processingId = null;
                    activeAction = null;
                    if (result.type === "success") {
                      toast.success("Inquiry processing...");
                      await invalidateAll();
                      selectedMember = allMembers.find(
                        (m) => m.inquiry.id === selectedMember.inquiry.id,
                      );
                    }
                  };
                }}
              >
                <input
                  type="hidden"
                  name="id"
                  value={selectedMember.inquiry.id}
                />
                <input type="hidden" name="status" value="processing" />
                <Button
                  type="submit"
                  variant="outline"
                  class="w-full gap-2 font-bold rounded-xl h-10"
                  disabled={processingId === selectedMember.id}
                >
                  {#if processingId === selectedMember.id && activeAction === "processing"}
                    <Loader2 class="size-4 animate-spin" />
                  {:else}
                    <Clock class="size-4" />
                  {/if}
                  Start Processing
                </Button>
              </form>

              <div class="grid grid-cols-2 gap-2">
                <form
                  method="POST"
                  action="?/updateStatus"
                  use:enhance={() => {
                    processingId = selectedMember.id;
                    activeAction = "approving";
                    return async ({ result }) => {
                      processingId = null;
                      activeAction = null;
                      if (result.type === "success") {
                        toast.success("Approved!");
                        isDrawerOpen = false;
                        await invalidateAll();
                      }
                    };
                  }}
                >
                  <input
                    type="hidden"
                    name="id"
                    value={selectedMember.inquiry.id}
                  />
                  <input type="hidden" name="status" value="approved" />
                  <Button
                    type="submit"
                    class="w-full gap-2 font-bold rounded-xl h-10 bg-emerald-600 text-white"
                    disabled={processingId === selectedMember.id}
                  >
                    {#if processingId === selectedMember.id && activeAction === "approving"}
                      <Loader2 class="size-4 animate-spin" />
                    {:else}
                      <CheckCircle2 class="size-4" />
                    {/if}
                    Approve
                  </Button>
                </form>
                <form
                  method="POST"
                  action="?/updateStatus"
                  use:enhance={() => {
                    processingId = selectedMember.id;
                    activeAction = "rejecting";
                    return async ({ result }) => {
                      processingId = null;
                      activeAction = null;
                      if (result.type === "success") {
                        toast.success("Rejected");
                        isDrawerOpen = false;
                        await invalidateAll();
                      }
                    };
                  }}
                >
                  <input
                    type="hidden"
                    name="id"
                    value={selectedMember.inquiry.id}
                  />
                  <input type="hidden" name="status" value="rejected" />
                  <Button
                    type="submit"
                    variant="outline"
                    class="w-full gap-2 font-bold rounded-xl h-10 text-destructive border-destructive/20"
                    disabled={processingId === selectedMember.id}
                  >
                    {#if processingId === selectedMember.id && activeAction === "rejecting"}
                      <Loader2 class="size-4 animate-spin" />
                    {:else}
                      <XCircle class="size-4" />
                    {/if}
                    Reject
                  </Button>
                </form>
              </div>
            </div>
          {:else}
            <div class="bg-muted/30 p-4 rounded-xl border border-border/40">
              <p
                class="text-xs font-medium text-muted-foreground flex items-center gap-2"
              >
                <ShieldCheck class="size-4 text-primary" />
                Access restricted to administrators.
              </p>
            </div>
          {/if}
        </div>

        <div class="flex flex-col gap-3 py-4">
          <Button
            variant="default"
            href={`mailto:${selectedMember.inquiry.email}`}
            class="w-full gap-2 font-bold rounded-xl h-12"
          >
            <Mail class="size-5" />
            Contact Applicant
          </Button>
          <form
            method="POST"
            action="?/delete"
            class="w-full"
            use:enhance={() => {
              if (!confirm("Are you sure?")) return;
              processingId = selectedMember.id;
              activeAction = "deleting";
              return async ({ result }) => {
                processingId = null;
                activeAction = null;
                if (result.type === "success") {
                  toast.success("Application deleted");
                  isDrawerOpen = false;
                  await invalidateAll();
                }
              };
            }}
          >
            <input type="hidden" name="id" value={selectedMember.inquiry.id} />
            <Button
              type="submit"
              variant="ghost"
              class="w-full gap-2 font-bold rounded-xl h-12 text-muted-foreground hover:text-destructive"
              disabled={processingId === selectedMember.id}
            >
              {#if processingId === selectedMember.id && activeAction === "deleting"}
                <Loader2 class="size-5 animate-spin" />
              {:else}
                <Trash2 class="size-5" />
              {/if}
              Delete Application
            </Button>
          </form>
        </div>
      </div>
    {/if}
  </Drawer.Content>
</Drawer.Root>

<!-- Bulk Delete Confirmation -->
<AlertDialog.Root bind:open={isBulkDeleteDialogOpen}>
  <AlertDialog.Content class="rounded-xl border-border/60 shadow-lg">
    <AlertDialog.Header>
      <AlertDialog.Title class="text-xl font-bold tracking-tight flex items-center gap-2 text-destructive">
        <Trash2 class="size-5" />
        Confirm Bulk Deletion
      </AlertDialog.Title>
      <AlertDialog.Description class="text-muted-foreground font-medium">
        Are you sure you want to delete <strong>{selectedIds.size}</strong> selected membership inquiries? This action cannot be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer class="gap-2">
      <AlertDialog.Cancel class="rounded-lg font-bold">Cancel</AlertDialog.Cancel>
      <form
        method="POST"
        action="?/bulkDelete"
        use:enhance={() => {
          isBulkDeleting = true;
          return async ({ result }) => {
            isBulkDeleting = false;
            if (result.type === "success") {
              toast.success(`Successfully deleted ${selectedIds.size} inquiries`);
              selectedIds = new Set();
              isBulkDeleteDialogOpen = false;
              await invalidateAll();
            } else {
              toast.error("Failed to delete inquiries");
            }
          };
        }}
      >
        <input type="hidden" name="ids" value={JSON.stringify(Array.from(selectedIds))} />
        <Button
          type="submit"
          variant="destructive"
          class="rounded-lg font-bold gap-2 min-w-[100px]"
          disabled={isBulkDeleting}
        >
          {#if isBulkDeleting}
            <Loader2 class="size-4 animate-spin" />
          {/if}
          Delete All
        </Button>
      </form>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
