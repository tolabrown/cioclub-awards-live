<script lang="ts">
  import { TableCell, TableRow } from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Calendar as CalendarIcon, Trash2, CalendarClock, ChevronDown } from "@lucide/svelte";
  import { Calendar } from "$lib/components/ui/calendar";
  import { Popover, PopoverContent, PopoverTrigger } from "$lib/components/ui/popover";
  import { format } from "date-fns";
  import SelectComponent from "./select-component.svelte";
  import { toast } from "svelte-sonner";
  import type { User } from "$lib/auth";
  import { page } from "$app/state";
  import { admin } from "$lib/auth-client";
  import { getRoleBadgeVariant, roles } from "$lib/authentication/fxn";
  import { adminRoles, Role } from "$lib/constants";
  import Identity from "$lib/authentication/ui/user/Identity.svelte";
  import { Lock } from "@lucide/svelte";
  import { getLocalTimeZone, CalendarDate } from "@internationalized/date";
  import type { iResult } from "$lib/interface";

  interface Props {
    user: User;
    i: number;
    screen: "desktop" | "mobile";
    onDelete: (user: User) => void;
    isSelected: boolean;
    onSelectionToggle: () => void;
  }

  let { user, i, onDelete, screen, isSelected, onSelectionToggle }: Props = $props();
  let updating = $state<string | null>(null);

  const me = page.data.user as User;
  const isAdmin = $derived(adminRoles.includes(me.role as Role));
  const num = $derived(i + 1);
  const roleVariant = $derived(getRoleBadgeVariant(user?.role as string));

  const updateUserRole = async (profile: User, newRole: string) => {
    if (!adminRoles.includes(me.role as Role)) {
      toast.error("Access Denied", {
        description: "Only administrators can change user roles.",
      });
      return;
    }
    updating = profile.id;
    try {
      const canChangeRole = await admin.hasPermission({
        permissions: { user: ["set-role"] },
      });
      if (!canChangeRole.data?.success) throw new Error("Forbidden");
      await admin.setRole({ userId: profile.id, role: newRole as any });
      toast.success("Success", {
        description: "User role updated successfully.",
      });
      location.reload();
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error("Error", {
        description: "Failed to update user role. Please try again.",
      });
    } finally {
      updating = null;
    }
  };

  const onValueChange = async (profile: User, val: string) => {
    await updateUserRole(profile, val);
  };

  const updateSubscriptionDate = async (newDate: Date | undefined) => {
    if (!newDate) return;
    if (!isAdmin) return;

    updating = user.id;
    try {
      const url = `/api/users/${user.id}`;
      const options: RequestInit = {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          me, 
          data: { subscriptionEndsAt: newDate.toISOString() } 
        }),
      };
      
      const response = await fetch(url, options);
      const { status, message, data } = (await response.json()) as iResult;
      
      if (status === "error") throw new Error(message);
      
      user = data;
      toast.success("Subscription Updated", {
        description: `Access extended until ${format(newDate, "MMM dd, yyyy")}`,
      });
    } catch (error: any) {
      console.error("Error updating subscription date:", error);
      toast.error("Update Failed", {
        description: error.message || "Failed to update subscription date.",
      });
    } finally {
      updating = null;
    }
  };

  let calendarValue = $state<CalendarDate | undefined>(undefined);

  $effect(() => {
    if (user.subscriptionEndsAt) {
      const d = new Date(user.subscriptionEndsAt);
      calendarValue = new CalendarDate(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate()
      );
    } else {
      calendarValue = undefined;
    }
  });
</script>

{#if screen === "desktop"}
  <TableRow class="group hover:bg-muted/30 transition-colors">
    <TableCell class="w-10 pl-6">
      <input
        type="checkbox"
        checked={isSelected}
        onchange={onSelectionToggle}
        class="w-4 h-4 rounded border-border text-primary focus:ring-primary transition-all cursor-pointer"
      />
    </TableCell>
    <TableCell class="font-bold text-muted-foreground/60 w-12">{num}.</TableCell>
    <TableCell>
      <div class="py-1">
        <Identity {user} />
      </div>
    </TableCell>
    <TableCell class="text-center">
      <Badge
        variant={roleVariant}
        class="px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-widest border-0 shadow-sm"
      >
        {user.role}
      </Badge>
    </TableCell>
    <TableCell>
      <div class="flex items-center gap-2 text-muted-foreground font-medium">
        <CalendarIcon class="size-3.5" />
        {format(new Date(user.createdAt), "MMM dd, yyyy")}
      </div>
    </TableCell>
    <TableCell>
      {#if isAdmin}
        <Popover>
          <PopoverTrigger>
            <Button 
              variant="outline" 
              class="h-8 rounded-lg px-3 flex items-center gap-2 border-border/50 hover:bg-muted/50 transition-all font-bold text-xs"
              disabled={updating === user.id}
            >
              <CalendarClock class="size-3.5 text-primary" />
              <span>
                {user.subscriptionEndsAt 
                  ? format(new Date(user.subscriptionEndsAt), "MMM dd, yyyy") 
                  : "No active plan"}
              </span>
              <ChevronDown class="size-3 text-muted-foreground ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0 rounded-xl shadow-xl border-border/50" align="start">
            <Calendar
              type="single"
              bind:value={calendarValue}
              onValueChange={(v) => {
                if (v) {
                  updateSubscriptionDate(v.toDate(getLocalTimeZone()));
                }
              }}
              class="rounded-xl"
            />
          </PopoverContent>
        </Popover>
      {:else}
        <div class="flex items-center gap-2 text-muted-foreground font-medium text-xs">
          <CalendarClock class="size-3.5" />
          {user.subscriptionEndsAt 
            ? format(new Date(user.subscriptionEndsAt), "MMM dd, yyyy") 
            : "No active plan"}
        </div>
      {/if}
    </TableCell>
    <TableCell class="text-right pr-6">
      <div class="flex items-center justify-end gap-3">
        {#if isAdmin && me.id !== user?.id}
          <div
            class="bg-muted px-1 py-1 rounded-xl border border-border/50 flex items-center shadow-sm"
          >
            <SelectComponent
              disabled={updating === user.id}
              value={user.role as string}
              options={roles}
              class="h-8 w-32 bg-transparent border-0 font-bold text-xs"
              name="role"
              onValueChange={(val: string) => onValueChange(user, val)}
              placeholder="Select role"
            />
          </div>
          <Button
            disabled={updating === user.id}
            variant="ghost"
            size="icon"
            onclick={(e) => {
              e.stopPropagation();
              onDelete(user);
            }}
            class="size-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <Trash2 class="size-4" />
          </Button>
        {:else if me.id === user?.id}
          <Badge
            variant="outline"
            class="rounded-full font-bold text-[10px] uppercase tracking-widest opacity-40"
            >Own Profile</Badge
          >
        {:else}
          <Lock class="size-3.5 text-muted-foreground/40" />
        {/if}
      </div>
    </TableCell>
  </TableRow>
{:else}
  <div
    class="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 relative"
  >
    <div class="absolute top-4 left-4 z-10">
      <input
        type="checkbox"
        checked={isSelected}
        onchange={onSelectionToggle}
        class="w-5 h-5 rounded border-border text-primary focus:ring-primary transition-all cursor-pointer shadow-sm"
      />
    </div>

    <div class="p-5 pl-12 space-y-4">
      <div class="flex items-start justify-between">
        <Identity {user} class="px-0" />
        <Badge
          variant={roleVariant}
          class="px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-widest border-0 shadow-sm"
        >
          {user.role}
        </Badge>
      </div>

      <div class="flex items-center justify-between pt-2">
        <div
          class="flex items-center gap-2 text-xs font-medium text-muted-foreground"
        >
          <CalendarIcon class="size-3.5" />
          Member since {format(new Date(user.createdAt), "MMM dd, yyyy")}
        </div>
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <CalendarClock class="size-3" />
            Subscription Ends
          </div>
          {#if isAdmin}
            <Popover>
              <PopoverTrigger>
                <Button 
                  variant="outline" 
                  class="h-9 w-full rounded-xl px-4 flex items-center justify-between border-border/50 bg-muted/20 font-bold text-xs"
                  disabled={updating === user.id}
                >
                  <span class="text-foreground">
                    {user.subscriptionEndsAt 
                      ? format(new Date(user.subscriptionEndsAt), "MMM dd, yyyy") 
                      : "No active plan"}
                  </span>
                  <ChevronDown class="size-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0 rounded-xl shadow-xl border-border/50" align="center">
                <Calendar
                  type="single"
                  bind:value={calendarValue}
                  onValueChange={(v) => {
                    if (v) {
                      updateSubscriptionDate(v.toDate(getLocalTimeZone()));
                    }
                  }}
                  class="rounded-xl"
                />
              </PopoverContent>
            </Popover>
          {:else}
            <div class="text-xs font-bold text-foreground">
              {user.subscriptionEndsAt 
                ? format(new Date(user.subscriptionEndsAt), "MMM dd, yyyy") 
                : "No active plan"}
            </div>
          {/if}
        </div>
        <Badge
          variant="outline"
          class="rounded-lg text-[10px] font-bold opacity-30">#{num}</Badge
        >
      </div>
    </div>

    <div
      class="flex flex-col gap-3 border-t border-border/50 bg-muted/20 px-4 py-4"
    >
      {#if isAdmin && me.id !== user?.id}
        <div class="w-full">
          <SelectComponent
            disabled={updating === user.id}
            value={user.role as string}
            options={roles}
            class="h-10 w-full bg-background font-bold text-xs"
            name="role"
            onValueChange={(val: string) => onValueChange(user, val)}
            placeholder="Select role"
          />
        </div>
        <Button
          disabled={updating === user.id}
          variant="outline"
          size="sm"
          onclick={() => onDelete(user)}
          class="w-full h-10 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 font-bold"
        >
          <Trash2 class="size-4 mr-2" />
          Delete User
        </Button>
      {:else}
        <p class="text-xs font-bold text-muted-foreground italic opacity-50">
          {me.id === user?.id ? "Personal account" : "Restricted access"}
        </p>
      {/if}
    </div>
  </div>
{/if}
