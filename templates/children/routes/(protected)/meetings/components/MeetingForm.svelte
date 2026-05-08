<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type { iMeeting, iFile } from "$lib/interface";
  import { toast } from "svelte-sonner";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";
  import SelectComponent, {
    type iSelect,
  } from "$lib/components/ui/select/select-component.svelte";
  import { goto } from "$app/navigation";
  import ImageCropperModal from "../../children/components/ImageCropperModal.svelte";
  import { resizeToFileSize } from "$lib/authentication/imageresize";
  import { Trash2 } from "@lucide/svelte";
  import { MeetingTypes, MAX_IMAGE_SIZE } from "$lib/constants";

  interface Props {
    meeting?: iMeeting | null;
  }

  let { meeting }: Props = $props();

  const isEditing = !!meeting;

  // Helper function to convert Date to datetime-local format (YYYY-MM-DDTHH:MM)
  const toDatetimeLocal = (date: Date | string | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Form state
  let type = $state(meeting?.type || "");
  let datetime = $state(toDatetimeLocal(meeting?.datetime));

  // File upload state
  let imageFile: File | null = $state(null);
  let imagePreview = $state(
    meeting?.image && typeof meeting.image === "object"
      ? meeting.image.url
      : "",
  );
  let imageId = $state(
    meeting?.image && typeof meeting.image === "object"
      ? meeting.image.id
      : meeting?.image || null,
  );
  let imageUploading = $state(false);
  let deletingImage = $state(false);

  // Cropper state
  let showCropper = $state(false);
  let imageToCrop: File | null = $state(null);

  let isLoading = $state(false);

  const meetingTypeOptions: iSelect[] = Object.entries(MeetingTypes).map(
    ([key, value]) => ({
      label: value,
      value: value,
    }),
  );

  // File upload functions
  const handleImageChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB for images)
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error("Image must be less than 5MB");
        return;
      }

      // Show cropper modal
      imageToCrop = file;
      showCropper = true;

      // Reset input to allow selecting the same file again
      input.value = "";
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    showCropper = false;

    try {
      // Resize to max 500KB for banner
      const resizedFile = await resizeToFileSize(croppedFile, 500, "jpeg");

      imageFile = resizedFile;
      imagePreview = URL.createObjectURL(resizedFile);

      toast.success(`Image ready (${Math.round(resizedFile.size / 1024)}KB)`);
    } catch (error: any) {
      toast.error("Failed to process image");
      console.error(error);
    }

    imageToCrop = null;
  };

  const handleCropCancel = () => {
    showCropper = false;
    imageToCrop = null;
  };

  const removeImage = async () => {
    if (!imageId) {
      imageFile = null;
      imagePreview = "";
      return;
    }

    if (
      isEditing &&
      meeting?.image &&
      (typeof meeting.image === "object"
        ? meeting.image.id === imageId
        : meeting.image === imageId)
    ) {
      if (
        !confirm(
          "Are you sure you want to delete this image? This cannot be undone.",
        )
      )
        return;

      deletingImage = true;
      try {
        // 1. Remove link from meeting
        const updateResponse = await fetch(`/api/meetings/${meeting.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: null }),
        });

        const updateResult = await updateResponse.json();
        if (updateResult.status === "error")
          throw new Error(updateResult.message);

        // 2. Delete file from server
        const deleteResponse = await fetch(`/api/files/${imageId}`, {
          method: "DELETE",
        });

        const deleteResult = await deleteResponse.json();
        if (deleteResult.status === "error")
          throw new Error(deleteResult.message);

        toast.success("Image deleted successfully");

        // Clear local state
        imageFile = null;
        imagePreview = "";
        imageId = null;
      } catch (error: any) {
        console.error("Failed to delete image:", error);
        toast.error(error.message || "Failed to delete image");
      } finally {
        deletingImage = false;
      }
    } else {
      // Just a local removal of a newly selected/uploaded file
      imageFile = null;
      imagePreview = "";
      imageId = null;
    }
  };

  const uploadImage = async (): Promise<string | iFile | null> => {
    if (!imageFile) return imageId;

    imageUploading = true;
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.message);
      }

      return result.data.file.id;
    } catch (error: any) {
      toast.error(`Image upload failed: ${error.message}`);
      return null;
    } finally {
      imageUploading = false;
    }
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    // Validation
    if (!type.trim()) {
      toast.error("Please select meeting type");
      return;
    }

    if (!datetime) {
      toast.error("Please select meeting date and time");
      return;
    }

    isLoading = true;

    try {
      // Upload image if changed
      let finalImageId = imageId;
      if (imageFile) {
        const uploadedId = await uploadImage();
        if (uploadedId) {
          finalImageId = uploadedId;
        }
      }

      // Build payload
      const payload: any = {
        type,
        datetime: new Date(datetime).toISOString(),
        image: finalImageId,
      };

      if (isEditing) {
        // Update existing meeting
        const response = await fetch(`/api/meetings/${meeting.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.status === "error") {
          throw new Error(result.message);
        }

        toast.success("Meeting updated successfully");
      } else {
        // Create new meeting
        const response = await fetch("/api/meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.status === "error") {
          throw new Error(result.message);
        }

        toast.success("Meeting added successfully");
      }

      // Redirect to meetings list
      goto("/meetings");
    } catch (error: any) {
      console.error("Error saving meeting:", error);
      toast.error(error.message || "Failed to save meeting");
    } finally {
      isLoading = false;
    }
  };
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <!-- Meeting Information Section -->
  <div class="space-y-4 rounded-lg border p-4">
    <h3 class="text-lg font-semibold">Meeting Information</h3>

    <div class="grid grid-cols-1 gap-4">
      <div class="space-y-2">
        <Label for="type"
          >Meeting Type <span class="text-red-500">*</span></Label
        >
        <SelectComponent
          options={meetingTypeOptions}
          bind:value={type}
          name="type"
          placeholder="Select meeting type"
        />
      </div>

      <div class="space-y-2">
        <Label for="datetime"
          >Date & Time <span class="text-red-500">*</span></Label
        >
        <Input
          id="datetime"
          type="datetime-local"
          bind:value={datetime}
          required
          class="w-full"
        />
        <p class="text-xs text-muted-foreground mt-1">
          Select the date and time for the meeting
        </p>
      </div>
    </div>
  </div>

  <!-- Image Upload Section -->
  <div class="space-y-4 rounded-lg border p-4">
    <h3 class="text-lg font-semibold">Meeting Banner</h3>
    <p class="text-sm text-muted-foreground">
      Upload a banner image for the meeting (optional)
    </p>

    <div class="space-y-4">
      {#if imagePreview}
        <div class="relative inline-block w-full max-w-md">
          <img
            src={imagePreview}
            alt="preview"
            class="w-full rounded-lg object-cover border-2 border-primary"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            class="absolute -right-2 -top-2 h-8 w-8 rounded-full"
            onclick={removeImage}
            disabled={deletingImage}
          >
            {#if deletingImage}
              <LoadingSpinner class="h-4 w-4 text-white" />
            {:else}
              <Trash2 class="h-4 w-4" />
            {/if}
          </Button>
        </div>
      {:else}
        <label
          for="image-upload"
          class="flex h-48 w-full max-w-md items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
        >
          <div class="text-center">
            <span class="text-4xl mb-2 block">📅</span>
            <span class="text-sm text-muted-foreground"
              >Click to upload banner</span
            >
          </div>
        </label>
      {/if}

      <div class="flex items-center gap-2">
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onchange={handleImageChange}
          class="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onclick={() => document.getElementById("image-upload")?.click()}
          disabled={imageUploading}
        >
          {imageUploading
            ? "Uploading..."
            : imagePreview
              ? "Change Image"
              : "Upload Image"}
        </Button>
        <span class="text-xs text-muted-foreground"
          >Max 5MB (JPG, PNG, WebP)</span
        >
      </div>
    </div>
  </div>

  <!-- Form Actions -->
  <div class="flex gap-4">
    <Button type="submit" disabled={isLoading} class="flex-1 sm:flex-none">
      {#if isLoading}
        <LoadingSpinner class="mr-2 h-4 w-4" />
        {isEditing ? "Updating..." : "Creating..."}
      {:else}
        {isEditing ? "Update Meeting" : "Create Meeting"}
      {/if}
    </Button>
    <Button
      type="button"
      variant="outline"
      onclick={() => goto("/meetings")}
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
    onCancel={handleCropCancel}
  />
{/if}
