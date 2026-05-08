<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { ScoreTypes } from "$lib/constants";
  import type { iScore, iChild } from "$lib/interface";
  import { Loader2, Check, ChevronsUpDown } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";

  import { onMount } from "svelte";
  import { verses as verseCounts } from "$lib/constants/verses";

  interface Props {
    score?: iScore;
    mode?: "create" | "edit";
    onSuccess?: () => void;
  }

  let { score, mode = "create", onSuccess }: Props = $props();

  let searchResults = $state<iChild[]>([]);
  let isSearching = $state(false);
  let hasSearched = $state(false);

  // Form State
  let childId = $state(
    score?.child
      ? typeof score.child === "string"
        ? score.child
        : score.child.id
      : "",
  );

  // Initialize selectedChild from prop if available as object
  let selectedChild = $state<iChild | null>(
    score?.child && typeof score.child === "object"
      ? (score.child as iChild)
      : null,
  );

  // If we have an ID but no object (e.g. from a refresh or shallow load), we might need to fetch it.
  // However, usually the parent page passes the full object.
  // If not, we can fetch it on mount.
  onMount(async () => {
    if (scoreType === ScoreTypes.BIBLE_WRITING && points > 0) {
      verses = Math.floor(points / 5);
    }

    if (childId && !selectedChild) {
      try {
        const res = await fetch(`/api/children/${childId}`);
        const result = await res.json();
        if (result.data) selectedChild = result.data;
      } catch (error) {
        console.error("Failed to load selected child:", error);
      }
    }
  });

  let bibleRange = $state("");
  let lastExpansion = $state<{ notes: string; verses: number } | null>(null);

  function expandBibleRange() {
    const rangeRegex = /^(.+?)\s+(\d+)\s*-\s*(\d+)$/;
    const singleChapterRegex = /^(.+?)\s+(\d+)$/;
    const trimmedInput = bibleRange.trim();

    const rangeMatch = trimmedInput.match(rangeRegex);
    const singleMatch = trimmedInput.match(singleChapterRegex);

    // Revert last expansion if present
    if (lastExpansion) {
      notes = notes.replace(lastExpansion.notes, "").trim();
      verses -= lastExpansion.verses;
      lastExpansion = null;
    }

    if (rangeMatch) {
      const book = rangeMatch[1];
      const start = parseInt(rangeMatch[2]);
      const end = parseInt(rangeMatch[3]);

      if (start <= end) {
        const result = [];
        let totalVerses = 0;
        const bookLower = book.toLowerCase();

        for (let i = start; i <= end; i++) {
          const chapterLabel = `${book} ${i}`;
          result.push(chapterLabel);

          // Add verses if chapter is found in our constants
          const key = `${bookLower} ${i}`;
          if (verseCounts[key as keyof typeof verseCounts]) {
            totalVerses += verseCounts[key as keyof typeof verseCounts];
          }
        }

        const expanded = result.join(", ");
        notes = notes ? `${notes}\n${expanded}` : expanded;
        verses += totalVerses;

        // Track new expansion so we can revert it next time
        lastExpansion = { notes: expanded, verses: totalVerses };

        bibleRange = "";
        toast.success(`Range expanded! Added ${totalVerses} verses.`);
      } else {
        toast.error("Invalid range: start chapter is greater than end chapter");
      }
    } else if (singleMatch) {
      // Handle single chapter input like "Proverbs 2"
      const book = singleMatch[1];
      const chapter = parseInt(singleMatch[2]);
      const bookLower = book.toLowerCase();
      const key = `${bookLower} ${chapter}`;

      if (verseCounts[key as keyof typeof verseCounts]) {
        const chapterVerses = verseCounts[key as keyof typeof verseCounts];
        const chapterLabel = `${book} ${chapter}`;

        notes = notes ? `${notes}\n${chapterLabel}` : chapterLabel;
        verses += chapterVerses;

        // Track new expansion so we can revert it next time
        lastExpansion = { notes: chapterLabel, verses: chapterVerses };

        bibleRange = "";
        toast.success(`Chapter added! Added ${chapterVerses} verses.`);
      } else {
        toast.error(`Chapter "${key}" not found in verse counts.`);
      }
    } else {
      toast.error(
        "Invalid format. Use 'Book Chapter' or 'Book Chapter - Chapter' (e.g., Proverbs 2 or Proverbs 1 - 3)",
      );
    }
  }

  let scoreType = $state(score?.scoreType || ScoreTypes.BIBLE_WRITING);
  let loading = $state(false);
  let points = $state(score?.points || 0);
  let ageAtSubmission = $state(score?.ageAtSubmission || 0);
  let submissionDate = $state(
    score?.submissionDate
      ? new Date(score.submissionDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  let notes = $state(score?.notes || "");

  // Combobox State (Search)
  let search = $state("");

  // Auto-calculate age when child is selected and date changes
  $effect(() => {
    if (selectedChild?.dateOfBirth && !score) {
      // Only auto-set age for new entries or if not manually overridden yet (simplified logic)
      const birthDate = new Date(selectedChild.dateOfBirth);
      const subDate = new Date(submissionDate);

      // Calculate difference in milliseconds
      const diff = subDate.getTime() - birthDate.getTime();

      // Convert to years (using 365.25 days per year to account for leap years)
      const age = diff / (1000 * 60 * 60 * 24 * 365.25);

      // Round to 1 decimal place
      ageAtSubmission = Math.round(age * 10) / 10;
    }
  });

  // Auto-calculate points for Bible Writing (5 points per verse - assuming input is verses?)
  // User asked "Bible Writing awards 5 points per verse".
  // I'll add a helper input for verses if type is Bible Writing.
  let verses = $state(0);

  $effect(() => {
    if (scoreType === ScoreTypes.BIBLE_WRITING && verses > 0) {
      points = verses * 5;
    }
  });

  async function handleSearchChild() {
    if (!search.trim()) return;
    isSearching = true;
    hasSearched = true;
    try {
      const res = await fetch(`/api/children?search=${search}&limit=20`);
      const result = await res.json();
      if (result.data) searchResults = result.data;
    } catch (error) {
      console.error(error);
      toast.error("Failed to search children");
    } finally {
      isSearching = false;
    }
  }

  function selectChild(child: iChild) {
    selectedChild = child;
    childId = child.id;
    search = "";
    searchResults = [];
    hasSearched = false;
  }

  function clearSelection() {
    selectedChild = null;
    childId = "";
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!childId) {
      toast.error("Please select a child");
      return;
    }
    if (points <= 0) {
      toast.error("Points must be greater than 0");
      return;
    }
    if (ageAtSubmission <= 0) {
      toast.error("Age must be valid");
      return;
    }

    loading = true;
    try {
      const payload = {
        child: childId,
        scoreType,
        points: Number(points),
        ageAtSubmission: Number(ageAtSubmission),
        submissionDate: new Date(submissionDate).toISOString(),
        notes,
      };

      const url =
        mode === "create" ? "/api/scores" : `/api/scores/${score?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save score");

      toast.success(
        `Score ${mode === "create" ? "created" : "updated"} successfully`,
      );
      if (onSuccess) onSuccess();
      else goto("/scores");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6 w-full">
  <div class="grid gap-2 w-full md:grid-cols-2">
    <!-- Child Selection (Search) -->
    <div class="space-y-2">
      <Label>Child <span class="text-red-500">*</span></Label>

      {#if selectedChild}
        <div
          class="flex items-center justify-between p-3 border rounded-md bg-muted/20"
        >
          <div class="flex items-center gap-3">
            {#if selectedChild.image && typeof selectedChild.image === "object"}
              <img
                src={selectedChild.image.url}
                alt={selectedChild.name}
                class="h-10 w-10 rounded-full object-cover border"
              />
            {:else}
              <div
                class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold"
              >
                {selectedChild.name.charAt(0)}
              </div>
            {/if}
            <div>
              <p class="font-medium">{selectedChild.name}</p>
              <p class="text-xs text-muted-foreground">
                {selectedChild.ageGroup}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onclick={clearSelection}
            disabled={mode === "edit"}
          >
            Change
          </Button>
        </div>
      {:else}
        <div class="space-y-2">
          <div class="flex gap-2">
            <Input
              placeholder="Search child by name..."
              bind:value={search}
              onkeydown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleSearchChild())}
            />
            <Button
              type="button"
              onclick={handleSearchChild}
              disabled={isSearching}
            >
              {#if isSearching}
                <Loader2 class="h-4 w-4 animate-spin" />
              {:else}
                Search
              {/if}
            </Button>
          </div>

          {#if hasSearched && searchResults.length === 0}
            <p class="text-sm text-muted-foreground text-center py-2">
              No children found.
            </p>
          {/if}

          {#if searchResults.length > 0}
            <div
              class="border rounded-md max-h-[200px] overflow-y-auto divide-y"
            >
              {#each searchResults as child}
                <button
                  type="button"
                  class="w-full flex items-center gap-3 p-2 hover:bg-muted/50 transition-colors text-left"
                  onclick={() => selectChild(child)}
                >
                  {#if child.image && typeof child.image === "object"}
                    <img
                      src={child.image.url}
                      alt={child.name}
                      class="h-8 w-8 rounded-full object-cover"
                    />
                  {:else}
                    <div
                      class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold"
                    >
                      {child.name.charAt(0)}
                    </div>
                  {/if}
                  <div>
                    <p class="text-sm font-medium">{child.name}</p>
                    <p class="text-xs text-muted-foreground">
                      {child.ageGroup}
                    </p>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Score Type (SelectComponent) -->
    <div class="space-y-2">
      <Label>Score Type</Label>
      <SelectComponent
        options={Object.values(ScoreTypes).map((t) => ({
          label: t,
          value: t,
        }))}
        bind:value={scoreType}
        name="scoreType"
        placeholder="Select score type"
        class="w-full"
      />
    </div>

    <!-- Date -->
    <div class="space-y-2">
      <Label>Submission Date</Label>
      <Input type="date" bind:value={submissionDate} />
    </div>

    <!-- Age -->
    <div class="space-y-2">
      <Label>Age at Submission</Label>
      <Input type="number" step="0.1" bind:value={ageAtSubmission} />
      <p class="text-xs text-muted-foreground">
        Auto-calculated from DOB if available
      </p>
    </div>

    <!-- Points / Verses -->
    <div class="space-y-2">
      <div class="grid gap-4 md:grid-cols-2">
        {#if scoreType === ScoreTypes.BIBLE_WRITING}
          <div class="space-y-2">
            <Label>Number of Verses</Label>
            <Input
              type="number"
              bind:value={verses}
              min="0"
              placeholder="Enter verses count"
            />
            <p class="text-xs text-muted-foreground">5 points per verse</p>
          </div>
        {/if}

        <div class="space-y-2">
          <Label>Total Points</Label>
          <Input type="number" bind:value={points} min="0" />
        </div>
      </div>
    </div>

    <!-- Bible Range Expander -->
    {#if scoreType === ScoreTypes.BIBLE_WRITING}
      <div class="space-y-2">
        <Label>Bible Range Expander</Label>
        <div class="flex gap-2">
          <Input placeholder="e.g. Proverbs 1 - 3" bind:value={bibleRange} />
          <Button
            type="button"
            variant="secondary"
            onclick={expandBibleRange}
            class="shrink-0"
          >
            Expand
          </Button>
        </div>
        <p class="text-xs text-muted-foreground">
          Expands ranges like "Proverbs 1 - 3" into "Proverbs 1, Proverbs 2,
          Proverbs 3" and adds to notes.
        </p>
      </div>
    {/if}

    <!-- Notes -->
    <div class="space-y-2">
      <Label>Notes</Label>
      <Textarea bind:value={notes} placeholder="Add any additional notes..." />
    </div>
  </div>

  <div class="flex justify-end gap-4">
    <Button type="button" variant="outline" href="/scores">Cancel</Button>
    <Button type="submit" disabled={loading}>
      {#if loading}
        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      {/if}
      {mode === "create" ? "Create Score" : "Update Score"}
    </Button>
  </div>
</form>
