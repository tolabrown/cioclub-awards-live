<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import {
    RadioGroup,
    RadioGroupItem,
  } from "$lib/components/ui/radio-group/index.js";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import JumiaLogo from "$lib/components/icons/JumiaLogo.svelte";
  import { browser } from "$app/environment";
  import {
    Check,
    ArrowRight,
    ArrowLeft,
    Info,
    MapPin,
    ChevronDown,
    ChevronUp,
    Truck,
    Loader2,
  } from "@lucide/svelte";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { cn } from "$lib/utils";
  import { fade, slide } from "svelte/transition";

  interface Props {
    open: boolean;
    zones: any[];
    onSelect: (data: {
      zoneId: string;
      city: string;
      size: "small" | "medium" | "large";
    }) => void;
    onClose: () => void;
  }

  let { open = $bindable(), zones, onSelect, onClose }: Props = $props();

  let isMobile = $state(false);
  let step = $state(1); // 1: Zone & City, 2: Package Size
  let showGuide = $state(false);

  let selectedZoneId = $state("");
  let selectedCity = $state("");
  let selectedSize = $state<"small" | "medium" | "large">("small");

  const selectedZone = $derived(
    zones.find((z) => z.id.toString() === selectedZoneId),
  );
  const cities = $derived(
    selectedZone
      ? selectedZone.cities.split(",").map((c: any) => c.trim())
      : [],
  );
  const cityOptions = $derived(
    cities.map((c: any) => ({ label: c, value: c })),
  );
  const zoneOptions = $derived(
    zones.map((z) => ({ label: z.zone, value: z.id.toString() })),
  );

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

  function handleNext() {
    if (step === 1 && selectedZoneId && selectedCity) {
      step = 2;
    } else if (step === 2) {
      onSelect({
        zoneId: selectedZoneId,
        city: selectedCity,
        size: selectedSize,
      });
      open = false;
      step = 1;
    }
  }

  function handleBack() {
    if (step === 2) step = 1;
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      onClose();
      step = 1;
      showGuide = false;
    }
    open = newOpen;
  }

  const sizes = [
    { id: "small", name: "Small", desc: "Up to 2kg (e.g., Phones, Shoes)" },
    {
      id: "medium",
      name: "Medium",
      desc: "2kg - 10kg (e.g., Laptops, Blenders)",
    },
    { id: "large", name: "Large", desc: "Over 10kg (e.g., Fridges, TVs)" },
  ];
</script>

{#snippet coverageGuide()}
  <div
    class="mt-2 overflow-hidden rounded-2xl border-2 border-primary/20 bg-primary/5 transition-all duration-500 shadow-inner"
    transition:slide
  >
    <div
      class="flex items-center gap-3 bg-primary/10 px-4 py-2.5 border-b border-primary/10"
    >
      <MapPin class="h-4 w-4 text-primary" />
      <h4
        class="text-[10px] font-bold uppercase tracking-[0.15em] text-primary"
      >
        Coverage Directory
      </h4>
    </div>
    <div
      class="grid grid-cols-1 gap-2 p-3 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20"
    >
      {#if zones && zones.length > 0}
        {#each zones as zone}
          <div
            class="group flex flex-col gap-1 rounded-xl bg-white/60 dark:bg-slate-900/60 p-3 border border-primary/5 transition-colors hover:border-primary/20"
          >
            <div class="flex items-center justify-between">
              <p
                class="text-[10px] font-bold uppercase tracking-tight text-foreground"
              >
                {zone.zone}
              </p>
              <Badge
                variant="outline"
                class="h-4 px-1.5 text-[8px] font-bold uppercase border-primary/20 text-primary"
                >Active</Badge
              >
            </div>
            <p
              class="text-[9px] leading-relaxed text-muted-foreground italic font-medium"
            >
              {zone.cities}
            </p>
          </div>
        {/each}
      {:else}
        <div class="py-6 text-center">
          <Loader2 class="h-5 w-5 animate-spin text-primary/40 mx-auto mb-2" />
          <p
            class="text-[10px] text-muted-foreground font-bold uppercase tracking-widest"
          >
            Syncing Zone Data...
          </p>
        </div>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet content()}
  <div class="space-y-5">
    <!-- Origin Note -->
    <div
      class="flex items-center gap-3 rounded-xl bg-slate-900 px-3 py-2 text-white shadow-lg shadow-slate-900/10"
    >
      <Truck class="h-4 w-4 text-primary shrink-0" />
      <p class="text-[10px] font-medium leading-tight">
        All items ship from our <b
          class="text-primary uppercase tracking-tighter">Lagos (Zone 1)</b
        > hub by default.
      </p>
    </div>

    <!-- Progress Indicator -->
    <div class="flex items-center gap-2">
      <div
        class={cn(
          "h-1.5 flex-1 rounded-full transition-all duration-500",
          step >= 1 ? "bg-primary w-full" : "bg-muted",
        )}
      ></div>
      <div
        class={cn(
          "h-1.5 flex-1 rounded-full transition-all duration-500",
          step >= 2 ? "bg-primary w-full" : "bg-muted",
        )}
      ></div>
    </div>

    {#if step === 1}
      <div in:fade={{ duration: 200 }} class="space-y-5">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <div class="h-7 w-1 bg-primary rounded-full"></div>
            <Label
              class="text-[11px] font-bold uppercase tracking-widest text-foreground"
            >
              Delivery Destination
            </Label>
          </div>
          <button
            onclick={() => (showGuide = !showGuide)}
            class="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest border border-border/50"
          >
            {showGuide ? "Hide Zones" : "Show Zones"}
            {#if showGuide}
              <ChevronUp class="h-3.5 w-3.5" />
            {:else}
              <ChevronDown class="h-3.5 w-3.5" />
            {/if}
          </button>
        </div>

        {#if showGuide}
          {@render coverageGuide()}
        {/if}

        <div class="grid gap-4">
          <div class="space-y-2 w-full">
            <Label
              class="text-xs font-bold text-foreground focus-within:text-primary transition-colors"
              >Select Region</Label
            >
            <SelectComponent
              options={zoneOptions}
              bind:value={selectedZoneId}
              name="zone"
              placeholder="Searching for your region..."
              class="h-12 rounded-xl bg-muted/30 border-none font-bold w-full"
            />
          </div>

          {#if selectedZoneId}
            <div in:slide class="space-y-2 w-full">
              <Label class="text-xs font-bold text-foreground"
                >Select City</Label
              >
              <SelectComponent
                options={cityOptions}
                bind:value={selectedCity}
                name="city"
                placeholder="Where should we deliver?"
                class="h-12 rounded-xl bg-muted/30 border-none font-bold w-full"
              />
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div in:fade={{ duration: 200 }} class="space-y-4">
        <div class="flex items-center gap-2">
          <div class="h-7 w-1 bg-primary rounded-full"></div>
          <Label
            class="text-[11px] font-bold uppercase tracking-widest text-foreground"
          >
            Package Dimension
          </Label>
        </div>
        <RadioGroup bind:value={selectedSize} class="grid gap-3">
          {#each sizes as size}
            <Label
              for={size.id}
              class={cn(
                "flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 transition-all hover:bg-accent/5",
                selectedSize === size.id
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                  : "border-border/50 bg-white dark:bg-slate-900/50 hover:border-border",
              )}
            >
              <RadioGroupItem value={size.id} id={size.id} class="mt-1" />
              <div class="flex-1 space-y-1">
                <p class="text-sm font-bold leading-none tracking-tight">
                  {size.name}
                </p>
                <p
                  class="text-[11px] leading-relaxed text-muted-foreground font-medium"
                >
                  {size.desc}
                </p>
              </div>
              {#if selectedSize === size.id}
                <div transition:fade>
                  <Check class="h-5 w-5 text-primary" />
                </div>
              {/if}
            </Label>
          {/each}
        </RadioGroup>
      </div>
    {/if}

    <div class="flex items-center justify-between pt-2 gap-4">
      {#if step === 2}
        <button
          onclick={handleBack}
          class="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Back
        </button>
      {:else}
        <div></div>
      {/if}

      <Button
        onclick={handleNext}
        disabled={step === 1 && (!selectedZoneId || !selectedCity)}
        class="flex-1 rounded-xl shadow-xl shadow-primary/20"
      >
        {step === 2 ? "Calculate & Apply" : "Next Step"}
        <ArrowRight class="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
{/snippet}

{#if !isMobile}
  {#if Dialog}
      <Dialog.Root {open} onOpenChange={handleOpenChange}>
      <Dialog.Content
        class="sm:max-w-[440px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden"
      >
        <div class="bg-card p-8">
          <Dialog.Header class="mb-6">
            <div class="flex items-center gap-3 mb-3">
              <JumiaLogo class="h-6 !w-[40%]" />
              <div class="h-6 w-px bg-border"></div>
              <Dialog.Title class="text-2xl font-bold tracking-tight"
                >Shipping</Dialog.Title
              >
            </div>
            <Dialog.Description class="text-sm font-medium text-muted-foreground">
              Get an accurate delivery cost based on your location and package
              size.
            </Dialog.Description>
          </Dialog.Header>
          {@render content()}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  {/if}
{:else}
  {#if browser && Drawer}
    <Drawer.Root {open} onOpenChange={handleOpenChange}>
      <Drawer.Content class="rounded-t-[2.5rem] bg-card max-h-[96%]">
        <div class="mx-auto mt-2 h-1.5 w-12 rounded-full bg-muted/40"></div>

        <div class="flex flex-col h-full overflow-hidden">
          <Drawer.Header class="text-left px-8 pt-6 pb-2">
            <div class="flex items-center gap-3 mb-2">
              <JumiaLogo class="h-7 !w-[40%]" />
              <div class="h-5 w-px bg-border"></div>
              <Drawer.Title class="text-xl font-bold tracking-tight"
                >Shipping</Drawer.Title
              >
            </div>
            <Drawer.Description
              class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
            >
              Step {step} of 2 • {step === 1 ? "Location" : "Dimensions"}
            </Drawer.Description>
          </Drawer.Header>

          <div class="flex-1 overflow-y-auto px-8 py-4 scrollbar-hide">
            {@render content()}
          </div>

          <div
            class="px-8 pb-10 pt-4 bg-gradient-to-t from-card via-card to-transparent"
          >
            <!-- The Next Step button is handled inside the content() snippet's footer for desktop, 
                 but for mobile we might want a fixed footer if content scrolls. 
                 However, I've made the middle scrollable so the button inside content() will stay at the end 
                 of the scroll unless I pull it out. 
                 Let's move the navigation buttons out of content() into a proper footer for consistent UX. 
            -->
          </div>
        </div>
      </Drawer.Content>
    </Drawer.Root>
  {/if}
{/if}
