<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    LineChart,
    DollarSign,
    ShoppingCart,
    Users,
    ArrowUpRight,
    ArrowDownRight,
  } from "@lucide/svelte";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { format } from "date-fns";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const { stats, recentOrders } = $derived(data);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <h1 class="text-3xl font-bold tracking-tight">Analytics</h1>
    <p class="text-muted-foreground">
      Overview of your store performance, sales, and customer growth.
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="rounded-xl border bg-card p-6 flex flex-col gap-2">
      <div class="flex items-center justify-between text-muted-foreground">
        <span class="text-sm font-medium">Total Revenue</span>
        <DollarSign class="size-4" />
      </div>
      <div class="flex items-end justify-between">
        <span class="text-2xl font-bold"
          >{formatCurrency(stats.totalRevenue)}</span
        >
        <span class="text-xs text-green-600 flex items-center">
          <ArrowUpRight class="size-3 mr-1" /> +12%
        </span>
      </div>
    </div>
    <div class="rounded-xl border bg-card p-6 flex flex-col gap-2">
      <div class="flex items-center justify-between text-muted-foreground">
        <span class="text-sm font-medium">Total Orders</span>
        <ShoppingCart class="size-4" />
      </div>
      <div class="flex items-end justify-between">
        <span class="text-2xl font-bold">{stats.totalOrders}</span>
        <span class="text-xs text-green-600 flex items-center">
          <ArrowUpRight class="size-3 mr-1" /> +5%
        </span>
      </div>
    </div>
    <div class="rounded-xl border bg-card p-6 flex flex-col gap-2">
      <div class="flex items-center justify-between text-muted-foreground">
        <span class="text-sm font-medium">Total Customers</span>
        <Users class="size-4" />
      </div>
      <div class="flex items-end justify-between">
        <span class="text-2xl font-bold">{stats.totalCustomers}</span>
        <span class="text-xs text-green-600 flex items-center">
          <ArrowUpRight class="size-3 mr-1" /> +2%
        </span>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-4">
    <h2 class="text-xl font-bold tracking-tight">Recent Orders</h2>
    <div class="rounded-md border bg-card overflow-hidden">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Order #</Table.Head>
            <Table.Head>Date</Table.Head>
            <Table.Head>Total</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head class="text-right">Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each recentOrders as order}
            <Table.Row>
              <Table.Cell class="font-medium">#{order.orderNumber}</Table.Cell>
              <Table.Cell
                >{format(new Date(order.createdAt), "MMM dd, yyyy")}</Table.Cell
              >
              <Table.Cell>{formatCurrency(Number(order.total))}</Table.Cell>
              <Table.Cell>
                <Badge variant="outline" class="capitalize"
                  >{order.status}</Badge
                >
              </Table.Cell>
              <Table.Cell class="text-right">
                <Button variant="ghost" size="sm">Details</Button>
              </Table.Cell>
            </Table.Row>
          {/each}
          {#if recentOrders.length === 0}
            <Table.Row>
              <Table.Cell colspan={5} class="h-24 text-center">
                No orders found.
              </Table.Cell>
            </Table.Row>
          {/if}
        </Table.Body>
      </Table.Root>
    </div>
  </div>
</div>
