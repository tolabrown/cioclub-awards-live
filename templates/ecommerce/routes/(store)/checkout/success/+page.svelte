<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    CheckCircle2,
    XCircle,
    ArrowRight,
    LogIn,
    UserPlus,
    Package,
  } from "@lucide/svelte";
  import { formatPrice } from "$lib/fxns";

  let { data } = $props();

  const isSuccess = $derived(data.status === "success");
  const order = $derived(data.order);
</script>

<div
  class="center mx-auto max-w-2xl px-4 py-20 min-h-[70vh] flex flex-col items-center justify-center text-center"
>
  {#if isSuccess}
    <div
      class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-8 animate-in zoom-in duration-500"
    >
      <CheckCircle2 class="h-12 w-12" />
    </div>

    <h1 class="text-3xl font-bold mb-4">Payment Successful!</h1>
    <p class="text-muted-foreground text-lg mb-8 max-w-md">
      Thank you for your purchase. We've received your order and it's now being
      processed.
    </p>

    {#if order}
      <div
        class="w-full bg-muted/30 rounded-xl p-6 border border-border mb-12 text-left"
      >
        <div
          class="flex justify-between items-center mb-4 pb-4 border-b border-border"
        >
          <span
            class="text-sm font-medium text-muted-foreground uppercase tracking-widest"
            >Order Details</span
          >
          <span class="font-bold">#{order.orderNumber}</span>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Status</span>
            <span class="font-medium capitalize">{order.status}</span>
          </div>
          <div class="flex justify-between text-lg font-bold">
            <span>Total Paid</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    {/if}

    <div class="w-full space-y-4">
      {#if !data.user}
        <div
          class="p-6 rounded-xl bg-primary/5 border border-primary/20 text-left relative overflow-hidden"
        >
          <div class="relative z-10">
            <h3
              class="text-xl font-bold text-primary mb-2 flex items-center gap-2"
            >
              <UserPlus class="h-5 w-5" />
              Save your details for next time
            </h3>
            <p class="text-sm text-muted-foreground mb-6">
              Create an account to track your orders, manage addresses, and
              enjoy a faster checkout experience.
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <Button
                href="/register"
                class="flex-1 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20"
              >
                Create Account
              </Button>
              <Button
                href="/login"
                variant="outline"
                class="flex-1 rounded-xl font-bold"
              >
                <LogIn class="mr-2 h-4 w-4" />
                Login
              </Button>
            </div>
          </div>
          <Package
            class="absolute -right-4 -bottom-4 h-32 w-32 text-primary/5 -rotate-12"
          />
        </div>
      {/if}

      <Button
        href="/products"
        variant="ghost"
        class="w-full text-muted-foreground hover:text-foreground rounded-xl"
      >
        Continue Shopping
        <ArrowRight class="ml-2 h-4 w-4" />
      </Button>
    </div>
  {:else if data.status === "failed"}
    <div
      class="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mb-8"
    >
      <XCircle class="h-12 w-12" />
    </div>
    <h1 class="text-3xl font-bold mb-4">Payment Failed</h1>
    <p class="text-muted-foreground text-lg mb-8">
      {data.message ||
        "We couldn't process your payment. Please try again or contact support."}
    </p>
    <Button href="/products" class="min-w-[200px] rounded-xl font-bold">
      Back to Products
    </Button>
  {:else}
    <div class="animate-pulse flex flex-col items-center">
      <div class="h-12 w-12 rounded-full bg-muted mb-4"></div>
      <div class="h-8 w-48 bg-muted rounded mb-4"></div>
      <div class="h-4 w-64 bg-muted rounded"></div>
    </div>
  {/if}
</div>
