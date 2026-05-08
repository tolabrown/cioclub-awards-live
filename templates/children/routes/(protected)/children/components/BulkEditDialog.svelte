<script lang="ts">
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import { Label } from "$lib/components/ui/label";
  import type { iChild } from "$lib/interface";
  import type { User } from "$lib/auth";
  import { Edit } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import type { iResult } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { page } from "$app/state";
    import SelectComponent, { type iSelect } from "$lib/components/ui/select/select-component.svelte";

  interface Props {
    children: iChild[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { children, open = $bindable(false), onOpenChange }: Props = $props();

  const me = page.data.user as User;

  let isLoading = $state(false);

  // Update field toggles
  let updateAgeGroup = $state(false);
  let updateActive = $state(false);
  let updateNotes = $state(false);

  // Selected values
  let selectedAgeGroup = $state("");
  let selectedActive = $state(true);
  let selectedNotes = $state("");

  const ageGroupOptions: iSelect[] = [
    { label: "Nursery", value: "Nursery" },
    { label: "Toddlers", value: "Toddlers" },
    { label: "Beginners", value: "Beginners" },
    { label: "Primary", value: "Primary" },
    { label: "Juniors", value: "Juniors" },
  ];

  const activeOptions: iSelect[] = [
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!updateAgeGroup && !updateActive && !updateNotes) {
      toast.error("Please select at least one field to update");
      return;
    }

    isLoading = true;
    try {
      const childIds = children.map((child) => child.id);

      // Update children in parallel
      const updatePromises = childIds.map(async (id) => {
        const data: any = {};

        if (updateAgeGroup) {
          data.ageGroup = selectedAgeGroup;
        }
        if (updateActive) {
          data.active = selectedActive === true;
        }
        if (updateNotes) {
          data.notes = selectedNotes;
        }

        const url = `/api/children/${id}`;
        const options: RequestInit = {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        };

        const response = await fetch(url, options);
        const result = (await response.json()) as iResult;

        if (result.status === "error") {
          throw new Error(result.message);
        }
        return result;
      });

      await Promise.all(updatePromises);

      toast.success("Success Alert", {
        description: `Successfully updated ${children.length} ${children.length > 1 ? "children" : "child"}`,
      });
      location.reload();
    } catch (err: any) {
      console.error("Failed to update children:", err);
      toast.error("Error Alert", {
        description: err.message || "Failed to update some children",
      });
    } finally {
      isLoading = false;
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset all states
        updateAgeGroup = false;
        updateActive = false;
        updateNotes = false;
        selectedAgeGroup = "";
        selectedActive = true;
        selectedNotes = "";
      }
    }
  };

  // Check if any update is selected
  const hasUpdates = $derived(updateAgeGroup || updateActive || updateNotes);
</script>

<Dialog {open} onOpenChange={handleOpenChange}>
  <DialogContent class="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle class="flex items-center gap-2">
        <Edit class="h-5 w-5" />
        Bulk Edit Children
      </DialogTitle>
      <DialogDescription>
        Update multiple children at once. Select the fields you want to modify.
      </DialogDescription>
    </DialogHeader>

    <form onsubmit={handleSubmit} class="space-y-4">
      <ScrollArea class="h-[calc(50vh)]">
        <div class="space-y-4 pr-4">
          <!-- Selected Children Preview -->
          <div
            class="space-y-2 rounded-lg border bg-gray-50 p-3 dark:bg-secondary"
          >
            <p class="text-sm font-medium text-muted-foreground">
              Editing {children.length}
              {children.length > 1 ? "children" : "child"}:
            </p>
            <div class="flex flex-wrap gap-1">
              {#each children.slice(0, 5) as child}
                <Badge variant="secondary" class="text-xs">
                  {child.name}
                </Badge>
              {/each}
              {#if children.length > 5}
                <Badge variant="secondary" class="text-xs">
                  +{children.length - 5} more
                </Badge>
              {/if}
            </div>
          </div>

          <!-- Update Fields -->
          <div class="space-y-3">
            <!-- Update Age Group -->
            <div class="flex items-start space-x-3 rounded-lg border p-4">
              <Checkbox
                id="update-age-group"
                checked={updateAgeGroup}
                onCheckedChange={(checked) => (updateAgeGroup = !!checked)}
              />
              <div class="flex-1 space-y-2">
                <Label
                  for="update-age-group"
                  class="cursor-pointer font-medium"
                >
                  Update Age Group
                </Label>
                {#if updateAgeGroup}
                  <SelectComponent
                    class="w-full"
                    options={ageGroupOptions}
                    bind:value={selectedAgeGroup}
                    name="ageGroup"
                    placeholder="Select age group"
                  />
                {/if}
              </div>
            </div>

            <!-- Update Active Status -->
            <div class="flex items-start space-x-3 rounded-lg border p-4">
              <Checkbox
                id="update-active"
                checked={updateActive}
                onCheckedChange={(checked) => (updateActive = !!checked)}
              />
              <div class="flex-1 space-y-2">
                <Label for="update-active" class="cursor-pointer font-medium">
                  Update Active Status
                </Label>
                {#if updateActive}
                  <SelectComponent
                    class="w-full"
                    options={activeOptions}
                    bind:value={selectedActive}
                    name="active"
                    placeholder="Select status"
                  />
                {/if}
              </div>
            </div>

            <!-- Update Notes -->
            <div class="flex items-start space-x-3 rounded-lg border p-4">
              <Checkbox
                id="update-notes"
                checked={updateNotes}
                onCheckedChange={(checked) => (updateNotes = !!checked)}
              />
              <div class="flex-1 space-y-2">
                <Label for="update-notes" class="cursor-pointer font-medium">
                  Update Notes
                </Label>
                {#if updateNotes}
                  <textarea
                    bind:value={selectedNotes}
                    class="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="Enter notes..."
                    rows="3"
                  ></textarea>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          class="cursor-pointer"
          onclick={() => handleOpenChange(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>

        {#if isLoading}
          <Button disabled={isLoading}>
            <LoadingSpinner class="text-white dark:text-background" />
            <span>Updating...</span>
          </Button>
        {:else}
          <Button type="submit" disabled={!hasUpdates}>
            Update {children.length}
            {children.length > 1 ? "Children" : "Child"}
          </Button>
        {/if}
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
