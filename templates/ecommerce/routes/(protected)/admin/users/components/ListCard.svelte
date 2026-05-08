<script lang="ts">
  import { TableCell, TableRow } from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Trash2, UserCog } from "@lucide/svelte";
  import { format } from "date-fns";
  import SelectComponent from "./select-component.svelte";
  import { toast } from "svelte-sonner";
  import type { User } from "$lib/auth";
  import { page } from "$app/state";
  import { admin } from "$lib/auth-client";
  import { getRoleBadgeVariant, roles } from "$lib/authentication/fxn";
  import { adminRoles, Role } from "$lib/constants/index";
  import Identity from "$lib/authentication/ui/user/Identity.svelte";

  interface Props {
    user: User;
    i: number;
    screen: "desktop" | "mobile";
    onDelete: (user: User) => void;
  }

  let { user, i, onDelete, screen }: Props = $props();
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
      const response = await fetch(`/api/users/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { role: newRole } }),
      });
      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);

      toast.success("Updated", {
        description: `User role updated to ${newRole}.`,
      });
      window.location.reload();
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
</script>

{#if screen === "desktop"}
  <TableRow>
    <TableCell>{num}.</TableCell>
    <TableCell><Identity {user} /></TableCell>
    <TableCell>
      <Badge variant={roleVariant}>{user.role}</Badge>
    </TableCell>
    <TableCell>{format(new Date(user.createdAt), "MMM dd, yyyy")}</TableCell>
    <TableCell class="text-right">
      <div class="flex items-center justify-end gap-2">
        {#if isAdmin && me.id !== user?.id}
          <SelectComponent
            disabled={updating === user.id}
            value={user.role as string}
            options={roles}
            name="role"
            onValueChange={(val: string) => onValueChange(user, val)}
            placeholder="Select role"
          />
          <Button
            variant="ghost"
            onclick={(e) => {
              e.stopPropagation();
              onDelete(user);
            }}
            disabled={updating === user.id}
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        {:else}
          <Badge variant="outline"
            >{me.id === user?.id ? "YOU" : "LOCKED"}</Badge
          >
        {/if}
      </div>
    </TableCell>
  </TableRow>
{:else}
  <div class="rounded-xl border bg-card p-4 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <Identity {user} />
        <div class="mt-3 flex gap-2">
          <Badge variant="secondary">ID: {num}</Badge>
          <Badge variant={roleVariant}>{user.role}</Badge>
        </div>
      </div>
    </div>

    <div class="mt-4 space-y-3 pt-4 border-t border-dashed">
      <div
        class="flex items-center justify-between text-xs text-muted-foreground"
      >
        <span>Joined On</span>
        <span class="text-foreground"
          >{format(new Date(user.createdAt), "MMM dd, yyyy")}</span
        >
      </div>

      <div class="flex items-center gap-2">
        {#if isAdmin && me.id !== user?.id}
          <SelectComponent
            disabled={updating === user.id}
            value={user.role as string}
            options={roles}
            name="role"
            onValueChange={(val: string) => onValueChange(user, val)}
            placeholder="Select role"
          />
          <Button
            variant="outline"
            onclick={() => onDelete(user)}
            disabled={updating === user.id}
          >
            <Trash2 class="size-4" />
          </Button>
        {:else}
          <div
            class="w-full text-center text-xs font-bold text-muted-foreground"
          >
            {me.id === user?.id ? "YOUR ACCOUNT" : "LIMITED ACCESS"}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
