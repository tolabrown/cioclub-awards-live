<script lang="ts">
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
  import { toast } from "svelte-sonner";
  import type { iResult } from "$lib/interface";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";

  interface Props {
    child: iChild;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { child, open, onOpenChange }: Props = $props();

  let isLoading = $state(false);

  console.log({ child })

  // Access parent info from the joined data
  const parentName = $derived((child as any).parentName || "Unknown");

  const handleDelete = async () => {
    isLoading = true;
    try {
      const url = `/api/children/${child.id}`;
      const options: RequestInit = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ child }),
      };

      const response = await fetch(url, options);
      const result = (await response.json()) as iResult;

      if (result.status === "error") {
        throw new Error(result.message);
      }

      toast.success("Success Alert", {
        description: `Successfully deleted ${child.name}`,
      });
      location.reload();
    } catch (err: any) {
      console.error("Failed to delete child:", err);
      toast.error("Error Alert", {
        description: err.message || "Failed to delete child",
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
        Delete Child Record
      </DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete the record
        for <strong>{child.name}</strong>.
      </DialogDescription>
    </DialogHeader>

    <div class="rounded-lg border bg-gray-50 p-4 dark:bg-secondary">
      <div class="space-y-2">
        <div>
          <span class="text-sm font-medium">Child:</span>
          <span class="ml-2 text-sm">{child.name}</span>
        </div>
        {#if child.ageGroup}
          <div>
            <span class="text-sm font-medium">Age Group:</span>
            <span class="ml-2 text-sm">{child.ageGroup}</span>
          </div>
        {/if}
      </div>
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
          onclick={handleDelete}
          disabled={isLoading}
          class="cursor-pointer"
        >
          Delete Child
        </Button>
      {/if}
    </DialogFooter>
  </DialogContent>
</Dialog>
