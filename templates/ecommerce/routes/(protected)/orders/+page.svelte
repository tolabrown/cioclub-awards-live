<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import * as Empty from "$lib/components/ui/empty";
  import {
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowRight,
    Search,
    ChevronRight,
    ShoppingBag,
    History,
  } from "@lucide/svelte";
  import { formatPrice } from "$lib/fxns";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const orders = $derived(data.orders || []);
  const meta = $derived(
    data.meta || {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasMore: false,
    },
  );

  function getStatusIcon(status: string) {
    switch (status) {
      case "pending":
        return Clock;
      case "processing":
        return Package;
      case "shipped":
        return Truck;
      case "delivered":
        return CheckCircle2;
      case "cancelled":
      case "refunded":
        return XCircle;
      default:
        return Clock;
    }
  }

  function getStatusVariant(status: string) {
    switch (status) {
      case "pending":
        return "outline" as const;
      case "processing":
        return "secondary" as const;
      case "shipped":
        return "default" as const;
      case "delivered":
        return "default" as const; // We could use a custom success color if available, but default/indigo works
      case "cancelled":
      case "refunded":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  }

  function formatDate(date: Date | string) {
    return new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  }
</script>

<div class="flex flex-col gap-8 pb-10">
  <!-- Hero Section with Gradient -->
  <div
    class="relative rounded-xl shadow-lg bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-border/50 overflow-hidden"
  >
    <div class="absolute inset-0 bg-grid-pattern opacity-5 rounded-xl"></div>
    <div
      class="relative p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
    >
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-primary font-bold">
          <History class="h-5 w-5" />
          <span class="uppercase tracking-wider text-xs">Orders History</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold text-foreground">
          Track Your Orders
        </h1>
        <p class="text-muted-foreground text-lg max-w-xl font-medium">
          Manage your purchases, download invoices, and stay updated on your
          delivery status.
        </p>
      </div>
      <div class="hidden lg:block">
        <div
          class="p-4 bg-background/50 backdrop-blur-md rounded-xl border border-border shadow-sm"
        >
          <div class="flex items-center gap-4">
            <div
              class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
            >
              <ShoppingBag class="h-6 w-6" />
            </div>
            <div>
              <p class="text-sm font-bold text-foreground">
                {meta.total} Total Orders
              </p>
              <p class="text-xs text-muted-foreground font-medium">All time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {#if orders.length === 0}
    <div class="flex flex-col items-center justify-center py-20 px-4">
      <Empty.Root class="max-w-md text-center">
        <Empty.Media>
          <div
            class="h-32 w-32 rounded-full bg-muted/50 flex items-center justify-center mb-6"
          >
            <ShoppingBag class="h-16 w-16 text-muted-foreground/30" />
          </div>
        </Empty.Media>
        <Empty.Title class="text-2xl font-bold">No orders found</Empty.Title>
        <Empty.Description class="text-muted-foreground mb-8">
          It looks like you haven't made any purchases yet. Your future orders
          will appear here.
        </Empty.Description>
        <Button
          href="/products"
          variant="default"
          class="rounded-xl shadow-lg shadow-primary/20"
        >
          Start Shopping
          <ArrowRight class="ml-2 h-4 w-4" />
        </Button>
      </Empty.Root>
    </div>
  {:else}
    <!-- Desktop View (Table) -->
    <div class="hidden md:block">
      <Card.Root
        class="rounded-xl shadow-lg overflow-hidden border-border bg-card"
      >
        <Table.Root>
          <Table.Header class="bg-muted/30">
            <Table.Row>
              <Table.Head class="font-bold">Order Details</Table.Head>
              <Table.Head class="font-bold">Date</Table.Head>
              <Table.Head class="font-bold">Total</Table.Head>
              <Table.Head class="font-bold">Status</Table.Head>
              <Table.Head class="text-right"></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each orders as order}
              {@const Icon = getStatusIcon(order.status)}
              <Table.Row class="hover:bg-muted/50 transition-colors">
                <Table.Cell>
                  <div class="flex flex-col">
                    <span class="font-bold text-foreground"
                      >#{order.orderNumber}</span
                    >
                    <span class="text-xs text-muted-foreground font-medium">
                      {order.items?.length || 0}
                      {order.items?.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell class="font-medium text-muted-foreground">
                  {formatDate(order.createdAt)}
                </Table.Cell>
                <Table.Cell class="font-bold text-foreground">
                  {formatPrice(order.total)}
                </Table.Cell>
                <Table.Cell>
                  <div class="flex items-center gap-2">
                    <Badge
                      variant={getStatusVariant(order.status)}
                      class="rounded-md font-bold uppercase tracking-tighter px-2"
                    >
                      <Icon class="mr-1 h-3 w-3" />
                      {order.status}
                    </Badge>
                  </div>
                </Table.Cell>
                <Table.Cell class="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    href="/orders/{order.id}"
                    class="rounded-lg group"
                  >
                    Details
                    <ChevronRight
                      class="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </Card.Root>
    </div>

    <!-- Mobile View (Cards) -->
    <div class="flex flex-col gap-4 md:hidden">
      {#each orders as order}
        {@const Icon = getStatusIcon(order.status)}
        <Card.Root
          class="rounded-xl shadow-md border-border bg-card overflow-hidden active:scale-[0.98] transition-transform"
        >
          <Card.Header class="pb-3 border-b border-border/50 bg-muted/20">
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-foreground"
                >#{order.orderNumber}</span
              >
              <Badge
                variant={getStatusVariant(order.status)}
                class="rounded-md font-bold uppercase text-[10px] px-1.5 py-0"
              >
                <Icon class="mr-1 h-3 w-3" />
                {order.status}
              </Badge>
            </div>
          </Card.Header>
          <Card.Content class="pt-4 space-y-4">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground font-medium">Order Date</span>
              <span class="text-foreground font-semibold"
                >{formatDate(order.createdAt)}</span
              >
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground font-medium">Total Amount</span
              >
              <span class="text-foreground font-bold"
                >{formatPrice(order.total)}</span
              >
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground font-medium">Items</span>
              <span class="text-foreground font-medium"
                >{order.items?.length || 0} items</span
              >
            </div>

            <Button
              variant="outline"
              href="/orders/{order.id}"
              class="w-full rounded-lg font-bold"
            >
              View Order Details
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>

    {#if meta.totalPages > 1}
      <div class="flex items-center justify-center gap-4 mt-12 mb-8">
        <Button
          variant="outline"
          disabled={meta.page <= 1}
          href="?page={meta.page - 1}"
          class="rounded-xl font-bold shadow-sm transition-all hover:bg-accent"
        >
          Previous
        </Button>
        <div class="flex items-center gap-2">
          <Badge
            variant="outline"
            class="h-10 px-4 rounded-xl flex items-center justify-center border-primary/20 bg-primary/5 text-primary text-sm font-bold"
          >
            {meta.page} / {meta.totalPages}
          </Badge>
        </div>
        <Button
          variant="outline"
          disabled={!meta.hasMore}
          href="?page={meta.page + 1}"
          class="rounded-xl font-bold shadow-sm transition-all hover:bg-accent"
        >
          Next
        </Button>
      </div>
    {/if}
  {/if}
</div>

<style>
  /* Optional: Custom grid pattern if not available in globals */
  .bg-grid-pattern {
    background-image:
      linear-gradient(to right, currentColor 1px, transparent 1px),
      linear-gradient(to bottom, currentColor 1px, transparent 1px);
    background-size: 24px 24px;
  }
</style>
