<script lang="ts">
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import SelectComponent from "./select-component.svelte";
  import type { User } from "$lib/auth";
  import { Calendar, User as UserIcon } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import { page } from "$app/state";
  import type { iResult } from "$lib/interface";
  import { adminRoles, Role } from "$lib/constants";
  import { roles } from "$lib/authentication/fxn";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";

  interface Props {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let {
    user = $bindable(),
    open = $bindable(false),
    onOpenChange,
  }: Props = $props();
  const me = page.data.user as User;
  const isAdmin = $derived(adminRoles.includes(me.role as Role));
  let isLoading = $state(false);
  let formData = $state(user);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const entries = Object.fromEntries(fd.entries());
    isLoading = true;
    try {
      const url = `/api/users/${user.id}`;
      const options: RequestInit = {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ me, data: { ...entries } }),
      };
      const response = await fetch(url, options);
      const { status, message, data } = (await response.json()) as iResult;
      if (status === "error") throw new Error(message);
      user = data;
      toast.success("Profile Updated", {
        description: "Member profile has been updated successfully.",
      });
      location.reload();
    } catch (err: any) {
      console.error("Failed to update user:", err);
      toast.error("Update Failed", {
        description:
          err.message || "Could not update this profile. Please try again.",
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
        class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2"
      >
        <UserIcon class="size-6" />
      </div>
      <DialogTitle class="text-2xl font-bold tracking-tight"
        >Edit Member Profile</DialogTitle
      >
      <DialogDescription class="text-muted-foreground font-medium"
        >Update the institutional records for this member.</DialogDescription
      >
    </DialogHeader>
    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-3">
        <Label
          for="name"
          class="text-sm font-bold uppercase tracking-widest text-muted-foreground"
          >Full Name</Label
        >
        <div class="relative">
          <UserIcon
            class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60"
          />
          <Input
            name="name"
            id="name"
            type="text"
            placeholder="Enter full name"
            bind:value={formData.name}
            class="pl-10 h-11 rounded-xl bg-muted/30 border-border/50 focus:ring-primary/20"
            required
          />
        </div>
      </div>
      <div class="space-y-3 pb-4">
        <Label
          for="role"
          class="text-sm font-bold uppercase tracking-widest text-muted-foreground"
          >Continental Role</Label
        >
        {#if isAdmin && me.id !== user?.id}
          <div class="bg-muted/30 rounded-xl border border-border/50 p-1">
            <SelectComponent
              disabled={isLoading}
              bind:value={user.role as string}
              options={roles}
              class="w-full bg-transparent border-0 font-bold h-10 px-4"
              name="role"
              placeholder="Select role"
            />
          </div>
        {:else}
          <div
            class="h-11 flex items-center px-4 rounded-xl bg-muted/20 border border-border/10 text-sm font-bold text-muted-foreground italic"
          >
            {me.id === user?.id
              ? "Self-editing restricted"
              : "Administrative access required"}
          </div>
        {/if}
      </div>
      <DialogFooter class="pt-6 border-t border-border/50">
        <Button
          type="button"
          variant="ghost"
          class="font-bold rounded-xl"
          onclick={() => handleOpenChange(false)}
          disabled={isLoading}>Discard</Button
        >
        {#if isLoading}
          <Button disabled={isLoading} class="rounded-xl px-8"
            ><LoadingSpinner
              class="text-white dark:text-background mr-2"
            /><span>Synchronizing...</span></Button
          >
        {:else}
          <Button
            type="submit"
            class="rounded-xl px-10 shadow-md font-bold transition-all"
            >Update Identity</Button
          >
        {/if}
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
