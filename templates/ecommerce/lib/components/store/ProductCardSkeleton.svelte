<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    viewMode?: "grid" | "list" | "box";
  }

  let { viewMode = "grid" }: Props = $props();
</script>

<div
  class={cn(
    "relative overflow-hidden bg-card rounded-xl border border-border flex flex-col transition-all duration-300",
    viewMode === "list" ? "h-auto" : "h-full",
  )}
>
  <div class={cn("flex flex-1", viewMode === "list" ? "flex-row" : "flex-col")}>
    <!-- Image Skeleton -->
    <div
      class={cn(
        "bg-muted animate-pulse shrink-0",
        viewMode === "list"
          ? "w-28 h-28 sm:w-36 sm:h-36"
          : "aspect-square w-full",
      )}
    ></div>

    <!-- Info Skeleton -->
    <div
      class={cn(
        "flex flex-col flex-1 gap-2",
        viewMode === "list" ? "p-3 justify-center" : "p-2 pb-0",
      )}
    >
      <div class="h-3 w-1/4 bg-muted animate-pulse rounded opacity-70"></div>
      <div class="h-5 w-3/4 bg-muted animate-pulse rounded mt-1"></div>
      <div class="h-7 w-1/2 bg-muted animate-pulse rounded mt-1"></div>

      <!-- Rating/Truck row for list mode -->
      {#if viewMode === "list"}
        <div class="mt-2 flex items-center gap-4">
          <div class="h-4 w-16 bg-muted animate-pulse rounded"></div>
          <div class="h-4 w-16 bg-muted animate-pulse rounded"></div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Action Area: Always below content for list mode on all screen sizes -->
  {#if viewMode === "list"}
    <div
      class="flex items-center gap-3 p-3 bg-muted/5 border-t border-border/50"
    >
      <div class="w-24 h-10 bg-muted animate-pulse rounded-xl"></div>
      <div class="h-10 w-10 bg-muted animate-pulse rounded-xl"></div>
      <div class="h-10 w-10 bg-muted animate-pulse rounded-xl"></div>
    </div>
  {:else}
    <div class="p-2 pt-0 mt-auto">
      <div class="flex items-center justify-between gap-2 p-2">
        <div class="flex gap-2">
          <div class="h-9 w-9 bg-muted animate-pulse rounded-xl"></div>
          <div class="h-9 w-9 bg-muted animate-pulse rounded-xl"></div>
          <div class="h-9 w-9 bg-muted animate-pulse rounded-xl"></div>
        </div>
      </div>
      <div class="h-10 w-full bg-muted animate-pulse rounded-xl mt-1"></div>
    </div>
  {/if}
</div>
