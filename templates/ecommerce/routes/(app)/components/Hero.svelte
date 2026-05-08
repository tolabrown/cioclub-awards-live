<script lang="ts">
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import {
    ArrowRight,
    CheckCircle,
    Star,
    ShieldCheck,
    Truck,
    Store,
    Sparkles,
    Search,
  } from "@lucide/svelte";
  import { goto } from "$app/navigation";

  const { categories = [] } = $props();
  const settings = $derived(page.data.settings);

  let searchQuery = $state("");

  const handleSearch = (e: SubmitEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      goto(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
</script>

<section
  class="relative aspect-[340/640] w-full overflow-hidden sm:aspect-[340/488] md:aspect-[768/472] lg:aspect-[1024/520] xl:aspect-[1440/600] shadow-lg"
>
  <!-- Background image -->
  <div class="absolute inset-0">
    <img
      src={settings?.heroImage?.url || "/background.webp"}
      alt={settings?.storeName || "Store Background"}
      class="h-full w-full object-cover"
    />
    <!-- Thematic overlays -->
    <div class="absolute inset-0 bg-black/70 dark:bg-background/80"></div>
    <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-background/20"
    ></div>
  </div>

  <!-- Content -->
  <div
    class="absolute inset-0 z-10 mx-auto flex flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8"
  >
    <div
      class="flex flex-col gap-4 md:gap-6 animate-in fade-in zoom-in duration-700"
    >
      <!-- Trust badge -->
      <div
        class="inline-flex items-center gap-2 self-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md"
      >
        <span class="relative flex h-2 w-2">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
          ></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-primary"
          ></span>
        </span>
        🇳🇬 Trusted by 50,000+ Nigerians
      </div>

      <h1
        class="animate-float text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl"
      >
        {settings?.heroTitle || "Premium Care for"}
        <span
          class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          >{settings?.heroSubtitle || "You & Your Little One"}</span
        >
      </h1>

      <p class="mx-auto max-w-2xl text-lg text-white/90 md:text-xl font-medium">
        {settings?.heroDescription ||
          "Discover our curated collection of luxury baby essentials and high-end health & beauty products designed for ultimate wellness and comfort."}
      </p>

      <!-- Search Widget (hidden on mobile, uses bottom nav instead) -->
      <form
        onsubmit={handleSearch}
        class="hidden sm:flex w-full max-w-xl mx-auto items-center gap-2 pt-4"
      >
        <div class="relative flex-1">
          <Search
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white"
          />
          <Input
            type="search"
            placeholder="Search for baby essentials, beauty products..."
            bind:value={searchQuery}
            class="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <!-- CTA buttons -->
      <div class="flex flex-col justify-center gap-4 sm:flex-row pt-2">
        <Button
          href="/products"
          class="group rounded-xl px-10 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          Explore Collection
          <ArrowRight
            class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
          />
        </Button>
        <Button
          href="/categories"
          variant="outline"
          class="rounded-xl border-white/20 px-10 font-bold text-white shadow-lg dark:backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white bg-transparent"
        >
          Browse Categories
        </Button>
      </div>

      <!-- Trust indicators -->
      <div
        class="flex flex-wrap items-center justify-center gap-2 md:gap-6 pt-2 md:pt-6 text-sm font-medium text-white/80"
      >
        <div class="flex items-center gap-2">
          <Truck class="h-4 w-4 text-primary" />
          <span>Free Shipping</span>
        </div>
        <div class="flex items-center gap-2">
          <ShieldCheck class="h-4 w-4 text-primary" />
          <span>Secure Payment</span>
        </div>
        <div class="flex items-center gap-2">
          <Store class="h-4 w-4 text-primary" />
          <span>Official Store</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex gap-0.5">
            {#each [1, 2, 3, 4, 5] as _}
              <Star class="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {/each}
          </div>
          <span class="ml-1 text-white font-bold">4.9/5 Rating</span>
        </div>
      </div>
    </div>
  </div>
</section>
