<script lang="ts">
  import type { iScore, iChild } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import {
    Calendar,
    FileText,
    Trophy,
    Target,
    User as UserIcon,
    Calculator,
  } from "@lucide/svelte";
  import { format } from "date-fns";
  import * as Drawer from "$lib/components/ui/drawer";
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

<Drawer.Root bind:open {onOpenChange}>
  <Drawer.Content class="max-h-[90vh]">
    <Drawer.Header class="border-b">
      <div class="flex items-center gap-3">
        {#if child?.image && typeof child.image === "object"}
          <img
            src={child.image.url}
            alt={child.name}
            class="h-16 w-16 rounded-full object-cover"
          />
        {:else}
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-muted"
          >
            <span class="text-3xl">👤</span>
          </div>
        {/if}
        <div>
          <Drawer.Title class="text-xl"
            >{child?.name || "Unknown Child"}</Drawer.Title
          >
          <Drawer.Description>
            {score.scoreType}
          </Drawer.Description>
        </div>
      </div>
    </Drawer.Header>

    <!-- Content -->
    <div class="space-y-4 overflow-y-auto p-4">
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
      <div class="space-y-3">
        <div class="flex items-start gap-3">
          <Calendar class="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p class="text-sm font-medium">Submission Date</p>
            <p class="text-sm text-muted-foreground">
              {format(new Date(score.submissionDate), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>

        {#if score.notes}
          <div class="flex items-start gap-3">
            <FileText class="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p class="text-sm font-medium">Notes</p>
              <p class="text-sm text-muted-foreground whitespace-pre-wrap">
                {score.notes}
              </p>
            </div>
          </div>
        {/if}
      </div>

      <!-- Child Info Summary -->
      {#if child}
        <div class="rounded-lg border p-4 bg-muted/30">
          <h3 class="mb-2 font-semibold flex items-center gap-2 text-sm">
            <UserIcon class="h-4 w-4" />
            Child Details
          </h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-muted-foreground">Age Group:</span>
              <span class="font-medium ml-1">{child.ageGroup || "N/A"}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Gender:</span>
              <span class="font-medium ml-1 capitalize"
                >{child.gender || "N/A"}</span
              >
            </div>
          </div>
        </div>
      {/if}
    </div>

    <Drawer.Footer class="border-t">
      {#if editors.includes(user.role as Role)}
        <div class="flex gap-2">
          <Button variant="outline" class="flex-1" onclick={onEdit}>Edit</Button
          >
          <Button variant="destructive" class="flex-1" onclick={onDelete}>
            Delete
          </Button>
        </div>
      {:else}
        <Button variant="outline" class="flex-1" onclick={() => (open = false)}>
          Close
        </Button>
      {/if}
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
