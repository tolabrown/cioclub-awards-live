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
  import { Badge } from "$lib/components/ui/badge";
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
      toast.success("User Deleted", {
        description: `${user.name} has been removed successfully.`,
      });
      location.reload();
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      toast.error("Deletion Failed", {
        description:
          err.message || "Could not delete this user. Please try again.",
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
  <DialogContent class="sm:max-w-md rounded-xl border-border/50 shadow-lg">
    <DialogHeader class="space-y-3">
      <div
        class="size-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-2"
      >
        <AlertTriangle class="size-6" />
      </div>
      <DialogTitle class="text-2xl font-bold tracking-tight"
        >Revoke Access</DialogTitle
      >
      <DialogDescription class="text-muted-foreground font-medium"
        >This action will permanently remove this member from the continental
        network directory. This cannot be undone.</DialogDescription
      >
    </DialogHeader>
    <div
      class="space-y-3 rounded-xl border border-destructive/20 bg-destructive/5 p-5"
    >
      <div class="flex items-center justify-between">
        <span
          class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >Identity</span
        >
        <span class="text-sm font-bold text-foreground">{user.name}</span>
      </div>
      <div class="flex items-center justify-between">
        <span
          class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >Access Tier</span
        >
        <Badge
          variant="gsred"
          class="px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-widest border-0 shadow-sm"
        >
          {user.role}
        </Badge>
      </div>
    </div>
    <DialogFooter class="pt-6 border-t border-border/50">
      <Button
        type="button"
        variant="ghost"
        class="font-bold rounded-xl"
        onclick={() => handleOpenChange(false)}
        disabled={isLoading}>Retain Member</Button
      >
      {#if isLoading}
        <Button
          variant="destructive"
          disabled={isLoading}
          class="rounded-xl px-8"
          ><LoadingSpinner class="text-white mr-2" /><span>Revoking...</span
          ></Button
        >
      {:else}
        <Button
          type="button"
          variant="destructive"
          onclick={handleDelete}
          disabled={isLoading}
          class="rounded-xl px-10 shadow-lg font-bold">Confirm Deletion</Button
        >
      {/if}
    </DialogFooter>
  </DialogContent>
</Dialog>
