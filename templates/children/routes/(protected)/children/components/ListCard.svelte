<script lang="ts">
  import { TableCell, TableRow } from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Trash2, Edit, Eye, XIcon } from "@lucide/svelte";
  import { format, differenceInYears } from "date-fns";
  import type { iChild } from "$lib/interface";
  import { editors, Role } from "$lib/constants";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";

  interface Props {
    child: iChild;
    i: number;
    screen: "desktop" | "mobile";
    onDelete: (child: iChild) => void;
    onView?: (child: iChild) => void;
  }

  let { child, i, onDelete, screen, onView }: Props = $props();

  const num = i + 1;
  const user = page.data.user as User;

  // Calculate age from DOB
  const age = $derived(
    child.dateOfBirth
      ? differenceInYears(new Date(), new Date(child.dateOfBirth))
      : null
  );

  // Access parents array
  const parents = $derived((child as any).parents || []);

  const getAgeGroupColor = (ageGroup?: string) => {
    switch (ageGroup) {
      case "Nursery":
        return "bg-purple-500";
      case "Toddlers":
        return "bg-[#fd6c02]";
      case "Beginners":
        return "bg-cyan-500";
      case "Primary":
        return "bg-emerald-500";
      case "Juniors":
        return "bg-[#f71002]";
      default:
        return "bg-gray-500";
    }
  };
</script>

{#if screen === "desktop"}
  {@render Desktop(num, child, onDelete, () => onView?.(child))}
{:else}
  {@render Mobile(num, child, onDelete)}
{/if}

{#snippet Desktop(
  num: number,
  child: iChild,
  onDelete: (child: iChild) => void,
  onClick: () => void
)}
  <TableRow class="cursor-pointer hover:bg-muted/50" onclick={onClick}>
    <TableCell class="font-medium">{num}.</TableCell>
    <TableCell class="font-medium">
      <div class="flex items-center gap-2">
        <!-- Avatar -->
        <button
          class="relative cursor-pointer transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
          onclick={() => onView?.(child)}
        >
          {#if (child as any).image?.url}
            <img
              src={(child as any).image.url}
              alt={child.name}
              class="h-12 w-12 rounded-full object-cover"
            />
          {:else}
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-muted border-2 border-muted-foreground/20"
            >
              <span class="text-xl">👤</span>
            </div>
          {/if}
        </button>
        <div>
          <div class="font-semibold">{child.name}</div>
          <div class="text-xs text-muted-foreground">
            {age !== null ? `${age} years` : "Age not set"}
          </div>
        </div>
      </div>
    </TableCell>
    <TableCell>
      {#if child.ageGroup}
        <Badge class={`${getAgeGroupColor(child.ageGroup)} text-white`}>
          {child.ageGroup}
        </Badge>
      {:else}
        <span class="text-sm text-muted-foreground">Not assigned</span>
      {/if}
    </TableCell>
    <TableCell>
      <div class="space-y-1">
        {#if parents.length > 0}
          {#each parents as parent}
            <div>
              <div class="font-medium text-sm">
                {parent.name}
                <span class="text-xs text-muted-foreground"
                  >({parent.parentType})</span
                >
              </div>
              {#if parent.email}
                <div class="text-xs text-muted-foreground">{parent.email}</div>
              {/if}
            </div>
          {/each}
        {:else}
          <span class="text-sm text-muted-foreground">No parents</span>
        {/if}
      </div>
    </TableCell>
    <TableCell>
      <div class="space-y-1">
        {#if parents.length > 0}
          {#each parents as parent}
            <div class="text-sm">{parent.phone}</div>
          {/each}
        {:else}
          <span class="text-sm text-muted-foreground">-</span>
        {/if}
      </div>
    </TableCell>
    <TableCell class="flex h-full items-center justify-end gap-2 text-right">
      <Button
        variant="ghost"
        size="sm"
        onclick={(e) => {
          e.stopPropagation();
          onView?.(child);
        }}
      >
        <Eye class="h-4 w-4" />
      </Button>
      {#if editors.includes(user.role as Role)}
        <Button
          variant="ghost"
          size="sm"
          href={`/children/${child.id}`}
          onclick={(e) => e.stopPropagation()}
          class="h-8 w-8 cursor-pointer p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <Edit class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onclick={(e) => {
            e.stopPropagation();
            onDelete(child);
          }}
          class="h-8 w-8 cursor-pointer p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
      {/if}
    </TableCell>
  </TableRow>
{/snippet}

{#snippet Mobile(num: number, child: iChild, onDelete: (child: iChild) => void)}
  <div class="rounded-lg border bg-white shadow-sm dark:bg-secondary/50">
    <!-- Header Section -->
    <div class="border-b p-3">
      <div class="flex items-start justify-between gap-3">
        <!-- Avatar -->
        {#if (child as any).image?.url}
          <img
            src={(child as any).image.url}
            alt={child.name}
            class="h-14 w-14 rounded-full object-cover flex-shrink-0"
          />
        {:else}
          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-muted border-2 border-muted-foreground/20 flex-shrink-0"
          >
            <span class="text-2xl">👤</span>
          </div>
        {/if}

        <div class="min-w-0 flex-1">
          <div class="font-semibold">{child.name}</div>
          <div class="mt-1 text-xs text-muted-foreground">
            {age !== null ? `${age} years` : "Age not set"}
          </div>
          <div class="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge class="text-xs">{num}</Badge>
            {#if child.ageGroup}
              <Badge
                class={`${getAgeGroupColor(child.ageGroup)} text-xs text-white`}
              >
                {child.ageGroup}
              </Badge>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="space-y-2 p-3">
      <!-- Parent Info -->
      <div>
        <div class="text-xs font-medium text-muted-foreground mb-1">
          Parents
        </div>
        {#if parents.length > 0}
          {#each parents as parent}
            <div class="mb-2 last:mb-0">
              <div class="font-medium text-sm">
                {parent.name}
                <span class="text-xs text-muted-foreground"
                  >({parent.parentType})</span
                >
              </div>
              <div class="text-xs text-muted-foreground">{parent.phone}</div>
            </div>
          {/each}
        {:else}
          <div class="text-sm text-muted-foreground">No parents listed</div>
        {/if}
      </div>

      <!-- Created Date -->
      <div class="flex items-center justify-between text-xs pt-2 border-t">
        <span class="text-muted-foreground">
          Added {format(new Date(child.createdAt), "MMM dd, yyyy")}
        </span>
      </div>
    </div>

    <!-- Action Footer -->
    {#if editors.includes(user.role as Role)}
      <div
        class="flex items-center justify-end gap-2 border-t bg-muted/30 px-3 py-2"
      >
        <Button
          variant="outline"
          size="sm"
          href={`/children/${child.id}`}
          class="size-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <Edit class="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onclick={() => onDelete(child)}
          class="size-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 class="size-3.5" />
        </Button>
      </div>
    {/if}
  </div>
{/snippet}
