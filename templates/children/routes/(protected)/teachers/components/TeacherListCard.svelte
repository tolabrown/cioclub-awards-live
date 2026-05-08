<script lang="ts">
  import { TableCell, TableRow } from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Trash2, Edit, Eye } from "@lucide/svelte";
  import type { iTeacher, iUser } from "$lib/interface";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";
  import { authorizedStates } from ".";

  interface Props {
    teacher: iTeacher;
    i: number;
    screen: "desktop" | "mobile";
    onDelete: (teacher: iTeacher) => void;
    onView?: (teacher: iTeacher) => void;
  }

  let { teacher, i, onDelete, screen, onView }: Props = $props();

  const user = page.data.user as User;
  const { isAuthorized } = authorizedStates(user, teacher);

  const num = i + 1;
  const getTypeColor = (type?: string) => {
    switch (type) {
      case "Full Time":
        return "bg-emerald-500";
      case "Volunteer":
        return "bg-blue-500";
      case "Utility":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLocationColor = (location?: string) => {
    switch (location) {
      case "Apostolic Center":
        return "bg-purple-500";
      case "Magodo Church":
        return "bg-pink-500";
      case "Egbeda Church":
        return "bg-cyan-500";
      case "Island Church":
        return "bg-teal-500";
      case "Ajegunle Church":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };
</script>

{#if screen === "desktop"}
  {@render Desktop(num, teacher, onDelete, () => onView?.(teacher))}
{:else}
  {@render Mobile(num, teacher, onDelete)}
{/if}

{#snippet Desktop(
  num: number,
  teacher: iTeacher,
  onDelete: (teacher: iTeacher) => void,
  onClick: () => void,
)}
  <TableRow class="cursor-pointer hover:bg-muted/50" onclick={onClick}>
    <TableCell class="font-medium">{num}.</TableCell>
    <TableCell class="font-medium">
      <div class="flex items-center gap-2">
        <!-- Avatar -->
        <button
          class="relative cursor-pointer transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
          onclick={() => onView?.(teacher)}
        >
          {#if (teacher as any).image?.url}
            <img
              src={(teacher as any).image.url}
              alt={teacher.name}
              class="h-12 w-12 rounded-full object-cover"
            />
          {:else}
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-muted border-2 border-muted-foreground/20"
            >
              <span class="text-xl">👨‍🏫</span>
            </div>
          {/if}
        </button>

        <div class="flex flex-col">
          <span class="font-semibold">{teacher.name}</span>
          {#if teacher.email}
            <span class="text-xs text-muted-foreground">{teacher.email}</span>
          {/if}
        </div>
      </div>
    </TableCell>
    <TableCell>
      {#if teacher.teacherType}
        <Badge class={`${getTypeColor(teacher.teacherType)} text-white`}>
          {teacher.teacherType}
        </Badge>
      {:else}
        <span class="text-muted-foreground">-</span>
      {/if}
    </TableCell>
    <TableCell>
      {#if teacher.location}
        <Badge class={`${getLocationColor(teacher.location)} text-white`}>
          {teacher.location}
        </Badge>
      {:else}
        <span class="text-muted-foreground">-</span>
      {/if}
    </TableCell>
    <TableCell>
      {#if teacher.phone}
        <span class="text-sm">{teacher.phone}</span>
      {:else}
        <span class="text-muted-foreground">-</span>
      {/if}
    </TableCell>
    <TableCell class="text-right">
      <div class="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          onclick={(e) => {
            e.stopPropagation();
            onView?.(teacher);
          }}
        >
          <Eye class="h-4 w-4" />
        </Button>
        {#if isAuthorized}
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            href={`/teachers/${teacher.id}`}
            onclick={(e) => e.stopPropagation()}
          >
            <Edit class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-destructive hover:text-destructive"
            onclick={(e) => {
              e.stopPropagation();
              onDelete(teacher);
            }}
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        {/if}
      </div>
    </TableCell>
  </TableRow>
{/snippet}

{#snippet Mobile(
  num: number,
  teacher: iTeacher,
  onDelete: (teacher: iTeacher) => void,
)}
  <div class="rounded-lg border bg-card p-4 shadow-sm">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        {#if (teacher as any).image?.url}
          <img
            src={(teacher as any).image.url}
            alt={teacher.name}
            class="h-12 w-12 rounded-full object-cover"
          />
        {:else}
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
          >
            <span class="text-xl">👨‍🏫</span>
          </div>
        {/if}
        <div>
          <p class="font-semibold">{teacher.name}</p>
          {#if teacher.teacherType}
            <Badge
              class={`${getTypeColor(teacher.teacherType)} text-white text-xs`}
            >
              {teacher.teacherType}
            </Badge>
          {/if}
        </div>
      </div>
      <span class="text-sm text-muted-foreground">{num}</span>
    </div>

    {#if teacher.location}
      <div class="mt-2">
        <Badge class={`${getLocationColor(teacher.location)} text-white`}>
          {teacher.location}
        </Badge>
      </div>
    {/if}

    <div class="mt-3 flex gap-2">
      <Button
        variant="outline"
        size="sm"
        class="flex-1"
        href={`/teachers/${teacher.id}`}
      >
        <Edit class="mr-1 h-3 w-3" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        class="flex-1 text-destructive hover:text-destructive"
        onclick={() => onDelete(teacher)}
      >
        <Trash2 class="mr-1 h-3 w-3" />
        Delete
      </Button>
    </div>
  </div>
{/snippet}
