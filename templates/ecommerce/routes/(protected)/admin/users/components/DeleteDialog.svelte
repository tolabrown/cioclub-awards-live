<script lang="ts">
  import type { User } from "$lib/auth";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import { AlertTriangle } from "@lucide/svelte";
  import type { iResult } from "$lib/interface";
  import { page } from "$app/state";
  import { toast } from "svelte-sonner";

  interface Props {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { user, open, onOpenChange }: Props = $props();
  const me = page.data.user as User;
  let isLoading = $state(false);

  const handleDelete = async () => {
    isLoading = true;
    try {
      const url = `/api/users/${user.id}`;
      const options: RequestInit = {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ me, data: null }),
      };
      const response = await fetch(url, options);
      const { status, message } = (await response.json()) as iResult;
      if (status === "error") throw new Error(message);
      toast.success("Deleted", {
        description: `Successfully deleted ${user.name}`,
      });
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      toast.error("Error", {
        description: err.message || "Failed to delete user",
      });
    } finally {
      isLoading = false;
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) onOpenChange(newOpen);
  };
</script>

<Dialog {open} onOpenChange={handleOpenChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete User</DialogTitle>
      <DialogDescription
        >This action cannot be undone. This will permanently delete the user.</DialogDescription
      >
    </DialogHeader>
    <div class="space-y-4 rounded-xl border bg-muted/30 p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Name:</span><span class="text-sm"
          >{user.name}</span
        >
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Role:</span><span
          class="text-sm capitalize font-bold">{user.role}</span
        >
      </div>
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onclick={() => handleOpenChange(false)}
        disabled={isLoading}>Cancel</Button
      >
      {#if isLoading}
        <Button disabled={isLoading}>
          <LoadingSpinner />
          <span>Deleting...</span>
        </Button>
      {:else}
        <Button
          variant="destructive"
          onclick={handleDelete}
          disabled={isLoading}>Delete User</Button
        >
      {/if}
    </DialogFooter>
  </DialogContent>
</Dialog>
