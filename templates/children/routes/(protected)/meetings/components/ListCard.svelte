<script lang="ts">
  import { TableCell, TableRow } from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Trash2, Edit, Eye } from "@lucide/svelte";
  import type { iMeeting } from "$lib/interface";
  import { getFormattedDateAndTime } from "$lib/fxns";
  import { editors, Role } from "$lib/constants";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";

  interface Props {
    meeting: iMeeting;
    i: number;
    screen: "desktop" | "mobile";
    onDelete: (meeting: iMeeting) => void;
    onView?: (meeting: iMeeting) => void;
  }

  let { meeting, i, onDelete, screen, onView }: Props = $props();

  const num = i + 1;
  const user = page.data.user as User;

  const formatted = $derived(
    meeting.datetime
      ? getFormattedDateAndTime(meeting.datetime)
      : { date: "N/A", time: "N/A" }
  );

  const getMeetingTypeColor = (type?: string) => {
    const hash =
      type?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    const colors = [
      "bg-purple-500",
      "bg-orange-500",
      "bg-cyan-500",
      "bg-emerald-500",
      "bg-red-500",
      "bg-blue-500",
      "bg-pink-500",
    ];
    return colors[hash % colors.length];
  };
</script>

{@render Desktop(num, meeting, onDelete, () => onView?.(meeting))}
{#snippet Desktop(
  num: number,
  meeting: iMeeting,
  onDelete: (meeting: iMeeting) => void,
  onClick: () => void
)}
  <TableRow class="cursor-pointer hover:bg-muted/50" onclick={onClick}>
    <TableCell class="font-medium">{num}.</TableCell>
    <TableCell class="font-medium">
      <div class="flex items-center gap-2">
        <!-- Image -->
        <button
          class="relative cursor-pointer transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg overflow-hidden"
          onclick={() => onView?.(meeting)}
        >
          {#if (meeting as any).image?.url}
            <img
              src={(meeting as any).image.url}
              alt={meeting.type}
              class="size-12 object-cover"
            />
          {:else}
            <div
              class="flex h-12 w-16 items-center justify-center bg-muted border-2 border-muted-foreground/20"
            >
              <span class="text-xl">📅</span>
            </div>
          {/if}
        </button>
        <div>
          <div class="font-semibold line-clamp-1">{meeting.type}</div>
          <div class="text-xs text-muted-foreground">
            {formatted.date}
          </div>
        </div>
      </div>
    </TableCell>
    <TableCell>
      <Badge class={`${getMeetingTypeColor(meeting.type)} text-white`}>
        {meeting.type}
      </Badge>
    </TableCell>
    <TableCell>
      <div class="text-sm">{formatted.date}</div>
    </TableCell>
    <TableCell>
      <div class="text-sm">{formatted.time}</div>
    </TableCell>
    <TableCell class="flex h-full items-center justify-end gap-2 text-right">
      <Button
        variant="ghost"
        size="sm"
        onclick={(e) => {
          e.stopPropagation();
          onView?.(meeting);
        }}
      >
        <Eye class="h-4 w-4" />
      </Button>
      {#if editors.includes(user.role as Role)}
        <Button
          variant="ghost"
          size="sm"
          href={`/meetings/${meeting.id}`}
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
            onDelete(meeting);
          }}
          class="h-8 w-8 cursor-pointer p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
      {/if}
    </TableCell>
  </TableRow>
{/snippet}
