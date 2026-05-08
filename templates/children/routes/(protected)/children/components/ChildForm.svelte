<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type { iChild, iFile } from "$lib/interface";
  import { toast } from "svelte-sonner";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";
  import { Textarea } from "$lib/components/ui/textarea";
  import SelectComponent, {
    type iSelect,
  } from "$lib/components/ui/select/select-component.svelte";
  import { Switch } from "$lib/components/ui/switch";
  import { goto } from "$app/navigation";
  import ImageCropperModal from "./ImageCropperModal.svelte";
  import { resizeToFileSize } from "$lib/authentication/imageresize";
  import { Trash2 } from "@lucide/svelte";
  import { PhoneInput } from "$lib/components/ui/phone-input";
  import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from "$lib/constants";

  interface Props {
    child?: iChild | null;
  }

  let { child }: Props = $props();

  const isEditing = !!child;

  // Form state
  let name = $state(child?.name || "");
  let dateOfBirth = $state(
    child?.dateOfBirth
      ? (() => {
          const date = new Date(child.dateOfBirth);
          date.setHours(12, 0, 0, 0); // Set to 12 PM (noon)
          return date.toISOString().slice(0, 16);
        })()
      : "",
  );
  let gender = $state(child?.gender || "");
  let ageGroup = $state(child?.ageGroup || "");
  let allergies = $state(child?.allergies || "");
  let emergencyContact = $state(child?.emergencyContact || "");
  let notes = $state(child?.notes || "");
  let active = $state(child?.active ?? true);

  // Parent state - Array of parents
  let parents = $state(
    (child as any)?.parents?.length > 0
      ? (child as any).parents.map((p: any) => ({
          name: p.name,
          phone: p.phone,
          email: p.email || "",
          parentType: p.parentType || "Guardian",
          isPrimary: false, // We'll handle primary logic on save or UI
        }))
      : [
          {
            name: "",
            phone: "",
            email: "",
            parentType: "Father",
            isPrimary: true,
          },
          {
            name: "",
            phone: "",
            email: "",
            parentType: "Mother",
            isPrimary: false,
          },
        ],
  );

  // Ensure at least one parent if empty (shouldn't happen with default above)
  // if (parents.length === 0) {
  //   parents.push({
  //     name: "",
  //     phone: "",
  //     email: "",
  //     parentType: "Guardian",
  //     isPrimary: true,
  //   });
  // }

  // File upload state
  let avatarFile: File | null = $state(null);
  let avatarPreview = $state(
    child?.image && typeof child.image === "object" ? child.image.url : "",
  );
  let avatarId = $state(
    child?.image && typeof child.image === "object"
      ? child.image.id
      : child?.image || null,
  );
  let avatarUploading = $state(false);
  let deletingAvatar = $state(false);

  let mediaFiles: File[] = $state([]);
  let mediaPreviews: string[] = $state([]);
  let mediaIds: string[] = $state([]); // Only for newly uploaded files, not existing ones
  let existingMedia = $state(child?.files || []);
  let mediaUploading = $state(false);
  let uploadProgress = $state(0);
  let currentUploadFile = $state("");

  // File preview state
  let selectedPreview: {
    file: File | (typeof existingMedia)[0];
    index: number;
    type: "new" | "existing";
  } | null = $state(null);

  // Cropper state
  let showCropper = $state(false);
  let imageToCrop: File | null = $state(null);

  let isLoading = $state(false);

  // Constants
  const MAX_MEDIA_FILES = 4;

  const genderOptions: iSelect[] = [
    { label: "Boy", value: "boy" },
    { label: "Girl", value: "girl" },
  ];

  const ageGroupMapping = [
    {
      name: "Nursery",
      age: "0-2 years",
      min: 0,
      max: 2,
      emoji: "👶",
      color: "bg-pink-500",
    },
    {
      name: "Toddlers",
      age: "3-4 years",
      min: 3,
      max: 4,
      emoji: "🧸",
      color: "bg-[#fd6c02]",
    },
    {
      name: "Beginners",
      age: "5-6 years",
      min: 5,
      max: 6,
      emoji: "🎨",
      color: "bg-cyan-500",
    },
    {
      name: "Primary",
      age: "7-9 years",
      min: 7,
      max: 9,
      emoji: "📚",
      color: "bg-emerald-500",
    },
    {
      name: "Juniors",
      age: "10-12 years",
      min: 10,
      max: 12,
      emoji: "⭐",
      color: "bg-[#f71002]",
    },
    {
      name: "Teenagers",
      age: "13-17 years",
      min: 13,
      max: 17,
      emoji: "🎓",
      color: "bg-purple-500",
    },
    {
      name: "Young Adults",
      age: "18-21 years",
      min: 18,
      max: 21,
      emoji: "🎯",
      color: "bg-blue-500",
    },
    {
      name: "Adults",
      age: "22+ years",
      min: 22,
      max: 999,
      emoji: "👨",
      color: "bg-slate-600",
    },
  ];

  const ageGroupOptions: iSelect[] = ageGroupMapping.map((g) => ({
    label: `${g.emoji} ${g.name} (${g.age})`,
    value: g.name,
  }));

  const parentTypeOptions: iSelect[] = [
    { label: "Father", value: "Father" },
    { label: "Mother", value: "Mother" },
    { label: "Guardian", value: "Guardian" },
  ];

  // Auto-calculate age group
  $effect(() => {
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      const group = ageGroupMapping.find((g) => age >= g.min && age <= g.max);
      if (group) {
        ageGroup = group.name;
      }
    }
  });

  const addParent = () => {
    parents = [
      ...parents,
      {
        name: "",
        phone: "",
        email: "",
        parentType: "Guardian",
        isPrimary: false,
      },
    ];
  };

  const removeParent = (index: number) => {
    parents = parents.filter((_: any, i: number) => i !== index);
  };

  // File upload functions
  const handleAvatarChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB before processing)
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
      // Resize to max 200KB
      const resizedFile = await resizeToFileSize(croppedFile, 200, "jpeg");

      avatarFile = resizedFile;
      avatarPreview = URL.createObjectURL(resizedFile);

      toast.success(`Avatar ready (${Math.round(resizedFile.size / 1024)}KB)`);
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

  const removeAvatar = async () => {
    if (!avatarId) {
      avatarFile = null;
      avatarPreview = "";
      return;
    }

    // If it's a new upload not yet saved to server (no ID yet, or ID is from upload but not attached to child?)
    // Actually avatarId is set from child.image.id or upload response.
    // If we are editing and this is the original avatar:
    if (
      isEditing &&
      child?.image &&
      (typeof child.image === "object"
        ? child.image.id === avatarId
        : child.image === avatarId)
    ) {
      if (
        !confirm(
          "Are you sure you want to delete this avatar? This cannot be undone.",
        )
      )
        return;

      deletingAvatar = true;
      try {
        // 1. Remove link from child
        const updateResponse = await fetch(`/api/children/${child.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { image: null } }),
        });

        const updateResult = await updateResponse.json();
        if (updateResult.status === "error")
          throw new Error(updateResult.message);

        // 2. Delete file from server
        const deleteResponse = await fetch(`/api/files/${avatarId}`, {
          method: "DELETE",
        });

        const deleteResult = await deleteResponse.json();
        if (deleteResult.status === "error")
          throw new Error(deleteResult.message);

        toast.success("Avatar deleted successfully");

        // Clear local state
        avatarFile = null;
        avatarPreview = "";
        avatarId = null;
      } catch (error: any) {
        console.error("Failed to delete avatar:", error);
        toast.error(error.message || "Failed to delete avatar");
      } finally {
        deletingAvatar = false;
      }
    } else {
      // Just a local removal of a newly selected/uploaded file
      avatarFile = null;
      avatarPreview = "";
      avatarId = null;
    }
  };

  const handleMediaChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);

      // Check total file count
      const totalFiles =
        existingMedia.length + mediaFiles.length + files.length;
      if (totalFiles > MAX_MEDIA_FILES) {
        toast.error(
          `Maximum ${MAX_MEDIA_FILES} media files allowed. You can upload ${MAX_MEDIA_FILES - (existingMedia.length + mediaFiles.length)} more.`,
        );
        input.value = "";
        return;
      }

      for (const file of files) {
        // Validate file type
        if (
          !file.type.startsWith("image/") &&
          !file.type.startsWith("video/")
        ) {
          toast.error(`${file.name}: Only images and videos are allowed`);
          continue;
        }

        // Validate file size based on type
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
        const sizeLabel = isImage ? "5MB" : "250MB";

        if (file.size > maxSize) {
          toast.error(
            `${file.name}: ${isImage ? "Images" : "Videos"} must be less than ${sizeLabel}`,
          );
          continue;
        }

        // Check for duplicates (name + size)
        const isDuplicate =
          mediaFiles.some(
            (f) => f.name === file.name && f.size === file.size,
          ) ||
          existingMedia.some(
            (f) => f.name === file.name && f.size === file.size,
          );

        if (isDuplicate) {
          toast.error(`${file.name}: This file has already been uploaded`);
          continue;
        }

        // Resize images to 200KB
        let processedFile = file;
        if (file.type.startsWith("image/")) {
          try {
            processedFile = await resizeToFileSize(file, 200, "jpeg");
            toast.success(
              `${file.name} resized to ${Math.round(processedFile.size / 1024)}KB`,
            );
          } catch (error) {
            toast.error(`Failed to resize ${file.name}`);
            continue;
          }
        }

        mediaFiles = [...mediaFiles, processedFile];
        mediaPreviews = [...mediaPreviews, URL.createObjectURL(processedFile)];
      }

      // Reset input
      input.value = "";
    }
  };

  const removeMediaFile = (index: number) => {
    mediaFiles = mediaFiles.filter((_, i) => i !== index);
    URL.revokeObjectURL(mediaPreviews[index]);
    mediaPreviews = mediaPreviews.filter((_, i) => i !== index);
    // Close preview if this file was being previewed
    if (selectedPreview?.type === "new" && selectedPreview?.index === index) {
      selectedPreview = null;
    }
  };

  const removeExistingMedia = async (index: number) => {
    const fileToDelete = existingMedia[index];

    if (!fileToDelete?.id) {
      toast.error("Cannot delete file: Invalid file data");
      return;
    }

    try {
      // Delete from server via API endpoint
      const response = await fetch(`/api/files/${fileToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.message);
      }

      // Remove from local state
      existingMedia = existingMedia.filter((_, i) => i !== index);

      // Close preview if this file was being previewed
      if (
        selectedPreview?.type === "existing" &&
        selectedPreview?.index === index
      ) {
        selectedPreview = null;
      }

      toast.success("File deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete file:", error);
      toast.error(`Failed to delete file: ${error.message}`);
    }
  };

  const togglePreview = (
    file: File | (typeof existingMedia)[0],
    index: number,
    type: "new" | "existing",
  ) => {
    if (selectedPreview?.index === index && selectedPreview?.type === type) {
      selectedPreview = null; // Close if same file clicked
    } else {
      selectedPreview = { file, index, type };
    }
  };

  const uploadAvatar = async (): Promise<string | iFile | null> => {
    if (!avatarFile) return avatarId;

    avatarUploading = true;
    try {
      const formData = new FormData();
      formData.append("file", avatarFile);

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
      toast.error(`Avatar upload failed: ${error.message}`);
      return null;
    } finally {
      avatarUploading = false;
    }
  };

  const uploadMediaFiles = async (): Promise<string[]> => {
    if (mediaFiles.length === 0) return [];

    mediaUploading = true;
    const uploadedIds: string[] = [];

    try {
      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        currentUploadFile = file.name;
        uploadProgress = 0;

        const formData = new FormData();
        formData.append("file", file);

        // Use XMLHttpRequest for progress tracking
        const result = await new Promise<any>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              uploadProgress = Math.round((e.loaded / e.total) * 100);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch (error) {
                reject(new Error("Failed to parse response"));
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"));
          });

          xhr.open("POST", "/api/upload");
          xhr.send(formData);
        });

        if (result.status === "success") {
          uploadedIds.push(result.data.file.id);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      return uploadedIds;
    } finally {
      mediaUploading = false;
      uploadProgress = 0;
      currentUploadFile = "";
    }
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error("Please enter child name");
      return;
    }

    // Filter out empty parents (those without name or phone)
    const validParents = parents.filter(
      (parent: any) => parent.name.trim() || parent.phone.trim(),
    );

    // Validate that valid parents have both name and phone
    for (const parent of validParents) {
      if (!parent.name.trim()) {
        toast.error("Parents with phone numbers must have a name");
        return;
      }
      if (!parent.phone.trim()) {
        toast.error("Parents with names must have a phone number");
        return;
      }
    }

    isLoading = true;

    try {
      // Upload avatar if changed
      let finalAvatarId = avatarId;
      if (avatarFile) {
        const uploadedId = await uploadAvatar();
        if (uploadedId) {
          finalAvatarId = uploadedId;
        }
      }

      // Upload new media files
      const newMediaIds = await uploadMediaFiles();

      // Combine existing media IDs with newly uploaded IDs
      const existingMediaIds = existingMedia.map((m) => m.id);
      const allMediaIds = [...existingMediaIds, ...newMediaIds];

      // Build payload
      const payload: any = {
        name,
        dateOfBirth: dateOfBirth
          ? new Date(dateOfBirth).toISOString()
          : undefined,
        gender: gender || undefined,
        ageGroup: ageGroup || undefined,
        allergies: allergies || undefined,
        emergencyContact: emergencyContact || undefined,
        notes: notes || undefined,
        active,
        image: finalAvatarId,
        files: allMediaIds,
        parents: validParents, // Send only valid parents
      };

      if (isEditing) {
        // Update existing child
        const response = await fetch(`/api/children/${child.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: payload }),
        });

        const result = await response.json();

        if (result.status === "error") {
          throw new Error(result.message);
        }

        toast.success("Child updated successfully");
      } else {
        // Create new child
        const response = await fetch("/api/children", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.status === "error") {
          throw new Error(result.message);
        }

        toast.success("Child added successfully");
      }

      // Redirect to children list
      goto("/children");
    } catch (error: any) {
      console.error("Error saving child:", error);
      toast.error(error.message || "Failed to save child");
    } finally {
      isLoading = false;
    }
  };
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <!-- Child Information Section -->
  <div class="space-y-4 rounded-lg border p-4">
    <h3 class="text-lg font-semibold">Child Information</h3>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="name">Child Name <span class="text-red-500">*</span></Label>
        <Input
          id="name"
          bind:value={name}
          placeholder="Enter child's full name"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="datetime-local"
          bind:value={dateOfBirth}
        />
      </div>

      <div class="space-y-2">
        <Label for="gender">Gender</Label>
        <SelectComponent
          options={genderOptions}
          bind:value={gender}
          name="gender"
          placeholder="Select gender"
        />
      </div>

      <div class="space-y-2">
        <Label for="ageGroup">Age Group (Auto-calculated)</Label>
        <SelectComponent
          options={ageGroupOptions}
          bind:value={ageGroup}
          name="ageGroup"
          placeholder="Select age group"
          disabled={!!dateOfBirth}
        />
        {#if dateOfBirth}
          <p class="text-xs text-muted-foreground">
            Calculated from Date of Birth
          </p>
        {/if}
      </div>

      <div class="flex items-center space-x-2 pt-8">
        <Switch id="active" bind:checked={active} />
        <Label for="active">Active Status</Label>
      </div>
    </div>
  </div>

  <!-- Avatar Upload Section -->
  <div class="space-y-4 rounded-lg border p-4">
    <h3 class="text-lg font-semibold">Child Avatar</h3>
    <p class="text-sm text-muted-foreground">
      Upload a square photo to identify the child
    </p>

    <div class="space-y-4">
      {#if avatarPreview}
        <div class="relative inline-block">
          <img
            src={avatarPreview}
            alt="Avatar preview"
            class="h-32 w-32 rounded-full object-cover border-2 border-primary"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            class="absolute -right-2 -top-2 h-8 w-8 rounded-full"
            onclick={removeAvatar}
            disabled={deletingAvatar}
          >
            {#if deletingAvatar}
              <LoadingSpinner class="h-4 w-4 text-white" />
            {:else}
              <Trash2 class="h-4 w-4" />
            {/if}
          </Button>
        </div>
      {:else}
        <label
          for="avatar-upload"
          class="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted/50 cursor-pointer"
        >
          <span class="text-4xl">👤</span>
        </label>
      {/if}

      <div class="flex items-center gap-2">
        <Input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onchange={handleAvatarChange}
          class="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onclick={() => document.getElementById("avatar-upload")?.click()}
          disabled={avatarUploading}
        >
          {avatarUploading
            ? "Uploading..."
            : avatarPreview
              ? "Change Avatar"
              : "Upload Avatar"}
        </Button>
        <span class="text-xs text-muted-foreground"
          >Max 10MB (JPG, PNG, WebP, GIF)</span
        >
      </div>
    </div>
  </div>

  <!-- Additional Media Upload Section -->
  <div class="space-y-4 rounded-lg border p-4">
    <h3 class="text-lg font-semibold">Additional Media</h3>
    <p class="text-sm text-muted-foreground">
      Upload images and videos (optional)
    </p>

    <div class="space-y-4">
      <!-- Existing Media -->
      {#if existingMedia.length > 0}
        <div>
          <Label class="text-sm font-medium">Current Files</Label>
          <div
            class="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
          >
            {#each existingMedia as media, index}
              <div class="relative group">
                {#if media.type?.startsWith("image/")}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                  <img
                    src={media.url}
                    alt={media.name || "Media"}
                    class="h-24 w-full rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                    onclick={() => togglePreview(media, index, "existing")}
                  />
                {:else if media.type?.startsWith("video/")}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div
                    class="relative cursor-pointer hover:opacity-80 transition-opacity"
                    onclick={() => togglePreview(media, index, "existing")}
                  >
                    <video
                      src={media.url}
                      class="h-24 w-full rounded-lg object-cover border"
                      ><track kind="captions" /></video
                    >
                    <div
                      class="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg pointer-events-none"
                    >
                      <span class="text-2xl">▶️</span>
                    </div>
                  </div>
                {/if}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  class="absolute -right-2 -top-2 h-6 w-6 transition-opacity"
                  onclick={() => removeExistingMedia(index)}
                >
                  <Trash2 class="h-3 w-3" />
                </Button>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- New Media Previews -->
      {#if mediaPreviews.length > 0}
        <div>
          <Label class="text-sm font-medium">New Files to Upload</Label>
          <div
            class="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
          >
            {#each mediaPreviews as preview, index}
              <div class="relative group">
                {#if mediaFiles[index].type.startsWith("image/")}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <img
                    src={preview}
                    alt="Preview"
                    class="h-24 w-full rounded-lg object-cover border border-primary cursor-pointer hover:opacity-80 transition-opacity"
                    onclick={() =>
                      togglePreview(mediaFiles[index], index, "new")}
                  />
                {:else if mediaFiles[index].type.startsWith("video/")}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div
                    class="relative cursor-pointer hover:opacity-80 transition-opacity"
                    onclick={() =>
                      togglePreview(mediaFiles[index], index, "new")}
                  >
                    <video
                      src={preview}
                      class="h-24 w-full rounded-lg object-cover border border-primary"
                      ><track kind="captions" /></video
                    >
                    <div
                      class="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg pointer-events-none"
                    >
                      <span class="text-2xl">▶️</span>
                    </div>
                  </div>
                {/if}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  class="absolute -right-2 -top-2 h-6 w-6 transition-opacity"
                  onclick={() => removeMediaFile(index)}
                >
                  <Trash2 class="h-3 w-3" />
                </Button>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Upload Button -->
      <div class="flex items-center gap-2">
        <Input
          id="media-upload"
          type="file"
          accept="image/*,video/*"
          multiple
          onchange={handleMediaChange}
          class="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onclick={() => document.getElementById("media-upload")?.click()}
          disabled={mediaUploading}
        >
          {mediaUploading
            ? `Uploading ${mediaFiles.length} files...`
            : "Add Photos/Videos"}
        </Button>
        <span class="text-xs text-muted-foreground"
          >Max 5MB for images, 250MB for videos (4 files total)</span
        >
      </div>
    </div>
  </div>

  <!-- Parent Information Section -->
  <div class="space-y-4 rounded-lg border p-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">
        Parent/Guardian Information <span
          class="text-sm font-normal text-muted-foreground">(Optional)</span
        >
      </h3>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onclick={addParent}
        class="cursor-pointer"
      >
        Add Parent
      </Button>
    </div>

    {#each parents as parent, index}
      <div
        class="relative grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-2 bg-muted/20"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
          onclick={() => removeParent(index)}
        >
          ✕
        </Button>

        <div class="space-y-2">
          <Label for={`parentName-${index}`}>Parent Name</Label>
          <Input
            id={`parentName-${index}`}
            bind:value={parent.name}
            placeholder="Enter parent's full name"
          />
        </div>

        <div class="space-y-2">
          <Label for={`parentPhone-${index}`}>Parent Phone</Label>
          <PhoneInput
            bind:value={parent.phone}
            defaultCountry="NG"
            name={`parentPhone-${index}`}
            placeholder="Enter phone number"
          />
          <p class="text-xs text-muted-foreground">
            Phone will be saved in international format
          </p>
        </div>

        <div class="space-y-2">
          <Label for={`parentEmail-${index}`}>Parent Email</Label>
          <Input
            id={`parentEmail-${index}`}
            type="email"
            bind:value={parent.email}
            placeholder="Enter email address"
          />
        </div>

        <div class="space-y-2">
          <Label for={`parentType-${index}`}>Relationship</Label>
          <SelectComponent
            options={parentTypeOptions}
            bind:value={parent.parentType}
            name={`parentType-${index}`}
            placeholder="Select relationship"
          />
        </div>
      </div>
    {/each}
  </div>

  <!-- Medical & Emergency Information Section -->
  <div class="space-y-4 rounded-lg border p-4">
    <h3 class="text-lg font-semibold">Medical & Emergency Information</h3>

    <div class="grid grid-cols-1 gap-4">
      <div class="space-y-2">
        <Label for="allergies">Allergies</Label>
        <Textarea
          id="allergies"
          bind:value={allergies}
          placeholder="List any known allergies..."
          rows={2}
        />
      </div>

      <div class="space-y-2">
        <Label for="emergencyContact">Emergency Contact</Label>
        <Input
          id="emergencyContact"
          bind:value={emergencyContact}
          placeholder="Emergency contact number"
        />
      </div>
    </div>
  </div>

  <!-- Additional Notes Section -->
  <div class="space-y-4 rounded-lg border p-4">
    <h3 class="text-lg font-semibold">Additional Notes</h3>

    <div class="space-y-2">
      <Label for="notes">Notes</Label>
      <Textarea
        id="notes"
        bind:value={notes}
        placeholder="Any additional information..."
        rows={4}
      />
    </div>
  </div>

  <!-- Form Actions -->
  <div class="flex items-center gap-4">
    <Button type="submit" disabled={isLoading} class="cursor-pointer">
      {#if isLoading}
        <LoadingSpinner class="text-white dark:text-background" />
        {#if mediaUploading && uploadProgress > 0}
          <span>Uploading. {uploadProgress}%</span>
        {:else}
          <span>{isEditing ? "Updating..." : "Creating..."}</span>
        {/if}
      {:else}
        {isEditing ? "Update Child" : "Add Child"}
      {/if}
    </Button>

    <Button
      type="button"
      variant="outline"
      href="/children"
      class="cursor-pointer"
    >
      Cancel
    </Button>
  </div>
</form>

<!-- Image Cropper Modal -->
{#if showCropper && imageToCrop}
  <ImageCropperModal
    imageFile={imageToCrop}
    onCrop={handleCropComplete}
    onCancel={handleCropCancel}
  />
{/if}
