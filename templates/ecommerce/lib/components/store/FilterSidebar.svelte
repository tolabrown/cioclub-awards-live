<script lang="ts">
  import { Label } from "$lib/components/ui/label/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import {
    RadioGroup,
    RadioGroupItem,
  } from "$lib/components/ui/radio-group/index.js";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Trash2, Star, Truck } from "@lucide/svelte";
  import { cn } from "$lib/utils.js";
  import { untrack } from "svelte";

  interface Props {
    class?: string;
    categories: any[];
    tags?: any[];
    selectedCategory?: string;
    selectedTag?: string;
    priceRange: number[];
    rating?: string;
    discountRange?: string;
    onClear: () => void;
  }

  let {
    class: className,
    categories,
    tags = [],
    selectedCategory = $bindable(""),
    selectedTag = $bindable(""),
    priceRange = $bindable(),
    rating = $bindable("0-5"),
    discountRange = $bindable("0-100"),
    onClear,
  }: Props = $props();

  const hasFilters = $derived(
    selectedCategory !== "" ||
      selectedTag !== "" ||
      priceRange[0] > 0 ||
      priceRange[1] < 100000 ||
      rating !== "0-5" ||
      discountRange !== "0-100",
  );

  // Local state for price range to avoid immediate reactive updates
  let localPriceRange = $state([...priceRange]);

  // Sync local price range when the prop changes externally (e.g. on clear)
  // Use untrack on localPriceRange to prevent this effect from running when user drags slider
  $effect(() => {
    const propMin = priceRange[0];
    const propMax = priceRange[1];

    untrack(() => {
      if (localPriceRange[0] !== propMin || localPriceRange[1] !== propMax) {
        localPriceRange = [propMin, propMax];
      }
    });
  });

  const applyPriceFilter = () => {
    priceRange = [...localPriceRange];
  };

  // Show apply button when local differs from prop
  const showApplyButton = $derived(
    localPriceRange[0] !== priceRange[0] ||
      localPriceRange[1] !== priceRange[1],
  );

  const ratingOptions = [
    { value: "0-5", label: "All products", stars: 0 },
    { value: "4-5", label: "4 stars & up", stars: 4 },
    { value: "3-5", label: "3 stars & up", stars: 3 },
    { value: "2-5", label: "2 stars & up", stars: 2 },
    { value: "1-5", label: "1 star & up", stars: 1 },
    { value: "0-0", label: "No rating", stars: 0 },
  ];

  const discountOptions = [
    { value: "0-100", label: "All products" },
    { value: "50-100", label: "50% or more" },
    { value: "40-100", label: "40% or more" },
    { value: "30-100", label: "30% or more" },
    { value: "20-100", label: "20% or more" },
    { value: "10-100", label: "10% or more" },
  ];

  const categoryOptions = $derived(
    categories.map((c) => ({ label: c.name, value: c.id })),
  );
  const tagOptions = $derived(
    tags.map((t) => ({ label: t.name, value: t.id })),
  );
</script>

<aside class={cn("flex flex-col gap-8", className)}>
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold text-foreground">Filters</h2>
    {#if hasFilters}
      <Button
        variant="ghost"
        onclick={onClear}
        size="sm"
        class="h-8 px-2 text-primary hover:text-primary/80 font-bold"
      >
        <Trash2 class="mr-2 h-4 w-4" />
        Clear All
      </Button>
    {/if}
  </div>

  <!-- Categories -->
  <div class="flex flex-col gap-3">
    <Label
      class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
      >Categories</Label
    >
    <SelectComponent
      name="category"
      placeholder="Select Category"
      options={categoryOptions}
      bind:value={selectedCategory}
      class="w-full bg-background font-medium"
    />
  </div>

  <!-- Tag -->
  <div class="flex flex-col gap-3">
    <Label
      class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
      >Tag</Label
    >
    <SelectComponent
      name="tag"
      placeholder="Select Tag"
      options={tagOptions}
      bind:value={selectedTag}
      class="w-full bg-background font-medium"
    />
  </div>

  <!-- Price Range -->
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <Label
        class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >Price Range</Label
      >
    </div>
    <div class="px-2">
      <Slider
        type="multiple"
        bind:value={localPriceRange}
        max={100000}
        step={500}
        class="py-4"
      />
    </div>
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <span
          class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground"
          >₦</span
        >
        <Input
          type="number"
          bind:value={localPriceRange[0]}
          class="pl-7 text-xs font-bold bg-muted/30 border-none h-9"
        />
      </div>
      <div class="h-px w-2 bg-border"></div>
      <div class="relative flex-1">
        <span
          class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground"
          >₦</span
        >
        <Input
          type="number"
          bind:value={localPriceRange[1]}
          class="pl-7 text-xs font-bold bg-muted/30 border-none h-9"
        />
      </div>
    </div>
    {#if showApplyButton}
      <Button
        size="sm"
        class="w-full h-9 font-bold text-xs uppercase tracking-wider bg-primary text-primary-foreground shadow-md animate-in fade-in slide-in-from-bottom-2"
        onclick={applyPriceFilter}
      >
        Apply Price Filter
      </Button>
    {/if}
  </div>

  <!-- Rating -->
  <div class="flex flex-col gap-4">
    <Label
      class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
      >Rating</Label
    >
    <RadioGroup bind:value={rating} class="gap-2">
      {#each ratingOptions as opt}
        <div class="flex items-center space-x-2">
          <RadioGroupItem value={opt.value} id={"rating-" + opt.value} />
          <Label
            for={"rating-" + opt.value}
            class="flex items-center gap-1.5 cursor-pointer text-sm font-medium hover:text-primary transition-colors"
          >
            {#if opt.stars > 0}
              <div class="flex items-center">
                {#each Array(5) as _, i}
                  <Star
                    class={cn(
                      "h-3.5 w-3.5",
                      i < opt.stars
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted",
                    )}
                  />
                {/each}
              </div>
              & up
            {:else}
              {opt.label}
            {/if}
          </Label>
        </div>
      {/each}
    </RadioGroup>
  </div>

  <!-- Discount Percentage -->
  <div class="flex flex-col gap-4">
    <Label
      class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
      >Discount Percentage</Label
    >
    <RadioGroup bind:value={discountRange} class="gap-2">
      {#each discountOptions as opt}
        <div class="flex items-center space-x-2">
          <RadioGroupItem value={opt.value} id={"discount-" + opt.value} />
          <Label
            for={"discount-" + opt.value}
            class="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
          >
            {opt.label}
          </Label>
        </div>
      {/each}
    </RadioGroup>
  </div>
</aside>
