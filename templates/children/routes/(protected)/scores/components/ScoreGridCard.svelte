<script lang="ts">
  import type { iScore, iChild } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Calendar, Trophy, Trash2, Loader2 } from "@lucide/svelte";
  import { format } from "date-fns";
  import { cn } from "$lib/utils";
  import { ScoreTypes, adminAndTeachersRoles, Role } from "$lib/constants";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";

  interface Props {
    score: iScore;
    onClick: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
    columns?: number;
  }

  let {
    score,
    onClick,
    onDelete,
    isDeleting = false,
    columns = 2,
  }: Props = $props();

  const user = page.data.user as User;

  const child = score.child as iChild;

  const getScoreColor = (type: string) => {
    switch (type) {
      case ScoreTypes.BIBLE_WRITING:
        return "from-blue-500 to-blue-600";
      case ScoreTypes.BIBLE_STUDY_TEST:
        return "from-green-500 to-green-600";
      case ScoreTypes.ENTREPRENEURIAL_CLASS:
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getScoreBadgeColor = (type: string) => {
    switch (type) {
      case ScoreTypes.BIBLE_WRITING:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case ScoreTypes.BIBLE_STUDY_TEST:
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case ScoreTypes.ENTREPRENEURIAL_CLASS:
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
</script>

<button
  class={cn(
    "group relative overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
    columns === 1
      ? "flex flex-row h-32 sm:h-40 w-full"
      : "flex flex-col aspect-square w-full",
  )}
  onclick={onClick}
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

    <!-- Gradient Header (Only in 2-col overlay or distinct part?) -->
    <!-- In 1-col we might not need the top strip, or we can keep it inside content. 
         Let's stick to the overlay badge style for 2-col from AttendeeCard. -->

    <div class="absolute top-2 right-2">
      <Badge
        variant="outline"
        class={cn(
          "border-0 text-[10px] px-2 py-0.5 backdrop-blur-md",
          columns === 1
            ? getScoreBadgeColor(score.scoreType)
            : "bg-white/20 text-white",
        )}
      >
        {score.scoreType}
      </Badge>
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
        {child?.name || "Unknown Child"}
      </h3>

      {#if columns === 1}
        <div class="mt-2 flex flex-col gap-2">
          <span class="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar class="h-3 w-3" />
            {format(new Date(score.submissionDate), "MMM dd, yyyy")}
          </span>
          <div
            class="flex items-center gap-1 text-lg font-bold leading-none text-primary mt-1"
          >
            {score.normalizedScore.toFixed(2)}
            <Trophy class="h-3 w-3 text-yellow-500" />
          </div>
        </div>
      {:else}
        <!-- 2 Column Overlay -->
        <div class="flex items-center justify-between mt-1">
          <span class="text-xs text-white/80 flex items-center gap-1">
            <Calendar class="h-3 w-3" />
            {format(new Date(score.submissionDate), "MMM dd")}
          </span>
          <div class="flex items-center gap-1 text-sm font-bold text-white">
            {score.normalizedScore.toFixed(1)}
            <Trophy class="h-3 w-3 text-yellow-500" />
          </div>
        </div>
      {/if}
    </div>

    <!-- Actions (Delete) - Only readable/clickable easily in 1-col or via long press? 
         User asked for mobile cards similar to attendees page. 
         Attendee grid card didn't have delete button on the card face in my previous edit.
         But ScoreGridCard had it. I will keep it for 1-col, maybe hide for 2-col to avoid clutter/misclicks?
         Or put it top-left for 2-col. let's hide for 2-col to follow "clean overlay" style. -->
    {#if columns === 1 && adminAndTeachersRoles.includes(user.role as Role)}
      <div class="absolute bottom-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onclick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
        >
          {#if isDeleting}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else}
            <Trash2 class="h-4 w-4" />
          {/if}
        </Button>
      </div>
    {/if}
  </div>
</button>
