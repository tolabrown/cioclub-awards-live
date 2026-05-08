<script lang="ts">
  import type { PageProps } from "./$types";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { formatPrice } from "$lib/fxns";
  import {
    CheckCircle2,
    XCircle,
    Package,
    Truck,
    ArrowRight,
    ShoppingBag,
  } from "@lucide/svelte";

  let { data }: PageProps = $props();

  const order = $derived(data.order);
  const status = $derived(data.status);
  const error = $derived(data.error);
  const isSuccess = $derived(status === "success");
</script>

<div class="center center px-4 py-12">
  {#if isSuccess && order}
    <div class="text-center">
      <div class="mb-4 flex justify-center">
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500"
        >
          <CheckCircle2 class="h-10 w-10" />
        </div>
      </div>
      <h1 class="text-3xl font-bold text-foreground">Payment Successful!</h1>
      <p class="mt-2 text-muted-foreground">
        Thank you for your order. We've received your payment and are processing
        it.
      </p>
      <div class="mt-4 flex justify-center gap-2">
        <Badge variant="outline" class="text-xs"
          >Order #{order.orderNumber}</Badge
        >
        <Badge variant="outline" class="text-xs"
          >Reference: {order.paymentReference}</Badge
        >
      </div>
    </div>

    <div class="mt-12 grid gap-6">
      <!-- Order Summary -->
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-3">
            {#each order.items || [] as item}
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground"
                  >{item.productName} x {item.quantity}</span
                >
                <span class="font-medium">{formatPrice(item.totalPrice)}</span>
              </div>
            {/each}
          </div>
          <div class="border-t border-border pt-4">
            <div class="flex justify-between font-bold">
              <span>Total Paid</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Shipping Info -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Truck class="h-5 w-5" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {#if order.shippingAddress}
            <div class="text-sm">
              <p class="font-medium text-foreground">
                {order.shippingAddress.fullName}
              </p>
              <p class="text-muted-foreground">
                {order.shippingAddress.addressLine1}
              </p>
              {#if order.shippingAddress.addressLine2}
                <p class="text-muted-foreground">
                  {order.shippingAddress.addressLine2}
                </p>
              {/if}
              <p class="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state}
                {order.shippingAddress.postalCode}
              </p>
              <p class="mt-2 text-muted-foreground">
                {order.shippingAddress.phone}
              </p>
            </div>
          {/if}
        </CardContent>
      </Card>

      <div class="flex flex-col gap-3 sm:flex-row">
        <Button href="/orders" variant="outline" class="flex-1">
          View All Orders
        </Button>
        <Button href="/products" class="flex-1">
          Continue Shopping
          <ArrowRight class="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  {:else}
    <div class="text-center">
      <div class="mb-4 flex justify-center">
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500"
        >
          <XCircle class="h-10 w-10" />
        </div>
      </div>
      <h1 class="text-3xl font-bold text-foreground">Payment Failed</h1>
      <p class="mt-2 text-muted-foreground">
        {error ||
          "Something went wrong with your payment. Please try again or contact support."}
      </p>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
        <Button href="/checkout" variant="outline">Try Again</Button>
        <Button href="/cart">Return to Cart</Button>
      </div>
    </div>
  {/if}
</div>
