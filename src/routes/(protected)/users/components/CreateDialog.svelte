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
  import { User as UserIcon, Mail, Lock, ShieldCheck } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import { admin } from "$lib/auth-client";
  import { Role } from "$lib/constants";
  import { roles } from "$lib/authentication/fxn";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let {
    open = $bindable(false),
    onOpenChange,
  }: Props = $props();

  let isLoading = $state(false);
  let formData = $state({
    name: "",
    email: "",
    password: "",
    role: Role.USER as string
  });

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    isLoading = true;

    try {
      const response = await admin.createUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role as any,
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to create user");
      }

      toast.success("User Created", {
        description: `${formData.name} has been successfully added to the platform.`,
      });
      
      // Reset form and close
      formData = {
        name: "",
        email: "",
        password: "",
        role: Role.USER as string
      };
      onOpenChange(false);
      
      // Refresh the page or the query
      location.reload();
    } catch (err: any) {
      console.error("Failed to create user:", err);
      toast.error("Creation Failed", {
        description: err.message || "Could not create this user. Please try again.",
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
        >Add New Member</DialogTitle
      >
      <DialogDescription class="text-muted-foreground font-medium"
        >Manually create a new identity within the continental network.</DialogDescription
      >
    </DialogHeader>
    <form onsubmit={handleSubmit} class="space-y-4 pt-4">
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
            placeholder="John Doe"
            bind:value={formData.name}
            class="pl-10 h-11 rounded-xl bg-muted/30 border-border/50 focus:ring-primary/20"
            required
          />
        </div>
      </div>

      <div class="space-y-3">
        <Label
          for="email"
          class="text-sm font-bold uppercase tracking-widest text-muted-foreground"
          >Email Address</Label
        >
        <div class="relative">
          <Mail
            class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60"
          />
          <Input
            name="email"
            id="email"
            type="email"
            placeholder="john@example.com"
            bind:value={formData.email}
            class="pl-10 h-11 rounded-xl bg-muted/30 border-border/50 focus:ring-primary/20"
            required
          />
        </div>
      </div>

      <div class="space-y-3">
        <Label
          for="password"
          class="text-sm font-bold uppercase tracking-widest text-muted-foreground"
          >Initial Password</Label
        >
        <div class="relative">
          <Lock
            class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60"
          />
          <Input
            name="password"
            id="password"
            type="password"
            placeholder="Min 6 characters"
            bind:value={formData.password}
            class="pl-10 h-11 rounded-xl bg-muted/30 border-border/50 focus:ring-primary/20"
            minlength={6}
            required
          />
        </div>
      </div>

      <div class="space-y-3">
        <Label
          for="role"
          class="text-sm font-bold uppercase tracking-widest text-muted-foreground"
          >Assign Role</Label
        >
        <div class="bg-muted/30 rounded-xl border border-border/50 p-1">
          <SelectComponent
            disabled={isLoading}
            bind:value={formData.role}
            options={roles}
            class="w-full bg-transparent border-0 font-bold h-10 px-4"
            name="role"
            placeholder="Select role"
          />
        </div>
      </div>

      <DialogFooter class="pt-6 border-t border-border/50">
        <Button
          type="button"
          variant="ghost"
          class="font-bold rounded-xl"
          onclick={() => handleOpenChange(false)}
          disabled={isLoading}>Cancel</Button
        >
        {#if isLoading}
          <Button disabled={isLoading} class="rounded-xl px-8"
            ><LoadingSpinner
              class="text-white dark:text-background mr-2"
            /><span>Creating...</span></Button
          >
        {:else}
          <Button
            type="submit"
            class="rounded-xl px-10 shadow-md font-bold transition-all"
            >Create User</Button
          >
        {/if}
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
