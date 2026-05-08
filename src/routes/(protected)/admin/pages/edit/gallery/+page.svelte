<script lang="ts">
  import type { PageProps } from "./$types";
  import { deserialize } from "$app/forms";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import { toast } from "svelte-sonner";
  import { untrack } from "svelte";
  import { resizeImage } from "$lib/authentication/imageresize";
  import {
    Camera,
    LayoutDashboard,
    Sparkles,
    Grid,
    MapPin,
    Image as ImageIcon,
    Plus,
    Trash2,
    Loader2,
    Upload,
    Calendar,
    MoveUp,
    MoveDown,
  } from "@lucide/svelte";
  import EditorHeader from "$lib/components/admin/editor/EditorHeader.svelte";
  import EditorJumpLinks from "$lib/components/admin/editor/EditorJumpLinks.svelte";
  import SEOSection from "$lib/components/admin/editor/SEOSection.svelte";
  import SectionWrapper from "$lib/components/admin/editor/SectionWrapper.svelte";
  import AlbumEditor from "$lib/components/admin/gallery/AlbumEditor.svelte";
  import { invalidateAll } from "$app/navigation";

  let { data }: PageProps = $props();

  let isSubmitting = $state(false);
  let isUploadingOg = $state(false);
  let uploadingAlbumIndex = $state<number | null>(null);

  // Initialize state
  let pageTitle = $state("Moments of Impact - CIO Club Africa Gallery");
  let pageDescription = $state(
    "Relive the energy and breakthroughs of our continental gatherings.",
  );
  let ogImage = $state("");

  let content = $state({
    hero: {
      badge: "Visual Archive",
      title: "Moments of Impact",
      description: "Relive the energy, the connections...",
    },
    archivesSection: {
      title: "Gallery Archives",
      description: "Recent event albums and highlights",
    },
    albums: [] as any[],
    mediaAccess: {
      title: "Professional Media Access",
      description: "Members and press partners can request...",
      ctaPrimary: "Request HD Photos",
      ctaSecondary: "Press Guidelines",
    },
  });

  const defaultAlbum = {
    title: "New Event 2024",
    location: "Lagos, Nigeria",
    description: "",
    date: new Date().toISOString().split("T")[0],
    image: "",
    year: "2024",
    media: [] as string[],
  };

  // Sync data from server
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || "Moments of Impact - CIO Club Africa Gallery";
        pageDescription =
          meta.description ||
          "Relive the energy and breakthroughs of our continental gatherings.";
        ogImage = meta.ogImage || "";
      });
    }
    if (data.content) {
      untrack(() => {
        content = {
          hero: { ...content.hero, ...data.content.hero },
          archivesSection: {
            ...content.archivesSection,
            ...data.content.archivesSection,
          },
          albums: data.content.albums || [],
          mediaAccess: { ...content.mediaAccess, ...data.content.mediaAccess },
        };
      });
    }
  });

  async function handleSave() {
    isSubmitting = true;
    const formData = new FormData();
    formData.append("data", JSON.stringify(content));
    formData.append("title", pageTitle);
    formData.append("description", pageDescription);
    formData.append("ogImage", ogImage);

    try {
      const response = await fetch(`${location.pathname}?/save`, {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      if (result.type === "success") {
        toast.success("Gallery page content saved successfully");
        await invalidateAll();
      } else {
        toast.error("Failed to save content");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      isSubmitting = false;
    }
  }

  async function onImageUpload(
    e: Event,
    type: "og" | "album",
    index: number | null = null,
  ) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (type === "og") isUploadingOg = true;
    else uploadingAlbumIndex = index;

    try {
      const resizedFile = await resizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeKB: 200,
        format: "webp",
      });

      const formData = new FormData();
      formData.append("image", resizedFile);

      const response = await fetch(`${location.pathname}?/uploadImage`, {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text()) as any;

      if (result.type === "success" && result.data?.image) {
        if (type === "og") ogImage = result.data.image.url;
        else if (index !== null) {
          content.albums[index].image = result.data.image.url;
          // We could store imageId here if the schema supported it, but for now we follow the existing pattern while ensuring the upload is recorded.
        }
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process image");
    } finally {
      isUploadingOg = false;
      uploadingAlbumIndex = null;
      input.value = "";
    }
  }

  function addItem(type: "albums") {
    content.albums = [{ ...defaultAlbum }, ...content.albums];
  }

  function removeItem(type: "albums", index: number) {
    content.albums = content.albums.filter((_, i) => i !== index);
  }

  const jumpLinks = [
    { id: "seo", label: "SEO", icon: Sparkles },
    { id: "hero", label: "Hero", icon: LayoutDashboard },
    { id: "albums", label: "Albums", icon: Grid },
    { id: "access", label: "Media Access", icon: ImageIcon },
  ];
</script>

<div class="flex flex-col gap-4 pb-20 w-full">
  <EditorHeader title="Edit Gallery" {isSubmitting} onSave={handleSave} />

  <EditorJumpLinks links={jumpLinks} />

  <div class="space-y-4">
    <SEOSection
      bind:title={pageTitle}
      bind:description={pageDescription}
      bind:ogImage
      {isUploadingOg}
      {onImageUpload}
    />

    <Separator class="bg-border/40" />

    <!-- Hero Section -->
    <SectionWrapper
      id="hero"
      title="Hero Section"
      description="Main banner of the gallery page"
      icon={LayoutDashboard}
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Badge Text</Label
          >
          <Input bind:value={content.hero.badge} placeholder="Visual Archive" />
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Main Title</Label
          >
          <Input
            bind:value={content.hero.title}
            placeholder="Moments of Impact"
          />
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

    <!-- Albums Grid -->
    <SectionWrapper
      id="albums"
      title="Event Albums"
      description="List of event galleries categorized by year"
      icon={Grid}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => addItem("albums")}
          class="gap-2 rounded-lg text-primary"
        >
          <Plus class="size-4" /> Add Album
        </Button>
      {/snippet}

      <div class="space-y-8">
        {#each content.albums as album, i}
          <AlbumEditor
            bind:album={content.albums[i]}
            onRemove={() => removeItem("albums", i)}
          />
        {/each}

        {#if content.albums.length === 0}
          <div
            class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-3xl bg-muted/30 gap-4"
          >
            <div
              class="size-16 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Grid class="size-8 text-primary/40" />
            </div>
            <div class="text-center space-y-1">
              <p class="text-sm font-bold uppercase tracking-widest">
                No Albums Yet
              </p>
              <p class="text-xs text-muted-foreground">
                Click "Add Album" to start building your visual archive.
              </p>
            </div>
          </div>
        {/if}
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Media Access -->
    <SectionWrapper
      id="access"
      title="Professional Media Access"
      description="Callout for press and media assets"
      icon={ImageIcon}
    >
      <div class="grid gap-8 lg:grid-cols-2">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground"
              >Section Title</Label
            >
            <Input bind:value={content.mediaAccess.title} />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground"
                >Primary CTA</Label
              >
              <Input bind:value={content.mediaAccess.ctaPrimary} />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground"
                >Secondary CTA</Label
              >
              <Input bind:value={content.mediaAccess.ctaSecondary} />
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-muted-foreground"
            >Description</Label
          >
          <Textarea bind:value={content.mediaAccess.description} rows={4} />
        </div>
      </div>
    </SectionWrapper>
  </div>
</div>
