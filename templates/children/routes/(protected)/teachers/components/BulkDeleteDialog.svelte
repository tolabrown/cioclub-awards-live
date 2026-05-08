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
  import type { iTeacher } from "$lib/interface";
  import { AlertTriangle } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";

  interface Props {
    teachers: iTeacher[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: () => void;
  }

  let { teachers, open, onOpenChange, onComplete }: Props = $props();

  let isLoading = $state(false);

  const handleBulkDelete = async () => {
    isLoading = true;
    try {
      const deletePromises = teachers.map((teacher) =>
        fetch(`/api/teachers/${teacher.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );

      const results = await Promise.all(deletePromises);
      const failedDeletes = results.filter((r) => !r.ok);

      if (failedDeletes.length > 0) {
        throw new Error(`Failed to delete ${failedDeletes.length} teacher(s)`);
      }

      toast.success("Success", {
        description: `Successfully deleted ${teachers.length} teacher(s)`,
      });

      onComplete();
      location.reload();
    } catch (err: any) {
      console.error("Failed to delete teachers:", err);
      toast.error("Error", {
        description: err.message || "Failed to delete teachers",
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
        Bulk Delete Teachers
      </DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete{" "}
        <strong>{teachers.length} teacher(s)</strong>.
      </DialogDescription>
    </DialogHeader>

    <div class="rounded-lg border bg-gray-50 p-4 dark:bg-secondary">
      <div class="space-y-2">
        <div>
          <span class="text-sm font-medium">Selected Teachers:</span>
          <span class="ml-2 text-sm">{teachers.length}</span>
        </div>
        <div class="max-h-40 overflow-y-auto">
          <ul class="list-disc list-inside text-sm space-y-1">
            {#each teachers.slice(0, 5) as teacher}
              <li>{teacher.name}</li>
            {/each}
            {#if teachers.length > 5}
              <li class="text-muted-foreground">
                ...and {teachers.length - 5} more
              </li>
            {/if}
          </ul>
        </div>
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
          onclick={handleBulkDelete}
          disabled={isLoading}
          class="cursor-pointer"
        >
          Delete {teachers.length} Teacher{teachers.length > 1 ? "s" : ""}
        </Button>
      {/if}
    </DialogFooter>
  </DialogContent>
</Dialog>
