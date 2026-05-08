<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import ProductCardSkeleton from "./ProductCardSkeleton.svelte";
  import FilterSidebarSkeleton from "./FilterSidebarSkeleton.svelte";
  import { cn } from "$lib/utils.js";

  let { viewMode = "grid" as "grid" | "list" | "box" } = $props();
</script>

<div class="bg-muted/30 min-h-screen">
  <div class="container mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <!-- Sidebar Skeleton (Hidden on mobile) -->
      <div class="hidden lg:block space-y-6">
        <FilterSidebarSkeleton
          class="sticky top-24 h-fit rounded-xl border border-border bg-card p-6 shadow-sm"
        />
      </div>

      <main class="flex flex-col gap-6">
        <!-- Toolbar Skeleton -->
        <div
          class="sticky top-20 z-30 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-lg overflow-hidden"
        >
          <!-- Desktop Toolbar Header (Hidden on Mobile) -->
          <div
            class="hidden lg:flex items-center justify-between border-b border-border p-4 px-6 bg-muted/5"
          >
            <div class="flex items-center gap-3">
              <Skeleton class="h-9 w-9 rounded-xl" />
              <div class="space-y-1.5">
                <Skeleton class="h-5 w-24" />
                <Skeleton class="h-3 w-32" />
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <Skeleton class="h-9 w-9 rounded-lg" />
              <Skeleton class="h-9 w-9 rounded-lg" />
              <Skeleton class="h-9 w-9 rounded-lg" />
            </div>
          </div>

          <!-- Mobile Toolbar (Only Count, Search, Toggle) -->
          <div
            class="flex lg:hidden items-center justify-between gap-3 p-3 pb-3 border-b border-white/5"
          >
            <Skeleton class="h-10 w-24 rounded-xl" />
            <div class="flex items-center gap-2">
              <Skeleton class="h-10 w-10 rounded-xl" />
              <Skeleton class="h-10 w-20 rounded-xl" />
            </div>
          </div>

          <!-- Desktop Search & Sort Row -->
          <div
            class="hidden lg:flex items-center justify-between gap-3 p-3 sm:p-4"
          >
            <Skeleton class="h-11 flex-1 rounded-xl" />
            <div class="flex items-center gap-3">
              <Skeleton class="h-10 w-20 rounded-xl" />
              <Skeleton class="h-11 w-48 rounded-xl" />
            </div>
          </div>
        </div>

        <!-- Grid Skeleton -->
        <div
          class={cn(
            "grid gap-4 md:gap-6 pb-20",
            viewMode === "grid"
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
              : viewMode === "box"
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {#each Array(8) as _}
            <ProductCardSkeleton {viewMode} />
          {/each}
        </div>
      </main>
    </div>
  </div>
</div>
