<script lang="ts">
  import type { iMeeting } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Calendar, Clock, FileText, X } from "@lucide/svelte";
  import { format } from "date-fns";
  import * as Dialog from "$lib/components/ui/dialog";
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

<Dialog.Root bind:open {onOpenChange}>
  <Dialog.Content class="max-w-2xl max-h-[90vh] overflow-y-auto">
    <Dialog.Header class="border-b pb-4">
      <div class="flex items-start gap-4">
        {#if (meeting as any).image?.url}
          <img
            src={(meeting as any).image.url}
            alt={meeting.type}
            class="h-20 w-28 rounded-lg object-cover flex-shrink-0"
          />
        {:else}
          <div
            class="flex h-20 w-28 items-center justify-center rounded-lg bg-muted flex-shrink-0"
          >
            <span class="text-4xl">📅</span>
          </div>
        {/if}
        <div class="flex-1">
          <Dialog.Title class="text-2xl">{meeting.type}</Dialog.Title>
          <Dialog.Description class="mt-1">
            {formattedDate} at {new Date(meeting.datetime).toLocaleTimeString()}
          </Dialog.Description>
        </div>
      </div>
    </Dialog.Header>

    <!-- Content -->
    <div class="space-y-6 py-6">
      <!-- Type Badge -->
      <div>
        <Badge
          class={`${getMeetingTypeColor(meeting.type)} text-white text-base px-4 py-1.5`}
        >
          {meeting.type}
        </Badge>
      </div>

      <!-- Meeting Details Grid -->
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="flex items-start gap-3 rounded-lg border p-4">
          <Calendar class="h-6 w-6 text-muted-foreground mt-0.5" />
          <div>
            <p class="text-sm font-medium text-muted-foreground">Date</p>
            <p class="text-base font-semibold">
              {formattedDate}
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3 rounded-lg border p-4">
          <Clock class="h-6 w-6 text-muted-foreground mt-0.5" />
          <div>
            <p class="text-sm font-medium text-muted-foreground">Time</p>
            <p class="text-base font-semibold">
              {new Date(meeting.datetime).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      <!-- Image Section -->
      {#if (meeting as any).image?.url}
        <div class="rounded-lg border p-4">
          <h3 class="mb-3 font-semibold flex items-center gap-2">
            <FileText class="h-5 w-5" />
            Meeting Banner
          </h3>
          <img
            src={(meeting as any).image.url}
            alt={meeting.type}
            class="w-full rounded-lg object-cover max-h-96"
          />
        </div>
      {/if}

      <!-- Metadata -->
      <div class="rounded-lg border p-4 bg-muted/30">
        <p class="text-sm text-muted-foreground">
          Created on {format(
            new Date(meeting.createdAt),
            "MMMM dd, yyyy 'at' h:mm a",
          )}
        </p>
        <p class="text-sm text-muted-foreground mt-1">
          Last updated {format(
            new Date(meeting.updatedAt),
            "MMMM dd, yyyy 'at' h:mm a",
          )}
        </p>
      </div>
    </div>

    <Dialog.Footer class="border-t pt-4">
      {#if adminAndTeachersRoles.includes(user.role as Role)}
        <div class="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            class="flex-1 sm:flex-none"
            onclick={onEdit}
          >
            Edit Meeting
          </Button>
          <Button
            variant="destructive"
            class="flex-1 sm:flex-none"
            onclick={onDelete}
          >
            Delete Meeting
          </Button>
        </div>
      {:else}
        <Button variant="outline" onclick={() => (open = false)}>Close</Button>
      {/if}
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
