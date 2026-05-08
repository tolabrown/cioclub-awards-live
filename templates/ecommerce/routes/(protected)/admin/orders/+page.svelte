<script lang="ts">
  import type { PageProps } from "./$types";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import {
    Search,
    MoreHorizontal,
    Eye,
    Truck,
    Package,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Loader2,
  } from "@lucide/svelte";
  import { formatPrice } from "$lib/fxns";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";

  let { data }: PageProps = $props();
  let searchQuery = $state("");
  let statusFilter = $state("all");

  let isStatusDialogOpen = $state(false);
  let isUpdating = $state(false);
  let selectedOrder = $state<any>(null);
  let newStatus = $state("");

  const orders = $derived(data.orders || []);

  const filteredOrders = $derived(
    orders.filter((o: any) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.guestEmail || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    }),
  );

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

  function openStatusDialog(order: any) {
    selectedOrder = order;
    newStatus = order.status;
    isStatusDialogOpen = true;
  }
</script>

<div class="space-y-6">
  <div
    class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <h1 class="text-2xl font-bold text-foreground">Orders</h1>
      <p class="text-sm text-muted-foreground">Manage customer orders</p>
    </div>
    <div class="flex gap-2">
      <Button variant="outline">Export</Button>
    </div>
  </div>

  <Card>
    <CardContent class="p-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div class="relative flex-1">
          <Search
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search orders..."
            class="pl-9"
            bind:value={searchQuery}
          />
        </div>
        <div class="flex flex-wrap gap-2">
          {#each ["all", "pending", "processing", "shipped", "delivered"] as status}
            <Button
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onclick={() => (statusFilter = status)}
            >
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          {/each}
        </div>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardContent class="p-0">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Order</Table.Head>
            <Table.Head class="hidden sm:table-cell">Customer</Table.Head>
            <Table.Head>Total</Table.Head>
            <Table.Head class="hidden md:table-cell">Payment</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head class="hidden lg:table-cell">Date</Table.Head>
            <Table.Head class="w-12"></Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each filteredOrders as order}
            {@const StatusIcon = getStatusIcon(order.status)}
            <Table.Row>
              <Table.Cell>
                <p class="font-medium text-foreground">{order.orderNumber}</p>
                <p class="text-xs text-muted-foreground sm:hidden">
                  {order.guestEmail || "Guest"}
                </p>
              </Table.Cell>
              <Table.Cell class="hidden sm:table-cell">
                <p class="text-sm">
                  {order.shippingAddress?.fullName || "N/A"}
                </p>
                <p class="text-xs text-muted-foreground">
                  {order.guestEmail || ""}
                </p>
              </Table.Cell>
              <Table.Cell>
                <p class="font-medium">{formatPrice(order.total)}</p>
                <p class="text-xs text-muted-foreground">
                  {order.items?.length || 0} items
                </p>
              </Table.Cell>
              <Table.Cell class="hidden md:table-cell">
                <Badge
                  variant="secondary"
                  class={order.paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-orange-100 text-orange-800"}
                >
                  {order.paymentStatus}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Badge variant="secondary" class={getStatusColor(order.status)}>
                  <StatusIcon class="mr-1 h-3 w-3" />
                  {order.status}
                </Badge>
              </Table.Cell>
              <Table.Cell class="hidden lg:table-cell">
                <p class="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </Table.Cell>
              <Table.Cell>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    {#snippet child({ props })}
                      <Button {...props} variant="ghost" size="icon">
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    {/snippet}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Item>
                      <a
                        href={`/admin/orders/${order.id}`}
                        class="flex w-full items-center"
                      >
                        <Eye class="mr-2 h-4 w-4" />
                        View Details
                      </a>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onclick={() => openStatusDialog(order)}>
                      <Truck class="mr-2 h-4 w-4" />
                      Update Status
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Table.Cell>
            </Table.Row>
          {:else}
            <Table.Row>
              <Table.Cell
                colspan={7}
                class="py-8 text-center text-muted-foreground"
              >
                <Package class="size-8 mx-auto mb-2 opacity-20" />
                No orders found
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </CardContent>
  </Card>
</div>

<Dialog.Root bind:open={isStatusDialogOpen}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Update Order Status</Dialog.Title>
      <Dialog.Description>
        Change the status for order <strong>{selectedOrder?.orderNumber}</strong
        >
      </Dialog.Description>
    </Dialog.Header>
    <form
      method="POST"
      action={`/admin/orders/${selectedOrder?.id}?/updateStatus`}
      use:enhance={() => {
        isUpdating = true;
        return async ({ result }) => {
          isUpdating = false;
          if (result.type === "success") {
            isStatusDialogOpen = false;
            toast.success("Order status updated successfully");
            await invalidateAll();
          } else {
            toast.error("Failed to update status");
          }
        };
      }}
      class="space-y-4 pt-4"
    >
      <div class="space-y-2">
        <Label for="status">New Status</Label>
        <select
          id="status"
          name="status"
          bind:value={newStatus}
          class="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <Dialog.Footer>
        <Button
          type="button"
          variant="outline"
          onclick={() => (isStatusDialogOpen = false)}>Cancel</Button
        >
        <Button type="submit" disabled={isUpdating}>
          {#if isUpdating}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Updating...
          {:else}
            Update Status
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
