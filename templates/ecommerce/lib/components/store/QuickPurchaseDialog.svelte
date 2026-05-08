<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { toast } from "svelte-sonner";
  import {
    Zap,
    Loader2,
    Truck,
    AlertCircle,
    ShoppingBag,
    MapPin,
    CheckCircle2,
    CreditCard,
    Banknote,
  } from "@lucide/svelte";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import { formatPrice } from "$lib/fxns";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { fade, slide } from "svelte/transition";
  import { cn } from "$lib/utils";

  interface Props {
    open: boolean;
    product: any;
    quantity?: number;
    onClose: () => void;
  }

  let { open = $bindable(), product, quantity = 1, onClose }: Props = $props();

  let isMobile = $state(false);
  let isLoading = $state(false);

  // User session
  const user = $derived(page.data.user);
  const isLoggedIn = $derived(!!user);

  // Delivery method
  let deliveryMethod = $state<"shipping" | "pickup">("shipping");
  let pickupDetails = $state("");

  // Payment method
  let paymentMethod = $state<"paystack" | "pod">("paystack");

  // Shipping data from layout
  const zones = $derived(page.data.shippingZones || []);
  let selectedZoneId = $state("");
  let selectedCity = $state("");

  const selectedZone = $derived(
    zones.find((z: any) => z.id.toString() === selectedZoneId),
  );
  const cities = $derived(
    selectedZone
      ? selectedZone.cities.split(",").map((c: string) => c.trim())
      : [],
  );
  const cityOptions = $derived(
    cities.map((c: string) => ({ label: c, value: c })),
  );
  const zoneOptions = $derived(
    zones.map((z: any) => ({ label: z.zone, value: z.id.toString() })),
  );

  // Shipping fee: 0 for pickup, 1500 for shipping
  const shippingFee = $derived(
    deliveryMethod === "pickup" ? 0 : selectedZone ? 1500 : 0,
  );
  const totalAmount = $derived(
    parseFloat(product?.basePrice || 0) * quantity + shippingFee,
  );
  const amountToPayNow = $derived(
    paymentMethod === "pod" ? shippingFee : totalAmount,
  );

  // Form State
  let email = $state("");
  let fullName = $state("");
  let phone = $state("");

  // Populate from session if logged in
  $effect(() => {
    if (user) {
      email = user.email || "";
      fullName = user.name || "";
    }
  });

  // Dynamic imports
  let Dialog: any = $state(null);
  let Drawer: any = $state(null);

  $effect(() => {
    if (browser) {
      import("$lib/components/ui/dialog/index.js").then((module) => {
        Dialog = module;
      });
      import("$lib/components/ui/drawer/index.js").then((module) => {
        Drawer = module;
      });
    }
  });

  $effect(() => {
    if (browser) {
      const checkMobile = () => {
        isMobile = window.innerWidth < 1024;
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
    }
    open = newOpen;
  };

  const handlePurchase = async (e: Event) => {
    e.preventDefault();

    // Validate based on delivery method
    if (!email || !fullName || !phone) {
      toast.error("Please fill in all contact details");
      return;
    }

    if (deliveryMethod === "shipping" && (!selectedZoneId || !selectedCity)) {
      toast.error("Please select a delivery zone and city");
      return;
    }

    if (deliveryMethod === "pickup" && !pickupDetails.trim()) {
      toast.error("Please describe where and when you plan to pickup");
      return;
    }

    isLoading = true;
    try {
      const response = await fetch("/api/checkout/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          email,
          fullName,
          phone,
          deliveryMethod,
          zoneId: deliveryMethod === "shipping" ? selectedZone?.zone : null,
          city: deliveryMethod === "shipping" ? selectedCity : null,
          shippingCost: shippingFee,
          pickupDetails: deliveryMethod === "pickup" ? pickupDetails : null,
          userId: user?.id || null,
          paymentMethod,
          amountToPayNow,
        }),
      });

      const result = await response.json();
      if (result.success && result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        toast.error(result.error || "Failed to initialize payment");
        isLoading = false;
      }
    } catch (err) {
      console.error("Purchase error:", err);
      toast.error("An error occurred. Please try again.");
      isLoading = false;
    }
  };
</script>

{#snippet purchaseForm(isMobile: boolean)}
  <form onsubmit={handlePurchase} class="space-y-4">
    <!-- Contact Info -->
    <div class="space-y-4">
      {#if !isLoggedIn}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for={isMobile ? "fullName-m" : "fullName"}>Full Name</Label>
            <Input
              id={isMobile ? "fullName-m" : "fullName"}
              bind:value={fullName}
              placeholder="John Doe"
              class="rounded-xl bg-muted/20"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for={isMobile ? "email-m" : "email"}>Email Address</Label>
            <Input
              id={isMobile ? "email-m" : "email"}
              type="email"
              bind:value={email}
              placeholder="john@example.com"
              class="rounded-xl bg-muted/20"
              required
            />
          </div>
        </div>
      {:else}
        <div class="rounded-xl bg-primary/5 p-4 border border-primary/10">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              {user.name?.slice(0, 1) || "U"}
            </div>
            <div class="flex flex-col">
              <span
                class="text-xs text-muted-foreground font-bold uppercase tracking-wider"
                >Checkout as</span
              >
              <span class="font-bold text-foreground leading-tight"
                >{user.name}</span
              >
            </div>
          </div>
        </div>
      {/if}

      <div class="space-y-2">
        <Label for={isMobile ? "phone-m" : "phone"}>Phone Number</Label>
        <Input
          id={isMobile ? "phone-m" : "phone"}
          type="tel"
          bind:value={phone}
          placeholder="08012345678"
          class="rounded-xl bg-muted/20"
          required
        />
      </div>
    </div>

    <!-- Delivery Method Selection -->
    <div class="space-y-3 pt-2">
      <div class="flex items-center gap-2 mb-1">
        <Truck class="h-4 w-4 text-primary" />
        <span
          class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >Delivery Method</span
        >
      </div>

      <!-- Delivery Options -->
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          onclick={() => (deliveryMethod = "shipping")}
          class="text-left rounded-xl border-2 p-3 transition-all {deliveryMethod ===
          'shipping'
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'}"
        >
          <div class="flex items-center gap-2">
            <Truck class="h-4 w-4 text-primary" />
            <div>
              <span class="text-xs font-bold">Jumia Shipping</span>
              <p class="text-[10px] text-muted-foreground">Delivery</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onclick={() => (deliveryMethod = "pickup")}
          class="text-left rounded-xl border-2 p-3 transition-all {deliveryMethod ===
          'pickup'
            ? 'border-green-500 bg-green-500/5'
            : 'border-border hover:border-green-500/50'}"
        >
          <div class="flex items-center gap-2">
            <MapPin class="h-4 w-4 text-green-600" />
            <div>
              <span class="text-xs font-bold">Pickup</span>
              <p class="text-[10px] text-green-600 font-bold">FREE</p>
            </div>
          </div>
        </button>
      </div>

      <!-- Jumia Shipping Zone Selection -->
      {#if deliveryMethod === "shipping"}
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2" transition:slide>
          <div class="space-y-1.5">
            <Label class="text-[10px] uppercase ml-1">Zone</Label>
            <SelectComponent
              name="zone"
              placeholder="Select Zone"
              options={zoneOptions}
              bind:value={selectedZoneId}
              class="bg-muted/20"
            />
          </div>
          <div class="space-y-1.5">
            <Label class="text-[10px] uppercase ml-1">City</Label>
            <SelectComponent
              name="city"
              placeholder="Select City"
              options={cityOptions}
              bind:value={selectedCity}
              disabled={!selectedZoneId}
              class="bg-muted/20"
            />
          </div>
        </div>

        {#if selectedZone}
          <div
            class="mt-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900 border border-border/50 shadow-inner"
            transition:fade
          >
            <div class="flex items-center justify-between text-xs font-medium">
              <span class="text-muted-foreground">Estimated Delivery</span>
              <span class="text-foreground">24-48 Hours</span>
            </div>
          </div>
        {:else}
          <div
            class="flex items-center gap-2 text-[10px] text-orange-500 font-bold bg-orange-50/50 dark:bg-orange-950/20 p-2 rounded-lg border border-orange-200/50"
          >
            <AlertCircle class="h-3 w-3" />
            <span>Select a delivery zone to see shipping fee</span>
          </div>
        {/if}
      {/if}

      <!-- Pickup Details -->
      {#if deliveryMethod === "pickup"}
        <div class="space-y-3" transition:slide>
          <div
            class="flex flex-col gap-2 bg-green-50/50 dark:bg-green-950/20 p-4 rounded-xl border border-green-200/50"
          >
            <div
              class="flex items-center gap-2 text-xs text-green-600 font-bold group"
            >
              <CheckCircle2 class="h-4 w-4" />
              <span>FREE PICKUP ACTIVE</span>
            </div>
            <p class="text-[11px] leading-relaxed text-muted-foreground">
              <span class="font-bold text-foreground">Note:</span> Free shipping
              is only available for locations
              <span class="font-bold text-foreground">local to the seller</span
              >. Please
              <span class="text-primary font-bold">chat with the seller</span> before
              or after your order to finalize the exact pickup location and time.
            </p>
          </div>

          <div class="space-y-2">
            <Label
              for="pickupDetails"
              class="text-[10px] uppercase ml-1 font-bold text-muted-foreground"
            >
              Pickup Instructions *
            </Label>
            <Textarea
              id="pickupDetails"
              bind:value={pickupDetails}
              placeholder="e.g. 'I will pick up from the main gate on Saturday morning'"
              rows={2}
              class="resize-none rounded-xl bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>
        </div>
      {/if}
    </div>

    <!-- Payment Method Selection -->
    {#if deliveryMethod === "shipping"}
      <div class="space-y-3 pt-2">
        <div class="flex items-center gap-2 mb-1">
          <CreditCard class="h-4 w-4 text-primary" />
          <span
            class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >Payment Options</span
          >
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            onclick={() => (paymentMethod = "paystack")}
            class={cn(
              "text-left rounded-xl border-2 p-3 transition-all",
              paymentMethod === "paystack"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
            )}
          >
            <div class="flex items-center gap-2">
              <CreditCard class="h-4 w-4 text-primary" />
              <div>
                <span class="text-xs font-bold">Pay Now</span>
                <p class="text-[10px] text-muted-foreground">Full Payment</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onclick={() => (paymentMethod = "pod")}
            class={cn(
              "text-left rounded-xl border-2 p-3 transition-all",
              paymentMethod === "pod"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
            )}
          >
            <div class="flex items-center gap-2">
              <Banknote class="h-4 w-4 text-primary" />
              <div>
                <span class="text-xs font-bold">On Delivery</span>
                <p class="text-[10px] text-muted-foreground">
                  Pay Shipping Now
                </p>
              </div>
            </div>
          </button>
        </div>

        {#if paymentMethod === "pod"}
          <div
            class="bg-primary/5 p-3 rounded-xl border border-primary/20"
            transition:fade
          >
            <p class="text-[10px] leading-relaxed text-primary font-medium">
              <span class="font-bold uppercase tracking-tight mr-1">Note:</span>
              For Payment on Delivery, you only pay the
              <span class="font-bold">{formatPrice(shippingFee)}</span> shipping fee
              now to confirm your order. The balance will be paid when your item arrives.
            </p>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Order Summary -->
    <div class="pt-2">
      <Separator class="mb-4" />
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground"
            >Item Price {quantity > 1 ? `x ${quantity}` : ""}</span
          >
          <span class="font-medium"
            >{formatPrice(parseFloat(product.basePrice) * quantity)}</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Shipping Fee</span>
          <span
            class={deliveryMethod === "pickup" || selectedZone
              ? "font-bold text-primary"
              : "italic text-muted-foreground"}
          >
            {#if deliveryMethod === "pickup"}
              Free (Pickup)
            {:else if selectedZone}
              {formatPrice(shippingFee)}
            {:else}
              Select zone
            {/if}
          </span>
        </div>

        <div
          class="flex justify-between pt-2 border-t border-dashed border-border mt-2"
        >
          <span class="font-bold">Order Total</span>
          <span class="text-base font-bold text-foreground"
            >{formatPrice(totalAmount)}</span
          >
        </div>

        <div
          class="flex justify-between items-center rounded-lg bg-primary/10 p-2 mt-2"
        >
          <span class="text-xs font-bold uppercase tracking-wider text-primary"
            >Due Now</span
          >
          <span class="text-xl font-bold text-primary"
            >{formatPrice(amountToPayNow)}</span
          >
        </div>
      </div>
    </div>

    <!-- Submit -->
    <div class="pt-4">
      <Button
        type="submit"
        class="w-full rounded-xl font-bold text-lg bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 group"
        disabled={isLoading ||
          (deliveryMethod === "shipping" && !selectedCity) ||
          (deliveryMethod === "pickup" && !pickupDetails.trim())}
      >
        {#if isLoading}
          <Loader2 class="mr-2 h-5 w-5 animate-spin" />
          Processing...
        {:else}
          <Zap class="mr-2 h-5 w-5 fill-current" />
          Pay {formatPrice(amountToPayNow)}
          {paymentMethod === "pod" ? "to Confirm" : "Now"}
        {/if}
      </Button>
      <p
        class="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest font-bold opacity-60"
      >
        Secure Transaction via Paystack
      </p>
    </div>
  </form>
{/snippet}

{#if product}
  {#if !isMobile}
    {#if Dialog}
      <Dialog.Root {open} onOpenChange={handleOpenChange}>
        <Dialog.Content
          class="sm:max-w-[480px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-card"
        >
          <div
            class="p-8 max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide"
          >
            <div class="flex items-center gap-4 mb-8">
              <div class="relative">
                <div
                  class="absolute -inset-1 rounded-full bg-primary/20 blur animate-pulse"
                ></div>
                <div
                  class="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                >
                  <Zap class="h-7 w-7 fill-current" />
                </div>
              </div>
              <div>
                <h2 class="text-2xl font-bold tracking-tight">
                  Quick Purchase
                </h2>
                <p
                  class="text-sm text-muted-foreground font-medium line-clamp-1"
                >
                  {product.name}
                </p>
              </div>
            </div>

            {@render purchaseForm(false)}
          </div>
        </Dialog.Content>
      </Dialog.Root>
    {/if}
  {:else if browser && Drawer}
    <Drawer.Root {open} onOpenChange={handleOpenChange}>
      <Drawer.Content class="rounded-t-[2.5rem] bg-card">
        <Drawer.Header class="text-left px-8 pt-8">
          <Drawer.Title class="text-2xl font-bold tracking-tight"
            >Quick Purchase</Drawer.Title
          >
          <Drawer.Description
            class="font-medium line-clamp-1 text-muted-foreground"
          >
            {product.name}
          </Drawer.Description>
        </Drawer.Header>
        <div
          class="px-8 pb-12 mt-4 max-h-[80vh] overflow-y-auto scrollbar-hide"
        >
          {@render purchaseForm(true)}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  {/if}
{/if}
