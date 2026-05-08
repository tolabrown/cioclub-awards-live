<script lang="ts">
  import type { iMemory } from "$lib/interface";
  import { Calendar, MapPin, Image as ImageIcon } from "@lucide/svelte";
  import { format } from "date-fns";

  interface Props {
    memory: iMemory & { mediaCount?: number };
    columns: number;
    onClick: () => void;
  }

  let { memory, columns, onClick }: Props = $props();

  const coverUrl = $derived(
    memory.coverImage && typeof memory.coverImage === "object"
      ? memory.coverImage.url
      : "",
  );

  const formattedDate = $derived(
    memory.date ? format(new Date(memory.date), "do MMM, yyyy") : "",
  );
</script>

<button
  onclick={onClick}
  class="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md text-left w-full"
  class:aspect-video={columns === 1}
  class:aspect-square={columns === 2}
>
  <div class="relative flex-1 overflow-hidden">
    {#if coverUrl}
      <img
        src={coverUrl}
        alt={memory.name}
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    {:else}
      <div class="flex h-full w-full items-center justify-center bg-muted">
        <ImageIcon class="h-10 w-10 text-muted-foreground/20" />
      </div>
    {/if}

    <!-- Overlay Gradient -->
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
    ></div>

    <!-- Content -->
    <div class="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
      <div class="flex items-center gap-2 mb-1">
        <span
          class="text-xs font-medium text-white/90 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/10"
        >
          {memory.mediaCount || 0} Memories
        </span>
      </div>
      <h3
        class="font-bold leading-tight group-hover:text-primary transition-colors"
        class:text-lg={columns === 1}
        class:text-sm={columns === 2}
      >
        {memory.name}
      </h3>
      <div
        class="mt-1 flex items-center gap-3 text-[10px] sm:text-xs opacity-80"
        class:hidden={columns === 2}
      >
        {#if formattedDate}
          <div class="flex items-center gap-1">
            <Calendar class="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
        {/if}
        {#if memory.location}
          <div class="flex items-center gap-1">
            <MapPin class="h-3 w-3" />
            <span class="truncate max-w-[100px]">{memory.location}</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
</button>
