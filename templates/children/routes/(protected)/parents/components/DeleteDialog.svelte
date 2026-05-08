<script lang="ts">
  import type { iParent, iResult } from "$lib/interface";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import { Loader2, Trash2, AlertTriangle } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    parent: iParent;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { parent, open = $bindable(), onOpenChange }: Props = $props();

  let isLoading = $state(false);

  const handleDelete = async () => {
    isLoading = true;
    try {
      const response = await fetch(`/api/parents/${parent.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = (await response.json()) as iResult;

      if (result.status === "error") {
        throw new Error(result.message);
      }

      toast.success("Parent deleted", {
        description: `Successfully deleted ${parent.name}`,
      });

      // Refresh the page to update the list
      location.reload();
    } catch (err: any) {
      console.error("Failed to delete parent:", err);
      toast.error("Error", {
        description: err.message || "Failed to delete parent",
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

  const childCount = $derived(parent.children?.length || 0);
</script>

<AlertDialog.Root bind:open onOpenChange={handleOpenChange}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <div class="flex items-center gap-3 mb-2">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"
        >
          <AlertTriangle class="h-6 w-6 text-destructive" />
        </div>
        <div>
          <AlertDialog.Title>Delete Parent</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete <strong>{parent.name}</strong>?
          </AlertDialog.Description>
        </div>
      </div>
    </AlertDialog.Header>

    <div class="space-y-3 py-4">
      <div
        class="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm"
      >
        <p class="font-medium text-destructive mb-2">
          This action cannot be undone.
        </p>
        <p class="text-muted-foreground">Deleting this parent will:</p>
        <ul class="list-disc list-inside mt-2 text-muted-foreground space-y-1">
          <li>Remove all parent information from the database</li>
          {#if childCount > 0}
            <li>
              Unlink <strong class="text-foreground"
                >{childCount} {childCount === 1 ? "child" : "children"}</strong
              > from this parent
            </li>
          {/if}
        </ul>
      </div>

      {#if childCount > 0}
        <div class="rounded-lg border p-3 bg-muted/50">
          <p class="text-sm font-medium mb-2">Affected children:</p>
          <div class="flex flex-wrap gap-2">
            {#each parent.children || [] as child}
              <span
                class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-background border text-xs font-medium"
              >
                {child.name}
              </span>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={isLoading}>Cancel</AlertDialog.Cancel>
      <Button
        variant="destructive"
        onclick={handleDelete}
        disabled={isLoading}
        class="gap-2"
      >
        {#if isLoading}
          <Loader2 class="h-4 w-4 animate-spin" />
          Deleting...
        {:else}
          <Trash2 class="h-4 w-4" />
          Delete Parent
        {/if}
      </Button>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
