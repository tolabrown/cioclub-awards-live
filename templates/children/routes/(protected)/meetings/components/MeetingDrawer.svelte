<script lang="ts">
  import type { iMeeting } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Calendar, Clock, FileText } from "@lucide/svelte";
  import { format } from "date-fns";
  import * as Drawer from "$lib/components/ui/drawer";
  import { adminAndTeachersRoles, Role } from "$lib/constants";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";

  interface Props {
    meeting: iMeeting;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
  }

  let {
    meeting,
    open = $bindable(),
    onOpenChange,
    onEdit,
    onDelete,
  }: Props = $props();

  const user = page.data.user as User;

  const formattedDate = $derived(
    meeting.datetime ? format(new Date(meeting.datetime), "MMMM dd, yyyy") : "N/A",
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

<Drawer.Root bind:open {onOpenChange}>
  <Drawer.Content class="max-h-[90vh]">
    <Drawer.Header class="border-b">
      <div class="flex items-center gap-3">
        {#if (meeting as any).image?.url}
          <img
            src={(meeting as any).image.url}
            alt={meeting.type}
            class="h-16 w-24 rounded-lg object-cover"
          />
        {:else}
          <div
            class="flex h-16 w-24 items-center justify-center rounded-lg bg-muted"
          >
            <span class="text-3xl">📅</span>
          </div>
        {/if}
        <div>
          <Drawer.Title class="text-xl">{meeting.type}</Drawer.Title>
          <Drawer.Description>
            {formattedDate} at {new Date(meeting.datetime).toLocaleTimeString()}
          </Drawer.Description>
        </div>
      </div>
    </Drawer.Header>

    <!-- Content -->
    <div class="space-y-4 overflow-y-auto p-4">
      <!-- Type Badge -->
      <div>
        <Badge
          class={`${getMeetingTypeColor(meeting.type)} text-white text-sm px-3 py-1`}
        >
          {meeting.type}
        </Badge>
      </div>

      <!-- Meeting Details -->
      <div class="space-y-3">
        <div class="flex items-start gap-3">
          <Calendar class="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p class="text-sm font-medium">Date</p>
            <p class="text-sm text-muted-foreground">
              {formattedDate}
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <Clock class="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p class="text-sm font-medium">Time</p>
            <p class="text-sm text-muted-foreground">
              {new Date(meeting.datetime).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      <!-- Image Section -->
      {#if (meeting as any).image?.url}
        <div class="rounded-lg border p-4">
          <h3 class="mb-3 font-semibold flex items-center gap-2">
            <FileText class="h-4 w-4" />
            Meeting Banner
          </h3>
          <img
            src={(meeting as any).image.url}
            alt={meeting.type}
            class="w-full rounded-lg object-cover max-h-64"
          />
        </div>
      {/if}

      <!-- Created Date -->
      <div class="rounded-lg border p-4">
        <p class="text-xs text-muted-foreground">
          Added {format(new Date(meeting.createdAt), "MMM dd, yyyy")}
        </p>
      </div>
    </div>

    <Drawer.Footer class="border-t">
      {#if adminAndTeachersRoles.includes(user.role as Role)}
        <div class="flex gap-2">
          <Button variant="outline" class="flex-1" onclick={onEdit}>Edit</Button
          >
          <Button variant="destructive" class="flex-1" onclick={onDelete}>
            Delete
          </Button>
        </div>
      {:else}
        <Button variant="outline" class="flex-1" onclick={() => (open = false)}
          >Close</Button
        >
      {/if}
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
