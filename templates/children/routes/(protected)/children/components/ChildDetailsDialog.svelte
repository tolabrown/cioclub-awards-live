<script lang="ts">
  import type { iChild } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import {
    Phone,
    Mail,
    Calendar,
    AlertCircle,
    FileText,
    X,
    Maximize2,
  } from "@lucide/svelte";
  import WhatsApp from "$lib/components/icons/WhatsApp.svelte";
  import { format, differenceInYears } from "date-fns";
  import { fade, slide } from "svelte/transition";
  import * as Dialog from "$lib/components/ui/dialog";
  import { cn } from "$lib/utils";
  import { adminAndTeachersRoles, editors, Role } from "$lib/constants";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";

  interface Props {
    child: iChild;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: () => void;
    onDelete?: () => void;
    readonly?: boolean;
  }

  let {
    child,
    open = $bindable(),
    onOpenChange,
    onEdit,
    onDelete,
    readonly = false,
  }: Props = $props();

  const user = page.data.user as User;

  const age = $derived(
    child.dateOfBirth
      ? differenceInYears(new Date(), new Date(child.dateOfBirth))
      : null,
  );

  const parents = $derived((child as any).parents || []);

  const getAgeGroupColor = (ageGroup?: string) => {
    switch (ageGroup) {
      case "Nursery":
        return "bg-pink-500";
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

  let selectedMedia: any = $state(null);

  const selectMedia = (file: any) => {
    if (selectedMedia === file) {
      selectedMedia = null;
    } else {
      selectedMedia = file;
    }
  };
</script>

<Dialog.Root bind:open {onOpenChange}>
  <Dialog.Content class="sm:max-w-2xl">
    <Dialog.Header>
      <div class="flex items-center gap-4">
        {#if (child as any).image?.url}
          <img
            src={(child as any).image.url}
            alt={child.name}
            class="h-16 w-16 rounded-full object-cover border-2 border-muted"
          />
        {:else}
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-muted border-2 border-muted-foreground/20"
          >
            <span class="text-3xl">👤</span>
          </div>
        {/if}
        <div>
          <Dialog.Title class="text-xl">{child.name}</Dialog.Title>
          <Dialog.Description>
            {age !== null ? `${age} years old` : "Age not set"}
          </Dialog.Description>
        </div>
      </div>
    </Dialog.Header>

    <div class="space-y-4 py-4 max-h-[50vh] overflow-y-auto">
      <!-- Age Group Badge -->
      {#if child.ageGroup}
        <div>
          <Badge
            class={`${getAgeGroupColor(child.ageGroup)} text-white text-sm px-3 py-1`}
          >
            {child.ageGroup}
          </Badge>
        </div>
      {/if}

      <!-- Basic Info -->
      <div class="space-y-3">
        {#if child.dateOfBirth}
          <div class="flex items-start gap-3">
            <Calendar class="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p class="text-sm font-medium">Date of Birth</p>
              <p class="text-sm text-muted-foreground">
                {format(new Date(child.dateOfBirth), "MMMM dd, yyyy")}
              </p>
            </div>
          </div>
        {/if}

        {#if child.gender}
          <div class="flex items-start gap-3">
            <div class="h-5 w-5 flex items-center justify-center mt-0.5">
              <span class="text-lg">{child.gender === "boy" ? "♂️" : "♀️"}</span
              >
            </div>
            <div>
              <p class="text-sm font-medium">Gender</p>
              <Badge
                class={cn(
                  child.gender === "boy" ? "bg-[#55a0f3]" : "bg-[#f564bc]",
                  "text-white capitalize",
                )}>{child.gender}</Badge
              >
            </div>
          </div>
        {/if}
      </div>

      <!-- Parents Section -->
      {#if parents.length > 0}
        <div class="rounded-lg border p-4">
          <h3 class="mb-3 font-semibold flex items-center gap-2">
            <Phone class="h-4 w-4" />
            Parents / Guardians
          </h3>
          <div class="space-y-3">
            {#each parents as parent}
              <div class="rounded-md bg-muted/50 p-3">
                <div class="font-medium">{parent.name}</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  {parent.parentType}
                </div>
                <div class="mt-2 space-y-1">
                  <div class="flex items-center gap-2">
                    <a
                      href="tel:{parent.phone}"
                      class="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Phone class="h-3 w-3" />
                      {parent.phone}
                    </a>
                    <a
                      href="https://wa.me/{parent.phone.replace(/[^0-9]/g, '')}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-1 rounded-md bg-[#25D366] px-2 py-1 text-xs text-white transition-colors hover:bg-[#20BD5A]"
                      title="Message on WhatsApp"
                    >
                      <WhatsApp class="h-3 w-3" />
                      WhatsApp
                    </a>
                  </div>
                  {#if parent.email}
                    <a
                      href="mailto:{parent.email}"
                      class="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Mail class="h-3 w-3" />
                      {parent.email}
                    </a>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Emergency Contact -->
      {#if child.emergencyContact}
        <div
          class="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950"
        >
          <h3
            class="mb-2 font-semibold flex items-center gap-2 text-orange-900 dark:text-orange-100"
          >
            <AlertCircle class="h-4 w-4" />
            Emergency Contact
          </h3>
          <a
            href="tel:{child.emergencyContact}"
            class="text-sm text-orange-700 dark:text-orange-300"
          >
            {child.emergencyContact}
          </a>
        </div>
      {/if}

      <!-- Allergies -->
      {#if child.allergies}
        <div
          class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950"
        >
          <h3
            class="mb-2 font-semibold flex items-center gap-2 text-red-900 dark:text-red-100"
          >
            <AlertCircle class="h-4 w-4" />
            Allergies
          </h3>
          <p class="text-sm text-red-700 dark:text-red-300">
            {child.allergies}
          </p>
        </div>
      {/if}

      <!-- Notes -->
      {#if child.notes}
        <div class="rounded-lg border p-4">
          <h3 class="mb-2 font-semibold flex items-center gap-2">
            <FileText class="h-4 w-4" />
            Notes
          </h3>
          <p class="text-sm text-muted-foreground whitespace-pre-wrap">
            {child.notes}
          </p>
        </div>
      {/if}

      <!-- Additional Media -->
      {#if child.files && child.files.length > 0}
        <div class="rounded-lg border p-4">
          <h3 class="mb-3 font-semibold">Media Files ({child.files.length})</h3>

          <!-- Media Grid -->
          <div class="grid grid-cols-3 gap-2">
            {#each child.files as file}
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
      <div class="rounded-lg border p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Status</span>
          <Badge variant={child.active ? "default" : "secondary"}>
            {child.active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p class="mt-2 text-xs text-muted-foreground">
          Added {format(new Date(child.createdAt), "MMM dd, yyyy")}
        </p>
      </div>
    </div>

    <Dialog.Footer>
      {#if editors.includes(user.role as Role) && !readonly}
        <div class="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" class="flex-1 sm:flex-none" onclick={onEdit}
            >Edit</Button
          >
          <Button
            variant="destructive"
            class="flex-1 sm:flex-none"
            onclick={onDelete}
          >
            Delete
          </Button>
        </div>
      {:else}
        <Button
          variant="outline"
          class="w-full sm:w-auto"
          onclick={() => (open = false)}>Close</Button
        >
      {/if}
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
