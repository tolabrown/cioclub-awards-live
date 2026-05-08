<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { deserialize } from "$app/forms";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import {
    Trash2,
    Upload,
    ImageIcon,
    Plus,
    X,
    Maximize2,
    Calendar,
    MapPin,
    Loader2,
    Settings2,
    Eye,
    EyeOff,
  } from "@lucide/svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { resizeImage } from "$lib/authentication/imageresize";
  import ImageCropperModal from "$lib/components/ui/image-cropper/ImageCropperModal.svelte";
  import GalleryOverlay from "./GalleryOverlay.svelte";
  import type { iFile } from "$lib/interface";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { toast } from "svelte-sonner";

  interface AlbumMediaItem {
    id?: string;
    url: string;
    fileId: string;
    isVisible?: boolean;
    displayOrder?: number;
  }

  interface Album {
    id?: string;
    title: string;
    location: string;
    description: string;
    date: string;
    year: string;
    image: string; // Cover image URL
    coverImageId?: string;
    displayLimit?: number;
    media: AlbumMediaItem[]; // List of media items with IDs
  }

  interface Props {
    album: Album;
    onRemove: () => void;
  }

  let { album = $bindable(), onRemove }: Props = $props();

  let showCropper = $state(false);
  let cropperFile = $state<File | null>(null);
  let isUploadingCover = $state(false);
  let uploadingMediaIndex = $state<number | null>(null);
  let uploadProgress = $state({ current: 0, total: 0 });
  let showGallery = $state(false);
  let isMediaModalOpen = $state(false);
  let galleryStartIndex = $state(0);
  let isDesktop = $state(true);

  // Infinite Scroll for Media Assets
  let displayCount = $state(24);
  const visibleMedia = $derived(album.media.slice(0, displayCount));

  function loadMore() {
    if (displayCount < album.media.length) {
      displayCount += 24;
    }
  }

  // Reset display count when modal opens
  $effect(() => {
    if (isMediaModalOpen) {
      displayCount = 24;
    }
  });

  onMount(() => {
    if (!browser) return;
    const mql = window.matchMedia("(min-width: 768px)");
    isDesktop = mql.matches;

    const onChange = (e: MediaQueryListEvent) => {
      isDesktop = e.matches;
    };

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  });

  function inview(node: HTMLElement) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, { threshold: 0.1 });
    observer.observe(node);
    return {
      destroy: () => observer.disconnect()
    };
  }

  async function handleCoverSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      cropperFile = input.files[0];
      showCropper = true;
    }
  }

  async function onCoverCrop(croppedFile: File) {
    showCropper = false;
    isUploadingCover = true;

    try {
      const resized = await resizeImage(croppedFile, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.8,
        maxSizeKB: 200,
        format: "webp",
      });

      const formData = new FormData();
      formData.append("image", resized);

      const response = await fetch("?/uploadImage", {
        method: "POST",
        body: formData,
      });

      const resultText = await response.text();
      const result = deserialize(resultText) as any;

      if (result.type === "success" && result.data?.image) {
        album.image = result.data.image.url;
        album.coverImageId = result.data.image.id;
        toast.success("Cover image updated successfully");
      } else {
        const errorMessage =
          result.data?.error || result.error || "Upload failed on server";
        throw new Error(`Server Error: ${errorMessage}`);
      }
    } catch (err: any) {
      console.error("Cover upload error:", err);
      toast.error(`Upload Failed: ${err.message || "Unknown error"}`);
    } finally {
      isUploadingCover = false;
    }
  }

  async function handleCoverDelete() {
    if (!album.image) return;
    if (
      !confirm("Are you sure you want to permanently delete this cover image?")
    )
      return;

    const idToDelete = album.coverImageId;
    album.image = ""; // Optimistic UI
    album.coverImageId = "";

    try {
      const formData = new FormData();
      if (idToDelete) formData.append("id", idToDelete);
      const response = await fetch("?/deleteCover", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text()) as any;
      if (result.type !== "success") throw new Error("Delete failed");
      toast.success("Cover image deleted");
    } catch (err) {
      toast.error("Failed to delete cover image");
    }
  }

  async function handleMediaUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    uploadProgress = { current: 0, total: files.length };

    for (let i = 0; i < files.length; i++) {
      uploadingMediaIndex = album.media.length;
      uploadProgress.current = i + 1;
      try {
        const resized = await resizeImage(files[i], {
          maxWidth: 1600,
          maxHeight: 1200,
          quality: 0.7,
          maxSizeKB: 300,
          format: "webp",
        });

        const formData = new FormData();
        formData.append("image", resized);
        // Link to album immediately at upload time (if album already exists)
        if (album.id) {
          formData.append("albumId", album.id);
          formData.append("displayOrder", String(album.media.length));
        }

        const response = await fetch("?/uploadMedia", {
          method: "POST",
          body: formData,
        });

        const resultText = await response.text();
        const result = deserialize(resultText) as any;

        if (result.type === "success" && result.data?.image) {
        album.media = [
            ...album.media,
            { url: result.data.image.url, fileId: result.data.image.id, isVisible: true },
          ];
        } else {
          const errMsg =
            result.data?.error || result.error || "Server processing error";
          toast.error(`Media ${i + 1} failed: ${errMsg}`);
        }
      } catch (err: any) {
        toast.error(
          `Upload error for media ${i + 1}: ${err.message || "Connection issue"}`,
        );
      }
    }
    uploadingMediaIndex = null;
    uploadProgress = { current: 0, total: 0 };
    input.value = "";
  }

  async function removeMedia(index: number) {
    const mediaItem = album.media[index];
    album.media = album.media.filter((_, i) => i !== index);
    if (mediaItem.fileId) {
      try {
        const formData = new FormData();
        formData.append("id", mediaItem.fileId);
        const response = await fetch("?/deleteMedia", {
          method: "POST",
          body: formData,
        });
        const result = deserialize(await response.text()) as any;
        if (result.type !== "success") throw new Error("Delete failed");
        toast.success("Media deleted");
      } catch (err) {
        toast.error("Failed to delete media from storage");
      }
    }
  }

  function openGallery(index: number) {
    galleryStartIndex = index;
    showGallery = true;
  }

  const galleryMedia = $derived(
    album.media.map((m) => ({ id: m.fileId, url: m.url }) as iFile),
  );
</script>

<div
  class="relative group p-4 rounded-2xl border-2 border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all shadow-xl space-y-8"
>
  <!-- Controls -->
  <div
    class="absolute top-4 right-4 flex gap-2 z-10 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
  >
    <Button
      variant="destructive"
      size="icon"
      class="h-9 w-9 rounded-full shadow-lg"
      onclick={onRemove}
    >
      <Trash2 class="size-4" />
    </Button>
  </div>

  <div class="grid gap-10 lg:grid-cols-[1fr_2fr]">
    <!-- Left Column: Basic Info & Cover -->
    <div class="space-y-6">
      <div class="space-y-4">
        <Label
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
        >
          <ImageIcon class="size-3" /> Cover Image
        </Label>
        <div
          class="relative aspect-4/3 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border group/cover"
        >
          {#if album.image}
            <img
              src={album.image}
              alt="Cover"
              class="w-full h-full object-cover"
            />
            <div
              class="absolute top-2 right-2 flex items-center justify-center"
            >
              <Button
                variant="destructive"
                size="icon"
                class="h-9 w-9 rounded-full shadow-lg"
                onclick={handleCoverDelete}
                aria-label="Delete Cover"
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
                  onchange={handleCoverSelect}
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
              <Loader2
                class="size-8 animate-[spin_0.8s_linear_infinite] text-primary"
              />
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
            bind:value={album.title}
            placeholder="E.g., CIO Summit 2024"
            class="h-11 rounded-xl font-medium"
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
              bind:value={album.location}
              placeholder="Lagos, Nigeria"
              class="h-11 pl-10 rounded-xl"
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
                bind:value={album.year}
                placeholder="2024"
                class="h-11 pl-10 rounded-xl"
              />
            </div>
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Event Date</Label
            >
            <Input
              type="date"
              bind:value={album.date}
              class="h-11 rounded-xl"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Display Limit (Public Preview)</Label
          >
          <div class="relative">
            <Settings2
              class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              type="number"
              bind:value={album.displayLimit}
              placeholder="E.g., 8 (Leave empty for all)"
              class="h-11 pl-10 rounded-xl"
            />
          </div>
          <p class="text-[10px] text-muted-foreground">
            Limits how many images show in the album preview.
          </p>
        </div>
      </div>
    </div>

    <!-- Right Column: Description -->
    <div class="space-y-8">
      <div class="space-y-4">
        <Label
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Album Details
        </Label>
        <Textarea
          bind:value={album.description}
          placeholder="Describe the energy and impact of this event..."
          rows={6}
          class="rounded-2xl resize-none text-base p-4"
        />
      </div>

      <div class="pt-4">
        <Button
          variant="outline"
          class="w-full h-20 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all group/btn"
          onclick={() => (isMediaModalOpen = true)}
        >
          <div class="flex items-center gap-4">
            <div
              class="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover/btn:scale-110 transition-transform"
            >
              <ImageIcon class="size-6 text-primary" />
            </div>
            <div class="text-left">
              <p class="font-bold text-lg leading-none">Manage Media Assets</p>
              <p class="text-sm text-muted-foreground mt-1">
                {album.media.length} photos in this album
              </p>
            </div>
            <div
              class="ml-auto p-2 rounded-full bg-muted group-hover/btn:bg-primary group-hover/btn:text-white transition-colors"
            >
              <Plus class="size-4" />
            </div>
          </div>
        </Button>
      </div>
    </div>
  </div>
</div>

<!-- Media Assets Modal (Desktop) -->
{#if isDesktop}
  <Dialog.Root bind:open={isMediaModalOpen}>
    <Dialog.Content class="max-w-5xl h-[90vh] flex flex-col overflow-hidden">
      <Dialog.Header
        class="flex flex-row items-center justify-between pr-8 shrink-0"
      >
        <div>
          <Dialog.Title class="text-2xl font-bold"
            >Manage Media Assets</Dialog.Title
          >
          <Dialog.Description>
            {album.title} — {album.media.length} items
          </Dialog.Description>
        </div>
        <label class="cursor-pointer group/add">
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
      </Dialog.Header>
      <ScrollArea class="flex-1 min-h-0 mt-6 px-1">
        <div class="space-y-8 pb-12">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {#each visibleMedia as m, idx}
              <div
                class="relative aspect-square rounded-3xl overflow-hidden bg-muted group/media shadow-lg hover:shadow-xl transition-all border-4 border-transparent hover:border-primary/40"
              >
                <img
                  src={m.url}
                  alt=""
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-110"
                />
                
                <!-- Improved Overlay with larger buttons -->
                <div
                  class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 px-2"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-9 rounded-xl bg-white/20 text-white backdrop-blur-xl border border-white/30 transition-transform active:scale-95"
                    onclick={() => openGallery(idx)}
                    aria-label="View Fullsize"
                  >
                    <Maximize2 class="size-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-9 rounded-xl {m.isVisible !== false ? 'bg-primary/90' : 'bg-muted/40'} text-white backdrop-blur-xl border border-white/20 transition-transform active:scale-95"
                    onclick={() => (m.isVisible = m.isVisible === false ? true : false)}
                    aria-label={m.isVisible !== false ? "Visible to Public" : "Hidden from Public"}
                  >
                    {#if m.isVisible !== false}
                      <Eye class="size-5" />
                    {:else}
                      <EyeOff class="size-5" />
                    {/if}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-9 rounded-xl bg-destructive/90 text-white backdrop-blur-xl border border-white/20 transition-transform active:scale-95"
                    onclick={() => removeMedia(idx)}
                    aria-label="Remove Photo"
                  >
                    <X class="size-5" />
                  </Button>
                </div>

                {#if m.isVisible === false}
                  <div class="absolute top-4 left-4 bg-destructive/90 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-2xl backdrop-blur-md">
                    Hidden
                  </div>
                {/if}
              </div>
            {/each}

            {#if uploadingMediaIndex !== null}
              <div
                class="aspect-square rounded-3xl bg-primary/5 flex flex-col items-center justify-center border-4 border-dashed border-primary/20 animate-pulse"
              >
                <Loader2 class="size-10 animate-spin text-primary" />
                <span class="text-xs font-black uppercase text-primary mt-4 tracking-widest"
                  >{uploadProgress.current} / {uploadProgress.total}</span
                >
              </div>
            {/if}
          </div>

          <!-- Loading Trigger for Infinite Scroll -->
          {#if displayCount < album.media.length}
            <div 
              class="h-20 flex items-center justify-center"
              use:inview
            >
              <div class="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 class="size-6 animate-spin" />
                <span class="text-[10px] font-bold uppercase tracking-widest">Loading more photos...</span>
              </div>
            </div>
          {/if}

          {#if album.media.length === 0 && uploadingMediaIndex === null}
            <div
              class="h-64 flex flex-col items-center justify-center border-4 border-dashed border-border rounded-4xl text-muted-foreground/40 gap-4"
            >
              <div class="size-20 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon class="size-10" />
              </div>
              <p class="text-sm font-black uppercase tracking-[0.2em]">
                No media uploaded yet
              </p>
            </div>
          {/if}
        </div>
      </ScrollArea>
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <!-- Media Assets Drawer (Mobile) -->
  <Drawer.Root bind:open={isMediaModalOpen}>
    <Drawer.Content class="h-[85vh]">
      <div class="mx-auto w-full max-w-sm flex flex-col h-full overflow-hidden">
        <Drawer.Header class="text-left border-b border-border pb-4">
          <div class="flex items-center justify-between">
            <div>
              <Drawer.Title class="text-xl font-bold">Media Assets</Drawer.Title
              >
              <Drawer.Description>{album.media.length} items</Drawer.Description
              >
            </div>
            <label class="cursor-pointer">
              <div class="p-3 bg-primary/10 text-primary rounded-full">
                <Plus class="size-5" />
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                class="hidden"
                onchange={handleMediaUpload}
              />
            </label>
          </div>
        </Drawer.Header>

        <div class="flex-1 overflow-y-auto p-4 mb-6">
          <div class="grid grid-cols-2 gap-3">
            {#each album.media as m, idx}
              <div
                class="relative aspect-square rounded-xl overflow-hidden shadow-sm"
              >
                <img src={m.url} alt="" class="w-full h-full object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  class="absolute top-1 right-1 h-7 w-7 rounded-sm scale-90 opacity-80"
                  onclick={() => removeMedia(idx)}
                >
                  <Trash2 class="size-3.5" />
                </Button>
              </div>
            {/each}

            {#if uploadingMediaIndex !== null}
              <div
                class="aspect-square rounded-xl bg-primary/5 flex items-center justify-center border border-dashed border-primary/20"
              >
                <Loader2 class="size-6 animate-spin text-primary" />
              </div>
            {/if}
          </div>
        </div>
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}

{#if showCropper && cropperFile}
  <ImageCropperModal
    imageFile={cropperFile}
    onCrop={onCoverCrop}
    onCancel={() => {
      showCropper = false;
      cropperFile = null;
    }}
  />
{/if}

{#if showGallery && album.media.length > 0}
  <GalleryOverlay
    images={galleryMedia}
    startIndex={galleryStartIndex}
    onClose={() => (showGallery = false)}
  />
{/if}
