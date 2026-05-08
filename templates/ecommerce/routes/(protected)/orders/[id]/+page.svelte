<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import {
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronLeft,
    CreditCard,
    MapPin,
    Calendar,
    Hash,
    Receipt,
    ShoppingBag,
  } from "@lucide/svelte";
  import { formatPrice } from "$lib/fxns";
  import { cn } from "$lib/utils";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const order = $derived(data.order);
  const items = $derived(order?.items || []);

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
        return "default" as const;
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  const StatusIcon = $derived(getStatusIcon(order.status));

  const isProcessing = $derived(
    ["processing", "shipped", "delivered"].includes(order.status),
  );
  const isShipped = $derived(["shipped", "delivered"].includes(order.status));
  const isDelivered = $derived(order.status === "delivered");
</script>

<div class="flex flex-col gap-8 pb-12">
  <!-- Back Button & Title -->
  <div class="flex flex-col gap-4">
    <Button
      variant="ghost"
      href="/orders"
      class="w-fit -ml-2 rounded-lg text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft class="mr-2 h-4 w-4" />
      Back to Orders
    </Button>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          Order Details
        </h1>
        <div class="flex items-center gap-2 text-muted-foreground font-medium">
          <Hash class="h-4 w-4" />
          <span>{order.orderNumber}</span>
          <span class="text-border">•</span>
          <Calendar class="h-4 w-4" />
          <span>{formatDate(order.createdAt)}</span>
        </div>
      </div>
      <Badge
        variant={getStatusVariant(order.status)}
        class="h-10 px-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-sm"
      >
        <StatusIcon class="mr-2 h-4 w-4" />
        {order.status}
      </Badge>
    </div>
  </div>

  <div class="grid gap-8 lg:grid-cols-3">
    <!-- Main Content: Items & Timeline -->
    <div class="lg:col-span-2 space-y-8">
      <!-- Order Tracking Timeline -->
      <Card.Root
        class="rounded-xl shadow-lg border-border overflow-hidden bg-gradient-to-br from-background to-primary/5"
      >
        <Card.Header class="bg-muted/30 border-b border-border/50">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <Truck class="h-5 w-5 text-primary" />
              <Card.Title class="text-lg font-bold">Package Tracking</Card.Title
              >
            </div>
            {#if order.trackingNumber}
              <Badge
                variant="outline"
                class="rounded-lg bg-primary/10 border-primary/20 text-primary font-bold"
              >
                ID: {order.trackingNumber}
              </Badge>
            {/if}
          </div>
        </Card.Header>
        <Card.Content class="p-6">
          <div
            class="relative space-y-8 before:absolute before:inset-0 before:left-3 sm:before:left-4 before:h-full before:w-0.5 before:bg-border before:content-['']"
          >
            <!-- Order Placed -->
            <div class="relative flex items-start gap-4 sm:gap-6">
              <div
                class="relative z-10 flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20 text-primary-foreground"
              >
                <Clock class="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div class="space-y-1">
                <p class="font-bold text-sm sm:text-base text-foreground">
                  Order Placed
                </p>
                <p class="text-xs sm:text-sm text-muted-foreground font-medium">
                  Successfully received
                </p>
                <p
                  class="text-[10px] sm:text-xs text-primary font-bold uppercase tracking-wider"
                >
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            <div class="relative flex items-start gap-4 sm:gap-6">
              <div
                class={cn(
                  "relative z-10 flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  isProcessing
                    ? "bg-primary shadow-lg shadow-primary/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground border-2 border-border",
                )}
              >
                <Package class="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div class="space-y-1">
                <p
                  class={cn(
                    "font-bold text-sm sm:text-base transition-colors",
                    isProcessing ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  Processing
                </p>
                <p class="text-xs sm:text-sm text-muted-foreground font-medium">
                  Preparing your items
                </p>
                {#if isProcessing && order.updatedAt && order.status !== "pending"}
                  <p
                    class="text-[10px] sm:text-xs text-primary font-bold uppercase tracking-wider"
                  >
                    Confirmed
                  </p>
                {/if}
              </div>
            </div>

            <!-- Shipped -->
            <div class="relative flex items-start gap-4 sm:gap-6">
              <div
                class={cn(
                  "relative z-10 flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  isShipped
                    ? "bg-primary shadow-lg shadow-primary/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground border-2 border-border",
                )}
              >
                <Truck class="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div class="space-y-1">
                <p
                  class={cn(
                    "font-bold text-sm sm:text-base transition-colors",
                    isShipped ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  Shipped
                </p>
                <p class="text-xs sm:text-sm text-muted-foreground font-medium">
                  Package is on the way
                </p>
                {#if order.trackingNumber && isShipped}
                  <div
                    class="mt-2 flex flex-col gap-1 rounded-lg bg-accent/50 p-2 border border-accent"
                  >
                    <span
                      class="text-[10px] font-bold text-muted-foreground uppercase"
                      >Tracking Number</span
                    >
                    <span class="text-xs font-bold text-foreground"
                      >{order.trackingNumber}</span
                    >
                  </div>
                {/if}
                {#if order.shippedAt}
                  <p
                    class="text-[10px] sm:text-xs text-primary font-bold uppercase tracking-wider"
                  >
                    {formatDate(order.shippedAt)}
                  </p>
                {/if}
              </div>
            </div>

            <!-- Delivered -->
            <div class="relative flex items-start gap-4 sm:gap-6">
              <div
                class={cn(
                  "relative z-10 flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  isDelivered
                    ? "bg-primary shadow-lg shadow-primary/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground border-2 border-border",
                )}
              >
                <CheckCircle2 class="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div class="space-y-1">
                <p
                  class={cn(
                    "font-bold text-sm sm:text-base transition-colors",
                    isDelivered ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  Delivered
                </p>
                <p class="text-xs sm:text-sm text-muted-foreground font-medium">
                  Package reached its destination
                </p>
                {#if order.deliveredAt}
                  <p
                    class="text-[10px] sm:text-xs text-primary font-bold uppercase tracking-wider"
                  >
                    {formatDate(order.deliveredAt)}
                  </p>
                {/if}
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Order Items -->
      <Card.Root class="rounded-xl shadow-lg border-border overflow-hidden">
        <Card.Header class="bg-muted/30 border-b border-border/50">
          <div class="flex items-center gap-2">
            <ShoppingBag class="h-5 w-5 text-primary" />
            <Card.Title class="text-lg font-bold">Order Items</Card.Title>
          </div>
        </Card.Header>
        <Card.Content class="p-0">
          <div class="overflow-x-auto">
            <Table.Root>
              <Table.Header>
                <Table.Row class="hover:bg-transparent">
                  <Table.Head class="font-bold pl-6">Product</Table.Head>
                  <Table.Head class="font-bold text-center">Qty</Table.Head>
                  <Table.Head class="font-bold text-right">Price</Table.Head>
                  <Table.Head class="font-bold text-right pr-6"
                    >Total</Table.Head
                  >
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {#each items as item}
                  <Table.Row class="hover:bg-muted/50 transition-colors">
                    <Table.Cell class="pl-6 py-4">
                      <div class="flex flex-col gap-1">
                        <span class="font-bold text-foreground"
                          >{item.productName}</span
                        >
                        <div class="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            class="text-[10px] uppercase font-bold px-1.5 py-0 rounded-md"
                          >
                            {item.productSku}
                          </Badge>
                          {#if item.sizeName}
                            <span
                              class="text-xs text-muted-foreground font-medium"
                            >
                              Size: {item.sizeName}
                            </span>
                          {/if}
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell class="text-center font-medium"
                      >{item.quantity}</Table.Cell
                    >
                    <Table.Cell
                      class="text-right font-medium text-muted-foreground"
                      >{formatPrice(item.unitPrice)}</Table.Cell
                    >
                    <Table.Cell
                      class="text-right font-bold text-foreground pr-6"
                      >{formatPrice(item.totalPrice)}</Table.Cell
                    >
                  </Table.Row>
                {/each}
              </Table.Body>
            </Table.Root>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Delivery info for mobile (visible if needed) or just timeline -->
      <Card.Root
        class="rounded-xl shadow-lg border-border overflow-hidden lg:hidden"
      >
        <Card.Header class="bg-muted/30 border-b border-border/50">
          <div class="flex items-center gap-2">
            <Truck class="h-5 w-5 text-primary" />
            <Card.Title class="text-lg font-bold">Delivery Info</Card.Title>
          </div>
        </Card.Header>
        <Card.Content class="p-6 space-y-4">
          <div class="space-y-1">
            <p class="text-sm font-bold text-foreground">
              {order.shippingAddress.fullName}
            </p>
            <p class="text-sm text-muted-foreground leading-relaxed">
              {order.shippingAddress.addressLine1}
              {#if order.shippingAddress.addressLine2}<br />{order
                  .shippingAddress.addressLine2}{/if}
              <br />{order.shippingAddress.city}, {order.shippingAddress.state}, {order
                .shippingAddress.postalCode}
              <br />{order.shippingAddress.phone}
            </p>
          </div>
        </Card.Content>
      </Card.Root>
    </div>

    <!-- Sidebar: Summary & Shipping -->
    <div class="space-y-8">
      <!-- Summary Card -->
      <Card.Root
        class="rounded-xl shadow-lg border-border bg-gradient-to-br from-background to-muted/20 overflow-hidden"
      >
        <Card.Header class="bg-muted/30 border-b border-border/50">
          <div class="flex items-center gap-2">
            <Receipt class="h-5 w-5 text-primary" />
            <Card.Title class="text-lg font-bold">Order Summary</Card.Title>
          </div>
        </Card.Header>
        <Card.Content class="p-6 space-y-4">
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground font-medium">Subtotal</span>
              <span class="text-foreground font-semibold"
                >{formatPrice(order.subtotal)}</span
              >
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground font-medium">Shipping Fee</span
              >
              <span class="text-foreground font-semibold"
                >{formatPrice(order.shippingCost)}</span
              >
            </div>
            {#if parseFloat(order.tax) > 0}
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground font-medium">Tax</span>
                <span class="text-foreground font-semibold"
                  >{formatPrice(order.tax)}</span
                >
              </div>
            {/if}
            {#if parseFloat(order.discount) > 0}
              <div class="flex justify-between text-sm text-destructive">
                <span class="font-medium">Discount</span>
                <span class="font-bold">-{formatPrice(order.discount)}</span>
              </div>
            {/if}
          </div>
          <div class="pt-4 border-t border-border">
            <div class="flex justify-between items-center text-lg">
              <span class="font-bold text-foreground">Total</span>
              <span class="font-bold text-primary"
                >{formatPrice(order.total)}</span
              >
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Customer & Shipping Card -->
      <Card.Root
        class="rounded-xl shadow-lg border-border bg-card hidden lg:block overflow-hidden"
      >
        <Card.Header class="bg-muted/30 border-b border-border/50">
          <div class="flex items-center gap-2">
            <MapPin class="h-5 w-5 text-primary" />
            <Card.Title class="text-lg font-bold">Shipping Address</Card.Title>
          </div>
        </Card.Header>
        <Card.Content class="p-6 space-y-4">
          <div class="space-y-2">
            <p class="font-bold text-foreground">
              {order.shippingAddress.fullName}
            </p>
            <div
              class="space-y-1 text-sm text-muted-foreground leading-relaxed"
            >
              <p>{order.shippingAddress.addressLine1}</p>
              {#if order.shippingAddress.addressLine2}<p>
                  {order.shippingAddress.addressLine2}
                </p>{/if}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}, {order
                  .shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <div
                class="flex items-center gap-2 pt-2 text-foreground font-medium"
              >
                <span
                  class="font-bold text-muted-foreground uppercase text-[10px]"
                  >Phone:</span
                >
                {order.shippingAddress.phone}
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Payment Method -->
      <Card.Root
        class="rounded-xl shadow-lg border-border bg-card overflow-hidden"
      >
        <Card.Header class="bg-muted/30 border-b border-border/50">
          <div class="flex items-center gap-2">
            <CreditCard class="h-5 w-5 text-primary" />
            <Card.Title class="text-lg font-bold">Payment</Card.Title>
          </div>
        </Card.Header>
        <Card.Content class="p-6 space-y-4">
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground font-medium">Method</span>
              <span class="text-foreground font-bold capitalize"
                >{order.paymentMethod || "Credit/Debit Card"}</span
              >
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground font-medium">Status</span>
              <Badge
                variant={order.paymentStatus === "paid" ? "default" : "outline"}
                class="rounded-md font-bold uppercase text-[10px] px-2"
              >
                {order.paymentStatus}
              </Badge>
            </div>
            {#if order.paymentReference}
              <div class="flex flex-col gap-1 pt-2">
                <span
                  class="text-[10px] text-muted-foreground uppercase font-bold tracking-widest"
                  >Reference</span
                >
                <span class="text-xs font-medium text-foreground break-all"
                  >{order.paymentReference}</span
                >
              </div>
            {/if}
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</div>
