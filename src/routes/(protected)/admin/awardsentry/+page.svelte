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
  import { Input } from "$lib/components/ui/input";
  import {
    Trophy,
    User,
    Building2,
    Calendar,
    Mail,
    Briefcase,
    MapPin,
    FileText,
    CheckCircle2,
    Clock,
    Search,
    Trash2,
    ArrowRight,
    Loader2,
    XCircle,
    Star,
    Eye,
    Download,
    Filter as FilterIcon,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { cn } from "$lib/utils";
  import { format } from "date-fns";
  import type { PageProps } from "./$types";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import FilterButton, {
    type FilterField,
  } from "$lib/components/ui/filter/FilterButton.svelte";
  import { jsonToCsv, downloadCsv } from "$lib/utils/admin-utils";
  import { Debounced } from "runed";
  import { onMount, untrack } from "svelte";

  let { data }: PageProps = $props();

  let selectedEntry = $state<any>(null);
  let isDialogOpen = $state(false);
  let isDrawerOpen = $state(false);
  let processingId = $state<string | null>(null);
  let activeAction = $state<string | null>(null);
  let isExporting = $state(false);

  // Search and Filter State
  let searchQuery = $state(page.url.searchParams.get("search") || "");
  let debouncedSearch = new Debounced(() => searchQuery, 500);

  let filterFields = $state<FilterField[]>([
    {
      name: "category",
      label: "Category",
      type: "select",
      value: page.url.searchParams.get("category") || "All Categories",
      options: [
        { label: "All Categories", value: "All Categories" },
        { label: "CIO of the Year", value: "cio_of_the_year" },
        { label: "Digital Transformation", value: "digital_transformation" },
        { label: "Innovation", value: "innovation" },
        { label: "Cybersecurity", value: "cybersecurity" },
        { label: "Data & Analytics", value: "data_analytics" },
        { label: "Cloud & Infrastructure", value: "cloud_infrastructure" },
        { label: "Emerging Tech", value: "emerging_tech" },
        { label: "Sustainability", value: "sustainability" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      value: page.url.searchParams.get("status") || "All Status",
      options: [
        { label: "All Status", value: "All Status" },
        { label: "Pending", value: "pending" },
        { label: "Under Review", value: "under_review" },
        { label: "Shortlisted", value: "shortlisted" },
        { label: "Winner", value: "winner" },
        { label: "Rejected", value: "rejected" },
      ],
    },
    {
      name: "industry",
      label: "Industry",
      type: "select",
      value: page.url.searchParams.get("industry") || "All Industries",
      options: [
        { label: "All Industries", value: "All Industries" },
        { label: "Banking & Finance", value: "Banking & Finance" },
        { label: "Telecommunications", value: "Telecommunications" },
        { label: "Public Sector", value: "Public Sector" },
        { label: "Manufacturing", value: "Manufacturing" },
        { label: "Retail & E-commerce", value: "Retail & E-commerce" },
        { label: "Healthcare", value: "Healthcare" },
        { label: "Energy & Utilities", value: "Energy & Utilities" },
        { label: "Education", value: "Education" },
        { label: "Others", value: "Others" },
      ],
    },
    {
      name: "year",
      label: "Year",
      type: "select",
      value:
        page.url.searchParams.get("year") ||
        new Date().getFullYear().toString(),
      options: Array.from({ length: 5 }, (_, i) => {
        const y = (new Date().getFullYear() - i).toString();
        return { label: y, value: y };
      }),
    },
  ]);

  // Infinite Scroll Query
  const entriesQuery = infiniteScroll.listQuery<any>(
    () => {
      const p: Record<string, string> = {
        search: debouncedSearch.current,
      };
      filterFields.forEach((f) => {
        if (f.value && !f.value.startsWith("All ")) {
          p[f.name] = f.value;
        }
      });
      return p;
    },
    "",
    "admin/awardsentry",
  );

  const results = $derived($entriesQuery.data?.results || []);
  let observerNode = $state<HTMLElement | null>(null);

  // Sync URL when filters change
  $effect(() => {
    const s = debouncedSearch.current;
    const url = new URL(page.url);

    if (s) url.searchParams.set("search", s);
    else url.searchParams.delete("search");

    filterFields.forEach((f) => {
      if (f.value && !f.value.startsWith("All "))
        url.searchParams.set(f.name, f.value);
      else url.searchParams.delete(f.name);
    });

    untrack(() => {
      if (url.toString() !== page.url.toString()) {
        goto(url, { keepFocus: true, noScroll: true });
      }
    });
  });

  onMount(() => {
    if (!observerNode) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          $entriesQuery.hasNextPage &&
          !$entriesQuery.isFetching
        ) {
          $entriesQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(observerNode);
    return () => observer.disconnect();
  });

  function openDetails(entry: any) {
    selectedEntry = entry;
    if (window.innerWidth >= 768) {
      isDialogOpen = true;
    } else {
      isDrawerOpen = true;
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800";
      case "under_review":
        return "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800";
      case "shortlisted":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800";
      case "winner":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "under_review":
        return "Under Review";
      default:
        return status || "Pending";
    }
  };

  const getCategoryLabel = (value: string) => {
    const map: Record<string, string> = {
      cio_of_the_year: "CIO of the Year",
      digital_transformation: "Digital Transformation",
      innovation: "Innovation Excellence",
      cybersecurity: "Cybersecurity Leadership",
      data_analytics: "Data & Analytics",
      cloud_infrastructure: "Cloud & Infrastructure",
      emerging_tech: "Emerging Tech Pioneer",
      sustainability: "Tech for Sustainability",
    };
    return map[value] || value;
  };

  const handleApplyFilters = (newFilters: FilterField[]) => {
    filterFields = [...newFilters];
  };

  const handleResetFilters = () => {
    filterFields = filterFields.map((f) => ({
      ...f,
      value:
        f.name === "year"
          ? new Date().getFullYear().toString()
          : f.type === "select"
            ? `All ${f.label}s`
            : "",
    }));
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
          <Trophy class="size-7" />
        </div>
        Award Entries
      </h1>
      <p class="text-muted-foreground font-medium pl-1">
        Review self-submitted award entries for The CIO & C-Suite Awards Africa.
      </p>
    </div>

    <div class="flex flex-col md:flex-row flex-wrap md:items-center gap-3 w-full md:w-auto sticky top-0 z-10 bg-background">
      <div class="relative flex-1 md:w-64 w-full">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
        />
        <Input
          placeholder="Search entries..."
          class="pl-9 bg-card border-border/50 rounded-xl"
          bind:value={searchQuery}
        />
      </div>

      <div class="flex justify-between items-center gap-3">
      <FilterButton
        filters={filterFields}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <form
        method="POST"
        action="?/exportCsv"
        use:enhance={() => {
          isExporting = true;
          return async ({ result }) => {
            isExporting = false;
            // @ts-ignore
            if (result.type === "success" && result.data?.exportData) {
              // @ts-ignore
              const csv = jsonToCsv(result.data.exportData);
              downloadCsv(
                csv,
                `award-entries-${format(new Date(), "yyyy-MM-dd")}.csv`,
              );
              toast.success("CSV Exported successfully");
            } else {
              toast.error("Failed to export CSV");
            }
          };
        }}
      >
        <Button
          type="submit"
          variant="outline"
          class="gap-2 rounded-xl border-border/50 bg-card hover:bg-muted"
          disabled={isExporting}
        >
          {#if isExporting}
            <Loader2 class="size-4 animate-spin text-primary" />
          {:else}
            <Download class="size-4 text-primary" />
          {/if}
          <span class="hidden sm:inline">Export CSV</span>
        </Button>
      </form>

      <div
        class="flex items-center gap-3 bg-card/50 backdrop-blur-md border border-border/50 p-1.5 rounded-xl shadow-sm"
      >
        <div class="px-3 py-1 flex items-center gap-2">
          <span class="size-2 rounded-full bg-primary animate-pulse"></span>
          <span
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            {$entriesQuery.data?.total || 0} Entries
          </span>
        </div>
      </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <Card.Root
    class="border-border/60 shadow-lg overflow-hidden bg-card/30 backdrop-blur-sm"
  >
    <!-- Desktop Table View -->
    <div class="hidden md:block">
      <Table.Root>
        <Table.Header class="bg-muted/50">
          <Table.Row>
            <Table.Head
              class="w-[200px] font-bold uppercase tracking-widest text-[10px]"
              >Project</Table.Head
            >
            <Table.Head
              class="w-[150px] font-bold uppercase tracking-widest text-[10px]"
              >Submitted By</Table.Head
            >
            <Table.Head
              class="w-[150px] font-bold uppercase tracking-widest text-[10px]"
              >Category</Table.Head
            >
            <Table.Head
              class="w-[120px] font-bold uppercase tracking-widest text-[10px]"
              >Country</Table.Head
            >
            <Table.Head
              class="w-[120px] font-bold uppercase tracking-widest text-[10px]"
              >Date</Table.Head
            >
            <Table.Head
              class="w-[110px] font-bold uppercase tracking-widest text-[10px]"
              >Status</Table.Head
            >
            <Table.Head class="w-[60px] text-right"></Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each results as entry}
            <Table.Row
              class="group hover:bg-muted/30 transition-colors cursor-pointer border-border/40"
              onclick={() => openDetails(entry)}
            >
              <Table.Cell>
                <div class="flex items-center gap-3">
                  <div
                    class="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs"
                  >
                    {entry.projectTitle.charAt(0)}
                  </div>
                  <div class="flex flex-col">
                    <span
                      class="font-bold text-sm group-hover:text-primary transition-colors truncate max-w-[160px] cursor-pointer"
                    >
                      {entry.projectTitle}
                    </span>
                    <span class="text-xs text-muted-foreground font-medium"
                      >{entry.organizationName}</span
                    >
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-foreground"
                    >{entry.userName || "Unknown"}</span
                  >
                  <span class="text-[10px] text-muted-foreground font-medium"
                    >{entry.userEmail || "—"}</span
                  >
                </div>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  variant="outline"
                  class="rounded-lg font-bold text-[10px] uppercase"
                >
                  {getCategoryLabel(entry.category)}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <div
                  class="flex items-center gap-2 text-xs text-muted-foreground font-medium"
                >
                  <MapPin class="size-3" />
                  {entry.country}
                </div>
              </Table.Cell>
              <Table.Cell>
                <div
                  class="flex items-center gap-2 text-xs text-muted-foreground font-medium"
                >
                  <Calendar class="size-3" />
                  {format(new Date(entry.submittedAt), "MMM dd, yyyy")}
                </div>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  class={cn(
                    "rounded-md font-bold text-[10px] uppercase border",
                    getStatusColor(entry.status),
                  )}
                >
                  {getStatusLabel(entry.status)}
                </Badge>
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
    <div class="md:hidden space-y-4">
      {#each results as entry}
        <Card.Root
          class="border-border/60 hover:border-primary/40 transition-all active:scale-[0.98]"
          onclick={() => openDetails(entry)}
        >
          <Card.Content class="p-4 space-y-3">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-3">
                <div
                  class="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm"
                >
                  {entry.projectTitle.charAt(0)}
                </div>
                <div class="space-y-0.5">
                  <h3 class="font-bold text-base">{entry.projectTitle}</h3>
                  <p class="text-xs text-muted-foreground font-medium">
                    {entry.organizationName}
                  </p>
                </div>
              </div>
              <Badge
                class={cn(
                  "rounded-md font-bold text-[10px] uppercase",
                  getStatusColor(entry.status),
                )}
              >
                {getStatusLabel(entry.status)}
              </Badge>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-border/20">
              <div class="space-y-0.5">
                <p
                  class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Category
                </p>
                <p class="text-xs font-bold text-primary">
                  {getCategoryLabel(entry.category)}
                </p>
              </div>
              <div class="space-y-0.5">
                <p
                  class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Submitted By
                </p>
                <p class="text-xs font-bold truncate">
                  {entry.userName || "Unknown"}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2">
              <div
                class="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider"
              >
                <Clock class="size-3" />
                {format(new Date(entry.submittedAt), "MMM dd, yyyy")}
              </div>
              <div class="text-primary">
                <ArrowRight class="size-4" />
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>

    <div
      bind:this={observerNode}
      class="h-10 flex items-center justify-center p-4"
    >
      {#if $entriesQuery.isFetchingNextPage}
        <Loader2 class="size-6 animate-spin text-primary/40" />
      {/if}
    </div>

    {#if results.length === 0 && !$entriesQuery.isFetching}
      <div class="py-20 text-center space-y-4">
        <div
          class="bg-muted/50 p-4 rounded-full size-16 mx-auto flex items-center justify-center text-muted-foreground/30"
        >
          <Trophy class="size-8" />
        </div>
        <div class="space-y-1">
          <p class="text-foreground font-bold">No Entries Found</p>
          <p class="text-muted-foreground text-sm">
            Try adjusting your search or filters.
          </p>
        </div>
      </div>
    {/if}
  </Card.Root>
</div>

<!-- Details Dialog (Desktop) -->
<Dialog.Root bind:open={isDialogOpen}>
  <Dialog.Content
    class="sm:max-w-[650px] p-0 overflow-hidden rounded-xl border-border/60 shadow-lg max-h-[90vh] overflow-y-auto"
  >
    {#if selectedEntry}
      <Dialog.Header class="p-6 bg-muted/20 border-b border-border/40">
        <div class="flex items-center justify-between mb-4">
          <Badge
            class={cn(
              "rounded-md font-bold text-[10px] uppercase",
              getStatusColor(selectedEntry.status),
            )}
          >
            {getStatusLabel(selectedEntry.status)}
          </Badge>
          <Badge
            variant="outline"
            class="rounded-md font-bold text-[10px] uppercase"
          >
            {getCategoryLabel(selectedEntry.category)}
          </Badge>
        </div>
        <div class="flex items-center gap-4">
          <div
            class="size-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-md border-2 border-background"
          >
            {selectedEntry.projectTitle.charAt(0)}
          </div>
          <div>
            <Dialog.Title class="text-2xl font-bold tracking-tight"
              >{selectedEntry.projectTitle}</Dialog.Title
            >
            <Dialog.Description
              class="text-muted-foreground font-medium text-base"
            >
              {selectedEntry.organizationName} · {selectedEntry.industry}
            </Dialog.Description>
          </div>
        </div>
      </Dialog.Header>

      <div class="p-6 space-y-6">
        <!-- Submitter Info -->
        <div class="space-y-3">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
          >
            <User class="size-3" /> Submitted By
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Name
              </p>
              <p class="text-sm font-bold text-foreground">
                {selectedEntry.userName || "Unknown User"}
              </p>
            </div>
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
              >
                <Mail class="size-3" /> Email
              </p>
              <p class="text-sm font-medium text-foreground">
                {selectedEntry.userEmail || "—"}
              </p>
            </div>
          </div>
        </div>

        <Separator class="bg-border/40" />

        <!-- Project Details -->
        <div class="space-y-3">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
          >
            <FileText class="size-3" /> Project Details
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
              >
                <Building2 class="size-3" /> Organization
              </p>
              <p class="text-sm font-bold text-foreground">
                {selectedEntry.organizationName}
              </p>
            </div>
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
              >
                <Briefcase class="size-3" /> Industry
              </p>
              <p class="text-sm font-bold text-foreground">
                {selectedEntry.industry}
              </p>
            </div>
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
              >
                <MapPin class="size-3" /> Country
              </p>
              <p class="text-sm font-bold text-foreground">
                {selectedEntry.country}
              </p>
            </div>
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
              >
                <Calendar class="size-3" /> Submitted
              </p>
              <p class="text-sm font-bold text-foreground">
                {format(new Date(selectedEntry.submittedAt), "MMMM dd, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <Separator class="bg-border/40" />

        <!-- Project Description -->
        <div class="space-y-3">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
          >
            <Eye class="size-3" /> Project Description
          </p>
          <div
            class="bg-muted/30 p-4 rounded-lg border border-border/40 text-left"
          >
            <p
              class="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
            >
              {selectedEntry.projectDescription}
            </p>
          </div>
        </div>

        <!-- Impact Statement -->
        <div class="space-y-3 text-left">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
          >
            <Star class="size-3" /> Impact Statement
          </p>
          <div class="bg-muted/30 p-4 rounded-lg border border-border/40">
            <p
              class="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
            >
              {selectedEntry.impactStatement}
            </p>
          </div>
        </div>

        <Separator class="bg-border/40" />

        <!-- Admin Actions -->
        <div class="space-y-3 text-left">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Update Status
          </p>
          <div class="flex flex-wrap gap-2">
            <form
              method="POST"
              action="?/updateStatus"
              use:enhance={() => {
                processingId = selectedEntry.id;
                activeAction = "under_review";
                return async ({ result }) => {
                  processingId = null;
                  activeAction = null;
                  if (result.type === "success") {
                    toast.success("Marked as Under Review");
                    await invalidateAll();
                    selectedEntry = results.find(
                      (e) => e.id === selectedEntry.id,
                    );
                  }
                };
              }}
            >
              <input type="hidden" name="id" value={selectedEntry.id} />
              <input type="hidden" name="status" value="under_review" />
              <Button
                type="submit"
                variant="outline"
                class="gap-2 rounded-lg font-bold"
                disabled={processingId === selectedEntry.id}
              >
                {#if processingId === selectedEntry.id && activeAction === "under_review"}
                  <Loader2 class="size-3.5 animate-spin" />
                {:else}
                  <Search class="size-3.5" />
                {/if}
                Under Review
              </Button>
            </form>

            <form
              method="POST"
              action="?/updateStatus"
              use:enhance={() => {
                processingId = selectedEntry.id;
                activeAction = "shortlisted";
                return async ({ result }) => {
                  processingId = null;
                  activeAction = null;
                  if (result.type === "success") {
                    toast.success("Entry shortlisted!");
                    await invalidateAll();
                    selectedEntry = results.find(
                      (e) => e.id === selectedEntry.id,
                    );
                  }
                };
              }}
            >
              <input type="hidden" name="id" value={selectedEntry.id} />
              <input type="hidden" name="status" value="shortlisted" />
              <Button
                type="submit"
                class="gap-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={processingId === selectedEntry.id}
              >
                {#if processingId === selectedEntry.id && activeAction === "shortlisted"}
                  <Loader2 class="size-3.5 animate-spin" />
                {:else}
                  <Star class="size-3.5" />
                {/if}
                Shortlist
              </Button>
            </form>

            <form
              method="POST"
              action="?/updateStatus"
              use:enhance={() => {
                processingId = selectedEntry.id;
                activeAction = "winner";
                return async ({ result }) => {
                  processingId = null;
                  activeAction = null;
                  if (result.type === "success") {
                    toast.success("🎉 Entry marked as Winner!");
                    isDialogOpen = false;
                    await invalidateAll();
                  }
                };
              }}
            >
              <input type="hidden" name="id" value={selectedEntry.id} />
              <input type="hidden" name="status" value="winner" />
              <Button
                type="submit"
                class="gap-2 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={processingId === selectedEntry.id}
              >
                {#if processingId === selectedEntry.id && activeAction === "winner"}
                  <Loader2 class="size-3.5 animate-spin" />
                {:else}
                  <CheckCircle2 class="size-3.5" />
                {/if}
                Winner
              </Button>
            </form>

            <form
              method="POST"
              action="?/updateStatus"
              use:enhance={() => {
                processingId = selectedEntry.id;
                activeAction = "rejected";
                return async ({ result }) => {
                  processingId = null;
                  activeAction = null;
                  if (result.type === "success") {
                    toast.success("Entry rejected");
                    isDialogOpen = false;
                    await invalidateAll();
                  }
                };
              }}
            >
              <input type="hidden" name="id" value={selectedEntry.id} />
              <input type="hidden" name="status" value="rejected" />
              <Button
                type="submit"
                variant="outline"
                class="gap-2 rounded-lg font-bold text-destructive border-destructive/20 hover:bg-destructive/10"
                disabled={processingId === selectedEntry.id}
              >
                {#if processingId === selectedEntry.id && activeAction === "rejected"}
                  <Loader2 class="size-3.5 animate-spin" />
                {:else}
                  <XCircle class="size-3.5" />
                {/if}
                Reject
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Separator class="bg-border/20" />

      <div class="p-6 bg-muted/20 flex gap-3">
        {#if selectedEntry.userEmail}
          <Button
            variant="outline"
            href={`mailto:${selectedEntry.userEmail}`}
            class="flex-1 gap-2 font-bold rounded-lg"
          >
            <Mail class="size-4" />
            Contact Entrant
          </Button>
        {/if}
        <form
          method="POST"
          action="?/delete"
          class="shrink-0"
          use:enhance={() => {
            if (!confirm("Are you sure you want to delete this entry?")) return;
            processingId = selectedEntry.id;
            activeAction = "deleting";
            return async ({ result }) => {
              processingId = null;
              activeAction = null;
              if (result.type === "success") {
                toast.success("Entry deleted");
                isDialogOpen = false;
                await invalidateAll();
              }
            };
          }}
        >
          <input type="hidden" name="id" value={selectedEntry.id} />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            class="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            disabled={processingId === selectedEntry.id}
          >
            {#if processingId === selectedEntry.id && activeAction === "deleting"}
              <Loader2 class="size-4 animate-spin" />
            {:else}
              <Trash2 class="size-5" />
            {/if}
          </Button>
        </form>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<!-- Details Drawer (Mobile) -->
<Drawer.Root bind:open={isDrawerOpen}>
  <Drawer.Content class="p-0 rounded-t-xl max-h-[90vh]">
    {#if selectedEntry}
      <div
        class="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4"
      ></div>

      <div class="p-6 space-y-6 overflow-y-auto">
        <!-- Header -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <Badge
              class={cn(
                "rounded-md font-bold text-[10px] uppercase",
                getStatusColor(selectedEntry.status),
              )}
            >
              {getStatusLabel(selectedEntry.status)}
            </Badge>
            <Badge
              variant="outline"
              class="rounded-md font-bold text-[10px] uppercase"
            >
              {getCategoryLabel(selectedEntry.category)}
            </Badge>
          </div>
          <div class="flex items-center gap-4">
            <div
              class="size-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-md border-2 border-background"
            >
              {selectedEntry.projectTitle.charAt(0)}
            </div>
            <div class="text-left">
              <Drawer.Header class="p-0">
                <Drawer.Title class="text-xl font-bold leading-tight"
                  >{selectedEntry.projectTitle}</Drawer.Title
                >
              </Drawer.Header>
              <p class="text-muted-foreground font-medium text-xs">
                {selectedEntry.organizationName} · {selectedEntry.industry}
              </p>
            </div>
          </div>
        </div>

        <!-- Submitter Info -->
        <div class="space-y-3 text-left">
          <p
            class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Submitted By
          </p>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-0.5">
              <p
                class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Name
              </p>
              <p class="text-xs font-bold truncate">
                {selectedEntry.userName || "Unknown"}
              </p>
            </div>
            <div class="space-y-0.5">
              <p
                class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Email
              </p>
              <p class="text-xs font-medium truncate">
                {selectedEntry.userEmail || "—"}
              </p>
            </div>
          </div>
        </div>

        <Separator class="bg-border/40" />

        <!-- Project Info -->
        <div class="space-y-3 text-left">
          <p
            class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Project Details
          </p>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-0.5">
              <p
                class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Country
              </p>
              <p class="text-xs font-bold">{selectedEntry.country}</p>
            </div>
            <div class="space-y-0.5">
              <p
                class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Industry
              </p>
              <p class="text-xs font-bold truncate">{selectedEntry.industry}</p>
            </div>
          </div>
        </div>

        <Separator class="bg-border/40" />

        <!-- Description -->
        <div class="space-y-3 text-left">
          <p
            class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Project Description
          </p>
          <div class="bg-muted/30 p-4 rounded-lg border border-border/40">
            <p
              class="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
            >
              {selectedEntry.projectDescription}
            </p>
          </div>
        </div>

        <!-- Impact -->
        <div class="space-y-3 text-left">
          <p
            class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Impact Statement
          </p>
          <div class="bg-muted/30 p-4 rounded-lg border border-border/40">
            <p
              class="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
            >
              {selectedEntry.impactStatement}
            </p>
          </div>
        </div>

        <Separator class="bg-border/40" />

        <!-- Mobile Actions -->
        <div class="flex flex-col gap-2 text-left pb-10">
          <p
            class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Update Status
          </p>

          <form
            method="POST"
            action="?/updateStatus"
            use:enhance={() => {
              processingId = selectedEntry.id;
              activeAction = "under_review";
              return async ({ result }) => {
                processingId = null;
                activeAction = null;
                if (result.type === "success") {
                  toast.success("Under Review");
                  await invalidateAll();
                  selectedEntry = results.find(
                    (e) => e.id === selectedEntry.id,
                  );
                }
              };
            }}
          >
            <input type="hidden" name="id" value={selectedEntry.id} />
            <input type="hidden" name="status" value="under_review" />
            <Button
              type="submit"
              variant="outline"
              class="w-full gap-2 font-bold rounded-lg"
              disabled={processingId === selectedEntry.id}
            >
              {#if processingId === selectedEntry.id && activeAction === "under_review"}
                <Loader2 class="size-4 animate-spin" />
              {:else}
                <Search class="size-4" />
              {/if}
              Mark as Under Review
            </Button>
          </form>

          <div class="grid grid-cols-3 gap-2">
            <form
              method="POST"
              action="?/updateStatus"
              use:enhance={() => {
                processingId = selectedEntry.id;
                activeAction = "shortlisted";
                return async ({ result }) => {
                  processingId = null;
                  activeAction = null;
                  if (result.type === "success") {
                    toast.success("Shortlisted!");
                    await invalidateAll();
                    selectedEntry = results.find(
                      (e) => e.id === selectedEntry.id,
                    );
                  }
                };
              }}
            >
              <input type="hidden" name="id" value={selectedEntry.id} />
              <input type="hidden" name="status" value="shortlisted" />
              <Button
                type="submit"
                class="w-full gap-1 font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                disabled={processingId === selectedEntry.id}
              >
                {#if processingId === selectedEntry.id && activeAction === "shortlisted"}
                  <Loader2 class="size-3.5 animate-spin" />
                {:else}
                  <Star class="size-3.5" />
                {/if}
                Shortlist
              </Button>
            </form>

            <form
              method="POST"
              action="?/updateStatus"
              use:enhance={() => {
                processingId = selectedEntry.id;
                activeAction = "winner";
                return async ({ result }) => {
                  processingId = null;
                  activeAction = null;
                  if (result.type === "success") {
                    toast.success("🎉 Winner!");
                    isDrawerOpen = false;
                    await invalidateAll();
                  }
                };
              }}
            >
              <input type="hidden" name="id" value={selectedEntry.id} />
              <input type="hidden" name="status" value="winner" />
              <Button
                type="submit"
                class="w-full gap-1 font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                disabled={processingId === selectedEntry.id}
              >
                {#if processingId === selectedEntry.id && activeAction === "winner"}
                  <Loader2 class="size-3.5 animate-spin" />
                {:else}
                  <CheckCircle2 class="size-3.5" />
                {/if}
                Winner
              </Button>
            </form>

            <form
              method="POST"
              action="?/updateStatus"
              use:enhance={() => {
                processingId = selectedEntry.id;
                activeAction = "rejected";
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
              <input type="hidden" name="id" value={selectedEntry.id} />
              <input type="hidden" name="status" value="rejected" />
              <Button
                type="submit"
                variant="outline"
                class="w-full gap-1 font-bold rounded-lg text-destructive border-destructive/20 hover:bg-destructive/10 text-xs"
                disabled={processingId === selectedEntry.id}
              >
                {#if processingId === selectedEntry.id && activeAction === "rejected"}
                  <Loader2 class="size-3.5 animate-spin" />
                {:else}
                  <XCircle class="size-3.5" />
                {/if}
                Reject
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div class="p-6 border-t border-border/40 bg-muted/20 flex gap-3">
        {#if selectedEntry.userEmail}
          <Button
            variant="outline"
            href={`mailto:${selectedEntry.userEmail}`}
            class="flex-1 gap-2 font-bold rounded-lg text-xs"
          >
            <Mail class="size-4" />
            Contact Entrant
          </Button>
        {/if}
        <form
          method="POST"
          action="?/delete"
          class="shrink-0"
          use:enhance={() => {
            if (!confirm("Delete this entry?")) return;
            processingId = selectedEntry.id;
            activeAction = "deleting";
            return async ({ result }) => {
              processingId = null;
              activeAction = null;
              if (result.type === "success") {
                toast.success("Deleted");
                isDrawerOpen = false;
                await invalidateAll();
              }
            };
          }}
        >
          <input type="hidden" name="id" value={selectedEntry.id} />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            class="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            disabled={processingId === selectedEntry.id}
          >
            {#if processingId === selectedEntry.id && activeAction === "deleting"}
              <Loader2 class="size-4 animate-spin" />
            {:else}
              <Trash2 class="size-5" />
            {/if}
          </Button>
        </form>
      </div>
    {/if}
  </Drawer.Content>
</Drawer.Root>
