<script lang="ts">
  import { onMount } from "svelte";
  import {
    Calendar,
    Plus,
    Trash2,
    Loader2,
    MapPin,
    Image as ImageIcon,
    Clock,
    Archive,
    X,
    Maximize2,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { toast } from "svelte-sonner";
  import SectionWrapper from "./SectionWrapper.svelte";
  import { resizeImage } from "$lib/authentication/imageresize";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";

  interface ArchiveMedia {
    url: string;
    fileId: string;
  }

  interface ArchiveItem {
    id?: string;
    title: string;
    location: string;
    description: string;
    year: string;
    date: string;
    coverImageUrl: string;
    coverImageId?: string;
    media: ArchiveMedia[];
  }

  let archives = $state<ArchiveItem[]>([]);
  let isLoading = $state(true);
  let isSaving = $state(false);
  let editingArchive = $state<ArchiveItem | null>(null);
  let isMediaModalOpen = $state(false);
  let uploadingMedia = $state(false);
  let isUploadingCover = $state(false);
  let uploadProgress = $state({ current: 0, total: 0 });
  let showGallery = $state(false);
  let galleryArchive = $state<ArchiveItem | null>(null);
  let galleryIndex = $state(0);

  const isMobile = new IsMobile();

  const defaultArchive: ArchiveItem = {
    title: "",
    location: "",
    description: "",
    year: new Date().getFullYear().toString(),
    date: new Date().toISOString().split("T")[0],
    coverImageUrl: "",
    media: [],
  };

  async function fetchArchives() {
    isLoading = true;
    try {
      const response = await fetch("/api/admin/ladies-in-tech/archives");
      const result = await response.json();
      if (result.success) {
        archives = result.results.map((a: any) => ({
          ...a,
          media:
            typeof a.media === "string"
              ? JSON.parse(a.media || "[]")
              : a.media || [],
        }));
      }
    } catch (error) {
      toast.error("Failed to fetch archives");
    } finally {
      isLoading = false;
    }
  }

  onMount(fetchArchives);

  function addArchive() {
    editingArchive = { ...defaultArchive };
  }

  async function saveArchive() {
    if (!editingArchive) return;
    if (!editingArchive.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!editingArchive.year.trim()) {
      toast.error("Year is required");
      return;
    }

    isSaving = true;
    try {
      const response = await fetch("/api/admin/ladies-in-tech/archives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingArchive,
          media: editingArchive.media,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(
          editingArchive.id ? "Archive updated" : "Archive created",
        );
        editingArchive = null;
        await fetchArchives();
      } else {
        toast.error(result.error || "Save failed");
      }
    } catch (error) {
      toast.error("Failed to save archive");
    } finally {
      isSaving = false;
    }
  }

  function editArchive(archive: ArchiveItem) {
    editingArchive = { ...archive, media: [...archive.media] };
  }

  async function deleteArchive(id: string) {
    if (!confirm("Are you sure you want to delete this archive?")) return;
    try {
      const response = await fetch("/api/admin/ladies-in-tech/archives", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        toast.success("Archive deleted");
        fetchArchives();
      }
    } catch (error) {
      toast.error("Error deleting archive");
    }
  }

  async function uploadFile(
    file: File,
  ): Promise<{ url: string; id: string } | null> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/files", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (result.success) {
      return { url: result.directUrl, id: result.id || "" };
    }
    return null;
  }

  async function handleCoverUpload(e: Event) {
    if (!editingArchive) return;
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    isUploadingCover = true;
    try {
      const resized = await resizeImage(input.files[0], {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.8,
        format: "webp",
      });
      const result = await uploadFile(resized);
      if (result) {
        editingArchive.coverImageUrl = result.url;
        editingArchive.coverImageId = result.id;
        toast.success("Cover image uploaded");
      } else {
        toast.error("Cover upload failed");
      }
    } catch (err: any) {
      toast.error(`Upload error: ${err.message || "Unknown error"}`);
    } finally {
      isUploadingCover = false;
      input.value = "";
    }
  }

  function handleCoverDelete() {
    if (!editingArchive) return;
    editingArchive.coverImageUrl = "";
    editingArchive.coverImageId = "";
  }

  async function handleMediaUpload(e: Event) {
    if (!editingArchive) return;
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    uploadingMedia = true;
    uploadProgress = { current: 0, total: files.length };

    for (let i = 0; i < files.length; i++) {
      uploadProgress.current = i + 1;
      try {
        const resized = await resizeImage(files[i], {
          maxWidth: 1600,
          maxHeight: 1200,
          quality: 0.7,
          format: "webp",
        });
        const result = await uploadFile(resized);
        if (result) {
          editingArchive.media = [
            ...editingArchive.media,
            { url: result.url, fileId: result.id },
          ];
        } else {
          toast.error(`Media ${i + 1} failed`);
        }
      } catch (err: any) {
        toast.error(`Upload error for media ${i + 1}`);
      }
    }
    uploadingMedia = false;
    uploadProgress = { current: 0, total: 0 };
    input.value = "";
  }

  function removeMedia(index: number) {
    if (!editingArchive) return;
    editingArchive.media = editingArchive.media.filter((_, i) => i !== index);
  }

  function openGallery(index: number) {
    if (!editingArchive) return;
    galleryArchive = editingArchive;
    galleryIndex = index;
    showGallery = true;
  }
</script>

{#snippet mediaGrid()}
  <div class="grid grid-cols-3 lg:grid-cols-5 gap-4 p-1">
    {#if editingArchive}
      {#each editingArchive.media as m, idx}
        <div
          class="relative aspect-square rounded-xl overflow-hidden bg-muted group/media shadow-sm hover:shadow-md transition-all border border-border/50"
        >
          <img
            src={m.url}
            alt="Media {idx + 1}"
            class="w-full h-full object-cover transition-transform group-hover/media:scale-110"
          />
          <div
            class="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-2"
          >
            <Button
              variant="ghost"
              size="icon"
              class="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-md"
              onclick={() => openGallery(idx)}
              aria-label="Expand photo {idx + 1}"
            >
              <Maximize2 class="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="h-9 w-9 rounded-full bg-destructive/80 text-white hover:bg-destructive backdrop-blur-md"
              onclick={() => removeMedia(idx)}
              aria-label="Remove photo {idx + 1}"
            >
              <X class="size-5" />
            </Button>
          </div>
        </div>
      {/each}

      {#if uploadingMedia}
        <div
          class="aspect-square rounded-xl bg-primary/5 flex flex-col items-center justify-center border-2 border-dashed border-primary/20 animate-pulse"
        >
          <Loader2 class="size-8 animate-spin text-primary" />
          <span class="text-xs font-bold uppercase text-primary mt-2">
            {uploadProgress.current} / {uploadProgress.total}
          </span>
        </div>
      {/if}

      {#if editingArchive.media.length === 0 && !uploadingMedia}
        <div
          class="col-span-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl text-muted-foreground/40 gap-3"
        >
          <ImageIcon class="size-10" />
          <p class="text-sm font-bold uppercase tracking-widest">
            No media uploaded yet
          </p>
          <p class="text-xs text-muted-foreground">
            Click "Add Media" to upload photos from this event.
          </p>
        </div>
      {/if}
    {/if}
  </div>
{/snippet}

{#snippet addMediaButton()}
  <label class="cursor-pointer">
    <div
      class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-primary/90 transition-all"
    >
      <Plus class="size-4" /> Add Media
    </div>
    <input
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      onchange={handleMediaUpload}
    />
  </label>
{/snippet}

<SectionWrapper
  id="ladies-in-tech-archives"
  title="Event Archives"
  description="Manage galleries and media from previous Ladies in Tech events"
  icon={Archive}
>
  {#snippet headerAction()}
    <Button
      variant="outline"
      size="sm"
      onclick={addArchive}
      class="gap-2 rounded-lg text-primary border-primary/20 hover:bg-primary/10"
    >
      <Plus class="size-4" /> Add Archive
    </Button>
  {/snippet}

  <div class="space-y-6">
    {#if isLoading}
      <div class="flex justify-center p-20">
        <Loader2 class="size-8 animate-spin text-primary/50" />
      </div>
    {:else if editingArchive}
      <!-- Archive Editor Form -->
      <div
        class="relative p-4 rounded-xl border-2 border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all shadow-lg space-y-8"
      >
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg">
            {editingArchive.id ? "Edit Archive" : "New Archive"}
          </h3>
          <div class="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onclick={() => (editingArchive = null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onclick={saveArchive}
              disabled={isSaving}
              class="gap-2"
            >
              {#if isSaving}
                <Loader2 class="size-4 animate-spin" />
              {:else}
                Save
              {/if}
            </Button>
          </div>
        </div>

        <div class="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <!-- Left Column: Cover Image -->
          <div class="space-y-6">
            <div class="space-y-4">
              <Label
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
              >
                <ImageIcon class="size-3" /> Cover Image
              </Label>
              <div
                class="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border-2 border-dashed border-border group/cover"
              >
                {#if editingArchive.coverImageUrl}
                  <img
                    src={editingArchive.coverImageUrl}
                    alt="Cover"
                    class="w-full h-full object-cover"
                  />
                  <div class="absolute top-2 right-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      class="h-9 w-9 rounded-full shadow-lg"
                      onclick={handleCoverDelete}
                      aria-label="Remove cover image"
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                {:else}
                  <div
                    class="flex flex-col items-center justify-center h-full gap-3 text-center p-6"
                  >
                    <div
                      class="size-12 rounded-full bg-primary/10 flex items-center justify-center"
                    >
                      <ImageIcon class="size-6 text-primary" />
                    </div>
                    <label class="cursor-pointer">
                      <div
                        class="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg hover:bg-primary/90 transition-colors"
                      >
                        Upload Cover
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        onchange={handleCoverUpload}
                      />
                    </label>
                    <p
                      class="text-[10px] text-muted-foreground uppercase font-medium"
                    >
                      Recommended: 1200x800
                    </p>
                  </div>
                {/if}

                {#if isUploadingCover}
                  <div
                    class="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Loader2 class="size-8 animate-spin text-primary" />
                  </div>
                {/if}
              </div>
            </div>

            <div class="space-y-4">
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >Album Title</Label
                >
                <Input
                  bind:value={editingArchive.title}
                  placeholder="E.g., Ladies in Tech 3.0"
                />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >Location</Label
                >
                <div class="relative">
                  <MapPin
                    class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    bind:value={editingArchive.location}
                    placeholder="Lagos, Nigeria"
                    class="pl-10"
                  />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >Year</Label
                  >
                  <div class="relative">
                    <Calendar
                      class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                    />
                    <Input
                      bind:value={editingArchive.year}
                      placeholder="2024"
                      class="pl-10"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >Date</Label
                  >
                  <Input type="date" bind:value={editingArchive.date} />
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Description & Media -->
          <div class="space-y-8">
            <div class="space-y-4">
              <Label
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >Album Details</Label
              >
              <Textarea
                bind:value={editingArchive.description}
                placeholder="Describe the energy and impact of this event..."
                rows={6}
                class="resize-none"
              />
            </div>

            <div class="pt-4">
              <Button
                variant="outline"
                class="w-full h-20 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all group/btn"
                onclick={() => (isMediaModalOpen = true)}
              >
                <div class="flex items-center gap-4">
                  <div
                    class="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover/btn:scale-110 transition-transform"
                  >
                    <ImageIcon class="size-6 text-primary" />
                  </div>
                  <div class="text-left">
                    <p class="font-bold text-lg leading-none">
                      Manage Media Assets
                    </p>
                    <p class="text-sm text-muted-foreground mt-1">
                      {editingArchive.media.length} photos in this album
                    </p>
                  </div>
                  <div
                    class="ml-auto p-2 rounded-full bg-muted group-hover/btn:bg-primary group-hover/btn:text-primary-foreground transition-colors"
                  >
                    <Plus class="size-4" />
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Archives Grid -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each archives as archive (archive.id)}
          <div class="w-full h-full animate-in fade-in duration-300">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="group relative overflow-hidden rounded-xl border bg-card/30 text-left transition-all hover:shadow-lg cursor-pointer flex flex-col"
              onclick={() => editArchive(archive)}
            >
              <div class="relative overflow-hidden bg-muted aspect-video">
                {#if archive.coverImageUrl}
                  <img
                    src={archive.coverImageUrl}
                    alt={archive.title}
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                {:else}
                  <div
                    class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-transparent"
                  >
                    <Archive class="h-12 w-12 text-primary/20" />
                  </div>
                {/if}

                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                ></div>

                <div
                  class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Button
                    variant="destructive"
                    size="icon"
                    class="size-8 rounded-lg"
                    onclick={(e: MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (archive.id) deleteArchive(archive.id);
                    }}
                    aria-label="Delete archive"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>

                {#if archive.media.length > 0}
                  <div class="absolute top-2 left-2 z-10">
                    <span
                      class="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-black/40 text-white/90 backdrop-blur-sm border border-white/10 flex items-center gap-1"
                    >
                      <ImageIcon class="size-3" />
                      {archive.media.length} photos
                    </span>
                  </div>
                {/if}
              </div>

              <div
                class="absolute bottom-0 left-0 w-full p-4 pointer-events-none"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/80 text-white border border-white/10"
                  >
                    {archive.year}
                  </span>
                  {#if archive.date}
                    <span
                      class="text-[9px] text-white/70 flex items-center gap-1"
                    >
                      <Clock class="size-3" />
                      {new Date(archive.date).toLocaleDateString()}
                    </span>
                  {/if}
                </div>
                <h3
                  class="font-bold leading-tight line-clamp-1 text-sm text-white"
                >
                  {archive.title}
                </h3>
                {#if archive.location}
                  <p
                    class="text-[10px] text-white/60 line-clamp-1 flex items-center gap-1"
                  >
                    <MapPin class="size-3" />
                    {archive.location}
                  </p>
                {/if}
              </div>
            </div>
          </div>
        {/each}

        {#if archives.length === 0}
          <div
            class="col-span-full flex flex-col items-center justify-center p-20 text-muted-foreground bg-accent/5 rounded-xl border-2 border-dashed"
          >
            <Archive class="size-12 mb-4 opacity-20" />
            <p class="font-bold uppercase tracking-widest text-xs">
              No archives yet
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Click "Add Archive" to start building your visual history.
            </p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</SectionWrapper>

<!-- Desktop: Dialog | Mobile: Drawer -->
{#if editingArchive}
  {#if isMobile.current}
    <!-- Mobile Drawer -->
    <Drawer.Root bind:open={isMediaModalOpen}>
      <Drawer.Content class="max-h-[85vh]">
        <Drawer.Header class="text-left">
          <div class="flex items-center justify-between">
            <div>
              <Drawer.Title class="text-xl font-bold">Media Assets</Drawer.Title
              >
              <Drawer.Description>
                {editingArchive.media.length} items
              </Drawer.Description>
            </div>
            {@render addMediaButton()}
          </div>
        </Drawer.Header>
        <div class="overflow-y-auto flex-1 px-4 pb-4">
          {@render mediaGrid()}
        </div>
        <Drawer.Footer>
          <Drawer.Close>
            <Button variant="outline" class="w-full rounded-xl">Done</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  {:else}
    <!-- Desktop Dialog -->
    <Dialog.Root bind:open={isMediaModalOpen}>
      <Dialog.Content class="max-w-5xl h-[90vh] flex flex-col overflow-hidden z-100">
        <Dialog.Header
          class="flex flex-row items-center justify-between pr-8 shrink-0">
          <div>
            <Dialog.Title class="text-2xl font-bold"
              >Manage Media Assets</Dialog.Title
            >
            <Dialog.Description>
              {editingArchive.title || "New Archive"} — {editingArchive.media
                .length} items
            </Dialog.Description>
          </div>
          {@render addMediaButton()}
        </Dialog.Header>

        <ScrollArea class="flex-1 min-h-0 mt-6">
          {@render mediaGrid()}
        </ScrollArea>
      </Dialog.Content>
    </Dialog.Root>
  {/if}
{/if}

<!-- Full-Screen Gallery Overlay -->
{#if showGallery && galleryArchive}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
    onclick={() => (showGallery = false)}
  >
    <Button
      variant="ghost"
      size="icon"
      class="absolute top-4 right-4 text-white hover:bg-white/10"
      onclick={() => (showGallery = false)}
      aria-label="Close gallery"
    >
      <X class="size-6" />
    </Button>
    <img
      src={galleryArchive.media[galleryIndex]?.url}
      alt="Gallery photo {galleryIndex + 1}"
      class="max-w-[90vw] max-h-[90vh] object-contain"
    />
    {#if galleryArchive.media.length > 1}
      <div class="absolute bottom-6 flex gap-2">
        {#each galleryArchive.media as _, idx}
          <button
            class="size-2 rounded-full transition-colors {idx === galleryIndex
              ? 'bg-white'
              : 'bg-white/30'}"
            onclick={(e: MouseEvent) => {
              e.stopPropagation();
              galleryIndex = idx;
            }}
            aria-label="Go to photo {idx + 1}"
          ></button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
