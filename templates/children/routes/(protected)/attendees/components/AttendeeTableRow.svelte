<script lang="ts">
  import { TableCell, TableRow } from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Eye, Edit, Trash2, Calendar } from "@lucide/svelte";
  import { format } from "date-fns";
  import type { iAttendee, iChild, iMeeting } from "$lib/interface";
  import { cn } from "$lib/utils";

  interface Props {
    attendee: iAttendee;
    index: number;
    onClick: () => void;
  }

  let { attendee, index, onClick }: Props = $props();

  const child = attendee.child as iChild;
  const meeting = attendee.meeting as iMeeting;

  const getMeetingBadgeColor = (type?: string) => {
    const hash =
      type?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    const colors = [
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    ];
    return colors[hash % colors.length];
  };
</script>

<TableRow class="cursor-pointer hover:bg-muted/50" onclick={onClick}>
  <TableCell class="font-medium">{index + 1}.</TableCell>
  <TableCell class="font-medium">
    <div class="flex items-center gap-2">
      <!-- Avatar -->
      {#if child?.image && typeof child.image === "object"}
        <img
          src={child.image.url}
          alt={child.name}
          class="h-10 w-10 rounded-full object-cover border-2 border-background"
        />
      {:else}
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-muted border-2 border-background"
        >
          <span class="text-lg">👤</span>
        </div>
      {/if}
      <div>
        <div class="font-semibold">{child?.name || "Unknown Child"}</div>
        <div class="text-xs text-muted-foreground">
          {child?.ageGroup || "N/A"}
        </div>
      </div>
    </div>
  </TableCell>
  <TableCell>
    {#if meeting?.type}
      <Badge
        variant="outline"
        class={cn("border-0", getMeetingBadgeColor(meeting.type))}
      >
        {meeting.type}
      </Badge>
    {:else}
      <span class="text-sm text-muted-foreground">Unknown</span>
    {/if}
  </TableCell>
  <TableCell>
    <div class="flex items-center gap-1 text-sm">
      <Calendar class="h-3 w-3 text-muted-foreground" />
      {meeting?.datetime
        ? format(new Date(meeting.datetime), "MMM dd, yyyy")
        : "N/A"}
    </div>
  </TableCell>
  <TableCell>
    <div class="text-sm text-muted-foreground">
      {attendee.notes || "-"}
    </div>
  </TableCell>
  <TableCell class="text-right">
    <Button
      variant="ghost"
      size="sm"
      onclick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      class="h-8 w-8 p-0"
    >
      <Eye class="h-4 w-4" />
    </Button>
  </TableCell>
</TableRow>
