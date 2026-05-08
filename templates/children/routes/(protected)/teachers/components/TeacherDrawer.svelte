<script lang="ts">
  import type { iTeacher } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import {
    Phone,
    Mail,
    MapPin,
    Briefcase,
    Calendar,
    FileText,
    Users,
    Maximize2,
    X,
  } from "@lucide/svelte";
  import WhatsApp from "$lib/components/icons/WhatsApp.svelte";
  import { fade, slide } from "svelte/transition";
  import * as Drawer from "$lib/components/ui/drawer";
  import { cn } from "$lib/utils";
  import { adminAndTeachersRoles, Role } from "$lib/constants";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";
  import { authorizedStates } from ".";

  interface Props {
    teacher: iTeacher;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
  }

  let {
    teacher,
    open = $bindable(),
    onOpenChange,
    onEdit,
    onDelete,
  }: Props = $props();

  const user = page.data.user as User;

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

  const parseCapacity = (capacity?: string) => {
    if (!capacity) return [];
    try {
      return JSON.parse(capacity);
    } catch {
      return [];
    }
  };

  const capacityList = $derived(parseCapacity(teacher.capacity as string));

  let selectedMedia: any = $state(null);

  const selectMedia = (file: any) => {
    if (selectedMedia === file) {
      selectedMedia = null;
    } else {
      selectedMedia = file;
    }
  };

  const { isAuthorized } = authorizedStates(user, teacher);
</script>

<Drawer.Root bind:open {onOpenChange}>
  <Drawer.Content class="max-h-[90vh]">
    <Drawer.Header class="border-b">
      <div class="flex items-center gap-3">
        {#if (teacher as any).image?.url}
          <img
            src={(teacher as any).image.url}
            alt={teacher.name}
            class="h-16 w-16 rounded-full object-cover"
          />
        {:else}
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-muted"
          >
            <span class="text-3xl">👨‍🏫</span>
          </div>
        {/if}
        <div>
          <Drawer.Title class="text-xl">{teacher.name}</Drawer.Title>
          <Drawer.Description>
            {teacher.teacherType || "Teacher"}
          </Drawer.Description>
        </div>
      </div>
    </Drawer.Header>

    <!-- Content -->
    <div class="space-y-4 overflow-y-auto p-4">
      <!-- Type and Location Badges -->
      <div class="flex flex-wrap gap-2">
        {#if teacher.teacherType}
          <Badge
            class={`${getTypeColor(teacher.teacherType)} text-white text-sm px-3 py-1`}
          >
            {teacher.teacherType}
          </Badge>
        {/if}
        {#if teacher.location}
          <Badge
            class={`${getLocationColor(teacher.location)} text-white text-sm px-3 py-1`}
          >
            {teacher.location}
          </Badge>
        {/if}
      </div>

      <!-- Contact Info -->
      <div class="space-y-3">
        {#if teacher.phone}
          <div class="flex items-start gap-3">
            <Phone class="mt-1 h-4 w-4 text-muted-foreground" />
            <div class="flex-1">
              <p class="text-sm font-medium">Phone</p>
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  href={`tel:${teacher.phone}`}
                  class="text-sm"
                >
                  {teacher.phone}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  href={`https://wa.me/${teacher.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  class="flex items-center gap-1"
                >
                  <WhatsApp class="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        {/if}

        {#if teacher.email}
          <div class="flex items-start gap-3">
            <Mail class="mt-1 h-4 w-4 text-muted-foreground" />
            <div class="flex-1">
              <p class="text-sm font-medium">Email</p>
              <Button
                variant="outline"
                size="sm"
                href={`mailto:${teacher.email}`}
                class="text-sm"
              >
                {teacher.email}
              </Button>
            </div>
          </div>
        {/if}

        {#if teacher.birthDay}
          <div class="flex items-start gap-3">
            <Calendar class="mt-1 h-4 w-4 text-muted-foreground" />
            <div class="flex-1">
              <p class="text-sm font-medium">Birthday</p>
              <p class="text-sm text-muted-foreground">{teacher.birthDay}</p>
            </div>
          </div>
        {/if}

        {#if teacher.assignedClass}
          <div class="flex items-start gap-3">
            <Briefcase class="mt-1 h-4 w-4 text-muted-foreground" />
            <div class="flex-1">
              <p class="text-sm font-medium">Assigned Class</p>
              <p class="text-sm text-muted-foreground">
                {teacher.assignedClass}
              </p>
            </div>
          </div>
        {/if}

        {#if capacityList.length > 0}
          <div class="flex items-start gap-3">
            <Users class="mt-1 h-4 w-4 text-muted-foreground" />
            <div class="flex-1">
              <p class="text-sm font-medium">Age Group Capacity</p>
              <div class="flex flex-wrap gap-1 mt-1">
                {#each capacityList as ageGroup}
                  <Badge variant="secondary" class="text-xs">
                    {ageGroup}
                  </Badge>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        {#if teacher.note}
          <div class="flex items-start gap-3">
            <FileText class="mt-1 h-4 w-4 text-muted-foreground" />
            <div class="flex-1">
              <p class="text-sm font-medium">Note</p>
              <p class="text-sm text-muted-foreground whitespace-pre-wrap">
                {teacher.note}
              </p>
            </div>
          </div>
        {/if}
      </div>

      <!-- Additional Media -->
      {#if teacher.files && teacher.files.length > 0}
        <div class="rounded-lg border p-4">
          <h3 class="mb-3 font-semibold">
            Media Files ({teacher.files.length})
          </h3>

          <!-- Media Grid -->
          <div class="grid grid-cols-3 gap-2">
            {#each teacher.files as file}
              <button
                class={cn(
                  "relative overflow-hidden rounded-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  selectedMedia === file && "ring-2 ring-primary ring-offset-2",
                )}
                onclick={() => selectMedia(file)}
              >
                {#if file.type?.startsWith("image/")}
                  <img
                    src={file.url}
                    alt={file.name || "Media"}
                    class="h-20 w-full object-cover transition-transform hover:scale-105"
                  />
                {:else if file.type?.startsWith("video/")}
                  <div class="relative h-20 w-full bg-black/10">
                    <video src={file.url} class="h-full w-full object-cover"
                      ><track kind="captions" /></video
                    >
                    <div
                      class="absolute inset-0 flex items-center justify-center bg-black/20"
                    >
                      <span class="text-xl">▶️</span>
                    </div>
                  </div>
                {/if}
              </button>
            {/each}
          </div>

          <!-- Full Width Preview -->
          {#if selectedMedia}
            <div
              transition:slide={{ duration: 300 }}
              class="mt-4 overflow-hidden rounded-xl border bg-muted/30"
            >
              <div
                class="flex items-center justify-between border-b bg-muted/50 px-4 py-2"
              >
                <span class="text-sm font-medium truncate max-w-[200px]">
                  {selectedMedia.name || "Media Preview"}
                </span>
                <div class="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8"
                    onclick={() => window.open(selectedMedia.url, "_blank")}
                    title="Open in new tab"
                  >
                    <Maximize2 class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onclick={() => (selectedMedia = null)}
                  >
                    <X class="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div
                class="relative flex items-center justify-center bg-black/5 p-2 dark:bg-black/40 min-h-[300px]"
              >
                {#if selectedMedia.type?.startsWith("image/")}
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.name || "Full preview"}
                    class="max-h-[500px] w-full rounded-lg object-contain shadow-sm"
                    transition:fade={{ duration: 200 }}
                  />
                {:else if selectedMedia.type?.startsWith("video/")}
                  <video
                    src={selectedMedia.url}
                    controls
                    class="max-h-[500px] w-full rounded-lg shadow-sm"
                    transition:fade={{ duration: 200 }}
                  >
                    <track kind="captions" />
                  </video>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Status -->
      <div class="rounded-lg border p-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Status</span>
          <Badge variant={teacher.active ? "default" : "secondary"}>
            {teacher.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <Drawer.Footer class="border-t">
      {#if isAuthorized}
        <div class="flex gap-2">
          <Button variant="outline" class="flex-1" onclick={onEdit}>
            Edit Teacher
          </Button>
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
