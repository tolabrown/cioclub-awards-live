<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type { iTeacher } from "$lib/interface";
  import { toast } from "svelte-sonner";
  import { Textarea } from "$lib/components/ui/textarea";
  import SelectComponent, {
    type iSelect,
  } from "$lib/components/ui/select/select-component.svelte";
  import { Switch } from "$lib/components/ui/switch";
  import { goto } from "$app/navigation";
  import {
    TeacherType,
    Locations,
    MAX_IMAGE_SIZE,
    MAX_VIDEO_SIZE,
  } from "$lib/constants";
  import { PhoneInput } from "$lib/components/ui/phone-input";
  import * as Card from "$lib/components/ui/card";
  import ImageCropperModal from "./ImageCropperModal.svelte";
  import { resizeToFileSize } from "$lib/authentication/imageresize";
  import { Trash2, Upload } from "@lucide/svelte";
  import { onMount } from "svelte";
  import type { iUser } from "$lib/interface";
  import SearchableSelect from "$lib/components/ui/searchable-select/searchable-select.svelte";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";

  interface Props {
    teacher?: iTeacher;
  }

  let { teacher }: Props = $props();

  const isEditing = !!teacher;

  // User selection state
  let selectedUserId = $state(
    teacher?.user && typeof teacher.user === "object"
      ? teacher.user.id
      : typeof teacher?.user === "string"
        ? teacher.user
        : "",
  );

  // Form state
  let name = $state(teacher?.name || "");
  let email = $state(teacher?.email || "");
  let phone = $state(teacher?.phone || "");
  let gender = $state(teacher?.gender || "");
  let birthDay = $state(teacher?.birthDay || "");
  let teacherType = $state(teacher?.teacherType || "");
  let location = $state(teacher?.location || "");
  let assignedClass = $state(teacher?.assignedClass || "");
  let note = $state(teacher?.note || "");
  let active = $state(teacher?.active ?? true);

  // Image upload state
  let avatarFile: File | null = $state(null);
  let avatarPreview = $state(
    teacher?.image && typeof teacher.image === "object"
      ? teacher.image.url
      : "",
  );
  let avatarId = $state(
    teacher?.image && typeof teacher.image === "object"
      ? teacher.image.id
      : teacher?.image || null,
  );
  let avatarUploading = $state(false);
  let deletingAvatar = $state(false);

  // Additional Media state
  let mediaFiles: File[] = $state([]);
  let mediaPreviews: string[] = $state([]);
  let mediaIds: string[] = $state([]); // Only for newly uploaded files
  let existingMedia = $state(teacher?.files || []);
  let mediaUploading = $state(false);
  let uploadProgress = $state(0);
  let currentUploadFile = $state("");

  // File preview state
  let selectedPreview: {
    file: File | (typeof existingMedia)[0];
    index: number;
    type: "new" | "existing";
  } | null = $state(null);

  const MAX_MEDIA_FILES = 4;

  // Cropper state
  let showCropper = $state(false);
  let imageToCrop: File | null = $state(null);

  const getCapacity = () => {
    if (teacher?.capacity) {
      try {
        return JSON.parse(teacher.capacity);
      } catch {
        return [];
      }
    }
    return [];
  };

  // Capacity state - array of selected age groups
  let capacity = $state<string[]>(getCapacity());

  let isLoading = $state(false);

  const genderOptions: iSelect[] = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];

  const teacherTypeOptions: iSelect[] = [
    { label: TeacherType.FULL_TIME, value: TeacherType.FULL_TIME },
    { label: TeacherType.VOLUNTEER, value: TeacherType.VOLUNTEER },
    { label: TeacherType.UTILITY, value: TeacherType.UTILITY },
  ];

  const locationOptions: iSelect[] = [
    { label: Locations.APOSTOLIC_CENTER, value: Locations.APOSTOLIC_CENTER },
    { label: Locations.MAGODO_CHURCH, value: Locations.MAGODO_CHURCH },
    { label: Locations.EGBEDA_CHURCH, value: Locations.EGBEDA_CHURCH },
    { label: Locations.ISLAND_CHURCH, value: Locations.ISLAND_CHURCH },
    { label: Locations.AJEGUNLE_CHURCH, value: Locations.AJEGUNLE_CHURCH },
  ];

  const ageGroupOptions = [
    "Nursery",
    "Toddlers",
    "Beginners",
    "Primary",
    "Juniors",
  ];

  const toggleAgeGroup = (ageGroup: string) => {
    if (capacity.includes(ageGroup)) {
      capacity = capacity.filter((ag) => ag !== ageGroup);
    } else {
      capacity = [...capacity, ageGroup];
    }
  };

  // Fetch users for selection (SearchableSelect)
  const fetchUserOptions = async (query: string) => {
    try {
      const response = await fetch(
        `/api/users?search=${encodeURIComponent(query)}&limit=20`,
      );
      const result = await response.json();
      if (result.data) {
        return result.data.map((u: iUser) => ({
          id: u.id,
          name: u.name,
          description: u.email,
          image: u.image ? { url: u.image } : null,
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return [];
    }
  };

  let initialUserItem = $state(
    teacher?.user && typeof teacher.user === "object"
      ? {
          id: teacher.user.id,
          name: teacher.user.name,
          description: teacher.user.email,
          image: teacher.user.image ? { url: teacher.user.image } : null,
        }
      : null,
  );

  const handleUserSelect = (item: any) => {
    selectedUserId = item ? item.id : "";
  };

  // Image upload functions
  const handleAvatarChange = (e: Event) => {
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

      // Reset input to allow selecting the same file again
      input.value = "";
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    showCropper = false;

    try {
      const resizedFile = await resizeToFileSize(croppedFile, 200, "jpeg");
      avatarFile = resizedFile;
      avatarPreview = URL.createObjectURL(resizedFile);
      toast.success(`Photo ready (${Math.round(resizedFile.size / 1024)}KB)`);
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
      avatarId = null;
      return;
    }

    if (
      isEditing &&
      teacher?.image &&
      (typeof teacher.image === "object"
        ? teacher.image.id === avatarId
        : teacher.image === avatarId)
    ) {
      if (
        !confirm(
          "Are you sure you want to delete this avatar? This cannot be undone.",
        )
      )
        return;

      deletingAvatar = true;
      try {
        // 1. Remove link from teacher
        const updateResponse = await fetch(`/api/teachers/${teacher.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: null }), // Note: API expects flat body for PATCH
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

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return avatarId as string;

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
      toast.error(`Photo upload failed: ${error.message}`);
      return null;
    } finally {
      avatarUploading = false;
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

    if (!confirm("Are you sure you want to delete this file?")) return;

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

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    isLoading = true;

    try {
      if (!name.trim()) {
        toast.error("Teacher name is required");
        return;
      }

      // Upload avatar if new file selected
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

      const teacherData = {
        userId: selectedUserId || null,
        name,
        email: email || null,
        phone: phone || null,
        gender: gender || null,
        birthDay: birthDay || null,
        teacherType: teacherType || null,
        location: location || null,
        capacity: capacity.length > 0 ? JSON.stringify(capacity) : null,
        assignedClass: assignedClass || null,
        note: note || null,
        image: finalAvatarId,
        files: allMediaIds, // Send all file IDs (existing + new)
        active,
      };

      const url = isEditing ? `/api/teachers/${teacher.id}` : "/api/teachers";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teacherData),
      });

      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.message);
      }

      toast.success(
        isEditing
          ? "Teacher updated successfully"
          : "Teacher created successfully",
      );

      goto("/teachers");
    } catch (error: any) {
      console.error("Failed to save teacher:", error);
      toast.error(error.message || "Failed to save teacher");
    } finally {
      isLoading = false;
    }
  };
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <!-- Photo Upload -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Teacher Photo</Card.Title>
      <Card.Description>Upload a profile photo for the teacher</Card.Description
      >
    </Card.Header>
    <Card.Content>
      <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <!-- Avatar Preview -->
        <label for="avatar-upload" class="flex flex-col items-center gap-2">
          {#if avatarPreview}
            <img
              src={avatarPreview}
              alt="Teacher avatar"
              class="h-32 w-32 rounded-full object-cover border-4 border-primary/20"
            />
          {:else}
            <div
              class="flex h-32 w-32 items-center justify-center rounded-full bg-muted border-4 border-muted-foreground/20"
            >
              <span class="text-5xl">👨‍🏫</span>
            </div>
          {/if}
        </label>

        <!-- Upload Controls -->
        <div class="flex flex-col gap-2 w-full sm:w-auto">
          <Label
            for="avatar-upload"
            class="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            <Upload class="h-4 w-4" />
            {avatarPreview ? "Change Photo" : "Upload Photo"}
          </Label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onchange={handleAvatarChange}
            class="hidden"
          />

          {#if avatarPreview}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onclick={removeAvatar}
              class="w-full sm:w-auto"
            >
              <Trash2 class="mr-2 h-4 w-4" />
              Remove
            </Button>
          {/if}

          <p class="text-xs text-muted-foreground text-center sm:text-left">
            Recommended: Square image, max 5MB
          </p>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- User Account Linking -->
  <Card.Root>
    <Card.Header>
      <Card.Title>User Account</Card.Title>
      <Card.Description
        >Link this teacher to a user account (optional)</Card.Description
      >
    </Card.Header>
    <Card.Content>
      <div class="space-y-2">
        <Label for="user">Linked User Account</Label>
        <p class="text-sm text-muted-foreground">
          Link to a user account to enable login and use their profile picture
          as fallback
        </p>
        <SearchableSelect
          placeholder="Search for a user..."
          fetchOptions={fetchUserOptions}
          initialItem={initialUserItem}
          onSelect={handleUserSelect}
          entityName="User"
          bind:value={selectedUserId}
        />
        {#if !selectedUserId}
          <p class="text-sm text-muted-foreground mt-2">
            No user account linked
          </p>
        {/if}
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Basic Information -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Basic Information</Card.Title>
      <Card.Description>Enter the teacher's personal details</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="name">Name <span class="text-destructive">*</span></Label>
          <Input id="name" bind:value={name} required placeholder="Full name" />
        </div>

        <div class="space-y-2">
          <Label for="gender">Gender</Label>
          <SelectComponent
            options={genderOptions}
            bind:value={gender}
            placeholder="Select gender"
            name="gender"
          />
        </div>

        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            type="email"
            bind:value={email}
            placeholder="email@example.com"
          />
        </div>

        <div class="space-y-2">
          <Label for="phone">Phone</Label>
          <PhoneInput bind:value={phone} placeholder="Phone number" />
        </div>

        <div class="space-y-2">
          <Label for="birthDay">Birthday (DD-MM)</Label>
          <Input
            id="birthDay"
            bind:value={birthDay}
            placeholder="e.g., 15-03"
            maxlength={5}
          />
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Teacher Details -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Teacher Details</Card.Title>
      <Card.Description
        >Specify teacher type, location, and assignment</Card.Description
      >
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="teacherType">Teacher Type</Label>
          <SelectComponent
            options={teacherTypeOptions}
            bind:value={teacherType}
            placeholder="Select type"
            name="teacherType"
          />
        </div>

        <div class="space-y-2">
          <Label for="location">Location</Label>
          <SelectComponent
            options={locationOptions}
            bind:value={location}
            placeholder="Select location"
            name="location"
          />
        </div>

        <div class="space-y-2 sm:col-span-2">
          <Label for="assignedClass">Assigned Class</Label>
          <Input
            id="assignedClass"
            bind:value={assignedClass}
            placeholder="e.g., Primary 1"
          />
        </div>
      </div>

      <!-- Age Group Capacity -->
      <div class="space-y-2">
        <Label>Age Group Capacity</Label>
        <p class="text-sm text-muted-foreground">
          Select the age groups this teacher can handle
        </p>
        <div class="flex flex-wrap gap-2">
          {#each ageGroupOptions as ageGroup}
            <Button
              type="button"
              variant={capacity.includes(ageGroup) ? "default" : "outline"}
              size="sm"
              onclick={() => toggleAgeGroup(ageGroup)}
            >
              {ageGroup}
            </Button>
          {/each}
        </div>
      </div>

      <!-- Note -->
      <div class="space-y-2">
        <Label for="note">Note</Label>
        <p class="text-sm text-muted-foreground">
          Add any additional notes (e.g., HOD, Assistant HOD)
        </p>
        <Textarea
          id="note"
          bind:value={note}
          placeholder="Enter notes..."
          rows={3}
        />
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Additional Media -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Additional Media</Card.Title>
      <Card.Description
        >Upload additional photos or videos (Max {MAX_MEDIA_FILES} files)</Card.Description
      >
    </Card.Header>
    <Card.Content class="space-y-4">
      <!-- Upload Area -->
      <div
        class="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors"
      >
        <input
          type="file"
          id="media-upload"
          multiple
          accept="image/*,video/*"
          class="hidden"
          onchange={handleMediaChange}
          disabled={existingMedia.length + mediaFiles.length >= MAX_MEDIA_FILES}
        />
        <label
          for="media-upload"
          class="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload class="h-8 w-8 text-muted-foreground" />
          <span class="text-sm font-medium">
            {existingMedia.length + mediaFiles.length >= MAX_MEDIA_FILES
              ? "Maximum files reached"
              : "Click to upload photos or videos"}
          </span>
          <span class="text-xs text-muted-foreground">
            Max 5MB for images, 250MB for videos
          </span>
        </label>
      </div>

      <!-- File List -->
      {#if existingMedia.length > 0 || mediaFiles.length > 0}
        <div class="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <!-- Existing Files -->
          {#each existingMedia as file, i}
            <div class="relative group aspect-square">
              {#if file.type?.startsWith("image/")}
                <button
                  type="button"
                  class="w-full h-full"
                  onclick={() => togglePreview(file, i, "existing")}
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    class="w-full h-full object-cover rounded-lg border"
                  />
                </button>
              {:else if file.type?.startsWith("video/")}
                <button
                  type="button"
                  class="w-full h-full flex items-center justify-center bg-muted rounded-lg border"
                  onclick={() => togglePreview(file, i, "existing")}
                >
                  <span class="text-2xl">🎥</span>
                </button>
              {:else}
                <div
                  class="w-full h-full flex items-center justify-center bg-muted rounded-lg border"
                >
                  <span class="text-2xl">📄</span>
                </div>
              {/if}

              <Button
                type="button"
                variant="destructive"
                size="icon"
                class="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onclick={() => removeExistingMedia(i)}
              >
                <Trash2 class="h-3 w-3" />
              </Button>

              <!-- Preview Overlay -->
              {#if selectedPreview?.type === "existing" && selectedPreview?.index === i}
                <div
                  class="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg"
                >
                  <div class="relative w-full h-full p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="absolute top-0 right-0 z-20"
                      onclick={(e) => {
                        e.stopPropagation();
                        selectedPreview = null;
                      }}
                    >
                      <span class="text-lg">×</span>
                    </Button>
                    {#if file.type?.startsWith("image/")}
                      <img
                        src={file.url}
                        alt={file.name}
                        class="w-full h-full object-contain"
                      />
                    {:else if file.type?.startsWith("video/")}
                      <video
                        src={file.url}
                        controls
                        class="w-full h-full object-contain"
                      >
                        <track kind="captions" />
                      </video>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/each}

          <!-- New Files -->
          {#each mediaFiles as file, i}
            <div class="relative group aspect-square">
              {#if file.type.startsWith("image/")}
                <button
                  type="button"
                  class="w-full h-full"
                  onclick={() => togglePreview(file, i, "new")}
                >
                  <img
                    src={mediaPreviews[i]}
                    alt={file.name}
                    class="w-full h-full object-cover rounded-lg border"
                  />
                </button>
              {:else if file.type.startsWith("video/")}
                <button
                  type="button"
                  class="w-full h-full flex items-center justify-center bg-muted rounded-lg border"
                  onclick={() => togglePreview(file, i, "new")}
                >
                  <span class="text-2xl">🎥</span>
                </button>
              {/if}

              <Button
                type="button"
                variant="destructive"
                size="icon"
                class="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onclick={() => removeMediaFile(i)}
              >
                <Trash2 class="h-3 w-3" />
              </Button>

              <!-- Preview Overlay -->
              {#if selectedPreview?.type === "new" && selectedPreview?.index === i}
                <div
                  class="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg"
                >
                  <div class="relative w-full h-full p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="absolute top-0 right-0 z-20"
                      onclick={(e) => {
                        e.stopPropagation();
                        selectedPreview = null;
                      }}
                    >
                      <span class="text-lg">×</span>
                    </Button>
                    {#if file.type.startsWith("image/")}
                      <img
                        src={mediaPreviews[i]}
                        alt={file.name}
                        class="w-full h-full object-contain"
                      />
                    {:else if file.type.startsWith("video/")}
                      <video
                        src={mediaPreviews[i]}
                        controls
                        class="w-full h-full object-contain"
                      >
                        <track kind="captions" />
                      </video>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Status -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Status</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex items-center justify-between">
        <div>
          <Label for="active">Active Status</Label>
          <p class="text-sm text-muted-foreground">
            Inactive teachers won't appear in active lists
          </p>
        </div>
        <Switch id="active" bind:checked={active} />
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Actions -->
  <div class="flex flex-col gap-3 sm:flex-row">
    <Button
      type="button"
      variant="outline"
      href="/teachers"
      disabled={isLoading}
    >
      Cancel
    </Button>
    <Button type="submit" disabled={isLoading || avatarUploading}>
      {#if isLoading || avatarUploading || mediaUploading}
        <LoadingSpinner class="mr-2" />
        {#if mediaUploading && uploadProgress > 0}
          <span>Uploading... {uploadProgress}%</span>
        {:else}
          {avatarUploading ? "Uploading..." : "Saving..."}
        {/if}
      {:else}
        {isEditing ? "Update Teacher" : "Create Teacher"}
      {/if}
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
