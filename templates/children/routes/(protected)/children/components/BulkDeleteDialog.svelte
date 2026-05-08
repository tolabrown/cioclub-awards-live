<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import type { iChild } from "$lib/interface";
  import { AlertTriangle } from "@lucide/svelte";
  import type { iResult } from "$lib/interface";
  import { toast } from "svelte-sonner";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";

  interface Props {
    children: iChild[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { children, open, onOpenChange }: Props = $props();

  let isLoading = $state(false);

  const handleBulkDelete = async () => {
    isLoading = true;
    try {
      const childIds: string[] = children.map((child) => child.id);

      // Delete children from database in parallel
      const deletePromises = childIds.map(async (id) => {
        const url = `/api/children/${id}`;
        const options: RequestInit = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        };

        const response = await fetch(url, options);
        const result = (await response.json()) as iResult;

        if (result.status === "error") {
          throw new Error(result.message);
        }
        return result;
      });

      await Promise.all(deletePromises);

      toast.success("Success Alert", {
        description: `Successfully deleted ${children.length} ${children.length > 1 ? "children" : "child"}`,
      });
      location.reload();
    } catch (err: any) {
      console.error("Failed to delete children:", err);
      toast.error("Error Alert", {
        description: err.message || "Failed to delete some children",
      });
    } finally {
      isLoading = false;
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
    }
  };
</script>

<Dialog {open} onOpenChange={handleOpenChange}>
  <DialogContent class="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle class="flex items-center gap-2 text-red-600">
        <AlertTriangle class="h-5 w-5" />
        Delete Multiple Children
      </DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete {children.length}
        {children.length > 1 ? "children" : "child"}.
      </DialogDescription>
    </DialogHeader>

    <div
      class="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border bg-gray-50 p-4 dark:bg-secondary"
    >
      {#each children as child}
        <div
          class="flex items-center justify-between rounded border bg-white p-2 dark:bg-background"
        >
          <div class="flex-1">
            <span class="text-sm font-medium">{child.name}</span>
            <div class="mt-1">
              <Badge variant="secondary" class="text-xs">
                {child.ageGroup || "No age group"}
              </Badge>
              <span class="ml-2 text-xs text-muted-foreground">
                {(child as any).parentName || "Unknown Parent"}
              </span>
            </div>
          </div>
        </div>
      {/each}
    </div>

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
        <Button disabled={isLoading} variant="destructive">
          <LoadingSpinner class="text-white" />
          <span>Deleting...</span>
        </Button>
      {:else}
        <Button
          type="button"
          variant="destructive"
          onclick={handleBulkDelete}
          disabled={isLoading}
          class="cursor-pointer"
        >
          Delete {children.length}
          {children.length > 1 ? "Children" : "Child"}
        </Button>
      {/if}
    </DialogFooter>
  </DialogContent>
</Dialog>
