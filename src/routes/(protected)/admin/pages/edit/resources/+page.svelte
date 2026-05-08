<script lang="ts">
  import type { PageProps } from "./$types";
  import { deserialize } from "$app/forms";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import * as Select from "$lib/components/ui/select";
  import { toast } from "svelte-sonner";
  import { untrack } from "svelte";
  import { resizeImage } from "$lib/authentication/imageresize";
  import {
    FileText,
    LayoutDashboard,
    Sparkles,
    Plus,
    Trash2,
    Loader2,
    Video,
    Image as ImageIcon,
    Globe,
    Library,
    Search,
    Edit3,
    Upload,
    Calendar,
    Music,
    Eye,
    FileDown,
  } from "@lucide/svelte";
  import EditorHeader from "$lib/components/admin/editor/EditorHeader.svelte";
  import EditorJumpLinks from "$lib/components/admin/editor/EditorJumpLinks.svelte";
  import SEOSection from "$lib/components/admin/editor/SEOSection.svelte";
  import SectionWrapper from "$lib/components/admin/editor/SectionWrapper.svelte";
  import { invalidateAll } from "$app/navigation";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";

  let { data }: PageProps = $props();
  const isMobile = new IsMobile();

  let isSubmitting = $state(false);
  let isUploadingOg = $state(false);

  // Layout State
  let pageTitle = $state("Resources Hub - CIO Club Africa");
  let pageDescription = $state(
    "Access our exclusive collection of whitepapers, reports, and multimedia content.",
  );
  let ogImage = $state("");

  let content = $state({
    hero: {
      badge: "Media & Knowledge",
      title: "Resources Hub",
      description: "Access our exclusive collection...",
    },
  });

  // Resource Management State
  let searchQuery = $state("");
  let selectedCategory = $state("all");
  let isEditingResource = $state(false);
  let isSavingResource = $state(false);
  let currentResource = $state<any>(null);
  let coverImageFile = $state<File | null>(null);
  let coverImagePreview = $state("");
  let mediaFile = $state<File | null>(null);
  let isUploadingFile = $state(false);

  // Filtered resources
  let filteredResources = $derived(
    data.resources.filter((r: any) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || r.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }),
  );

  // Sync data from server
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || "Resources Hub - CIO Club Africa";
        pageDescription =
          meta.description || "Access our exclusive collection...";
        ogImage = meta.ogImage || "";
      });
    }
    if (data.content) {
      untrack(() => {
        content = {
          hero: { ...content.hero, ...data.content.hero },
        };
      });
    }
  });

  async function handleSavePage() {
    isSubmitting = true;
    const formData = new FormData();
    formData.append("data", JSON.stringify(content));
    formData.append("title", pageTitle);
    formData.append("description", pageDescription);
    formData.append("ogImage", ogImage);

    try {
      const response = await fetch("?/saveMeta", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      if (result.type === "success") {
        toast.success("Page layout saved");
        await invalidateAll();
      } else {
        toast.error("Failed to save layout");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      isSubmitting = false;
    }
  }

  function openResourceModal(resource: any = null) {
    if (resource) {
      currentResource = {
        ...resource,
        publishedDate: resource.publishedDate
          ? new Date(resource.publishedDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      };
      coverImagePreview = resource.coverImage?.url || "";
    } else {
      currentResource = {
        title: "",
        description: "",
        category: "Report",
        publishedDate: new Date().toISOString().split("T")[0],
        coverImageId: null,
        fileId: null,
      };
      coverImagePreview = "";
    }
    coverImageFile = null;
    mediaFile = null;
    isEditingResource = true;
  }

  async function handleSaveResource() {
    isSavingResource = true;
    const formData = new FormData();

    if (currentResource.id) formData.append("id", currentResource.id);
    formData.append("title", currentResource.title);
    formData.append("description", currentResource.description || "");
    formData.append("category", currentResource.category);
    formData.append("publishedDate", currentResource.publishedDate);

    try {
      // 1. Handle Cover Image Upload if changed
      if (coverImageFile) {
        const resized = await resizeImage(coverImageFile, {
          maxWidth: 1200,
          quality: 0.8,
          format: "webp",
        });
        const uploadData = new FormData();
        uploadData.append("image", resized);
        const res = await fetch("?/uploadImage", {
          method: "POST",
          body: uploadData,
        });
        const uploadResult = deserialize(await res.text()) as any;
        if (uploadResult.type === "success") {
          formData.append("coverImageId", uploadResult.data.image.id);
        }
      } else if (currentResource.coverImageId) {
        formData.append("coverImageId", currentResource.coverImageId);
      }

      // 2. Handle Media File Upload if changed
      if (mediaFile) {
        const uploadData = new FormData();
        uploadData.append("file", mediaFile);
        const res = await fetch("?/uploadFile", {
          method: "POST",
          body: uploadData,
        });
        const uploadResult = deserialize(await res.text()) as any;
        if (uploadResult.type === "success") {
          formData.append("fileId", uploadResult.data.file.id);
        }
      } else if (currentResource.media?.[0]?.fileId) {
        formData.append("fileId", currentResource.media[0].fileId);
      }

      const response = await fetch("?/upsertResource", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      if (result.type === "success") {
        toast.success("Material saved successfully");
        isEditingResource = false;
        await invalidateAll();
      } else {
        toast.error("Failed to save material");
      }
    } catch (error) {
      toast.error("Error saving material");
    } finally {
      isSavingResource = false;
    }
  }

  async function handleDeleteResource(id: string) {
    if (!confirm("Are you sure you want to delete this material?")) return;

    const formData = new FormData();
    formData.append("id", id);

    try {
      const response = await fetch("?/deleteResource", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      if (result.type === "success") {
        toast.success("Material deleted");
        await invalidateAll();
      } else {
        toast.error("Delete failed");
      }
    } catch (error) {
      toast.error("Error deleting material");
    }
  }

  async function onImageUpload(e: Event, key: string) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (key === "og") {
      isUploadingOg = true;
      try {
        const uploadData = new FormData();
        uploadData.append("image", file);
        const res = await fetch("?/uploadImage", {
          method: "POST",
          body: uploadData,
        });
        const result = deserialize(await res.text()) as any;
        if (result.type === "success") ogImage = result.data.image.url;
      } finally {
        isUploadingOg = false;
      }
    } else if (key === "cover") {
      coverImageFile = file;
      coverImagePreview = URL.createObjectURL(file);
    } else if (key === "media") {
      mediaFile = file;
    }
    input.value = "";
  }

  const jumpLinks = [
    { id: "seo", label: "SEO", icon: Sparkles },
    { id: "hero", label: "Hero", icon: LayoutDashboard },
    { id: "materials", label: "Materials", icon: Library },
  ];
</script>

<div class="flex flex-col gap-4 pb-20 w-full">
  <EditorHeader
    title="Edit Resources Hub"
    {isSubmitting}
    onSave={handleSavePage}
  />

  <EditorJumpLinks links={jumpLinks} />

  <div class="space-y-4">
    <SEOSection
      bind:title={pageTitle}
      bind:description={pageDescription}
      bind:ogImage
      {isUploadingOg}
      onImageUpload={(e: any) => onImageUpload(e, "og")}
    />

    <Separator class="bg-border/40" />

    <!-- Hero Section -->
    <SectionWrapper
      id="hero"
      title="Hero Section"
      description="Main banner of the resources hub"
      icon={LayoutDashboard}
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Badge Text</Label
          >
          <Input
            bind:value={content.hero.badge}
            placeholder="Media & Knowledge"
          />
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Main Title</Label
          >
          <Input bind:value={content.hero.title} placeholder="Resources Hub" />
        </div>
      </div>
      <div class="space-y-2">
        <Label
          class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >Description</Label
        >
        <Textarea
          bind:value={content.hero.description}
          placeholder="Hero description text..."
          rows={3}
        />
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Materials Registry -->
    <SectionWrapper
      id="materials"
      title="Materials Registry"
      description="Manage whitepapers, reports, video and audio materials"
      icon={Library}
    >
      {#snippet headerAction()}
        <Button
          size="sm"
          onclick={() => openResourceModal()}
          class="gap-2 rounded-xl"
        >
          <Plus class="size-4" /> Add Material
        </Button>
      {/snippet}

      <div class="space-y-6">
        <!-- Search & Filter -->
        <div class="flex flex-col md:flex-row gap-4">
          <div class="relative flex-1">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              placeholder="Search materials..."
              class="pl-10 rounded-xl"
              bind:value={searchQuery}
            />
          </div>
          <Select.Root type="single" bind:value={selectedCategory}>
            <Select.Trigger class="w-full md:w-[180px] rounded-xl">
              {selectedCategory === "all" ? "All Categories" : selectedCategory}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Categories</Select.Item>
              <Select.Item value="Report">Report</Select.Item>
              <Select.Item value="Whitepaper">Whitepaper</Select.Item>
              <Select.Item value="Case Study">Case Study</Select.Item>
              <Select.Item value="Video">Video</Select.Item>
              <Select.Item value="Audio">Audio</Select.Item>
              <Select.Item value="Image">Image</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <!-- Materials Grid -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each filteredResources as item (item.id)}
            <div
              class="group relative bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div class="aspect-video relative overflow-hidden bg-muted">
                {#if item.coverImage?.url}
                  <img
                    src={item.coverImage.url}
                    alt={item.title}
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                {:else}
                  <div class="w-full h-full flex items-center justify-center">
                    <Library class="size-10 text-muted-foreground/20" />
                  </div>
                {/if}
                <div
                  class="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider"
                >
                  {item.category}
                </div>
              </div>

              <div class="p-4 flex-1 flex flex-col space-y-3">
                <div class="flex-1 space-y-1">
                  <h3 class="font-bold truncate" title={item.title}>
                    {item.title}
                  </h3>
                  <p class="text-xs text-muted-foreground line-clamp-2">
                    {item.description || "No description"}
                  </p>
                </div>

                <div
                  class="flex items-center justify-between pt-2 border-t border-border/40"
                >
                  <span class="text-[10px] font-medium text-muted-foreground">
                    {item.publishedDate
                      ? new Date(item.publishedDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                  <div class="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                      onclick={() => openResourceModal(item)}
                    >
                      <Edit3 class="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      onclick={() => handleDeleteResource(item.id)}
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </SectionWrapper>
  </div>
</div>

<!-- Material Editor -->
{#if isEditingResource}
  {#if !isMobile.current}
    <Dialog.Root
      open={true}
      onOpenChange={(o) => !o && (isEditingResource = false)}
    >
      <Dialog.Content
        class="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl"
      >
        {@render EditorContent()}
      </Dialog.Content>
    </Dialog.Root>
  {:else}
    <Drawer.Root
      open={true}
      onOpenChange={(o) => !o && (isEditingResource = false)}
    >
      <Drawer.Content class="p-0 rounded-t-[2rem] max-h-[95vh] flex flex-col">
        <div class="overflow-y-auto p-4 flex-1">
          {@render EditorContent()}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  {/if}
{/if}

{#snippet EditorContent()}
  <div class="bg-card">
    <div
      class="p-6 border-b flex items-center justify-between sticky top-0 bg-card z-10"
    >
      <div>
        <h2 class="text-xl font-bold">
          {currentResource.id ? "Edit Material" : "New Material"}
        </h2>
        <p class="text-xs text-muted-foreground">
          Manage media parameters and files
        </p>
      </div>
      <Button
        size="sm"
        onclick={handleSaveResource}
        disabled={isSavingResource}
        class="rounded-xl px-6"
      >
        {#if isSavingResource}
          <Loader2 class="size-4 animate-spin mr-2" /> Saving...
        {:else}
          Save Material
        {/if}
      </Button>
    </div>

    <div class="p-6 space-y-8">
      <!-- Media File Upload -->
      <div class="space-y-4">
        <Label
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >Resource File (PDF, MP3, MP4, etc.)</Label
        >
        <div
          class="relative group rounded-2xl bg-muted border-2 border-dashed border-border p-8 flex flex-col items-center justify-center gap-3 transition-all hover:bg-muted/80"
        >
          {#if mediaFile || currentResource.media?.[0]?.file}
            <div
              class="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"
            >
              <FileDown class="size-8" />
            </div>
            <div class="text-center">
              <p class="font-bold truncate max-w-[300px]">
                {mediaFile
                  ? mediaFile.name
                  : currentResource.media[0].file.name}
              </p>
              <p class="text-xs text-muted-foreground uppercase font-black">
                {mediaFile
                  ? mediaFile.type
                  : currentResource.media[0].file.type || "Attached File"}
              </p>
            </div>
          {:else}
            <div
              class="size-16 rounded-2xl bg-background border flex items-center justify-center text-muted-foreground"
            >
              <Upload class="size-8" />
            </div>
            <div class="text-center">
              <p class="font-bold">Drop your file here</p>
              <p class="text-xs text-muted-foreground">
                PDF, Audio, Video or Image (Max 50MB)
              </p>
            </div>
          {/if}
          <label
            class="mt-2 cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            {mediaFile || currentResource.media?.[0]?.file
              ? "Change File"
              : "Select File"}
            <input
              type="file"
              class="hidden"
              onchange={(e) => onImageUpload(e, "media")}
            />
          </label>
        </div>
      </div>

      <!-- Cover Image -->
      <div class="space-y-4">
        <Label
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >Cover Thumbnail</Label
        >
        <div
          class="relative group aspect-video rounded-3xl overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center"
        >
          {#if coverImagePreview}
            <img
              src={coverImagePreview}
              alt="Preview"
              class="w-full h-full object-cover"
            />
            <div
              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <label
                class="cursor-pointer bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-xs"
              >
                <Upload class="size-4" /> Change Cover
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onchange={(e) => onImageUpload(e, "cover")}
                />
              </label>
            </div>
          {:else}
            <label class="cursor-pointer flex flex-col items-center gap-3">
              <div
                class="size-12 rounded-xl bg-background border flex items-center justify-center text-muted-foreground"
              >
                <ImageIcon class="size-6" />
              </div>
              <div class="text-center">
                <p class="text-xs font-bold">Upload Cover</p>
              </div>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                onchange={(e) => onImageUpload(e, "cover")}
              />
            </label>
          {/if}
        </div>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-muted-foreground"
            >Title</Label
          >
          <Input bind:value={currentResource.title} class="rounded-xl" />
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground"
              >Category</Label
            >
            <Select.Root type="single" bind:value={currentResource.category}>
              <Select.Trigger class="rounded-xl">
                {currentResource.category}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="Report">Report</Select.Item>
                <Select.Item value="Whitepaper">Whitepaper</Select.Item>
                <Select.Item value="Case Study">Case Study</Select.Item>
                <Select.Item value="Video">Video</Select.Item>
                <Select.Item value="Audio">Audio</Select.Item>
                <Select.Item value="Image">Image</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground"
              >Published Date</Label
            >
            <Input
              type="date"
              bind:value={currentResource.publishedDate}
              class="rounded-xl"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-muted-foreground"
            >Description</Label
          >
          <Textarea
            bind:value={currentResource.description}
            rows={4}
            class="rounded-xl"
          />
        </div>
      </div>
    </div>
  </div>
{/snippet}

<style>
  :global(.rounded-3xl) {
    border-radius: 1.5rem;
  }
</style>
