<script lang="ts">
  import type { iScore, iChild } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Calendar, FileText, Trophy, X } from "@lucide/svelte";
  import { format } from "date-fns";
  import * as Dialog from "$lib/components/ui/dialog";
  import { cn } from "$lib/utils";
  import { editors, Role, ScoreTypes } from "$lib/constants";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";

  interface Props {
    score: iScore;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
  }

  let {
    score,
    open = $bindable(),
    onOpenChange,
    onEdit,
    onDelete,
  }: Props = $props();

  const user = page.data.user as User;
  const child = score.child as iChild;

  const getScoreColor = (type: string) => {
    switch (type) {
      case ScoreTypes.BIBLE_WRITING:
        return "bg-blue-500";
      case ScoreTypes.BIBLE_STUDY_TEST:
        return "bg-green-500";
      case ScoreTypes.ENTREPRENEURIAL_CLASS:
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };
</script>

<Dialog.Root bind:open {onOpenChange}>
  <Dialog.Content class="sm:max-w-[500px]">
    <Dialog.Header>
      <div class="flex items-center gap-4">
        {#if child?.image && typeof child.image === "object"}
          <img
            src={child.image.url}
            alt={child.name}
            class="h-16 w-16 rounded-full object-cover border-2 border-background shadow-sm"
          />
        {:else}
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-muted border-2 border-background shadow-sm"
          >
            <span class="text-3xl">👤</span>
          </div>
        {/if}
        <div>
          <Dialog.Title class="text-xl"
            >{child?.name || "Unknown Child"}</Dialog.Title
          >
          <Dialog.Description>
            {score.scoreType}
          </Dialog.Description>
        </div>
      </div>
    </Dialog.Header>

    <div class="grid gap-4 py-4">
      <!-- Score Card -->
      <div class="rounded-xl border bg-card p-4 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold flex items-center gap-2">
            <Trophy class="h-5 w-5 text-yellow-500" />
            Performance
          </h3>
          <Badge class={cn(getScoreColor(score.scoreType), "text-white")}>
            {score.scoreType}
          </Badge>
        </div>

        <div class="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          {#if score.scoreType === ScoreTypes.BIBLE_WRITING}
            <div class="space-y-1">
              <p class="text-xs text-muted-foreground uppercase">Verses</p>
              <p class="text-xl font-bold">{Math.floor(score.points / 5)}</p>
            </div>
          {/if}
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground uppercase">Points</p>
            <p class="text-xl font-bold">{score.points}</p>
          </div>
          <div class="space-y-1 border-x sm:border-x">
            <p class="text-xs text-muted-foreground uppercase">Age</p>
            <p class="text-xl font-bold">{score.ageAtSubmission.toFixed(1)}</p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground uppercase">Score</p>
            <p class="text-xl font-bold text-primary">
              {score.normalizedScore.toFixed(2)}
            </p>
          </div>
        </div>

        <div
          class="mt-4 text-xs text-center text-muted-foreground bg-muted/50 p-2 rounded-lg"
        >
          Normalized Score = Points ({score.points}) ÷ Age ({score.ageAtSubmission.toFixed(
            1,
          )})
        </div>
      </div>

      <!-- Details -->
      <div class="grid gap-2">
        <div class="flex items-center gap-2 text-sm">
          <Calendar class="h-4 w-4 text-muted-foreground" />
          <span class="font-medium">Date:</span>
          <span>{format(new Date(score.submissionDate), "MMMM dd, yyyy")}</span>
        </div>

        {#if score.notes}
          <div class="flex items-start gap-2 text-sm">
            <FileText class="h-4 w-4 text-muted-foreground mt-0.5" />
            <span class="font-medium">Notes:</span>
            <span class="text-muted-foreground">{score.notes}</span>
          </div>
        {/if}
      </div>
    </div>

    <Dialog.Footer>
      {#if editors.includes(user.role as Role)}
        <Button variant="outline" onclick={onEdit}>Edit</Button>
        <Button variant="destructive" onclick={onDelete}>Delete</Button>
      {:else}
        <Button variant="outline" onclick={() => (open = false)}>Close</Button>
      {/if}
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
