<script lang="ts">
  import type { iMeeting } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { format } from "date-fns";
  import { cn } from "$lib/utils";
  import { Calendar, Clock } from "@lucide/svelte";
  import { getFormattedDateAndTime } from "$lib/fxns";

  interface Props {
    meeting: iMeeting;
    onClick: () => void;
    columns?: number;
  }

  let { meeting, onClick, columns = 2 }: Props = $props();

  const formatted = $derived(
    meeting.datetime ? getFormattedDateAndTime(meeting.datetime) : { date: "N/A", time: "N/A" },
  );

  const getMeetingTypeColor = (type?: string) => {
    const hash =
      type?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    const colors = [
      "bg-purple-500/10 text-purple-500 border-purple-200",
      "bg-orange-500/10 text-orange-500 border-orange-200",
      "bg-cyan-500/10 text-cyan-500 border-cyan-200",
      "bg-emerald-500/10 text-emerald-500 border-emerald-200",
      "bg-red-500/10 text-red-500 border-red-200",
      "bg-blue-500/10 text-blue-500 border-blue-200",
      "bg-pink-500/10 text-pink-500 border-pink-200",
    ];
    return colors[hash % colors.length];
  };
</script>

<button
  onclick={onClick}
  class={cn(
    "group relative overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
    columns === 1
      ? "flex flex-row h-32 sm:h-40"
      : "flex flex-col aspect-square w-full",
  )}
>
  <!-- Image Section -->
  <div
    class={cn(
      "relative overflow-hidden bg-muted",
      columns === 1 ? "w-1/3 sm:w-40 h-full shrink-0" : "w-full h-full",
    )}
  >
    {#if (meeting as any).image?.url}
      <img
        src={(meeting as any).image.url}
        alt={meeting.type}
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    {:else}
      <div
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5"
      >
        <Calendar class="h-10 w-10 text-primary/40" />
      </div>
    {/if}

    <!-- Gradient Overlay for 2-column mode text readability -->
    {#if columns !== 1}
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
      ></div>
    {/if}
  </div>

  <!-- Content Section -->
  <div
    class={cn(
      "flex flex-col justify-center",
      columns === 1
        ? "flex-1 p-4 bg-gradient-to-br from-card to-card/50"
        : "absolute bottom-0 left-0 w-full p-3",
    )}
  >
    <div class="">
      <h3
        class={cn(
          "font-bold leading-tight line-clamp-1",
          columns === 1 ? "text-lg text-foreground" : "text-base text-white",
        )}
      >
        {meeting.type}
      </h3>

      {#if columns === 1}
        <div class="flex flex-wrap gap-2 mt-2">
          <Badge
            variant="outline"
            class={cn("text-xs border", getMeetingTypeColor(meeting.type))}
          >
            {meeting.type}
          </Badge>
          <Badge variant="secondary" class="text-xs">
            <Calendar class="mr-1 h-3 w-3" />
            {formatted.date}
          </Badge>
          <Badge variant="secondary" class="text-xs">
            <Clock class="mr-1 h-3 w-3" />
            {formatted.time}
          </Badge>
        </div>
      {:else}
        <div class="flex flex-col gap-1 mt-1">
          <div class="flex items-center gap-1.5 text-xs text-white/90">
            <Calendar class="h-3 w-3" />
            <span>{formatted.date}</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-white/80">
            <Clock class="h-3 w-3" />
            <span>{formatted.time}</span>
          </div>
        </div>
      {/if}
    </div>
  </div>
</button>
