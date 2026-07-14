<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Check,
    ChevronLeft,
    Loader2,
    Send,
    GraduationCap,
    Briefcase,
    Crown,
    Building2,
    Globe,
    CreditCard,
    ShieldCheck,
  } from "@lucide/svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import { fade, fly } from "svelte/transition";
  import * as Select from "$lib/components/ui/select";
  import { SUPPORTED_CURRENCIES } from "$lib/constants/currencies";
    import { cn } from "$lib/utils.js";

  let { data, form } = $props();
  const selectedTier = $derived(data.selectedTier);
  const user = $derived(data.user);

  let isSubmitting = $state(false);

  const tierIcons: Record<string, any> = {
    student: GraduationCap,
    "entry-level": Briefcase,
    executive: Crown,
    "corporate-sme": Building2,
    "corporate-enterprise": Globe,
  };

  const Icon = $derived(tierIcons[selectedTier?.id] || ShieldCheck);

  let selectedCurrency = $state(SUPPORTED_CURRENCIES[0]); // Default to NGN
  let exchangeRate = $state(1);
  let isFetchingRate = $state(false);

  const convertedAmount = $derived(Math.ceil(selectedTier?.amount * exchangeRate));
  const displayPrice = $derived(
    selectedCurrency.code === "NGN"
      ? selectedTier?.price
      : `${selectedCurrency.symbol}${convertedAmount.toLocaleString()}`,
  );

  async function updateExchangeRate(currencyCode: string) {
    if (currencyCode === "NGN") {
      exchangeRate = 1;
      return;
    }

    isFetchingRate = true;
    try {
      const response = await fetch(`/api/membership/rates?to=${currencyCode}`);
      const data = await response.json();
      if (data.rate) {
        exchangeRate = data.rate;
      }
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
      toast.error("Could not update exchange rate. Using default.");
    } finally {
      isFetchingRate = false;
    }
  }

  $effect(() => {
    updateExchangeRate(selectedCurrency.code);
  });
</script>

<div class="min-h-screen py-8 container bg-background">
  <div class="container max-w-4xl px-4">
    <!-- Back Button -->
    <Button
      href="/membership"
      variant="ghost"
      class="mb-8 group text-muted-foreground hover:text-foreground -ml-4"
    >
      <ChevronLeft
        class="size-4 mr-2 group-hover:-translate-x-1 transition-transform"
      />
      Back to Tiers
    </Button>

    <div class="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
      <!-- Registration Form -->
      <div class="space-y-8" in:fly={{ x: -20, duration: 600 }}>
        <div>
          <h1 class="text-3xl font-bold mb-2 text-foreground">
            Complete Your Registration
          </h1>
          <p class="text-muted-foreground font-medium">
            Please provide your professional details to proceed to secure
            payment.
          </p>
        </div>

        <form
          method="POST"
          action="?/initializePayment"
          use:enhance={() => {
            isSubmitting = true;
            return async ({ result }) => {
              isSubmitting = false;
              if (result.type === "success") {
                window.location.href = (result.data as any)
                  ?.authorization_url as string;
              } else if (result.type === "failure") {
                toast.error(
                  (result.data as any)?.message ||
                    "Something went wrong. Please try again.",
                );
              }
            };
          }}
          class="space-y-6 bg-card p-8 rounded-3xl border border-border shadow-xl"
        >
          <input type="hidden" name="tierId" value={selectedTier?.id} />
          <input type="hidden" name="amount" value={selectedTier?.amount} />
          <input type="hidden" name="currency" value={selectedCurrency.code} />
          <input type="hidden" name="convertedAmount" value={convertedAmount} />

          <div class="space-y-4 pb-4 border-b border-border/50">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Select Payment Currency</Label
            >
            <Select.Root
              type="single"
              value={selectedCurrency.code}
              onValueChange={(v) => {
                const cur = SUPPORTED_CURRENCIES.find((c) => c.code === v);
                if (cur) selectedCurrency = cur;
              }}
            >
              <Select.Trigger class="w-full h-14 rounded-xl border-border shadow-sm">
                <div class="flex items-center justify-between w-full gap-3">
                  <div class="flex items-center gap-3">
                    <span class="text-xl">{selectedCurrency.flag}</span>
                    <span class="font-bold">{selectedCurrency.name}</span>
                  </div>
                  <span class="text-xs font-semibold text-muted-foreground tracking-wide">{selectedCurrency.code}</span>
                </div>
              </Select.Trigger>
              <Select.Content class="rounded-xl shadow-2xl border-border">
                {#each SUPPORTED_CURRENCIES as currency}
                  <Select.Item
                    value={currency.code}
                    class="h-12 focus:bg-primary/5 rounded-lg"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-lg">{currency.flag}</span>
                      <span class="font-medium">{currency.name}</span>
                      <span class="text-xs text-muted-foreground ml-auto"
                        >{currency.code}</span
                      >
                    </div>
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <div class="space-y-2">
              <Label
                for="email"
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >Email Address</Label
              >
              <Input
                id="email"
                name="email"
                type="email"
                value={user?.email}
                readonly
                class="bg-muted border-border text-muted-foreground font-medium h-12 rounded-xl"
              />
              <p class="text-[10px] text-muted-foreground/70">
                Your account email (permanent)
              </p>
            </div>
            <div class="space-y-2">
              <Label
                for="fullName"
                class="text-xs font-bold uppercase tracking-wider text-foreground"
                >Full Name</Label
              >
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="How should we address you?"
                required
                value={user?.name}
                class="h-12 rounded-xl border-border focus:border-primary focus:ring-primary shadow-sm"
              />
            </div>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <div class="space-y-2">
              <Label
                for="organization"
                class="text-xs font-bold uppercase tracking-wider text-foreground"
                >Organization / Institution</Label
              >
              <Input
                id="organization"
                name="organization"
                type="text"
                placeholder="Company or University"
                required
                class="h-12 rounded-xl border-border focus:border-primary focus:ring-primary shadow-sm"
              />
            </div>
            <div class="space-y-2">
              <Label
                for="jobTitle"
                class="text-xs font-bold uppercase tracking-wider text-foreground"
                >Current Role</Label
              >
              <Input
                id="jobTitle"
                name="jobTitle"
                type="text"
                placeholder="Job Title or Student Status"
                required
                class="h-12 rounded-xl border-border focus:border-primary focus:ring-primary shadow-sm"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label
              for="phone"
              class="text-xs font-bold uppercase tracking-wider text-foreground"
              >Phone Number (with Country Code)</Label
            >
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+234 ..."
              required
              class="h-12 rounded-xl border-border focus:border-primary focus:ring-primary shadow-sm"
            />
          </div>

          <div class="grid gap-6 sm:grid-cols-2 pt-4 border-t border-border/50">
            <div class="space-y-2">
              <Label
                for="previousRole"
                class="text-xs font-bold uppercase tracking-wider text-foreground"
                >Previous Role</Label
              >
              <Input
                id="previousRole"
                name="previousRole"
                type="text"
                placeholder="What was your last position?"
                class="h-12 rounded-xl border-border focus:border-primary focus:ring-primary shadow-sm"
              />
            </div>
            <div class="space-y-2">
              <Label
                for="sector"
                class="text-xs font-bold uppercase tracking-wider text-foreground"
                >Sector</Label
              >
              <Input
                id="sector"
                name="sector"
                type="text"
                placeholder="e.g., Fintech & Financial Services, Oil & Gas"
                class="h-12 rounded-xl border-border focus:border-primary focus:ring-primary shadow-sm"
              />
            </div>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <div class="space-y-2">
              <Label
                for="currentLocation"
                class="text-xs font-bold uppercase tracking-wider text-foreground"
                >Current Location</Label
              >
              <Input
                id="currentLocation"
                name="currentLocation"
                type="text"
                placeholder="City, Country"
                class="h-12 rounded-xl border-border focus:border-primary focus:ring-primary shadow-sm"
              />
            </div>
            <div class="space-y-2">
              <Label
                for="contactDetails"
                class="text-xs font-bold uppercase tracking-wider text-foreground"
                >Alternative Contact Details</Label
              >
              <Input
                id="contactDetails"
                name="contactDetails"
                type="text"
                placeholder="Secondary email or social handle"
                class="h-12 rounded-xl border-border focus:border-primary focus:ring-primary shadow-sm"
              />
            </div>
          </div>

          <div class="space-y-6 pt-4 border-t border-border/50">
            <div class="space-y-2">
              <Label
                for="areasOfExpertise"
                class="text-xs font-bold uppercase tracking-wider text-foreground"
                >Areas of Expertise</Label
              >
              <Textarea
                id="areasOfExpertise"
                name="areasOfExpertise"
                placeholder="List your core professional strengths..."
                class="min-h-[100px] rounded-xl border-border focus:border-primary focus:ring-primary shadow-sm resize-none"
              />
            </div>

            <div class="space-y-2">
              <Label
                for="interests"
                class="text-xs font-bold uppercase tracking-wider text-foreground"
                >Professional Interests</Label
              >
              <Textarea
                id="interests"
                name="interests"
                placeholder="What topics are you most passionate about?"
                class="min-h-[100px] rounded-xl border-border focus:border-primary focus:ring-primary shadow-sm resize-none"
              />
            </div>

            <div class="space-y-2">
              <Label
                for="collaborationGoals"
                class="text-xs font-bold uppercase tracking-wider text-foreground"
                >Collaboration Goals</Label
              >
              <Textarea
                id="collaborationGoals"
                name="collaborationGoals"
                placeholder="What do you hope to achieve through the CIO Club network?"
                class="min-h-[100px] rounded-xl border-border focus:border-primary focus:ring-primary shadow-sm resize-none"
              />
            </div>
          </div>

          <div class="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || isFetchingRate}
              class="w-full bg-primary text-primary-foreground font-bold uppercase text-sm shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {#if isSubmitting}
                <Loader2 class="size-5 animate-spin mr-2" />
                Initializing Secure Checkout...
              {:else if isFetchingRate}
                <Loader2 class="size-5 animate-spin mr-2" />
                Fetching Exchange Rate...
              {:else}
                <CreditCard class="size-5 mr-2" />
                Pay {displayPrice} via {selectedCurrency.code === "NGN"
                  ? "Paystack"
                  : "Flutterwave"}
              {/if}
            </Button>
            <div
              class="flex items-center justify-center gap-2 mt-4 text-[11px] text-muted-foreground font-medium"
            >
              <ShieldCheck
                class={cn(
                  "size-3.5",
                  selectedCurrency.code === "NGN"
                    ? "text-emerald-500"
                    : "text-blue-500",
                )}
              />
              Secured & Encrypted by {selectedCurrency.code === "NGN"
                ? "Paystack"
                : "Flutterwave"}
            </div>
          </div>
        </form>
      </div>

      <!-- Tier Summary Sidebar -->
      <div class="space-y-6" in:fly={{ x: 20, duration: 600 }}>
        <div
          class="bg-card p-8 rounded-3xl border border-border shadow-xl sticky top-24"
        >
          <Badge
            variant="outline"
            class="bg-primary/5 text-primary border-primary/20 px-3 py-1 mb-6 rounded-full text-[10px] font-bold uppercase tracking-widest"
          >
            Subscription Summary
          </Badge>

          <div class="flex items-center gap-4 mb-6">
            <div
              class="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"
            >
              <Icon class="size-7" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-foreground">
                {selectedTier?.name}
              </h2>
              <p
                class="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase"
              >
                {selectedTier?.tagline}
              </p>
            </div>
          </div>

          <div class="space-y-4 py-6 border-y border-border mb-6">
            <div class="flex justify-between items-center text-sm font-medium">
              <span class="text-muted-foreground">Annual Fee</span>
              <span class="text-foreground font-bold"
                >{selectedTier?.price}</span
              >
            </div>
            <div class="flex justify-between items-center text-sm font-medium">
              <span class="text-muted-foreground">Duration</span>
              <span class="text-foreground font-bold">12 Months</span>
            </div>
            <div
              class="flex justify-between items-center text-sm font-medium pt-2 border-t border-border"
            >
              <span class="text-foreground font-bold">Total Due</span>
              <div class="text-right">
                {#if isFetchingRate && selectedCurrency.code !== "NGN"}
                  <div class="flex items-center gap-2 justify-end">
                    <Loader2 class="size-4 animate-spin text-primary" />
                    <span class="text-sm text-muted-foreground">Converting...</span>
                  </div>
                {:else}
                  <span class="text-primary font-bold text-lg"
                    >{displayPrice}</span
                  >
                {/if}
                {#if selectedCurrency.code !== "NGN" && !isFetchingRate}
                  <p class="text-[10px] text-muted-foreground mt-0.5">
                    Converted from {selectedTier?.price}
                  </p>
                {/if}
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Included Benefits
            </p>
            {#each selectedTier?.features || [] as feature}
              <div class="flex items-start gap-3">
                <div
                  class="size-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"
                >
                  <Check class="size-3" />
                </div>
                <span class="text-sm text-foreground font-medium leading-tight"
                  >{feature.text}</span
                >
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
