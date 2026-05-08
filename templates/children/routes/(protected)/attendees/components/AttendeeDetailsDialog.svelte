<script lang="ts">
  import type { iAttendee, iChild, iMeeting } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Calendar, FileText, Users, User as UserIcon } from "@lucide/svelte";
  import { format } from "date-fns";
  import * as Dialog from "$lib/components/ui/dialog";
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

<Dialog.Root bind:open {onOpenChange}>
  <Dialog.Content class="max-w-2xl max-h-[90vh] overflow-y-auto">
    <Dialog.Header>
      <div class="flex items-center gap-4">
        {#if child?.image && typeof child.image === "object"}
          <img
            src={child.image.url}
            alt={child.name}
            class="h-20 w-20 rounded-full object-cover"
          />
        {:else}
          <div
            class="flex h-20 w-20 items-center justify-center rounded-full bg-muted"
          >
            <span class="text-4xl">👤</span>
          </div>
        {/if}
        <div>
          <Dialog.Title class="text-2xl"
            >{child?.name || "Unknown Child"}</Dialog.Title
          >
          <Dialog.Description>
            Attendance for {meeting?.type || "Unknown Meeting"}
          </Dialog.Description>
        </div>
      </div>
    </Dialog.Header>

    <div class="space-y-4 mt-4">
      <!-- Meeting Card -->
      <div class="rounded-xl border bg-card p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold flex items-center gap-2 text-lg">
            <Users class="h-5 w-5 text-primary" />
            Meeting Details
          </h3>
          <Badge class={cn(getMeetingColor(meeting?.type), "text-white")}>
            {meeting?.type || "N/A"}
          </Badge>
        </div>

        <div class="space-y-4">
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
              <div class="w-full">
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
        <div class="rounded-lg border p-6 bg-muted/30">
          <h3 class="mb-3 font-semibold flex items-center gap-2">
            <UserIcon class="h-5 w-5" />
            Child Information
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-muted-foreground">Age Group:</span>
              <p class="font-medium">{child.ageGroup || "N/A"}</p>
            </div>
            <div>
              <span class="text-sm text-muted-foreground">Gender:</span>
              <p class="font-medium capitalize">{child.gender || "N/A"}</p>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <Dialog.Footer class="mt-6">
      {#if editors.includes(user.role as Role)}
        <div class="flex gap-2 w-full">
          <Button variant="outline" class="flex-1" onclick={onEdit}>Edit</Button
          >
          <Button variant="destructive" class="flex-1" onclick={onDelete}>
            Delete
          </Button>
        </div>
      {:else}
        <Button variant="outline" class="w-full" onclick={() => (open = false)}>
          Close
        </Button>
      {/if}
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
