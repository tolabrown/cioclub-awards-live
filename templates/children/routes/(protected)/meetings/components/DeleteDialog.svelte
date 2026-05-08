<script lang="ts">
  import type { iMeeting } from "$lib/interface"; 
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Loader2 } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    meeting: iMeeting;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { meeting, open = $bindable(), onOpenChange }: Props = $props();

  let isDeleting = $state(false);

  const handleDelete = async () => {
    isDeleting = true;
    try {
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.status === "success") {
        toast.success("Meeting deleted successfully");
        onOpenChange(false);
        // Refresh the page to update the list
        window.location.reload();
      } else {
        toast.error(result.message || "Failed to delete meeting");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the meeting");
      console.error(error);
    } finally {
      isDeleting = false;
    }
  };
</script>

<AlertDialog.Root bind:open {onOpenChange}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Meeting?</AlertDialog.Title>
      <AlertDialog.Description>
        Are you sure you want to delete <strong>{meeting.type}</strong>? This
        action cannot be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={isDeleting}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        onclick={handleDelete}
        disabled={isDeleting}
        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {#if isDeleting}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        {:else}
          Delete
        {/if}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
