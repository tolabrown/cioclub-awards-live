<script lang="ts">
  import type { PageProps } from "./$types";
  import { enhance, deserialize } from "$app/forms";
  import { goto, invalidateAll } from "$app/navigation";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { resizeImage } from "$lib/authentication/imageresize";
  import {
    ChevronLeft,
    Loader2,
    Upload,
    Link,
    X,
    Image as ImageIcon,
    Trash2,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  let { data }: PageProps = $props();

  let isSubmitting = $state(false);
  let isDeleting = $state(false);
  let name = $state("");
  let description = $state("");
  let parentId = $state("");
  let isActive = $state(true);

  // Image state
  let imageId = $state<string | null>(null);
  let imageFile = $state<File | null>(null);
  let imagePreview = $state<string | null>(null);
  let imageUrlInput = $state("");
  let isProcessingImage = $state(false);

  const categories = $derived(data.categories || []);

  async function uploadImageToServer(file: File) {
    isProcessingImage = true;
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("?/uploadImage", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      if (result.type === "success" && result.data) {
        const fileData = (result.data as any).file;
        imageId = fileData.id;
        imagePreview = fileData.url;
        toast.success("Image uploaded successfully");
        await invalidateAll();
      } else if (result.type === "failure") {
        const errorMsg = (result.data as any)?.error || "Upload failed";
        toast.error(errorMsg);
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload");
    } finally {
      isProcessingImage = false;
    }
  }

  async function processImage(file: File) {
    isProcessingImage = true;
    try {
      const resized = await resizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        format: "webp",
      });

      await uploadImageToServer(resized);
    } catch (error) {
      console.error("Resizing error:", error);
      toast.error(`Failed to process image`);
      isProcessingImage = false;
    }
  }

  const handleImageUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await processImage(input.files[0]);
    }
  };

  const handleImageUrl = async () => {
    if (!imageUrlInput) return;
    isProcessingImage = true;
    try {
      const response = await fetch(imageUrlInput);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const fileName = imageUrlInput.split("/").pop() || "image.webp";
      const file = new File([blob], fileName, { type: blob.type });
      await processImage(file);
      imageUrlInput = "";
    } catch (error) {
      console.error("URL Image error:", error);
      toast.error("Failed to load image from URL");
      isProcessingImage = false;
    }
  };

  const removeImage = async () => {
    if (!imageId && !imagePreview) return;

    if (confirm("Are you sure you want to delete this image?")) {
      isDeleting = true;
      try {
        if (imageId) {
          const formData = new FormData();
          formData.append("imageId", imageId);

          const response = await fetch("?/deleteImage", {
            method: "POST",
            body: formData,
          });
          const result = deserialize(await response.text());

          if (result.type === "success") {
            toast.success("Image deleted successfully");
            await invalidateAll();
          } else {
            // @ts-ignore
            const errorMsg = (result.data as any)?.error || "Deletion failed";
            toast.error(errorMsg);
          }
        }

        imageId = null;
        imageFile = null;
        imagePreview = null;
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("An error occurred during deletion");
      } finally {
        isDeleting = false;
      }
    }
  };
</script>

<div class="space-y-6 max-w-5xl mx-auto">
  <div class="flex items-center gap-4">
    <Button
      variant="ghost"
      size="icon"
      onclick={() => goto("/admin/categories")}
    >
      <ChevronLeft class="h-4 w-4" />
    </Button>
    <div>
      <h1 class="text-2xl font-bold text-foreground">Add Category</h1>
      <p class="text-sm text-muted-foreground">
        Create a new product category with rich visuals
      </p>
    </div>
  </div>

  <form
    method="POST"
    action="?/create"
    enctype="multipart/form-data"
    use:enhance={() => {
      isSubmitting = true;
      return async ({ result }) => {
        isSubmitting = false;
        if (result.type === "redirect") {
          toast.success("Category created successfully");
          goto(result.location);
        } else if (result.type === "failure") {
          toast.error(
            (result as any).data?.error || "Failed to create category",
          );
        }
      };
    }}
    class="grid gap-6 lg:grid-cols-3"
  >
    <!-- Hidden input for image ID -->
    <input type="hidden" name="imageId" value={imageId} />
    <div class="space-y-6 lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription
            >Main details and description for the category</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Category Name *</Label>
            <Input
              id="name"
              name="name"
              bind:value={name}
              required
              placeholder="Electronics, Fashion..."
            />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              bind:value={description}
              rows={4}
              placeholder="What's in this category?"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Category Image</CardTitle>
              <CardDescription
                >Upload or use a URL (WebP, &lt;200KB)</CardDescription
              >
            </div>
            {#if isProcessingImage}
              <div
                class="flex items-center gap-2 text-xs text-muted-foreground animate-pulse"
              >
                <Loader2 class="size-3 animate-spin" />
                Processing...
              </div>
            {/if}
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <label
              class="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-all text-center px-4"
            >
              <Upload class="size-6 text-muted-foreground mb-2" />
              <span class="text-sm font-semibold">Click to Upload</span>
              <input
                type="file"
                name="image"
                accept="image/*"
                class="hidden"
                onchange={handleImageUpload}
              />
            </label>

            <div
              class="flex h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 p-4 space-y-3"
            >
              <div class="flex items-center gap-2 w-full">
                <Link class="size-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Paste URL..."
                  class="h-9 text-xs rounded-lg"
                  bind:value={imageUrlInput}
                  onkeydown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleImageUrl())}
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                class="w-full h-8 text-xs rounded-lg"
                onclick={handleImageUrl}
                disabled={!imageUrlInput || isProcessingImage}
                type="button"
              >
                Add from URL
              </Button>
            </div>
          </div>

          {#if imagePreview}
            <div
              class="relative w-full aspect-[2/1] rounded-xl overflow-hidden border shadow-sm group"
            >
              <img
                src={imagePreview}
                alt="Preview"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                class="absolute inset-0 bg-black/20 flex items-center justify-center gap-4 transition-opacity"
              >
                <Button
                  variant="destructive"
                  size="icon"
                  class="h-12 w-12 rounded-full shadow-lg"
                  onclick={removeImage}
                  disabled={isDeleting}
                  type="button"
                >
                  {#if isDeleting}
                    <Loader2 class="h-5 w-5 animate-spin" />
                  {:else}
                    <Trash2 class="size-6" />
                  {/if}
                </Button>
              </div>
            </div>
          {:else}
            <div
              class="py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10"
            >
              <ImageIcon class="size-10 opacity-20 mb-2" />
              <p class="text-sm italic">No image selected</p>
            </div>
          {/if}
        </CardContent>
      </Card>
    </div>

    <div class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <Label for="isActive">Publicly Active</Label>
            <Switch id="isActive" name="isActive" bind:checked={isActive} />
            <input type="hidden" name="isActive" value={String(isActive)} />
          </div>
          <div class="space-y-2">
            <Label>Parent Category</Label>
            <Select.Root type="single" name="parentId" bind:value={parentId}>
              <Select.Trigger class="rounded-lg">
                <span
                  >{categories.find((c) => c.id === parentId)?.name ||
                    "None (Root)"}</span
                >
              </Select.Trigger>
              <Select.Content class="rounded-lg">
                <Select.Item value="">None (Root)</Select.Item>
                {#each categories as cat}
                  <Select.Item value={cat.id}>{cat.name}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
        </CardContent>
      </Card>

      <Card class="border-primary/20 shadow-md">
        <CardContent class="space-y-3 pt-6">
          <Button
            type="submit"
            class="w-full font-bold rounded-xl shadow-lg shadow-primary/20"
            disabled={isSubmitting || isProcessingImage}
          >
            {#if isSubmitting}
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              Creating...
            {:else}
              Create Category
            {/if}
          </Button>
          <Button
            type="button"
            variant="outline"
            class="w-full rounded-xl"
            onclick={() => goto("/admin/categories")}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  </form>
</div>
