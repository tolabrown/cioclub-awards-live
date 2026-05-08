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
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import { formatPrice } from "$lib/fxns";
  import {
    Loader2,
    Lock,
    CreditCard,
    ShieldCheck,
    Truck,
    MapPin,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
  } from "@lucide/svelte";
  import JumiaLogo from "$lib/components/icons/JumiaLogo.svelte";
  import JumiaShippingSelection from "$lib/components/store/JumiaShippingSelection.svelte";
  import { toast } from "svelte-sonner";

  let { data }: PageProps = $props();

  let isSubmitting = $state(false);
  let email = $state("");
  let sameAsBilling = $state(true);

  // Delivery method
  let deliveryMethod = $state<"shipping" | "pickup">("shipping");
  let pickupDetails = $state("");

  // Shipping address
  let shippingFullName = $state("");
  let shippingAddressLine1 = $state("");
  let shippingAddressLine2 = $state("");
  let shippingCity = $state("");
  let shippingState = $state("");
  let shippingPostalCode = $state("");
  let shippingPhone = $state("");

  // Jumia Shipping Selection
  const zones = $derived(data.shippingZones || []);
  let showShippingSelector = $state(false);
  let selectedZoneId = $state("");
  let selectedCity = $state("");
  let selectedSize = $state<"small" | "medium" | "large">("small");
  let jumiaShippingFee = $state(0);
  let isCalculatingShipping = $state(false);

  const selectedZone = $derived(
    zones.find((z) => z.id.toString() === selectedZoneId),
  );

  async function handleShippingSelect(selection: {
    zoneId: string;
    city: string;
    size: "small" | "medium" | "large";
  }) {
    selectedZoneId = selection.zoneId;
    selectedCity = selection.city;
    selectedSize = selection.size;

    isCalculatingShipping = true;
    try {
      const zoneName = zones.find(
        (z) => z.id.toString() === selection.zoneId,
      )?.zone;
      const response = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneName, size: selection.size }),
      });
      const result = await response.json();
      if (result.success) {
        jumiaShippingFee = result.fee;
        toast.success("Shipping fee updated");
      }
    } catch (e) {
      toast.error("Failed to calculate shipping fee");
    } finally {
      isCalculatingShipping = false;
    }
  }

  // Initialize from data
  $effect(() => {
    if (data.user?.email) email = data.user.email;
    if (data.user?.name) shippingFullName = data.user.name;
  });

  const cart = $derived(data.cart);
  const items = $derived(cart?.items || []);
  const subtotal = $derived(cart?.subtotal || 0);

  // Shipping cost: 0 for pickup, calculated for Jumia shipping
  const shippingCost = $derived(
    deliveryMethod === "pickup" ? 0 : jumiaShippingFee,
  );
  const total = $derived(subtotal + shippingCost);
</script>

<div class="center py-6">
  <h1 class="mb-6 text-2xl font-bold text-foreground">Checkout</h1>

  <form
    method="POST"
    use:enhance={() => {
      isSubmitting = true;
      return async ({ result }) => {
        isSubmitting = false;
        if (result.type === "redirect") {
          // Redirect to Paystack
          window.location.href = result.location;
        }
      };
    }}
  >
    <!-- Hidden fields for delivery method -->
    <input type="hidden" name="deliveryMethod" value={deliveryMethod} />
    <input type="hidden" name="pickupDetails" value={pickupDetails} />
    <input type="hidden" name="shippingCost" value={shippingCost} />
    <input type="hidden" name="shippingZone" value={selectedZone?.zone || ""} />
    <input type="hidden" name="shippingCity" value={selectedCity} />

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Checkout Form -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Contact -->
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <Label for="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                bind:value={email}
                required
                placeholder="your@email.com"
              />
              <p class="text-xs text-muted-foreground">
                We'll send order confirmation here
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Delivery Method -->
        <Card>
          <CardHeader>
            <CardTitle>Delivery Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup.Root
              bind:value={deliveryMethod}
              class="grid gap-4 sm:grid-cols-2"
            >
              <!-- Jumia Shipping Option -->
              <Label
                class="flex flex-col gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all {deliveryMethod ===
                'shipping'
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'}"
              >
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
                    >
                      <Truck class="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <JumiaLogo class="h-3" />
                        <p class="font-bold">Shipping</p>
                      </div>
                      <p class="text-xs text-muted-foreground">
                        Delivery to your address
                      </p>
                    </div>
                  </div>
                  <RadioGroup.Item value="shipping" class="sr-only" />
                  {#if deliveryMethod === "shipping"}
                    <div
                      class="h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                    >
                      <div class="h-1.5 w-1.5 rounded-full bg-white"></div>
                    </div>
                  {:else}
                    <div
                      class="h-4 w-4 rounded-full border-2 border-muted-foreground/30"
                    ></div>
                  {/if}
                </div>
              </Label>

              <!-- Pickup Option -->
              <Label
                class="flex flex-col gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all {deliveryMethod ===
                'pickup'
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'}"
              >
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10"
                    >
                      <MapPin class="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p class="font-bold">Pickup</p>
                      <p class="text-xs text-muted-foreground">
                        Free - Arrange pickup
                      </p>
                    </div>
                  </div>
                  <RadioGroup.Item value="pickup" class="sr-only" />
                  {#if deliveryMethod === "pickup"}
                    <div
                      class="h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                    >
                      <div class="h-1.5 w-1.5 rounded-full bg-white"></div>
                    </div>
                  {:else}
                    <div
                      class="h-4 w-4 rounded-full border-2 border-muted-foreground/30"
                    ></div>
                  {/if}
                </div>
              </Label>
            </RadioGroup.Root>

            <!-- Jumia Shipping Details -->
            {#if deliveryMethod === "shipping"}
              <div class="mt-4 space-y-3">
                <Button
                  variant="outline"
                  class="w-full justify-between h-auto py-3 px-4 rounded-xl group"
                  type="button"
                  onclick={() => (showShippingSelector = true)}
                >
                  <div class="flex flex-col items-start gap-0.5">
                    <span
                      class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Select Delivery Zone
                    </span>
                    {#if selectedZoneId && selectedCity}
                      <span class="text-sm font-bold text-foreground">
                        {selectedCity}, {selectedZone?.zone}
                      </span>
                    {:else}
                      <span class="text-sm font-medium text-muted-foreground">
                        Click to select location
                      </span>
                    {/if}
                  </div>
                  <ChevronRight
                    class="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform"
                  />
                </Button>

                {#if selectedZone}
                  <div
                    class="rounded-xl bg-primary/5 p-4 border border-primary/10"
                  >
                    <div class="flex items-center justify-between">
                      <div
                        class="flex items-center gap-2 text-xs font-bold text-primary"
                      >
                        <CheckCircle2 class="h-4 w-4" />
                        Verified Jumia Rate
                      </div>
                      <div class="font-bold text-primary">
                        {#if isCalculatingShipping}
                          <Loader2 class="h-4 w-4 animate-spin" />
                        {:else}
                          {formatPrice(jumiaShippingFee)}
                        {/if}
                      </div>
                    </div>
                  </div>
                {:else}
                  <div
                    class="flex items-start gap-3 rounded-xl bg-orange-50/50 dark:bg-orange-500/5 p-4 border border-orange-200/50 dark:border-orange-500/5"
                  >
                    <AlertCircle
                      class="h-5 w-5 text-orange-500 shrink-0 mt-0.5"
                    />
                    <p
                      class="text-xs text-orange-500 leading-relaxed font-bold"
                    >
                      Please select a shipping zone to continue.
                    </p>
                  </div>
                {/if}
              </div>
            {/if}

            <!-- Pickup Details -->
            {#if deliveryMethod === "pickup"}
              <div class="mt-4 space-y-2">
                <Label for="pickupDetails">Pickup Details *</Label>
                <Textarea
                  id="pickupDetails"
                  bind:value={pickupDetails}
                  placeholder="Describe where and when you plan to pickup (e.g., 'Will pickup at the Forge after Community Bible Study on Sunday')"
                  rows={3}
                  class="resize-none"
                  required
                />
                <p class="text-xs text-muted-foreground">
                  Include your preferred location, date, and availability
                </p>
              </div>
            {/if}
          </CardContent>
        </Card>

        <!-- Shipping Address (only for shipping) -->
        {#if deliveryMethod === "shipping"}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label for="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="shippingFullName"
                  bind:value={shippingFullName}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div class="space-y-2">
                <Label for="addressLine1">Address *</Label>
                <Input
                  id="addressLine1"
                  name="shippingAddressLine1"
                  bind:value={shippingAddressLine1}
                  required
                  placeholder="123 Main Street"
                />
              </div>
              <div class="space-y-2">
                <Input
                  name="shippingAddressLine2"
                  bind:value={shippingAddressLine2}
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label for="city">City *</Label>
                  <Input
                    id="city"
                    name="shippingCity"
                    bind:value={shippingCity}
                    required
                    placeholder="Lagos"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="state">State *</Label>
                  <Input
                    id="state"
                    name="shippingState"
                    bind:value={shippingState}
                    required
                    placeholder="Lagos"
                  />
                </div>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label for="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="shippingPostalCode"
                    bind:value={shippingPostalCode}
                    placeholder="100001"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="shippingPhone"
                    bind:value={shippingPhone}
                    required
                    placeholder="+234"
                  />
                </div>
              </div>

              <div class="flex items-center gap-2 pt-2">
                <Checkbox id="sameAsBilling" bind:checked={sameAsBilling} />
                <Label for="sameAsBilling" class="text-sm"
                  >Billing address same as shipping</Label
                >
              </div>
            </CardContent>
          </Card>
        {:else}
          <!-- For pickup, only require phone number -->
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label for="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="shippingFullName"
                  bind:value={shippingFullName}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div class="space-y-2">
                <Label for="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="shippingPhone"
                  bind:value={shippingPhone}
                  required
                  placeholder="+234"
                />
                <p class="text-xs text-muted-foreground">
                  We'll contact you to confirm pickup details
                </p>
              </div>
              <!-- Hidden fields for pickup mode -->
              <input type="hidden" name="shippingAddressLine1" value="Pickup" />
              <input type="hidden" name="shippingCity" value="Lagos" />
              <input type="hidden" name="shippingState" value="Lagos" />
              <input type="hidden" name="shippingPostalCode" value="" />
            </CardContent>
          </Card>
        {/if}

        <!-- Payment -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <CreditCard class="h-5 w-5" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="rounded-lg border border-border bg-muted/50 p-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
                >
                  <Lock class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p class="font-medium text-foreground">
                    Secure Payment via Paystack
                  </p>
                  <p class="text-sm text-muted-foreground">
                    You'll be redirected to complete payment
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Order Summary -->
      <div>
        <Card class="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Items -->
            <div class="max-h-60 space-y-3 overflow-y-auto">
              {#each items as item}
                <div class="flex gap-3">
                  <div
                    class="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted"
                  >
                    {#if item.product?.images?.[0]?.url}
                      <img
                        src={item.product.images[0].url}
                        alt=""
                        class="h-full w-full object-cover"
                      />
                    {/if}
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium line-clamp-1">
                      {item.product?.name}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p class="text-sm font-medium">
                    {formatPrice(parseFloat(item.priceAtAdd) * item.quantity)}
                  </p>
                </div>
              {/each}
            </div>

            <Separator />

            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Shipping</span>
                <span
                  class={deliveryMethod === "pickup"
                    ? "text-green-600 font-medium"
                    : ""}
                >
                  {deliveryMethod === "pickup"
                    ? "Free (Pickup)"
                    : shippingCost === 0
                      ? "Free"
                      : formatPrice(shippingCost)}
                </span>
              </div>
            </div>

            <Separator />

            <div class="flex justify-between font-medium">
              <span>Total</span>
              <span class="text-lg">{formatPrice(total)}</span>
            </div>

            <Button
              type="submit"
              class="w-full"
              disabled={isSubmitting ||
                items.length === 0 ||
                (deliveryMethod === "pickup" && !pickupDetails.trim())}
            >
              {#if isSubmitting}
                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                Processing...
              {:else}
                Pay {formatPrice(total)}
              {/if}
            </Button>

            <JumiaShippingSelection
              bind:open={showShippingSelector}
              {zones}
              onSelect={handleShippingSelect}
              onClose={() => (showShippingSelector = false)}
            />

            <div
              class="flex items-center justify-center gap-2 text-xs text-muted-foreground"
            >
              <ShieldCheck class="h-4 w-4" />
              <span>Secure checkout</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </form>
</div>
