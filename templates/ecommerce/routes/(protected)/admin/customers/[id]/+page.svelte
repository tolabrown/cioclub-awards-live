<script lang="ts">
  import type { PageProps } from "./$types";
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import * as Table from "$lib/components/ui/table";
  import {
    ChevronLeft,
    User,
    Mail,
    Calendar,
    Shield,
    Ban,
    ShieldAlert,
    Clock,
    CheckCircle,
    XCircle,
    Package,
    Loader2,
  } from "@lucide/svelte";
  import { format } from "date-fns";
  import { formatPrice } from "$lib/fxns";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";

  let { data }: PageProps = $props();
  const { customer, orders } = $derived(data);

  let isTogglingBan = $state(false);
  let isUpdatingRole = $state(false);
</script>

<div class="space-y-6">
  <div class="flex items-center gap-4">
    <Button variant="ghost" size="icon" href="/admin/customers">
      <ChevronLeft class="h-4 w-4" />
    </Button>
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Customer Details</h1>
      <p class="text-muted-foreground">{customer.name}</p>
    </div>
  </div>

  <div class="grid gap-6 md:grid-cols-3">
    <!-- User Profile Card -->
    <Card class="md:col-span-1 border-none shadow-lg">
      <CardHeader class="flex flex-row items-center gap-4 pb-2">
        <div
          class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary"
        >
          <User class="h-8 w-8" />
        </div>
        <div>
          <CardTitle class="text-xl">{customer.name}</CardTitle>
          <Badge
            variant={customer.role === "admin" ? "default" : "secondary"}
            class="mt-1 capitalize"
          >
            {customer.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent class="space-y-4 pt-4">
        <div class="space-y-3 text-sm">
          <div class="flex items-center gap-2 text-muted-foreground">
            <Mail class="h-4 w-4" />
            <span>{customer.email}</span>
          </div>
          <div class="flex items-center gap-2 text-muted-foreground">
            <Calendar class="h-4 w-4" />
            <span
              >Joined {format(
                new Date(customer.createdAt),
                "MMMM dd, yyyy",
              )}</span
            >
          </div>
          <div class="flex items-center gap-2 text-muted-foreground">
            <Shield class="h-4 w-4" />
            <span
              >Status:
              {#if customer.banned}
                <Badge variant="destructive" class="ml-1">Banned</Badge>
              {:else if customer.emailVerified}
                <Badge
                  variant="outline"
                  class="ml-1 text-green-600 border-green-600">Verified</Badge
                >
              {:else}
                <Badge variant="outline" class="ml-1">Unverified</Badge>
              {/if}
            </span>
          </div>
        </div>

        <Separator />

        <div class="space-y-3">
          <h3 class="font-semibold text-sm">Actions</h3>
          <div class="flex flex-col gap-2">
            <form
              method="POST"
              action="?/toggleBan"
              use:enhance={() => {
                isTogglingBan = true;
                return async ({ result }) => {
                  isTogglingBan = false;
                  if (result.type === "success") {
                    toast.success(
                      customer.banned ? "User unbanned" : "User banned",
                    );
                  } else {
                    toast.error("Failed to update status");
                  }
                };
              }}
            >
              <Button
                variant={customer.banned ? "outline" : "destructive"}
                class="w-full justify-start"
                disabled={isTogglingBan}
              >
                {#if isTogglingBan}
                  <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                {:else}
                  <Ban class="mr-2 h-4 w-4" />
                {/if}
                {customer.banned ? "Unban Customer" : "Ban Customer"}
              </Button>
            </form>

            <form
              method="POST"
              action="?/updateRole"
              use:enhance={() => {
                isUpdatingRole = true;
                return async ({ result }) => {
                  isUpdatingRole = false;
                  if (result.type === "success") {
                    toast.success("Role updated");
                  } else {
                    toast.error("Failed to update role");
                  }
                };
              }}
            >
              <input
                type="hidden"
                name="role"
                value={customer.role === "admin" ? "user" : "admin"}
              />
              <Button
                variant="outline"
                class="w-full justify-start text-foreground"
                disabled={isUpdatingRole}
              >
                {#if isUpdatingRole}
                  <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                {:else}
                  <ShieldAlert class="mr-2 h-4 w-4" />
                {/if}
                Make {customer.role === "admin" ? "User" : "Admin"}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Order History -->
    <Card class="md:col-span-2 border-none shadow-lg">
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        {#if orders.length > 0}
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Order #</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head>Total</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head class="text-right"></Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each orders as order}
                <Table.Row>
                  <Table.Cell class="font-medium"
                    >{order.orderNumber}</Table.Cell
                  >
                  <Table.Cell
                    >{format(
                      new Date(order.createdAt),
                      "MMM dd, yyyy",
                    )}</Table.Cell
                  >
                  <Table.Cell>{formatPrice(order.total)}</Table.Cell>
                  <Table.Cell>
                    <Badge variant="secondary" class="capitalize">
                      {order.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell class="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      href="/admin/orders/{order.id}">View</Button
                    >
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        {:else}
          <div
            class="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2"
          >
            <Package class="h-10 w-10 opacity-20" />
            <p>No orders found for this customer.</p>
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>
</div>
