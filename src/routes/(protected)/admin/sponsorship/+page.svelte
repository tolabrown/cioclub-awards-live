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
    Handshake,
    Building2,
    Mail,
    Phone,
    MessageSquare,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowRight,
    Loader2,
    Search,
    Download,
    Filter as FilterIcon,
    RefreshCw,
    Trash2,
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

  let selectedInquiry = $state<any>(null);
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
      name: "packageInterest",
      label: "Package",
      type: "select",
      value: page.url.searchParams.get("packageInterest") || "All Packages",
      options: [
        { label: "All Packages", value: "All Packages" },
        { label: "Platinum", value: "platinum" },
        { label: "Gold", value: "gold" },
        { label: "Silver", value: "silver" },
        { label: "Bronze", value: "bronze" },
        { label: "Custom", value: "custom" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      value: page.url.searchParams.get("status") || "All Status",
      options: [
        { label: "All Status", value: "All Status" },
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Negotiating", value: "negotiating" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Declined", value: "declined" },
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
  const inquiriesQuery = infiniteScroll.listQuery<any>(
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
    "admin/sponsorship-inquiries",
  );

  const results = $derived($inquiriesQuery.data?.results || []);
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
          $inquiriesQuery.hasNextPage &&
          !$inquiriesQuery.isFetching
        ) {
          $inquiriesQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(observerNode);
    return () => observer.disconnect();
  });

  function openDetails(inq: any) {
    selectedInquiry = inq;
    if (window.innerWidth >= 768) {
      isDialogOpen = true;
    } else {
      isDrawerOpen = true;
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800";
      case "contacted":
        return "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800";
      case "negotiating":
        return "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800";
      case "confirmed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800";
      case "declined":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
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
  <div class="flex flex-col gap-4 pt-4 text-left">
    <div class="space-y-1">
      <h1
        class="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3"
      >
        <div class="bg-primary/10 p-2 rounded-xl text-primary">
          <Handshake class="size-7" />
        </div>
        Sponsorship Inquiries
      </h1>
      <p class="text-muted-foreground font-medium pl-1">
        Manage interest from potential corporate partners and sponsors.
      </p>
    </div>

    <div
      class="flex flex-col md:flex-row flex-wrap md:items-center gap-3 w-full md:w-auto sticky top-0 z-10 bg-background"
    >
      <div class="relative flex-1 md:w-64">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
        />
        <Input
          placeholder="Search company or contact..."
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
                  `sponsorship-inquiries-${format(new Date(), "yyyy-MM-dd")}.csv`,
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
              {$inquiriesQuery.data?.total || 0} Inquiries
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
              >Company</Table.Head
            >
            <Table.Head
              class="w-[160px] font-bold uppercase tracking-widest text-[10px]"
              >Contact</Table.Head
            >
            <Table.Head
              class="w-[140px] font-bold uppercase tracking-widest text-[10px]"
              >Interest</Table.Head
            >
            <Table.Head
              class="w-[140px] font-bold uppercase tracking-widest text-[10px]"
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
          {#each results as inq}
            <Table.Row
              class="group hover:bg-muted/30 transition-colors cursor-pointer border-border/40"
              onclick={() => openDetails(inq)}
            >
              <Table.Cell>
                <div class="flex items-center gap-3 text-left">
                  <div
                    class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs"
                  >
                    <Building2 class="size-4" />
                  </div>
                  <span
                    class="font-bold text-sm group-hover:text-primary transition-colors"
                    >{inq.companyName}</span
                  >
                </div>
              </Table.Cell>
              <Table.Cell class="text-left">
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-foreground"
                    >{inq.contactName}</span
                  >
                  <span class="text-[10px] text-muted-foreground font-medium"
                    >{inq.contactEmail}</span
                  >
                </div>
              </Table.Cell>
              <Table.Cell class="text-left">
                <Badge
                  variant="outline"
                  class="rounded-lg font-bold text-[10px] uppercase bg-primary/5 border-primary/20"
                >
                  {inq.packageInterest}
                </Badge>
              </Table.Cell>
              <Table.Cell class="text-left">
                <div
                  class="flex items-center gap-2 text-xs text-muted-foreground font-medium"
                >
                  <Calendar class="size-3" />
                  {format(new Date(inq.createdAt), "MMM dd, yyyy")}
                </div>
              </Table.Cell>
              <Table.Cell class="text-left">
                <Badge
                  class={cn(
                    "rounded-md font-bold text-[10px] uppercase border",
                    getStatusColor(inq.status),
                  )}
                >
                  {inq.status || "New"}
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
    <div class="md:hidden space-y-4 text-left p-4">
      {#each results as inq}
        <Card.Root
          class="border-border/60 hover:border-primary/40 transition-all active:scale-[0.98]"
          onclick={() => openDetails(inq)}
        >
          <Card.Content class="p-4 space-y-3">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-3">
                <div
                  class="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold"
                >
                  <Building2 class="size-5" />
                </div>
                <div class="space-y-0.5">
                  <h3 class="font-bold text-base">{inq.companyName}</h3>
                  <p class="text-xs text-muted-foreground font-medium">
                    {inq.contactName}
                  </p>
                </div>
              </div>
              <Badge
                class={cn(
                  "rounded-md font-bold text-[10px] uppercase",
                  getStatusColor(inq.status),
                )}
              >
                {inq.status || "New"}
              </Badge>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-border/20">
              <div class="space-y-0.5">
                <p
                  class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Package
                </p>
                <p class="text-xs font-bold text-primary uppercase">
                  {inq.packageInterest}
                </p>
              </div>
              <div class="space-y-0.5">
                <p
                  class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Submitted
                </p>
                <p class="text-xs font-bold text-foreground">
                  {format(new Date(inq.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2">
              <div
                class="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider"
              >
                <Clock class="size-3" />
                Received
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
      {#if $inquiriesQuery.isFetchingNextPage}
        <Loader2 class="size-6 animate-spin text-primary/40" />
      {/if}
    </div>

    {#if results.length === 0 && !$inquiriesQuery.isFetching}
      <div class="py-20 text-center space-y-4">
        <div
          class="bg-muted/50 p-4 rounded-full size-16 mx-auto flex items-center justify-center text-muted-foreground/30"
        >
          <Handshake class="size-8" />
        </div>
        <div class="space-y-1">
          <p class="text-foreground font-bold">No Sponsors Found</p>
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
    class="sm:max-w-[600px] p-0 overflow-hidden rounded-xl border-border/60 shadow-lg text-left max-h-[90vh] overflow-y-auto"
  >
    {#if selectedInquiry}
      <Dialog.Header class="p-6 bg-muted/20 border-b border-border/40">
        <div class="flex items-center justify-between mb-4">
          <Badge
            class={cn(
              "rounded-md font-bold text-[10px] uppercase",
              getStatusColor(selectedInquiry.status),
            )}
          >
            {selectedInquiry.status || "New"}
          </Badge>
          <Badge
            variant="outline"
            class="rounded-md font-bold text-[10px] uppercase bg-primary/5"
          >
            Interest: {selectedInquiry.packageInterest}
          </Badge>
        </div>
        <div class="flex items-center gap-4">
          <div
            class="size-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md border-2 border-background"
          >
            <Building2 class="size-8" />
          </div>
          <div>
            <Dialog.Title class="text-2xl font-bold tracking-tight"
              >{selectedInquiry.companyName}</Dialog.Title
            >
            <Dialog.Description
              class="text-muted-foreground font-medium text-base"
            >
              Interested in the <span class="text-primary font-bold uppercase"
                >{selectedInquiry.packageInterest}</span
              > package
            </Dialog.Description>
          </div>
        </div>
      </Dialog.Header>

      <div class="p-6 space-y-6">
        <!-- Contact Details -->
        <div class="space-y-3">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
          >
            <Mail class="size-3" /> Contact Information
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Contact Name
              </p>
              <p class="text-sm font-bold text-foreground">
                {selectedInquiry.contactName}
              </p>
            </div>
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Email Address
              </p>
              <p class="text-sm font-medium text-foreground">
                {selectedInquiry.contactEmail}
              </p>
            </div>
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Phone Number
              </p>
              <p class="text-sm font-bold text-foreground">
                {selectedInquiry.contactPhone || "Not provided"}
              </p>
            </div>
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Date Received
              </p>
              <p class="text-sm font-bold text-foreground">
                {format(new Date(selectedInquiry.createdAt), "MMMM dd, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <Separator class="bg-border/40" />

        <!-- Message -->
        <div class="space-y-3">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
          >
            <MessageSquare class="size-3" /> Additional Message
          </p>
          <div
            class="bg-muted/30 p-4 rounded-lg border border-border/40 text-left"
          >
            <p
              class="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
            >
              {selectedInquiry.message || "No additional message provided."}
            </p>
          </div>
        </div>

        <Separator class="bg-border/40" />

        <!-- Admin Actions -->
        <div class="space-y-3">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Administrative Actions
          </p>
          <div class="flex flex-wrap gap-2 text-left">
            <form
              method="POST"
              action="?/updateStatus"
              use:enhance={() => {
                processingId = selectedInquiry.id;
                activeAction = "contacted";
                return async ({ result }) => {
                  processingId = null;
                  activeAction = null;
                  if (result.type === "success") {
                    toast.success("Status updated: Contacted");
                    await $inquiriesQuery.refetch();
                    selectedInquiry = results.find(
                      (i) => i.id === selectedInquiry.id,
                    );
                  }
                };
              }}
            >
              <input type="hidden" name="id" value={selectedInquiry.id} />
              <input type="hidden" name="status" value="contacted" />
              <Button
                type="submit"
                variant="outline"
                class="gap-2 rounded-lg font-bold"
                disabled={processingId === selectedInquiry.id}
              >
                {#if processingId === selectedInquiry.id && activeAction === "contacted"}
                  <Loader2 class="size-3.5 animate-spin" />
                {:else}
                  <RefreshCw class="size-3.5" />
                {/if}
                Contacted
              </Button>
            </form>

            <form
              method="POST"
              action="?/updateStatus"
              use:enhance={() => {
                processingId = selectedInquiry.id;
                activeAction = "negotiating";
                return async ({ result }) => {
                  processingId = null;
                  activeAction = null;
                  if (result.type === "success") {
                    toast.success("Status updated: Negotiating");
                    await $inquiriesQuery.refetch();
                    selectedInquiry = results.find(
                      (i) => i.id === selectedInquiry.id,
                    );
                  }
                };
              }}
            >
              <input type="hidden" name="id" value={selectedInquiry.id} />
              <input type="hidden" name="status" value="negotiating" />
              <Button
                type="submit"
                variant="outline"
                class="gap-2 rounded-lg font-bold text-purple-600 border-purple-200 hover:bg-purple-50"
                disabled={processingId === selectedInquiry.id}
              >
                Negotiating
              </Button>
            </form>

            <form
              method="POST"
              action="?/updateStatus"
              use:enhance={() => {
                processingId = selectedInquiry.id;
                activeAction = "confirmed";
                return async ({ result }) => {
                  processingId = null;
                  activeAction = null;
                  if (result.type === "success") {
                    toast.success("Sponsorship Confirmed!");
                    await $inquiriesQuery.refetch();
                    selectedInquiry = results.find(
                      (i) => i.id === selectedInquiry.id,
                    );
                  }
                };
              }}
            >
              <input type="hidden" name="id" value={selectedInquiry.id} />
              <input type="hidden" name="status" value="confirmed" />
              <Button
                type="submit"
                class="gap-2 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={processingId === selectedInquiry.id}
              >
                <CheckCircle2 class="size-3.5" />
                Confirmed
              </Button>
            </form>

            <form
              method="POST"
              action="?/delete"
              use:enhance={() => {
                if (!confirm("Are you sure you want to delete this inquiry?"))
                  return;
                processingId = selectedInquiry.id;
                activeAction = "delete";
                return async ({ result }) => {
                  processingId = null;
                  activeAction = null;
                  if (result.type === "success") {
                    toast.success("Inquiry deleted");
                    isDialogOpen = false;
                    isDrawerOpen = false;
                    await $inquiriesQuery.refetch();
                  }
                };
              }}
            >
              <input type="hidden" name="id" value={selectedInquiry.id} />
              <Button
                type="submit"
                variant="ghost"
                class="gap-2 rounded-lg font-bold text-destructive hover:bg-destructive/10"
                disabled={processingId === selectedInquiry.id}
              >
                <Trash2 class="size-3.5" />
                Delete
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Separator class="bg-border/20" />

      <div class="p-6 bg-muted/20 flex gap-3">
        <Button
          variant="outline"
          href={`mailto:${selectedInquiry.contactEmail}`}
          class="flex-1 gap-2 font-bold rounded-lg text-xs"
        >
          <Mail class="size-4" />
          Email Contact
        </Button>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<!-- Details Drawer (Mobile) -->
<Drawer.Root bind:open={isDrawerOpen}>
  <Drawer.Content class="px-4 pb-10 text-left">
    {#if selectedInquiry}
      <Drawer.Header class="px-0">
        <div class="flex items-center justify-between mb-2">
          <Badge
            class={cn(
              "rounded-md font-bold text-[10px] uppercase",
              getStatusColor(selectedInquiry.status),
            )}
          >
            {selectedInquiry.status || "New"}
          </Badge>
          <Badge
            variant="outline"
            class="rounded-md font-bold text-[10px] uppercase"
          >
            {selectedInquiry.packageInterest}
          </Badge>
        </div>
        <div class="flex items-center gap-3">
          <div
            class="size-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md"
          >
            <Building2 class="size-6" />
          </div>
          <div>
            <Drawer.Title class="text-xl font-bold"
              >{selectedInquiry.companyName}</Drawer.Title
            >
            <Drawer.Description class="font-medium">
              Contact: {selectedInquiry.contactName}
            </Drawer.Description>
          </div>
        </div>
      </Drawer.Header>

      <div class="space-y-6 pt-4">
        <div
          class="bg-muted/30 p-4 rounded-xl border border-border/40 space-y-4"
        >
          <div class="space-y-1">
            <p
              class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Email
            </p>
            <p class="text-sm font-medium">{selectedInquiry.contactEmail}</p>
          </div>
          <div class="space-y-1">
            <p
              class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Phone
            </p>
            <p class="text-sm font-bold">
              {selectedInquiry.contactPhone || "None"}
            </p>
          </div>
          <div class="space-y-1">
            <p
              class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Message
            </p>
            <p class="text-sm leading-relaxed">
              {selectedInquiry.message || "No message."}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            href={`mailto:${selectedInquiry.contactEmail}`}
            class="gap-2 font-bold rounded-xl"
          >
            <Mail class="size-4" />
            Email
          </Button>
          <Button
            variant="outline"
            href={`tel:${selectedInquiry.contactPhone}`}
            class="gap-2 font-bold rounded-xl"
            disabled={!selectedInquiry.contactPhone}
          >
            <Phone class="size-4" />
            Call
          </Button>
        </div>

        <Separator class="bg-border/20" />

        <div class="space-y-3">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Quick Status Update
          </p>
          <div class="flex gap-2">
            <form
              action="?/updateStatus"
              method="POST"
              use:enhance={() => {
                processingId = selectedInquiry.id;
                activeAction = "contacted";
                return async ({ result }) => {
                  processingId = null;
                  activeAction = null;
                  if (result.type === "success") {
                    toast.success("Status updated: Contacted");
                    await $inquiriesQuery.refetch();
                    selectedInquiry = results.find(
                      (i) => i.id === selectedInquiry.id,
                    );
                  }
                };
              }}
              class="flex-1"
            >
              <input type="hidden" name="id" value={selectedInquiry.id} />
              <input type="hidden" name="status" value="contacted" />
              <Button
                type="submit"
                variant="outline"
                class="w-full font-bold h-12 rounded-xl"
                disabled={processingId === selectedInquiry.id}
              >
                {#if processingId === selectedInquiry.id && activeAction === "contacted"}
                  <Loader2 class="size-4 animate-spin" />
                {:else}
                  Contacted
                {/if}
              </Button>
            </form>
            <form
              action="?/updateStatus"
              method="POST"
              use:enhance={() => {
                processingId = selectedInquiry.id;
                activeAction = "confirmed";
                return async ({ result }) => {
                  processingId = null;
                  activeAction = null;
                  if (result.type === "success") {
                    toast.success("Sponsorship Confirmed!");
                    await $inquiriesQuery.refetch();
                    selectedInquiry = results.find(
                      (i) => i.id === selectedInquiry.id,
                    );
                  }
                };
              }}
              class="flex-1"
            >
              <input type="hidden" name="id" value={selectedInquiry.id} />
              <input type="hidden" name="status" value="confirmed" />
              <Button
                type="submit"
                class="w-full font-bold h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                disabled={processingId === selectedInquiry.id}
              >
                {#if processingId === selectedInquiry.id && activeAction === "confirmed"}
                  <Loader2 class="size-4 animate-spin text-white" />
                {:else}
                  Confirm
                {/if}
              </Button>
            </form>
          </div>
        </div>
      </div>
    {/if}
  </Drawer.Content>
</Drawer.Root>
