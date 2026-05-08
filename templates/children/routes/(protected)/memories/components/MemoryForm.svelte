<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import type { iMemory, iFile } from "$lib/interface";
  import { toast } from "svelte-sonner";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";
  import ImageCropperModal from "../../children/components/ImageCropperModal.svelte";
  import { resizeToFileSize } from "$lib/authentication/imageresize";
  import {
    Trash2,
    Plus,
    Image as ImageIcon,
    Film,
    X,
    Loader2,
  } from "@lucide/svelte";
  import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from "$lib/constants";
  import { Progress } from "$lib/components/ui/progress";

  interface Props {
    memory?: iMemory | null;
  }

  let { memory }: Props = $props();

  const isEditing = !!memory;

  const toDateLocal = (date: Date | string | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Form state
  let name = $state(memory?.name || "");
  let date = $state(toDateLocal(memory?.date));
  let location = $state(memory?.location || "");
  let description = $state(memory?.description || "");

  // Cover image state
  let coverImageFile: File | null = $state(null);
  let coverImagePreview = $state(
    memory?.coverImage && typeof memory.coverImage === "object"
      ? memory.coverImage.url
      : "",
  );
  let coverImageId = $state(
    memory?.coverImage && typeof memory.coverImage === "object"
      ? memory.coverImage.id
      : memory?.coverImage || null,
  );

  // Multiple media state
  let mediaFiles = $state<
    Array<{
      file: File | null;
      preview: string;
      id: string | null;
      type: "image" | "video";
      status: "pending" | "uploading" | "success" | "error";
    }>
  >(
    (memory?.files || []).map((f) => ({
      file: null,
      preview: f.url,
      id: f.id,
      type: f.type?.startsWith("video") ? "video" : "image",
      status: "success",
    })),
  );

  // Cropper state
  let showCropper = $state(false);
  let imageToCrop: File | null = $state(null);

  // Progress state
  let isLoading = $state(false);
  let currentStep = $state("");
  let uploadCount = $state(0);
  let totalToUpload = $state(0);
  let progressValue = $derived(
    totalToUpload > 0 ? (uploadCount / totalToUpload) * 100 : 0,
  );

  const handleCoverChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error("Image must be less than 5MB");
        return;
      }
      imageToCrop = file;
      showCropper = true;
      input.value = "";
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    showCropper = false;
    try {
      const resizedFile = await resizeToFileSize(croppedFile, 500, "jpeg");
      coverImageFile = resizedFile;
      coverImagePreview = URL.createObjectURL(resizedFile);
      coverImageId = null; // Mark as needs upload
    } catch (error: any) {
      toast.error("Failed to process image");
    }
    imageToCrop = null;
  };

  const handleMediaChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      for (const file of files) {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
          toast.error(`${file.name} is not a valid image or video`);
          continue;
        }

        if (isImage && file.size > MAX_IMAGE_SIZE) {
          toast.error(`${file.name} exceeds 5MB limit`);
          continue;
        }

        if (isVideo && file.size > MAX_VIDEO_SIZE) {
          toast.error(`${file.name} exceeds 250MB limit`);
          continue;
        }

        mediaFiles = [
          ...mediaFiles,
          {
            file,
            preview: URL.createObjectURL(file),
            id: null,
            type: isVideo ? "video" : "image",
            status: "pending",
          },
        ];
      }
      input.value = "";
    }
  };

  const removeMedia = async (index: number) => {
    const item = mediaFiles[index];
    if (item.id && isEditing && memory) {
      // If editing and file exists, detach it immediately
      try {
        const res = await fetch(`/api/memories/${memory.id}/media`, {
          method: "DELETE",
          body: JSON.stringify({ fileId: item.id }),
        });
        const result = await res.json();
        if (result.status === "error") throw new Error(result.message);
        toast.success("File removed");
      } catch (error: any) {
        toast.error("Failed to remove file: " + error.message);
        return;
      }
    }

    if (item.preview && !item.id) {
      URL.revokeObjectURL(item.preview);
    }
    mediaFiles = mediaFiles.filter((_, i) => i !== index);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (result.status === "error") throw new Error(result.message);
    return result.data.file.id;
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a name");
    if (!date) return toast.error("Please select a date");

    isLoading = true;
    uploadCount = 0;

    // Calculate total steps
    const pendingMedia = mediaFiles.filter((m) => !m.id && m.file);
    totalToUpload = (coverImageFile ? 1 : 0) + pendingMedia.length + 1; // +1 for the record itself

    try {
      currentStep = "Saving record...";
      const memoryPayload = {
        name,
        date: new Date(date).toISOString(),
        location,
        description,
        coverImage: coverImageId, // Send existing ID if any
      };

      const endpoint = isEditing
        ? `/api/memories/${memory.id}`
        : "/api/memories";
      const method = isEditing ? "PATCH" : "POST";

      const recordRes = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memoryPayload),
      });

      const recordResult = await recordRes.json();
      if (recordResult.status === "error")
        throw new Error(recordResult.message);

      const savedMemory = recordResult.data;
      const memoryId = isEditing ? memory!.id : savedMemory.id;
      uploadCount++;

      // 1. Upload and Update Cover Image if needed
      if (coverImageFile) {
        currentStep = "Uploading cover image...";
        const uploadedId = await uploadFile(coverImageFile);
        if (uploadedId) {
          // Update the record with the new cover image ID
          await fetch(`/api/memories/${memoryId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coverImage: uploadedId }),
          });
          coverImageId = uploadedId;
          coverImageFile = null;
        }
        uploadCount++;
      }

      // 2. Upload and Link Media files one by one
      for (let i = 0; i < mediaFiles.length; i++) {
        const item = mediaFiles[i];
        if (!item.id && item.file) {
          currentStep = `Uploading media ${uploadCount} of ${totalToUpload - 1}...`;
          item.status = "uploading";
          try {
            const uploadedId = await uploadFile(item.file);
            if (uploadedId) {
              // Link it immediately
              await fetch(`/api/memories/${memoryId}/media`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileId: uploadedId }),
              });
              item.id = uploadedId;
              item.status = "success";
              item.file = null;
            }
          } catch (err) {
            item.status = "error";
            throw err;
          }
          uploadCount++;
        }
      }

      toast.success(`Memory ${isEditing ? "updated" : "created"} successfully`);
      window.location.href = "/memories";
    } catch (error: any) {
      toast.error(error.message || "An error occurred during save");
      console.error(error);
    } finally {
      isLoading = false;
      currentStep = "";
    }
  };
</script>

<form onsubmit={handleSubmit} class="space-y-8">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="space-y-6">
      <div class="space-y-4 rounded-lg border p-4 bg-card">
        <h3 class="text-lg font-semibold">Memory Details</h3>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="name"
              >Name <span class="text-destructive">*</span></Label
            >
            <Input
              id="name"
              bind:value={name}
              placeholder="Event Name"
              required
              disabled={isLoading}
            />
          </div>
          <div class="space-y-2">
            <Label for="date"
              >Date <span class="text-destructive">*</span></Label
            >
            <Input
              id="date"
              type="date"
              bind:value={date}
              required
              disabled={isLoading}
            />
          </div>
          <div class="space-y-2">
            <Label for="location">Location</Label>
            <Input
              id="location"
              bind:value={location}
              placeholder="Apostolic Center"
              disabled={isLoading}
            />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              bind:value={description}
              placeholder="Short description..."
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div class="space-y-4 rounded-lg border p-4 bg-card">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Cover Image</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onclick={() => document.getElementById("cover-upload")?.click()}
            disabled={isLoading}
          >
            {coverImagePreview ? "Change" : "Choose"}
          </Button>
        </div>
        <Input
          id="cover-upload"
          type="file"
          accept="image/*"
          class="hidden"
          onchange={handleCoverChange}
          disabled={isLoading}
        />

        <div
          class="relative aspect-video rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted"
        >
          {#if coverImagePreview}
            <img
              src={coverImagePreview}
              alt="Cover preview"
              class="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              class="absolute top-2 right-2 rounded-full h-8 w-8"
              onclick={() => {
                coverImageFile = null;
                coverImagePreview = "";
                coverImageId = null;
              }}
              disabled={isLoading}
            >
              <X class="h-4 w-4" />
            </Button>
          {:else}
            <div class="text-center text-muted-foreground p-4">
              <ImageIcon class="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p class="text-sm">Click 'Choose' to upload a cover image</p>
              <p class="text-xs">Recommended: 16:9 aspect ratio</p>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div class="space-y-4 rounded-lg border p-4 bg-card min-h-full">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Memory Media</h3>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onclick={() => document.getElementById("media-upload")?.click()}
              disabled={isLoading}
            >
              <Plus class="h-4 w-4 mr-1" /> Add Media
            </Button>
          </div>
        </div>
        <p class="text-sm text-muted-foreground">
          Upload all pictures and videos for this memory.
        </p>

        <Input
          id="media-upload"
          type="file"
          multiple
          accept="image/*,video/*"
          class="hidden"
          onchange={handleMediaChange}
          disabled={isLoading}
        />

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {#each mediaFiles as item, i}
            <div
              class="group relative aspect-square rounded-lg border overflow-hidden bg-black/5"
              class:opacity-50={item.status === "uploading"}
            >
              {#if item.type === "video"}
                <div
                  class="w-full h-full flex items-center justify-center bg-zinc-900"
                >
                  <Film class="h-8 w-8 text-zinc-500" />
                  {#if item.preview}
                    <video
                      src={item.preview}
                      class="absolute inset-0 w-full h-full object-cover opacity-50"
                    >
                      <track kind="captions" />
                    </video>
                  {/if}
                </div>
              {:else}
                <img
                  src={item.preview}
                  alt="Media preview"
                  class="w-full h-full object-cover"
                />
              {/if}

              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {#if item.status !== "uploading"}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    class="h-8 w-8 rounded-full"
                    onclick={() => removeMedia(i)}
                    disabled={isLoading}
                  >
                    <X class="h-4 w-4" />
                  </Button>
                {:else}
                  <Loader2 class="h-6 w-6 animate-spin text-white" />
                {/if}
              </div>

              {#if !item.id}
                <div
                  class="absolute bottom-1 right-1 bg-primary text-[10px] text-white px-1.5 py-0.5 rounded-sm dark:bg-white dark:text-primary font-bold"
                >
                  {item.status === "uploading" ? "Uploading..." : "New"}
                </div>
              {/if}

              {#if item.status === "error"}
                <div
                  class="absolute top-1 left-1 bg-destructive text-[10px] text-white px-1.5 py-0.5 rounded-sm"
                >
                  Failed
                </div>
              {/if}
            </div>
          {/each}

          {#if mediaFiles.length === 0}
            <div
              class="col-span-full py-12 text-center border-2 border-dashed rounded-lg"
            >
              <Plus
                class="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-20"
              />
              <p class="text-sm text-muted-foreground">No media added yet</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  {#if isLoading}
    <div
      class="space-y-4 rounded-lg border p-6 bg-card animate-in fade-in slide-in-from-bottom-4"
    >
      <div class="flex items-center justify-between text-sm font-medium">
        <div class="flex items-center gap-2">
          <Loader2 class="h-4 w-4 animate-spin text-primary" />
          <span>{currentStep}</span>
        </div>
        <span class="text-muted-foreground"
          >{uploadCount} / {totalToUpload}</span
        >
      </div>
      <Progress value={progressValue} class="h-2" />
      <p class="text-xs text-center text-muted-foreground">
        Please do not close this window until the process is complete.
      </p>
    </div>
  {/if}

  <div
    class="flex items-center gap-4 pt-4 border-t sticky bottom-0 bg-background/80 backdrop-blur pb-4"
  >
    <Button type="submit" size="lg" disabled={isLoading} class="min-w-[200px]">
      {#if isLoading}
        <LoadingSpinner class="mr-2 h-4 w-4" />
        Saving ({uploadCount} / {totalToUpload})...
      {:else}
        {isEditing ? "Update Memory" : "Create Memory"}
      {/if}
    </Button>

    <Button
      type="button"
      variant="ghost"
      size="lg"
      onclick={() => (window.location.href = "/memories")}
      disabled={isLoading}
    >
      Cancel
    </Button>
  </div>
</form>

{#if showCropper && imageToCrop}
  <ImageCropperModal
    imageFile={imageToCrop}
    onCrop={handleCropComplete}
    onCancel={() => {
      showCropper = false;
      imageToCrop = null;
    }}
  />
{/if}
