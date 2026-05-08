<script lang="ts">
  import { TableCell, TableRow } from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Eye, Calendar, Trophy, Trash2, Loader2 } from "@lucide/svelte";
  import { format } from "date-fns";
  import type { iScore, iChild } from "$lib/interface";
  import { cn } from "$lib/utils";
  import { ScoreTypes, adminAndTeachersRoles, Role } from "$lib/constants";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";

  interface Props {
    score: iScore;
    index: number;
    onClick: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
  }

  let { score, index, onClick, onDelete, isDeleting = false }: Props = $props();

  const user = page.data.user as User;

  const child = score.child as iChild;

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

<TableRow class="cursor-pointer hover:bg-muted/50" onclick={onClick}>
  <TableCell class="font-medium">{index + 1}.</TableCell>
  <TableCell class="font-medium">
    <div class="flex items-center gap-2">
      <!-- Avatar -->
      {#if child?.image && typeof child.image === "object"}
        <img
          src={child.image.url}
          alt={child.name}
          class="h-10 w-10 rounded-full object-cover border-2 border-background"
        />
      {:else}
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-muted border-2 border-background"
        >
          <span class="text-lg">👤</span>
        </div>
      {/if}
      <div>
        <div class="font-semibold">{child?.name || "Unknown Child"}</div>
        <div class="text-xs text-muted-foreground">
          Age: {score.ageAtSubmission.toFixed(1)} years
        </div>
      </div>
    </div>
  </TableCell>
  <TableCell>
    <Badge
      variant="outline"
      class={cn("border-0", getScoreBadgeColor(score.scoreType))}
    >
      {score.scoreType}
    </Badge>
  </TableCell>
  <TableCell>
    <div class="flex items-center gap-1 text-sm">
      <Calendar class="h-3 w-3 text-muted-foreground" />
      {format(new Date(score.submissionDate), "MMM dd, yyyy")}
    </div>
  </TableCell>
  <TableCell>
    <div class="flex items-center gap-2">
      <div class="text-right">
        <div class="text-xs text-muted-foreground">Points</div>
        <div class="font-semibold">{score.points}</div>
      </div>
      <div class="h-8 w-px bg-border"></div>
      <div class="text-right">
        <div class="text-xs text-muted-foreground">Normalized</div>
        <div class="flex items-center gap-1 font-bold text-primary">
          {score.normalizedScore.toFixed(2)}
          <Trophy class="h-3 w-3 text-yellow-500" />
        </div>
      </div>
    </div>
  </TableCell>
  <!-- <TableCell>
    <div class="text-sm text-muted-foreground">
      {score.notes || "-"}
    </div>
  </TableCell> -->
  <TableCell class="text-right">
    <div class="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="sm"
        onclick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        class="h-8 w-8 p-0"
      >
        <Eye class="h-4 w-4" />
      </Button>
      {#if adminAndTeachersRoles.includes(user.role as Role)}
        <Button
          variant="ghost"
          size="sm"
          onclick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          class="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={isDeleting}
        >
          {#if isDeleting}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else}
            <Trash2 class="h-4 w-4" />
          {/if}
        </Button>
      {/if}
    </div>
  </TableCell>
</TableRow>
