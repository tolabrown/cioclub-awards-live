<script lang="ts">
  import type { iAttendee, iChild, iMeeting } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { Calendar, Users, ChevronRight } from "@lucide/svelte";
  import { format } from "date-fns";
  import { cn } from "$lib/utils";

  interface Props {
    attendee: iAttendee;
    onClick: () => void;
    columns?: number;
  }

  let { attendee, onClick, columns = 2 }: Props = $props();

  const child = attendee.child as iChild;
  const meeting = attendee.meeting as iMeeting;

  const getMeetingColor = (type?: string) => {
    const hash =
      type?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    const colors = [
      "from-purple-500 to-purple-600",
      "from-orange-500 to-orange-600",
      "from-cyan-500 to-cyan-600",
      "from-emerald-500 to-emerald-600",
      "from-red-500 to-red-600",
      "from-blue-500 to-blue-600",
      "from-pink-500 to-pink-600",
    ];
    return colors[hash % colors.length];
  };

  const getMeetingBadgeColor = (type?: string) => {
    const hash =
      type?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    const colors = [
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
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
    {#if child?.image && typeof child.image === "object"}
      <img
        src={child.image.url}
        alt={child.name}
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    {:else}
      <div
        class="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800"
      >
        <span class="text-4xl">👤</span>
      </div>
    {/if}

    <!-- Gradient Overlay for 2-column mode text readability -->
    {#if columns !== 1}
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
      ></div>
    {/if}

    <!-- Meeting Type Indicator (Top Right/Overlay) -->
    <div class="absolute top-2 right-2">
      {#if columns === 1}
        <!-- In 1-col, maybe simpler? stick to text side. leaving empty for now or put badge elsewhere -->
      {:else}
        <Badge
          variant="outline"
          class={cn(
            "border-0 text-[10px] px-2 py-0.5 backdrop-blur-md bg-white/20 text-white",
            getMeetingColor(meeting?.type),
          )}
        >
          {meeting?.type || "Meeting"}
        </Badge>
      {/if}
    </div>
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
    <div class="w-full">
      <h3
        class={cn(
          "font-bold leading-tight line-clamp-1",
          columns === 1 ? "text-lg text-foreground" : "text-lg text-white",
        )}
      >
        {child?.name || "Unknown"}
      </h3>

      {#if columns === 1}
        <!-- 1 Column Layout Details -->
        <div class="mt-2 flex flex-col gap-2">
          <div class="flex flex-col gap-2">
            <Badge
              variant="outline"
              class={cn("border-0", getMeetingBadgeColor(meeting?.type))}
            >
              {meeting?.type || "Meeting"}
            </Badge>
            <span class="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar class="h-3 w-3" />
              {meeting?.datetime
                ? format(new Date(meeting.datetime), "MMM dd, yyyy")
                : "N/A"}
            </span>
          </div>
          {#if attendee.notes}
            <p class="text-xs text-muted-foreground line-clamp-1 italic">
              "{attendee.notes}"
            </p>
          {/if}
        </div>
      {:else}
        <!-- 2 Column Layout Details (Minimal overlay) -->
        <div class="flex items-center gap-2 mt-1">
          <span class="text-xs text-white/80 flex items-center gap-1">
            <Calendar class="h-3 w-3" />
            {meeting?.datetime
              ? format(new Date(meeting.datetime), "MMM dd")
              : "N/A"}
          </span>
        </div>
      {/if}
    </div>
  </div>
</button>
