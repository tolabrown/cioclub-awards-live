<script lang="ts">
  import type { iAttendee, iChild, iMeeting } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Calendar, FileText, Users, User as UserIcon } from "@lucide/svelte";
  import { format } from "date-fns";
  import * as Drawer from "$lib/components/ui/drawer";
  import { cn } from "$lib/utils";
  import { editors, Role } from "$lib/constants";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";

  interface Props {
    attendee: iAttendee;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
  }

  let {
    attendee,
    open = $bindable(),
    onOpenChange,
    onEdit,
    onDelete,
  }: Props = $props();

  const user = page.data.user as User;
  const child = attendee.child as iChild;
  const meeting = attendee.meeting as iMeeting;

  const getMeetingColor = (type?: string) => {
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

<Drawer.Root bind:open {onOpenChange}>
  <Drawer.Content class="max-h-[90vh]">
    <Drawer.Header class="border-b">
      <div class="flex items-center gap-3">
        {#if child?.image && typeof child.image === "object"}
          <img
            src={child.image.url}
            alt={child.name}
            class="h-16 w-16 rounded-full object-cover"
          />
        {:else}
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-muted"
          >
            <span class="text-3xl">👤</span>
          </div>
        {/if}
        <div>
          <Drawer.Title class="text-xl"
            >{child?.name || "Unknown Child"}</Drawer.Title
          >
          <Drawer.Description>
            {meeting?.type || "Unknown Meeting"}
          </Drawer.Description>
        </div>
      </div>
    </Drawer.Header>

    <!-- Content -->
    <div class="space-y-4 overflow-y-auto p-4">
      <!-- Meeting Card -->
      <div class="rounded-xl border bg-card p-4 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold flex items-center gap-2">
            <Users class="h-5 w-5 text-primary" />
            Meeting Attendance
          </h3>
          <Badge class={cn(getMeetingColor(meeting?.type), "text-white")}>
            {meeting?.type || "N/A"}
          </Badge>
        </div>

        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <Calendar class="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p class="text-sm font-medium">Meeting Date & Time</p>
              <p class="text-sm text-muted-foreground">
                {meeting?.datetime
                  ? format(
                      new Date(meeting.datetime),
                      "MMMM dd, yyyy 'at' h:mm a",
                    )
                  : "N/A"}
              </p>
            </div>
          </div>

          {#if attendee.notes}
            <div class="flex items-start gap-3">
              <FileText class="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p class="text-sm font-medium">Notes</p>
                <p class="text-sm text-muted-foreground whitespace-pre-wrap">
                  {attendee.notes}
                </p>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Child Info Summary -->
      {#if child}
        <div class="rounded-lg border p-4 bg-muted/30">
          <h3 class="mb-2 font-semibold flex items-center gap-2 text-sm">
            <UserIcon class="h-4 w-4" />
            Child Details
          </h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-muted-foreground">Age Group:</span>
              <span class="font-medium ml-1">{child.ageGroup || "N/A"}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Gender:</span>
              <span class="font-medium ml-1 capitalize"
                >{child.gender || "N/A"}</span
              >
            </div>
          </div>
        </div>
      {/if}
    </div>

    <Drawer.Footer class="border-t">
      {#if editors.includes(user.role as Role)}
        <div class="flex gap-2">
          <Button variant="outline" class="flex-1" onclick={onEdit}>Edit</Button
          >
          <Button variant="destructive" class="flex-1" onclick={onDelete}>
            Delete
          </Button>
        </div>
      {:else}
        <Button variant="outline" class="flex-1" onclick={() => (open = false)}>
          Close
        </Button>
      {/if}
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
