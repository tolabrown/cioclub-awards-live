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
  import type { iResult } from "$lib/interface";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";

  interface Props {
    teacher: iTeacher;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { teacher, open, onOpenChange }: Props = $props();

  let isLoading = $state(false);

  const handleDelete = async () => {
    isLoading = true;
    try {
      const url = `/api/teachers/${teacher.id}`;
      const options: RequestInit = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teacher }),
      };

      const response = await fetch(url, options);
      const result = (await response.json()) as iResult;

      if (result.status === "error") {
        throw new Error(result.message);
      }

      toast.success("Success Alert", {
        description: `Successfully deleted ${teacher.name}`,
      });
      location.reload();
    } catch (err: any) {
      console.error("Failed to delete teacher:", err);
      toast.error("Error Alert", {
        description: err.message || "Failed to delete teacher",
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
        Delete Teacher Record
      </DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete the record
        for <strong>{teacher.name}</strong>.
      </DialogDescription>
    </DialogHeader>

    <div class="rounded-lg border bg-gray-50 p-4 dark:bg-secondary">
      <div class="space-y-2">
        <div>
          <span class="text-sm font-medium">Teacher:</span>
          <span class="ml-2 text-sm">{teacher.name}</span>
        </div>
        {#if teacher.teacherType}
          <div>
            <span class="text-sm font-medium">Type:</span>
            <span class="ml-2 text-sm">{teacher.teacherType}</span>
          </div>
        {/if}
        {#if teacher.location}
          <div>
            <span class="text-sm font-medium">Location:</span>
            <span class="ml-2 text-sm">{teacher.location}</span>
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
          Delete Teacher
        </Button>
      {/if}
    </DialogFooter>
  </DialogContent>
</Dialog>
