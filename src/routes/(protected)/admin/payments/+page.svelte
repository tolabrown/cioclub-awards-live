<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import {
    CreditCard,
    Calendar,
    User,
    Clock,
    ArrowRight,
    Loader2,
    ExternalLink,
    ShieldCheck,
    AlertCircle,
    Building2,
    Briefcase,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { cn } from "$lib/utils";
  import { format } from "date-fns";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let selectedPayment = $state<any>(null);
  let isDialogOpen = $state(false);
  let isDrawerOpen = $state(false);
  let isLoadingMore = $state(false);

  let allPayments = $state<any[]>([]);

  $effect(() => {
    if (data.pagination.page === 1) {
      allPayments = [...data.payments];
    } else {
      const newItems = data.payments.filter(
        (newItem: any) => !allPayments.some((item) => item.id === newItem.id),
      );
      allPayments = [...allPayments, ...newItems];
    }
  });

  function openDetails(payment: any) {
    selectedPayment = payment;
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
    const url = new URL(window.location.href);
    url.searchParams.set("page", nextPage.toString());

    const response = await fetch(url.toString());
    if (response.ok) {
      window.history.pushState({}, "", url);
      await invalidateAll();
    }
    isLoadingMore = false;
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800";
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800";
    }
  };

  const formatAmount = (kobo: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(kobo / 100);
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
          <CreditCard class="size-7" />
        </div>
        Membership Payments
      </h1>
      <p class="text-muted-foreground font-medium pl-1">
        Track and verify all membership subscription transactions.
      </p>
    </div>

    <div
      class="flex items-center gap-3 bg-card/50 backdrop-blur-md border border-border/50 p-1.5 rounded-xl shadow-sm"
    >
      <div class="px-3 py-1 flex items-center gap-2">
        <span class="size-2 rounded-full bg-blue-500 animate-pulse"></span>
        <span
          class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          {data.pagination.total} Total Payments
        </span>
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
              >Subscriber</Table.Head
            >
            <Table.Head
              class="w-[150px] font-bold uppercase tracking-widest text-[10px]"
              >Tier</Table.Head
            >
            <Table.Head class="font-bold uppercase tracking-widest text-[10px]"
              >Amount</Table.Head
            >
            <Table.Head
              class="w-[150px] font-bold uppercase tracking-widest text-[10px]"
              >Reference</Table.Head
            >
            <Table.Head
              class="w-[150px] font-bold uppercase tracking-widest text-[10px]"
              >Date</Table.Head
            >
            <Table.Head
              class="w-[120px] font-bold uppercase tracking-widest text-[10px]"
              >Status</Table.Head
            >
            <Table.Head class="w-[80px] text-right"></Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each allPayments as payment}
            <Table.Row
              class="group hover:bg-muted/30 transition-colors cursor-pointer border-border/40"
              onclick={() => openDetails(payment)}
            >
              <Table.Cell>
                <div class="flex flex-col">
                  <span
                    class="font-bold text-sm group-hover:text-primary transition-colors"
                    >{payment.fullName}</span
                  >
                  <span class="text-xs text-muted-foreground font-medium"
                    >{payment.email}</span
                  >
                </div>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  variant="outline"
                  class="rounded-lg font-bold text-[10px] uppercase bg-secondary/50"
                >
                  {payment.tier}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <span class="font-bold text-sm text-foreground">
                  {formatAmount(payment.amount)}
                </span>
              </Table.Cell>
              <Table.Cell>
                <code
                  class="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border/40"
                >
                  {payment.reference}
                </code>
              </Table.Cell>
              <Table.Cell>
                <div
                  class="flex items-center gap-2 text-xs text-muted-foreground font-medium"
                >
                  <Calendar class="size-3" />
                  {format(new Date(payment.createdAt), "MMM dd, yyyy")}
                </div>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  class={cn(
                    "rounded-md font-bold text-[10px] uppercase border",
                    getStatusColor(payment.status),
                  )}
                >
                  {payment.status}
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
      {#each allPayments as payment}
        <Card.Root
          class="border-border/60 hover:border-primary/40 transition-all active:scale-[0.98]"
          onclick={() => openDetails(payment)}
        >
          <Card.Content class="p-4 space-y-3">
            <div class="flex justify-between items-start">
              <div class="space-y-0.5">
                <h3 class="font-bold text-base">{payment.fullName}</h3>
                <p class="text-xs text-muted-foreground font-medium">
                  {payment.email}
                </p>
              </div>
              <Badge
                class={cn(
                  "rounded-md font-bold text-[10px] uppercase",
                  getStatusColor(payment.status),
                )}
              >
                {payment.status}
              </Badge>
            </div>

            <div class="flex items-center justify-between">
              <Badge
                variant="secondary"
                class="rounded-lg text-[9px] font-black uppercase"
              >
                {payment.tier}
              </Badge>
              <span class="font-bold text-sm">
                {formatAmount(payment.amount)}
              </span>
            </div>

            <div
              class="flex items-center justify-between pt-2 border-t border-border/40"
            >
              <div
                class="flex items-center gap-2 text-[11px] text-muted-foreground font-bold uppercase tracking-wider"
              >
                <Clock class="size-3" />
                {format(new Date(payment.createdAt), "MMM dd, h:mm a")}
              </div>
              <code class="text-[9px] font-mono text-muted-foreground">
                {payment.reference}
              </code>
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>

    {#if data.pagination.hasMore}
      <div
        class="p-8 flex justify-center border-t border-border/40 bg-muted/20"
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

    {#if allPayments.length === 0}
      <div class="py-20 text-center space-y-4">
        <div
          class="bg-muted/50 p-4 rounded-full size-16 mx-auto flex items-center justify-center text-muted-foreground/30"
        >
          <CreditCard class="size-8" />
        </div>
        <div class="space-y-1">
          <p class="text-foreground font-bold">No Payments Found</p>
          <p class="text-muted-foreground text-sm">
            Payment records will appear here as they are processed.
          </p>
        </div>
      </div>
    {/if}
  </Card.Root>
</div>

<!-- Details Dialog (Desktop) -->
<Dialog.Root bind:open={isDialogOpen}>
  <Dialog.Content
    class="sm:max-w-[600px] p-0 overflow-hidden rounded-xl border-border/60 shadow-2xl"
  >
    {#if selectedPayment}
      <Dialog.Header class="p-6 bg-muted/40 border-b border-border/40">
        <div class="flex items-center justify-between mb-4">
          <Badge
            class={cn(
              "rounded-md font-bold text-[10px] uppercase",
              getStatusColor(selectedPayment.status),
            )}
          >
            {selectedPayment.status}
          </Badge>
          <div
            class="text-xs text-muted-foreground font-medium flex items-center gap-1.5"
          >
            <Calendar class="size-3.5" />
            {format(
              new Date(selectedPayment.createdAt),
              "MMMM dd, yyyy @ h:mm a",
            )}
          </div>
        </div>
        <Dialog.Title class="text-2xl font-bold tracking-tight"
          >{selectedPayment.fullName}</Dialog.Title
        >
        <Dialog.Description class="text-muted-foreground font-medium text-base">
          {selectedPayment.email}
        </Dialog.Description>
      </Dialog.Header>

      <div class="p-6 space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-1">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Subscription Tier
            </p>
            <div class="flex items-center gap-2 text-sm font-bold">
              <Badge
                variant="outline"
                class="bg-primary/5 text-primary border-primary/20"
              >
                {selectedPayment.tier}
              </Badge>
            </div>
          </div>
          <div class="space-y-1">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Amount Paid
            </p>
            <div class="text-xl font-bold text-foreground">
              {formatAmount(selectedPayment.amount)}
            </div>
          </div>
          <div class="space-y-1">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Transaction ID / Ref
            </p>
            <code class="text-xs font-mono bg-muted p-1 rounded">
              {selectedPayment.reference}
            </code>
          </div>
          {#if selectedPayment.metadata}
            <div class="space-y-1">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Organization
              </p>
              <div class="flex items-center gap-2 text-sm font-bold">
                <Building2 class="size-4 text-muted-foreground" />
                {selectedPayment.metadata.organization || "N/A"}
              </div>
            </div>
            <div class="space-y-1">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Job Title
              </p>
              <div class="flex items-center gap-2 text-sm font-bold">
                <Briefcase class="size-4 text-muted-foreground" />
                {selectedPayment.metadata.jobTitle || "N/A"}
              </div>
            </div>
          {/if}
        </div>

        <Separator class="bg-border/40" />

        <div
          class="rounded-xl border border-border/40 p-4 bg-muted/20 flex items-start gap-4"
        >
          <div
            class={cn(
              "p-2 rounded-lg",
              selectedPayment.status === "success"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-amber-500/10 text-amber-600",
            )}
          >
            {#if selectedPayment.status === "success"}
              <ShieldCheck class="size-5" />
            {:else}
              <AlertCircle class="size-5" />
            {/if}
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-bold leading-none">
              {selectedPayment.status === "success"
                ? "Verified Payment"
                : "Verification Incomplete"}
            </h4>
            <p class="text-xs text-muted-foreground leading-relaxed">
              {selectedPayment.status === "success"
                ? "This transaction has been successfully verified via the Paystack gateway."
                : "The system is awaiting confirmation from the payment provider or the checkout was interrupted."}
            </p>
          </div>
        </div>
      </div>

      <Dialog.Footer class="p-6 bg-muted/20 border-t border-border/40">
        <Button
          variant="outline"
          class="w-full gap-2 font-bold rounded-xl"
          onclick={() => (isDialogOpen = false)}
        >
          Close Record
        </Button>
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<!-- Details Drawer (Mobile) -->
<Drawer.Root bind:open={isDrawerOpen}>
  <Drawer.Content class="p-0 rounded-t-xl">
    {#if selectedPayment}
      <div
        class="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4"
      ></div>

      <div class="p-6 space-y-6 max-h-[85vh] overflow-y-auto pb-12">
        <div class="space-y-1">
          <div class="flex items-center justify-between mb-2">
            <Badge
              class={cn(
                "rounded-md font-bold text-[10px] uppercase",
                getStatusColor(selectedPayment.status),
              )}
            >
              {selectedPayment.status}
            </Badge>
            <Badge
              variant="outline"
              class="rounded-lg text-[9px] font-black uppercase"
            >
              {selectedPayment.tier}
            </Badge>
          </div>
          <h2 class="text-2xl font-bold leading-tight">
            {selectedPayment.fullName}
          </h2>
          <p class="text-muted-foreground font-medium text-sm">
            {selectedPayment.email}
          </p>
        </div>

        <div class="text-3xl font-bold text-foreground">
          {formatAmount(selectedPayment.amount)}
        </div>

        <Separator class="bg-border/40" />

        <div class="grid grid-cols-1 gap-4">
          {#if selectedPayment.metadata}
            <div class="space-y-1">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Organization
              </p>
              <p class="font-bold text-sm">
                {selectedPayment.metadata.organization || "N/A"}
              </p>
            </div>
            <div class="space-y-1">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Job Title
              </p>
              <p class="font-bold text-sm">
                {selectedPayment.metadata.jobTitle || "N/A"}
              </p>
            </div>
          {/if}
          <div class="space-y-1">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Reference
            </p>
            <code class="text-xs font-mono bg-muted p-1 rounded"
              >{selectedPayment.reference}</code
            >
          </div>
          <div class="space-y-1">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Date
            </p>
            <p class="font-bold text-sm">
              {format(new Date(selectedPayment.createdAt), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>

        <div
          class="bg-muted/30 p-4 rounded-xl border border-border/40 flex items-start gap-4"
        >
          <div
            class={cn(
              "p-2 rounded-lg",
              selectedPayment.status === "success"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-amber-500/10 text-amber-600",
            )}
          >
            <CreditCard class="size-5" />
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-bold leading-none">Gateway Status</h4>
            <p class="text-xs text-muted-foreground">
              {selectedPayment.status === "success"
                ? "Payment fully processed."
                : "Pending or incomplete payment."}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          class="w-full font-bold rounded-xl h-12"
          onclick={() => (isDrawerOpen = false)}
        >
          Close
        </Button>
      </div>
    {/if}
  </Drawer.Content>
</Drawer.Root>
