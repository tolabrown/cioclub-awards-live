<script lang="ts">
  import type { PageProps } from "./$types";
  import { enhance } from "$app/forms";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { formatPrice } from "$lib/fxns";
  import {
    ChevronLeft,
    Truck,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Copy,
    ExternalLink,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Loader2,
    User,
  } from "@lucide/svelte";

  let { data }: PageProps = $props();
  const { order } = $derived(data);
  const items = $derived(order?.items || []);

  let isUpdating = $state(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "processing":
        return Package;
      case "shipped":
        return Truck;
      case "delivered":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
</script>

{#if order}
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" href="/admin/orders">
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-foreground">
              {order.orderNumber}
            </h1>
            <Badge variant="secondary" class={getStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>
          <p class="text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" size="sm">
          <Mail class="mr-2 h-4 w-4" />
          Email Customer
        </Button>
        <Button variant="outline" size="sm">
          <ExternalLink class="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Order Content -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Items -->
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent class="p-0">
            <div class="divide-y divide-border">
              {#each items as item}
                <div class="flex gap-4 p-4">
                  <div
                    class="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted"
                  >
                    <!-- Image placeholder or fetch real if available -->
                    <div
                      class="flex h-full items-center justify-center text-muted-foreground"
                    >
                      <Package class="h-8 w-8" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-foreground">
                      {item.productName}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      SKU: {item.productSku}
                      {#if item.sizeName}
                        • Size: {item.sizeName}{/if}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-foreground">
                      {formatPrice(item.totalPrice)}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {item.quantity} x {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
            <div class="space-y-2 p-4 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Shipping</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <Separator />
              <div class="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Timeline / History -->
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex gap-4">
                <div class="relative mt-1">
                  <div
                    class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary"
                  >
                    <CheckCircle class="h-4 w-4" />
                  </div>
                  <div
                    class="absolute inset-x-0 top-6 mx-auto h-full w-px bg-border"
                  ></div>
                </div>
                <div>
                  <p class="text-sm font-medium">Order Placed</p>
                  <p class="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {#if order.paymentStatus === "paid"}
                <div class="flex gap-4">
                  <div class="relative mt-1">
                    <div
                      class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500"
                    >
                      <CreditCard class="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium">Payment Received</p>
                    <p class="text-xs text-muted-foreground">
                      Reference: {order.paymentReference}
                    </p>
                  </div>
                </div>
              {/if}
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Order Management -->
        <Card class="rounded-xl shadow-lg border-border">
          <CardHeader>
            <CardTitle class="text-lg font-bold">Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              method="POST"
              action="?/updateStatus"
              use:enhance={() => {
                isUpdating = true;
                return async () => {
                  isUpdating = false;
                };
              }}
              class="space-y-4"
            >
              <!-- Status -->
              <div class="space-y-2">
                <Label for="status">Order Status</Label>
                <Select.Root
                  type="single"
                  name="status"
                  bind:value={order.status}
                >
                  <Select.Trigger class="w-full rounded-lg">
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Select.Trigger>
                  <Select.Content class="rounded-xl">
                    <Select.Item value="pending" class="rounded-lg"
                      >Pending</Select.Item
                    >
                    <Select.Item value="processing" class="rounded-lg"
                      >Processing</Select.Item
                    >
                    <Select.Item value="shipped" class="rounded-lg"
                      >Shipped</Select.Item
                    >
                    <Select.Item value="delivered" class="rounded-lg"
                      >Delivered</Select.Item
                    >
                    <Select.Item value="cancelled" class="rounded-lg"
                      >Cancelled</Select.Item
                    >
                  </Select.Content>
                </Select.Root>
              </div>

              <!-- Tracking Number -->
              <div class="space-y-2">
                <Label for="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  name="trackingNumber"
                  placeholder="e.g. TRK12345678"
                  value={order.trackingNumber || ""}
                  class="rounded-lg"
                />
              </div>

              <!-- Shipped At -->
              <div class="space-y-2">
                <Label for="shippedAt">Shipped Date</Label>
                <Input
                  id="shippedAt"
                  name="shippedAt"
                  type="datetime-local"
                  value={order.shippedAt
                    ? new Date(order.shippedAt).toISOString().slice(0, 16)
                    : ""}
                  class="rounded-lg"
                />
              </div>

              <!-- Delivered At -->
              <div class="space-y-2">
                <Label for="deliveredAt">Delivered Date</Label>
                <Input
                  id="deliveredAt"
                  name="deliveredAt"
                  type="datetime-local"
                  value={order.deliveredAt
                    ? new Date(order.deliveredAt).toISOString().slice(0, 16)
                    : ""}
                  class="rounded-lg"
                />
              </div>

              <Button
                type="submit"
                class="w-full rounded-xl font-bold mt-2"
                disabled={isUpdating}
              >
                {#if isUpdating}
                  <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                {:else}
                  Save Management Info
                {/if}
              </Button>
            </form>
          </CardContent>
        </Card>

        <!-- Customer Info -->
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
              >
                <User class="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p class="font-medium text-foreground">
                  {order.shippingAddress?.fullName || "Guest"}
                </p>
                <p class="text-xs text-muted-foreground">
                  {order.guestEmail || order.userId || ""}
                </p>
              </div>
            </div>
            <Separator />
            <div class="space-y-3 text-sm">
              <div class="flex items-start gap-2">
                <Mail class="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>{order.guestEmail || "N/A"}</span>
              </div>
              <div class="flex items-start gap-2">
                <Phone class="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>{order.shippingAddress?.phone || "N/A"}</span>
              </div>
              <div class="flex items-start gap-2">
                <MapPin class="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  {#if order.shippingAddress?.addressLine2}
                    <p>{order.shippingAddress?.addressLine2}</p>
                  {/if}
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress
                      ?.state}
                    {order.shippingAddress?.postalCode}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Payment Info -->
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Status</span>
              <Badge
                variant="secondary"
                class={order.paymentStatus === "paid"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"}
              >
                {order.paymentStatus}
              </Badge>
            </div>
            {#if order.paymentReference}
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Reference</span>
                <div class="flex items-center gap-1 text-xs">
                  <code>{order.paymentReference}</code>
                  <Button variant="ghost" size="icon" class="h-6 w-6">
                    <Copy class="h-3 w-3" />
                  </Button>
                </div>
              </div>
            {/if}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
{/if}
