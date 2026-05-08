<script lang="ts">
  import type { PageProps } from "./$types";
  import { deserialize } from "$app/forms";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { toast } from "svelte-sonner";
  import { untrack } from "svelte";
  import { resizeImage } from "$lib/authentication/imageresize";
  import {
    LayoutDashboard,
    Sparkles,
    Newspaper,
    Plus,
    Trash2,
    Loader2,
    ImageIcon,
    Upload,
    Zap,
    Wand2,
    Globe,
  } from "@lucide/svelte";
  import { invalidateAll } from "$app/navigation";
  import RichEditor from "$lib/components/ui/editor/rich-editor.svelte";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import { cn } from "$lib/utils";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";

  let { data }: PageProps = $props();

  const isMobile = new IsMobile();
  let isSubmitting = $state(false);
  let isUploadingOg = $state(false);
  let uploadingImageKey = $state<string | null>(null);
  let isEditorOpen = $state(false);
  let isGenerating = $state(false);
  let sourceUrl = $state("");

  // Initialize state
  let pageTitle = $state("Insights & Media - CIO Club Africa");
  let pageDescription = $state("Africa's Digital Pulse");
  let ogImage = $state("");

  let content = $state({
    hero: {
      badge: "Insights & Media",
      title: "Africa's Digital Pulse",
      description: "Stay updated with the latest trends...",
    },
    newsletter: {
      title: "Continental Intelligence",
      description: "Subscribe to our weekly digest...",
      badgeCount: "5,000+",
    },
    categories: [] as string[],
    featured: {
      id: "",
    },
  });

  let newsItems = $derived(data.newsItems || []);

  const categories = [
    { label: "Events", value: "Events" },
    { label: "Awards", value: "Awards" },
    { label: "Industry", value: "Industry" },
    { label: "Community", value: "Community" },
    { label: "General", value: "General" },
  ];

  let selectedNewsId = $state<string | null>(null);
  let editItem = $state({
    id: "",
    title: "",
    caption: "",
    content: "",
    category: "General",
    imageId: "",
    imageUrl: "",
    isFeatured: false,
  });

  // Sync data from server
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || "Insights & Media - CIO Club Africa";
        pageDescription = meta.description || "Africa's Digital Pulse";
        ogImage = meta.ogImage || "";
        if (meta.data) {
          content = {
            hero: { ...content.hero, ...meta.data.hero },
            featured: { ...content.featured, ...meta.data.featured },
            categories: meta.data.categories || [],
            newsletter: { ...content.newsletter, ...meta.data.newsletter },
          };
        }
      });
    }
  });

  async function handleSaveMeta() {
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

      const result = deserialize(await response.text()) as any;
      if (result.type === "success") {
        toast.success("Page metadata saved");
        await invalidateAll();
      } else {
        toast.error("Failed to save metadata");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      isSubmitting = false;
    }
  }

  async function handleUpsertNews() {
    isSubmitting = true;
    const formData = new FormData();
    Object.entries(editItem).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    try {
      const response = await fetch("?/upsertNews", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text()) as any;
      if (result.type === "success") {
        toast.success(editItem.id ? "News updated" : "News created");
        isEditorOpen = false;
        selectedNewsId = null;
        resetEditItem();
        await invalidateAll();
      } else {
        toast.error("Failed to save news article");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      isSubmitting = false;
    }
  }

  async function handleAiGenerate() {
    if (!sourceUrl) {
      toast.error("Please enter a URL first");
      return;
    }

    isGenerating = true;
    const formData = new FormData();
    formData.append("url", sourceUrl);

    try {
      const response = await fetch("?/generateNews", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text()) as any;
      if (result.type === "success") {
        // Robustly extract data from potential nesting
        let aiData = result.data;
        // Handle n8n array format or wrapped data
        if (Array.isArray(aiData) && aiData.length > 0) aiData = aiData[0];
        if (aiData && aiData.output) aiData = aiData.output;
        // In case SvelteKit wrappers are present
        if (aiData && aiData.data && !aiData.title && !aiData.body)
          aiData = aiData.data;

        const { title, caption, body } = aiData || {};

        // Directly update state for reactivity
        if (title) editItem.title = title;
        if (caption) editItem.caption = caption;
        if (body) editItem.content = body;

        toast.success("Article content generated!");
      } else {
        toast.error(result.data?.error || "Failed to generate content");
      }
    } catch (error) {
      toast.error("An error occurred during generation");
    } finally {
      isGenerating = false;
    }
  }

  function resetEditItem() {
    sourceUrl = "";
    editItem = {
      id: "",
      title: "",
      caption: "",
      content: "",
      category: "General",
      imageId: "",
      imageUrl: "",
      isFeatured: false,
    };
  }

  function startEdit(item: any) {
    selectedNewsId = item.id;
    editItem = {
      id: item.id,
      title: item.title,
      caption: item.caption || "",
      content: item.content,
      category: item.category,
      imageId: item.imageId || "",
      imageUrl: item.image?.url || "",
      isFeatured: item.isFeatured || false,
    };
    sourceUrl = "";
    isEditorOpen = true;
  }

  async function deleteNews(id: string) {
    if (!confirm("Are you sure?")) return;
    const formData = new FormData();
    formData.append("id", id);
    try {
      const response = await fetch("?/deleteNews", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text()) as any;
      if (result.type === "success") {
        toast.success("News deleted");
        await invalidateAll();
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  }

  async function onImageUpload(e: Event, key: string) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (key === "og") isUploadingOg = true;
    else uploadingImageKey = key;

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

      const response = await fetch("?/uploadImage", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text()) as any;

      if (result.type === "success" && result.data?.image) {
        const url = result.data.image.url;
        const id = result.data.image.id; // This is now the database ID

        if (key === "og") {
          ogImage = url;
        } else if (key === "news-edit") {
          editItem.imageUrl = url;
          editItem.imageId = id;
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
      uploadingImageKey = null;
      input.value = "";
    }
  }

  // Removed unused addItem and removeItem functions that referenced undefined defaultItem

  const jumpLinks = [
    { id: "seo", label: "SEO", icon: Sparkles },
    { id: "hero", label: "Hero", icon: LayoutDashboard },
    { id: "featured", label: "Featured", icon: Zap },
    { id: "items", label: "Latest News", icon: Newspaper },
    { id: "newsletter", label: "Newsletter", icon: Newspaper },
  ];
</script>

{#snippet articleEditor()}
  <div class="space-y-4">
    <!-- AI Generation Section -->
    <div
      class="relative p-1 rounded-xl bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 shadow-md group border border-primary/20"
    >
      <div class="bg-card rounded-lg p-4 space-y-3">
        <div class="flex items-center justify-between">
          <Label
            class="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2"
          >
            <Wand2 class="size-3" />
            AI Magic Write
          </Label>
          <Badge
            variant="outline"
            class="text-[10px] bg-primary/5 text-primary border-primary/20"
            >Beta</Badge
          >
        </div>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <Globe
              class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              bind:value={sourceUrl}
              placeholder="Paste article URL here..."
              class="pl-10 h-10 border-primary/20 focus-visible:ring-primary/30"
            />
          </div>
          <Button
            onclick={handleAiGenerate}
            disabled={isGenerating || !sourceUrl}
            class="h-10 px-4 transition-all duration-300 relative overflow-hidden"
          >
            {#if isGenerating}
              <Loader2 class="size-4 animate-spin mr-2" />
              Generating...
            {:else}
              <Sparkles class="size-4 mr-2" />
              Generate
              <!-- Subtle shine effect -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
              ></div>
            {/if}
          </Button>
        </div>
        <p class="text-[10px] text-muted-foreground italic">
          AI will automatically fill the title, caption, and body from the URL.
        </p>
      </div>
    </div>
    <!-- Cover Image -->
    <div class="space-y-4">
      <Label
        class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >Cover Photo</Label
      >
      <div
        class="relative aspect-[21/9] rounded-xl overflow-hidden bg-muted border-2 border-dashed group"
      >
        {#if editItem.imageUrl}
          <img
            src={editItem.imageUrl}
            alt=""
            class="w-full h-full object-cover"
          />
          <div
            class="absolute inset-0 bg-black/40 flex items-center justify-center gap-4"
          >
            <label
              class="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
            >
              <Upload class="size-4" /> Change
              <input
                type="file"
                class="hidden"
                accept="image/*"
                onchange={(e) => onImageUpload(e, "news-edit")}
              />
            </label>
          </div>
        {:else}
          <label
            class="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-2"
          >
            <Upload class="size-8 text-muted-foreground/40" />
            <span class="text-sm font-medium text-muted-foreground"
              >Upload article cover</span
            >
            <input
              type="file"
              class="hidden"
              accept="image/*"
              onchange={(e) => onImageUpload(e, "news-edit")}
            />
          </label>
        {/if}
        {#if uploadingImageKey === "news-edit"}
          <div
            class="absolute inset-0 bg-background/80 flex items-center justify-center"
          >
            <Loader2 class="size-8 animate-spin text-primary" />
          </div>
        {/if}
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label
          class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >Title</Label
        >
        <Input bind:value={editItem.title} placeholder="Enter article title" />
      </div>
      <div class="space-y-2">
        <Label
          class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >Category</Label
        >
        <SelectComponent
          name="category"
          placeholder="Select Category"
          options={categories}
          bind:value={editItem.category}
          class="w-full"
        />
      </div>
    </div>

    <div class="space-y-2">
      <Label
        class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >Caption / Abstract</Label
      >
      <Textarea
        bind:value={editItem.caption}
        placeholder="A short catchy summary..."
        rows={2}
      />
    </div>

    <div class="space-y-2">
      <Label
        class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >Article Content</Label
      >
      <RichEditor bind:value={editItem.content} class="min-h-[200px]" />
    </div>

    <div class="flex items-center gap-2 pt-2">
      <input
        type="checkbox"
        id="isFeatured"
        bind:checked={editItem.isFeatured}
        class="size-4 rounded border-gray-300"
      />
      <Label for="isFeatured">Featured on homepage / top of list</Label>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t">
      <Button class="flex-1" onclick={handleUpsertNews} disabled={isSubmitting}>
        {#if isSubmitting}
          <Loader2 class="size-3 animate-spin mr-2" />
        {/if}
        Save Article
      </Button>
      {#if selectedNewsId !== "new"}
        <Button
          variant="destructive"
          onclick={() => deleteNews(selectedNewsId!)}
          disabled={isSubmitting}>Delete</Button
        >
      {/if}
    </div>
  </div>
{/snippet}

<div class="flex flex-col gap-4 pb-20 w-full">
  <div
    class="flex flex-col md:flex-row gap-2 md:items-center justify-between border-b pb-4"
  >
    <div class="space-y-1">
      <h1 class="text-3xl font-bold tracking-tight">News Management</h1>
      <p class="text-sm text-muted-foreground">
        Manage articles and page metadata
      </p>
    </div>
    <div class="flex gap-4">
      <Button
        variant="outline"
        onclick={() => {
          resetEditItem();
          selectedNewsId = "new";
          isEditorOpen = true;
        }}
        class="gap-2"
      >
        <Plus class="size-4" /> Add Article
      </Button>
      <Button disabled={isSubmitting} onclick={handleSaveMeta}>
        {#if isSubmitting}
          <Loader2 class="size-4 animate-spin mr-2" />
        {/if}
        Save Page Meta
      </Button>
    </div>
  </div>

  <div class="grid lg:grid-cols-12 gap-4">
    <!-- Sidebar: Articles List -->
    <aside class="lg:col-span-4 space-y-4">
      <div
        class="flex flex-col md:flex-row gap-2 md:items-center justify-between"
      >
        <h3 class="font-bold flex items-center gap-2">
          <Newspaper class="size-4" />
          Articles
        </h3>
        <Badge variant="secondary">{newsItems.length}</Badge>
      </div>

      <div class="grid gap-4 max-h-[800px] overflow-y-auto pr-2">
        {#each newsItems as item}
          <button
            onclick={() => startEdit(item)}
            class={cn(
              "w-full text-left p-4 rounded-xl border transition-all hover:border-primary/50 group bg-card",
              selectedNewsId === item.id
                ? "border-primary ring-1 ring-primary"
                : "border-border/40",
            )}
          >
            <div class="flex gap-4">
              <div class="size-16 rounded-lg bg-muted overflow-hidden shrink-0">
                {#if item.image?.url}
                  <img
                    src={item.image.url}
                    alt=""
                    class="w-full h-full object-cover"
                  />
                {:else}
                  <div class="w-full h-full flex items-center justify-center">
                    <ImageIcon class="size-6 text-muted-foreground/40" />
                  </div>
                {/if}
              </div>
              <div class="flex-1 min-w-0 space-y-1">
                <p
                  class="text-[10px] font-bold uppercase tracking-widest text-primary"
                >
                  {item.category}
                </p>
                <h4 class="font-bold text-sm truncate">{item.title}</h4>
                <p class="text-xs text-muted-foreground line-clamp-1">
                  {item.caption || "No caption"}
                </p>
              </div>
            </div>
          </button>
        {/each}
        {#if newsItems.length === 0}
          <div
            class="p-8 text-center border-2 border-dashed rounded-xl border-border/40"
          >
            <p class="text-sm text-muted-foreground">No articles yet</p>
          </div>
        {/if}
      </div>
    </aside>

    <!-- Main Content: SEO & Metadata -->
    <main class="lg:col-span-8 space-y-4">
      <div class="space-y-4">
        <Card class="rounded-xl border-border/40 bg-card shadow-sm">
          <CardHeader>
            <CardTitle class="text-lg font-bold flex items-center gap-2">
              <Sparkles class="size-5 text-primary" />
              Page SEO & Metadata
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label
                  class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  >Browser Title</Label
                >
                <Input bind:value={pageTitle} />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  >OG Image URL</Label
                >
                <div class="flex gap-2">
                  <Input bind:value={ogImage} />
                  <Button
                    variant="outline"
                    size="icon"
                    onclick={() =>
                      document.getElementById("og-upload")?.click()}
                  >
                    <Upload class="size-4" />
                  </Button>
                  <input
                    id="og-upload"
                    type="file"
                    class="hidden"
                    accept="image/*"
                    onchange={(e) => onImageUpload(e, "og")}
                  />
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >Meta Description</Label
              >
              <Textarea bind:value={pageDescription} rows={2} />
            </div>
          </CardContent>
        </Card>

        <!-- Featured Section Hero Config -->
        <Card class="rounded-xl border-border/40 bg-card shadow-sm">
          <CardHeader>
            <CardTitle class="text-lg font-bold flex items-center gap-2">
              <LayoutDashboard class="size-5 text-primary" />
              Hero Configuration
            </CardTitle>
          </CardHeader>
          <CardContent class="grid md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="space-y-2">
                <Label
                  class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  >Badge Text</Label
                >
                <Input bind:value={content.hero.badge} />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  >Title</Label
                >
                <Input bind:value={content.hero.title} />
              </div>
            </div>
            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >Description</Label
              >
              <Textarea bind:value={content.hero.description} rows={4} />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</div>

{#if isMobile.current}
  <Drawer.Root bind:open={isEditorOpen}>
    <Drawer.Content class="max-h-[95vh]">
      <div
        class="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4"
      ></div>
      <Drawer.Header class="px-4">
        <Drawer.Title>
          {selectedNewsId === "new" ? "Create New Article" : "Edit Article"}
        </Drawer.Title>
      </Drawer.Header>
      <div class="px-4 pb-10 overflow-y-auto">
        {@render articleEditor()}
      </div>
    </Drawer.Content>
  </Drawer.Root>
{:else}
  <Dialog.Root bind:open={isEditorOpen}>
    <Dialog.Content
      class="max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden text-left bg-background"
    >
      <Dialog.Header class="p-4 border-b">
        <Dialog.Title class="text-2xl font-bold">
          {selectedNewsId === "new" ? "Create New Article" : "Edit Article"}
        </Dialog.Title>
      </Dialog.Header>
      <div class="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-background">
        {@render articleEditor()}
      </div>
    </Dialog.Content>
  </Dialog.Root>
{/if}
