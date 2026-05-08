<script lang="ts">
  import { Star, StarHalf } from "@lucide/svelte";

  interface Props {
    rating: number;
    count?: number;
    showCount?: boolean;
    size?: "sm" | "md" | "lg";
  }

  let { rating, count = 0, showCount = false, size = "sm" }: Props = $props();

  const fullStars = $derived(Math.floor(rating));
  const hasHalfStar = $derived(rating % 1 >= 0.5);
  const emptyStars = $derived(
    Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0)),
  );

  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };
</script>

<div class="flex items-center gap-1.5">
  <div class="flex items-center gap-0.5">
    {#each Array(fullStars) as _}
      <Star class="{sizes[size]} fill-primary text-primary" />
    {/each}
    {#if hasHalfStar}
      <StarHalf class="{sizes[size]} fill-primary text-primary" />
    {/if}
    {#each Array(emptyStars) as _}
      <Star class="{sizes[size]} text-muted-foreground" />
    {/each}
  </div>
  {#if showCount}
    <span class="text-xs font-medium text-muted-foreground">({count})</span>
  {/if}
</div>
