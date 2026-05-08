<script lang="ts">
  import type { iFile } from "$lib/interface";
  import GalleryOverlay from "./GalleryOverlay.svelte";

  interface Props {
    images: iFile[];
  }

  let { images }: Props = $props();

  let selectedIndex = $state<number | null>(null);

  // Helper to determine span based on index for the classic bento effect
  const getSpan = (index: number) => {
    const patterns = [
      "md:col-span-2 md:row-span-2", // Large
      "md:col-span-1 md:row-span-1", // Small
      "md:col-span-1 md:row-span-2", // Tall
      "md:col-span-1 md:row-span-1", // Small
      "md:col-span-2 md:row-span-1", // Wide
    ];
    return patterns[index % patterns.length];
  };
</script>

<div
  class="grid grid-cols-2 md:grid-cols-4 md:grid-rows-auto gap-4 auto-rows-[200px]"
>
  {#each images as img, i}
    <button
      class="relative overflow-hidden rounded-2xl group {getSpan(
        i,
      )} bg-muted/50 transition-all duration-500 hover:shadow-2xl hover:z-10"
      onclick={() => (selectedIndex = i)}
    >
      <img
        src={img.url}
        alt={img.name || "Memory image"}
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div
        class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4"
      >
        <span
          class="text-white bg-black/40 px-4 py-2 rounded-full text-xs md:text-sm font-semibold backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-xl border border-white/10"
          >View Image</span
        >
      </div>
    </button>
  {/each}
</div>

{#if selectedIndex !== null}
  <GalleryOverlay
    {images}
    startIndex={selectedIndex}
    onClose={() => (selectedIndex = null)}
  />
{/if}
