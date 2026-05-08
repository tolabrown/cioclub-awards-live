<script lang="ts">
  import type { PageProps } from "./$types";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Star,
    ArrowRight,
  } from "@lucide/svelte";
  import { formatPrice } from "$lib/fxns";

  let { data }: PageProps = $props();

  // Real stats from database
  const stats = $derived([
    {
      title: "Total Revenue",
      value: formatPrice(data.stats?.totalRevenue || 0),
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: String(data.stats?.totalOrders || 0),
      icon: ShoppingCart,
    },
    {
      title: "Total Customers",
      value: String(data.customerCount || 0),
      icon: Users,
    },
    {
      title: "Active Products",
      value: String(data.activeProductsCount || 0),
      icon: Package,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-muted text-foreground";
      case "processing":
        return "bg-primary/10 text-primary";
      case "shipped":
        return "bg-accent text-accent-foreground";
      case "delivered":
        return "bg-primary/20 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
</script>

<div class="space-y-6">
  <!-- Page Header -->
  <div
    class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <h1 class="text-2xl font-bold text-foreground">Dashboard</h1>
      <p class="text-sm text-muted-foreground">
        Welcome back! Here's what's happening with your store.
      </p>
    </div>
    <div class="flex gap-2">
      <Button variant="outline" href="/admin/products/create"
        >Add Product</Button
      >
      <Button href="/admin/orders">View Orders</Button>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each stats as stat}
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
            >
              <stat.icon class="h-5 w-5 text-primary" />
            </div>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-bold text-foreground">{stat.value}</p>
            <p class="text-xs text-muted-foreground">{stat.title}</p>
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <!-- Recent Orders -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between pb-2">
        <CardTitle class="text-base font-medium">Recent Orders</CardTitle>
        <Button variant="ghost" size="sm" href="/admin/orders">
          View all
          <ArrowRight class="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          {#if data.recentOrders && data.recentOrders.length > 0}
            {#each data.recentOrders as order}
              <div
                class="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p class="font-medium text-foreground">{order.id}</p>
                  <p class="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div class="text-right">
                  <p class="font-medium text-foreground">
                    {formatPrice(Number(order.total))}
                  </p>
                  <span
                    class="inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize {getStatusColor(
                      order.status,
                    )}"
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            {/each}
          {:else}
            <p class="py-4 text-center text-sm text-muted-foreground">
              No recent orders.
            </p>
          {/if}
        </div>
      </CardContent>
    </Card>

    <!-- Low Stock Alert -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between pb-2">
        <div class="flex items-center gap-2">
          <AlertTriangle class="h-4 w-4 text-destructive" />
          <CardTitle class="text-base font-medium">Low Stock Alert</CardTitle>
        </div>
        <Button variant="ghost" size="sm" href="/admin/inventory">
          Manage
          <ArrowRight class="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          {#if data.lowStockProducts && data.lowStockProducts.length > 0}
            {#each data.lowStockProducts as product}
              <div
                class="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p class="font-medium text-foreground">{product.name}</p>
                  <p class="text-sm text-muted-foreground">
                    Threshold: {product.lowStockThreshold}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive"
                  >
                    {product.stockQuantity} left
                  </span>
                </div>
              </div>
            {/each}
          {:else}
            <p class="py-4 text-center text-sm text-muted-foreground">
              All products are well stocked!
            </p>
          {/if}
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Pending Reviews -->
  <Card>
    <CardHeader class="flex flex-row items-center justify-between pb-2">
      <div class="flex items-center gap-2">
        <Star class="h-4 w-4 text-primary" />
        <CardTitle class="text-base font-medium">Pending Reviews</CardTitle>
      </div>
      <Button variant="ghost" size="sm" href="/admin/reviews">
        Moderate
        <ArrowRight class="ml-1 h-4 w-4" />
      </Button>
    </CardHeader>
    <CardContent>
      <p class="py-4 text-center text-sm text-muted-foreground">
        No pending reviews at the moment.
      </p>
    </CardContent>
  </Card>
</div>
