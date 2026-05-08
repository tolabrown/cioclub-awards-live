<script lang="ts">
  import type { PageProps } from "./$types";
  import type { ActionResult } from "@sveltejs/kit";
  import { enhance, deserialize } from "$app/forms";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Card from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { toast } from "svelte-sonner";
  import { untrack } from "svelte";
  import { resizeImage } from "$lib/authentication/imageresize";
  import {
    Save,
    Upload,
    Trash2,
    Plus,
    Loader2,
    ChevronLeft,
    Image as ImageIcon,
    LayoutDashboard,
    Globe,
    Target,
    BarChart3,
    Hash,
    Sparkles,
    Search,
    MessageSquare,
    ArrowRight,
  } from "@lucide/svelte";
  import { goto, invalidateAll } from "$app/navigation";
  import IconPicker from "$lib/components/ui/picker/IconPicker.svelte";
  import ColorPicker from "$lib/components/ui/picker/ColorPicker.svelte";
  import SearchableSelect from "$lib/components/ui/searchable-select/searchable-select.svelte";

  let { data }: PageProps = $props();

  let isSubmitting = $state(false);
  let isUploading = $state(false);
  let isUploadingOg = $state(false);

  // Initialize state
  let pageTitle = $state("Home");
  let pageDescription = $state("CIO Club Africa Homepage");
  let ogImage = $state("");

  let content = $state({
    hero: {
      subtitle: "",
      title: "",
      description: "",
      primaryCta: { text: "", href: "" },
      secondaryCta: { text: "", href: "" },
      loggedInCta: { text: "", href: "" },
    },
    mission: {
      tag: "",
      title: "",
      description: "",
      imageUrl: "",
      cta: { text: "", href: "" },
    },
    pillars: [] as any[],
    stats: [] as any[],
    insights: {
      tag: "Latest Insights",
      title: "News & Community Stories",
      description:
        "Stay updated with the latest trends and stories from our community.",
      articles: [] as any[],
    },
    testimonials: [] as any[],
  });

  // Sync data from server only once or when data reference changes
  // to avoid infinite loops when content is modified locally
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || "Home";
        pageDescription = meta.description || "CIO Club Africa Homepage";
        ogImage = meta.ogImage || "";
      });
    }
    if (data.content) {
      // Use untrack to prevent reading 'content' from triggering the effect again
      untrack(() => {
        content = {
          ...content,
          ...data.content,
          insights: data.content.insights || content.insights,
          testimonials: data.content.testimonials || [],
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
      const response = await fetch("?/save", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      if (result.type === "success") {
        toast.success("Homepage content saved successfully");
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

  async function onImageUpload(e: Event, type: "mission" | "og" = "mission") {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (type === "og") isUploadingOg = true;
    else isUploading = true;

    try {
      // Resize to < 200KB as requested
      const resizedFile = await resizeImage(file, {
        maxWidth: type === "og" ? 1200 : 1200,
        maxHeight: type === "og" ? 630 : 1200,
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

      const result = deserialize(await response.text()) as ActionResult<{
        image: { url: string };
      }>;

      if (result.type === "success" && result.data?.image) {
        if (type === "og") ogImage = result.data.image.url;
        else content.mission.imageUrl = result.data.image.url;
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process image");
    } finally {
      if (type === "og") isUploadingOg = false;
      else isUploading = false;
      input.value = "";
    }
  }

  function addPillar() {
    content.pillars = [
      ...content.pillars,
      {
        title: "",
        description: "",
        icon: "Users",
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
    ];
  }

  function removePillar(index: number) {
    content.pillars = content.pillars.filter((_, i) => i !== index);
  }

  function addStat() {
    content.stats = [
      ...content.stats,
      {
        value: "",
        label: "",
        emoji: "📊",
        gradient: "from-blue-600 to-indigo-600",
      },
    ];
  }

  function removeStat(index: number) {
    content.stats = content.stats.filter((_, i) => i !== index);
  }

  async function fetchNews(query: string) {
    const res = await fetch(
      `/api/admin/news/search?q=${encodeURIComponent(query)}`,
    );
    if (!res.ok) return [];
    return await res.json();
  }

  function addInsight(article: any) {
    if (content.insights.articles.some((a: any) => a.id === article.id)) {
      toast.error("This article is already added");
      return;
    }
    content.insights.articles = [...content.insights.articles, article];
    toast.success("Article added to insights");
  }

  function removeInsight(id: string) {
    content.insights.articles = content.insights.articles.filter(
      (a: any) => a.id !== id,
    );
  }

  async function fetchTestimonials(query: string) {
    const res = await fetch(
      `/api/admin/testimonials/search?q=${encodeURIComponent(query)}`,
    );
    if (!res.ok) return [];
    return await res.json();
  }

  function addTestimonial(t: any) {
    if (content.testimonials.some((existing: any) => existing.id === t.id)) {
      toast.error("This testimonial is already added");
      return;
    }
    content.testimonials = [...content.testimonials, t];
    toast.success("Testimonial added to homepage");
  }

  function removeTestimonial(id: string) {
    content.testimonials = content.testimonials.filter(
      (t: any) => t.id !== id,
    );
  }

  function scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  type HeroCtaKey = "primaryCta" | "secondaryCta" | "loggedInCta";
  const ctaKeys: HeroCtaKey[] = ["primaryCta", "secondaryCta", "loggedInCta"];
</script>

<div class="flex flex-col gap-4 pb-20 w-full">
  <!-- Sticky Toolbar -->
  <div
    class="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b pb-4 -mx-4 px-4 pt-4 flex flex-col md:flex-row gap-2 items-center justify-between"
  >
    <div class="flex justify-start items-center gap-4 w-full md:w-fit">
      <Button
        variant="ghost"
        size="icon"
        onclick={() => goto("/admin/pages")}
        class="rounded-full"
      >
        <ChevronLeft class="size-5" />
      </Button>
      <div>
        <h1 class="text-xl font-bold tracking-tight">Edit Homepage</h1>
      </div>
    </div>
    <div class="flex items-center gap-3 w-full md:w-fit">
      <Button
        onclick={handleSave}
        disabled={isSubmitting}
        class="gap-2 shadow-lg shadow-primary/20 rounded-xl w-full sm:w-fit"
      >
        {#if isSubmitting}
          <Loader2 class="size-4 animate-spin" />
          Saving...
        {:else}
          <Save class="size-4" />
          Save Changes
        {/if}
      </Button>
    </div>
  </div>

  <!-- Jump Links -->
  <div
    class="sticky top-[117px] md:top-18 z-40 flex flex-wrap gap-2 p-1.5 bg-background/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm transition-all"
  >
    <Button
      variant="ghost"
      size="sm"
      onclick={() => scrollTo("seo")}
      class="gap-2 rounded-lg text-xs font-medium"
    >
      <Globe class="size-3" /> SEO
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onclick={() => scrollTo("hero")}
      class="gap-2 rounded-lg text-xs font-medium"
    >
      <LayoutDashboard class="size-3" /> Hero
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onclick={() => scrollTo("mission")}
      class="gap-2 rounded-lg text-xs font-medium"
    >
      <Target class="size-3" /> Mission
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onclick={() => scrollTo("pillars")}
      class="gap-2 rounded-lg text-xs font-medium"
    >
      <Hash class="size-3" /> Pillars
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onclick={() => scrollTo("stats")}
      class="gap-2 rounded-lg text-xs font-medium"
    >
      <BarChart3 class="size-3" /> Stats
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onclick={() => scrollTo("insights")}
      class="gap-2 rounded-lg text-xs font-medium"
    >
      <Sparkles class="size-3" /> Insights
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onclick={() => scrollTo("testimonials")}
      class="gap-2 rounded-lg text-xs font-medium"
    >
      <MessageSquare class="size-3" /> Testimonials
    </Button>
  </div>

  <!-- Sections -->
  <div class="space-y-4">
    <!-- SEO Section -->
    <section id="seo" class="scroll-mt-32 space-y-4">
      <div class="flex items-center gap-2 px-1">
        <div class="bg-primary/10 p-2 rounded-lg text-primary">
          <Globe class="size-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold">Search Engine Optimization</h2>
          <p class="text-sm text-muted-foreground leading-none">
            Meta tags and OG image for shareability
          </p>
        </div>
      </div>

      <Card.Root class="overflow-hidden border-border/60 shadow-md">
        <Card.Content class="p-6 space-y-4">
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-4">
              <div class="space-y-2">
                <Label
                  for="meta-title"
                  class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >Page Meta Title</Label
                >
                <Input
                  id="meta-title"
                  bind:value={pageTitle}
                  placeholder="e.g. Home | CIO Club Africa"
                  class="rounded-lg border-muted-foreground/20 focus-visible:ring-primary"
                />
              </div>
              <div class="space-y-2">
                <Label
                  for="meta-desc"
                  class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >Page Meta Description</Label
                >
                <Textarea
                  id="meta-desc"
                  bind:value={pageDescription}
                  placeholder="Brief description for search engines"
                  rows={4}
                  class="rounded-xl border-muted-foreground/20 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >OG Image (1200x630)</Label
              >
              <div
                class="relative aspect-[1.91/1] rounded-xl overflow-hidden bg-muted/30 border-2 border-dashed border-border/60 group"
              >
                {#if ogImage}
                  <img
                    src={ogImage}
                    alt="OG Preview"
                    class="w-full h-full object-cover"
                  />
                  <div
                    class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:bg-black/60 transition-all"
                  >
                    <Button
                      variant="destructive"
                      size="icon"
                      class="rounded-full h-10 w-10 shadow-lg"
                      onclick={() => (ogImage = "")}
                    >
                      <Trash2 class="size-5" />
                    </Button>
                  </div>
                {:else}
                  <div
                    class="flex flex-col items-center justify-center h-full gap-2 text-center p-4"
                  >
                    <ImageIcon class="size-8 text-muted-foreground/40" />
                    <p class="text-xs text-muted-foreground">
                      Share image for social media
                    </p>
                  </div>
                {/if}
                {#if isUploadingOg}
                  <div
                    class="absolute inset-0 bg-background/80 flex items-center justify-center"
                  >
                    <Loader2 class="size-6 animate-spin text-primary" />
                  </div>
                {/if}
              </div>
              <div class="flex gap-2">
                <Input
                  bind:value={ogImage}
                  placeholder="Or paste URL here..."
                  class="text-xs h-8"
                />
                <label class="cursor-pointer shrink-0">
                  <div
                    class="flex items-center gap-2 h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors"
                  >
                    {#if isUploadingOg}
                      <Loader2 class="size-3 animate-spin" />
                      Uploading...
                    {:else}
                      <Upload class="size-3" />
                      Upload
                    {/if}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    onchange={(e) => onImageUpload(e, "og")}
                    disabled={isUploadingOg}
                  />
                </label>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </section>

    <Separator class="bg-border/40" />

    <!-- Hero Section -->
    <section id="hero" class="scroll-mt-32 space-y-4">
      <div class="flex items-center gap-2 px-1">
        <div class="bg-primary/10 p-2 rounded-lg text-primary">
          <LayoutDashboard class="size-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold">Hero Section</h2>
          <p class="text-sm text-muted-foreground leading-none">
            The first thing visitors see
          </p>
        </div>
      </div>

      <Card.Root class="border-border/60 shadow-md">
        <Card.Content class="p-6 space-y-4">
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >Subtitle / Tag</Label
              >
              <Input
                bind:value={content.hero.subtitle}
                placeholder="e.g. Premier Leadership Club"
              />
            </div>
            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >Main Title</Label
              >
              <Input
                bind:value={content.hero.title}
                placeholder="Enter catchy title"
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
              placeholder="Hero description text"
              rows={3}
            />
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            {#each ctaKeys as ctaKey}
              <div class="p-4 rounded-xl border bg-muted/10 space-y-4">
                <h3
                  class="text-xs font-bold uppercase tracking-widest text-primary flex items-center justify-between"
                >
                  {ctaKey === "primaryCta"
                    ? "Primary"
                    : ctaKey === "secondaryCta"
                      ? "Secondary"
                      : "Logged In"} CTA
                </h3>
                <div class="space-y-3">
                  <div class="space-y-1">
                    <Label class="text-[10px] font-medium text-muted-foreground"
                      >Text</Label
                    >
                    <Input
                      bind:value={content.hero[ctaKey].text}
                      class="h-8 text-xs"
                    />
                  </div>
                  <div class="space-y-1">
                    <Label class="text-[10px] font-medium text-muted-foreground"
                      >Link</Label
                    >
                    <Input
                      bind:value={content.hero[ctaKey].href}
                      class="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>
    </section>

    <Separator class="bg-border/40" />

    <!-- Mission Section -->
    <section id="mission" class="scroll-mt-32 space-y-4">
      <div class="flex items-center gap-2 px-1">
        <div class="bg-primary/10 p-2 rounded-lg text-primary">
          <Target class="size-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold">Mission & Vision</h2>
          <p class="text-sm text-muted-foreground leading-none">
            Your identity and core values
          </p>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <Card.Root class="md:col-span-2 border-border/60 shadow-md">
          <Card.Content class="p-6 space-y-6">
            <div class="grid gap-6 md:grid-cols-2">
              <div class="space-y-2">
                <Label
                  class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >Section Tag</Label
                >
                <Input
                  bind:value={content.mission.tag}
                  placeholder="e.g. Our Mission"
                />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >Section Title</Label
                >
                <Input
                  bind:value={content.mission.title}
                  placeholder="Driving Continental Transformation"
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >Description</Label
              >
              <Textarea
                bind:value={content.mission.description}
                placeholder="Mission description"
                rows={5}
              />
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label
                  class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >Button Text</Label
                >
                <Input bind:value={content.mission.cta.text} class="h-9" />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >Button Link</Label
                >
                <Input bind:value={content.mission.cta.href} class="h-9" />
              </div>
            </div>
          </Card.Content>
        </Card.Root>

        <Card.Root class="border-border/60 shadow-md">
          <Card.Content class="p-6 space-y-4">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Mission Image</Label
            >
            <div
              class="relative aspect-square rounded-xl overflow-hidden bg-muted/40 border-2 border-dashed border-border/60 group"
            >
              {#if content.mission.imageUrl}
                <img
                  src={content.mission.imageUrl}
                  alt="Mission"
                  class="w-full h-full object-cover"
                />
                <div
                  class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:bg-black/60 transition-all"
                >
                  <Button
                    variant="destructive"
                    size="icon"
                    class="rounded-full h-12 w-12 shadow-xl"
                    onclick={() => (content.mission.imageUrl = "")}
                  >
                    <Trash2 class="size-6" />
                  </Button>
                </div>
              {:else}
                <div
                  class="flex flex-col items-center justify-center h-full p-4 text-center gap-2"
                >
                  <ImageIcon class="size-10 text-muted-foreground/30" />
                  <p class="text-xs text-muted-foreground">
                    Add visual context
                  </p>
                </div>
              {/if}
              {#if isUploading}
                <div
                  class="absolute inset-0 bg-background/80 flex items-center justify-center"
                >
                  <Loader2 class="size-8 animate-spin text-primary" />
                </div>
              {/if}
            </div>
            <div class="space-y-3">
              <Input
                bind:value={content.mission.imageUrl}
                placeholder="Image URL..."
                class="h-8 text-xs"
              />
              <label class="w-full cursor-pointer">
                <div
                  class="flex items-center justify-center gap-2 h-10 px-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl font-bold transition-all border shadow-sm"
                >
                  {#if isUploading}
                    <Loader2 class="size-4 animate-spin" />
                    Uploading...
                  {:else}
                    <Upload class="size-4" />
                    Upload New Image
                  {/if}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onchange={onImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </section>

    <Separator class="bg-border/40" />

    <!-- Pillars Section -->
    <section id="pillars" class="scroll-mt-32 space-y-4">
      <div
        class="flex flex-col md:flex-row gap-1 items-start md:items-center justify-between px-1"
      >
        <div class="flex items-center gap-2">
          <div class="bg-primary/10 p-2 rounded-lg text-primary">
            <Hash class="size-5" />
          </div>
          <div>
            <h2 class="text-lg font-bold">Strategic Pillars</h2>
            <p class="text-sm text-muted-foreground leading-none">
              Core areas of focus
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onclick={addPillar}
          class="gap-2 rounded-lg border-primary/20 hover:bg-primary/5 text-primary"
        >
          <Plus class="size-4" /> Add Pillar
        </Button>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        {#each content.pillars as pillar, i}
          <div
            class="relative group p-6 rounded-xl border-2 border-border/40 bg-card hover:border-primary/30 transition-all shadow-sm"
          >
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-8 w-8 hover:bg-destructive/10 rounded-full transition-all"
              onclick={() => removePillar(i)}
            >
              <Trash2 class="size-4" />
            </Button>

            <div class="space-y-4">
              <div class="grid gap-4 mt-2">
                <div class="space-y-1">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >Title</Label
                  >
                  <Input
                    bind:value={pillar.title}
                    placeholder="e.g. Advocacy"
                  />
                </div>
                <div class="space-y-1">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >Description</Label
                  >
                  <Textarea
                    bind:value={pillar.description}
                    placeholder="Pillar description"
                    rows={2}
                  />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <IconPicker label="Lucide Icon" bind:value={pillar.icon} />
                  <ColorPicker
                    label="Color Class"
                    bind:value={pillar.color}
                    mode="text"
                  />
                </div>
              </div>
            </div>
          </div>
        {/each}
        {#if content.pillars.length === 0}
          <div
            class="md:col-span-2 py-16 text-center border-2 border-dashed border-border/80 rounded-2xl bg-muted/5"
          >
            <p class="text-muted-foreground font-medium">
              No pillars defined yet.
            </p>
            <Button variant="link" onclick={addPillar} class="text-primary mt-1"
              >Get started here</Button
            >
          </div>
        {/if}
      </div>
    </section>

    <Separator class="bg-border/40" />

    <!-- Stats Section -->
    <section id="stats" class="scroll-mt-32 space-y-4">
      <div
        class="flex flex-col md:flex-row gap-1 items-start md:items-center justify-between px-1"
      >
        <div class="flex items-center gap-2">
          <div class="bg-primary/10 p-2 rounded-lg text-primary">
            <BarChart3 class="size-5" />
          </div>
          <div>
            <h2 class="text-lg font-bold">Key Statistics</h2>
            <p class="text-sm text-muted-foreground leading-none">
              Impact numbers shown on homepage
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onclick={addStat}
          class="gap-2 rounded-lg border-primary/20 hover:bg-primary/5 text-primary"
        >
          <Plus class="size-4" /> Add Stat
        </Button>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {#each content.stats as stat, i}
          <Card.Root
            class="relative group border-2 border-border/40 bg-card hover:border-primary/30 transition-all shadow-sm rounded-xl overflow-hidden"
          >
            <div
              class="absolute top-0 left-0 w-full h-1 bg-linear-to-r {stat.gradient ||
                'from-primary/40 to-primary/10'}"
            ></div>
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-7 w-7 hover:bg-destructive/10 rounded-full transition-all z-10"
              onclick={() => removeStat(i)}
            >
              <Trash2 class="size-3.5" />
            </Button>

            <Card.Content class="p-5 pt-8 space-y-4">
              <div class="space-y-1.5">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Stat Value</Label
                >
                <Input
                  bind:value={stat.value}
                  placeholder="e.g. 100+"
                  class="h-9 font-bold text-lg"
                />
              </div>
              <div class="space-y-1.5">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Description</Label
                >
                <Input
                  bind:value={stat.label}
                  placeholder="e.g. Members"
                  class="h-9 text-sm"
                />
              </div>

              <div class="grid grid-cols-2 gap-2 pt-2">
                <div class="space-y-1.5">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >Emoji</Label
                  >
                  <Input
                    bind:value={stat.emoji}
                    class="h-8 text-center text-lg"
                  />
                </div>
                <div class="space-y-1.5">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >Gradient</Label
                  >
                  <Input bind:value={stat.gradient} class="h-8 text-[10px]" />
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        {/each}

        {#if content.stats.length === 0}
          <div
            class="sm:col-span-2 lg:col-span-4 py-12 text-center border-2 border-dashed border-border/80 rounded-2xl bg-muted/5"
          >
            <p class="text-muted-foreground font-medium">
              No statistics added yet.
            </p>
            <Button variant="link" onclick={addStat} class="text-primary mt-1"
              >Add your first impact stat</Button
            >
          </div>
        {/if}
      </div>
    </section>

    <Separator class="bg-border/40" />

    <!-- Insights Section -->
    <section id="insights" class="scroll-mt-32 space-y-4">
      <div class="flex items-center gap-2 px-1">
        <div class="bg-primary/10 p-2 rounded-lg text-primary">
          <Sparkles class="size-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold">Latest Insights</h2>
          <p class="text-sm text-muted-foreground leading-none">
            Featured news and stories
          </p>
        </div>
      </div>

      <Card.Root class="border-border/60 shadow-md">
        <Card.Content class="p-4 space-y-8">
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >Section Tag</Label
              >
              <Input
                bind:value={content.insights.tag}
                placeholder="e.g. Latest Insights"
              />
            </div>
            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >Main Title</Label
              >
              <Input
                bind:value={content.insights.title}
                placeholder="News & Community Stories"
              />
            </div>
          </div>
          <div class="space-y-2">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Description</Label
            >
            <Textarea
              bind:value={content.insights.description}
              placeholder="Section description"
              rows={2}
            />
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <Label
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >Featured Articles</Label
              >
              <div class="text-[10px] text-muted-foreground font-medium">
                ({content.insights.articles.length} added)
              </div>
            </div>

            <SearchableSelect
              placeholder="Search news articles to add..."
              fetchOptions={fetchNews}
              onSelect={addInsight}
              class="w-full"
            />

            {#if content.insights.articles.length > 0}
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {#each content.insights.articles as article}
                  <div
                    class="group relative flex gap-3 p-3 rounded-xl border bg-card hover:border-primary/30 transition-all shadow-sm"
                  >
                    <button
                      class="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onclick={() => removeInsight(article.id)}
                    >
                      <Trash2 class="size-3" />
                    </button>
                    {#if article.image?.url}
                      <img
                        src={article.image.url}
                        alt={article.name}
                        class="h-12 w-12 rounded-lg object-cover border shrink-0"
                      />
                    {:else}
                      <div
                        class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 uppercase text-xs"
                      >
                        {article.name.charAt(0)}
                      </div>
                    {/if}
                    <div class="min-w-0">
                      <p class="text-sm font-bold truncate leading-tight">
                        {article.name}
                      </p>
                      <p
                        class="text-[10px] text-muted-foreground line-clamp-2 mt-0.5"
                      >
                        {article.description}
                      </p>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div
                class="py-12 text-center border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center gap-2"
              >
                <Search class="size-8 text-muted-foreground/30" />
                <p class="text-sm text-muted-foreground font-medium">
                  No articles picked yet
                </p>
                <p class="text-xs text-muted-foreground/70">
                  Use the search bar above to find and add stories
                </p>
              </div>
            {/if}
          </div>
        </Card.Content>
      </Card.Root>
    </section>

    <Separator class="bg-border/40" />

    <!-- Testimonials Section -->
    <section id="testimonials" class="scroll-mt-32 space-y-4">
      <div class="flex items-center gap-2 px-1">
        <div class="bg-primary/10 p-2 rounded-lg text-primary">
          <MessageSquare class="size-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold">Featured Testimonials</h2>
          <p class="text-sm text-muted-foreground leading-none">
            Pick member voices to showcase on the homepage
          </p>
        </div>
      </div>

      <Card.Root class="border-border/60 shadow-md">
        <Card.Content class="p-4 space-y-6">
          <div class="flex items-center justify-between">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pick Testimonials</Label>
            <div class="text-[10px] text-muted-foreground font-medium">({content.testimonials.length} selected)</div>
          </div>

          <SearchableSelect
            placeholder="Search by name or company..."
            fetchOptions={fetchTestimonials}
            onSelect={addTestimonial}
            class="w-full"
          />

          {#if content.testimonials.length > 0}
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {#each content.testimonials as t}
                <div class="group relative flex gap-3 p-3 rounded-xl border bg-card hover:border-primary/30 transition-all shadow-sm">
                  <button
                    class="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                    onclick={() => removeTestimonial(t.id)}
                  >
                    <Trash2 class="size-3" />
                  </button>
                  {#if t.image?.url}
                    <img src={t.image.url} alt={t.name} class="h-12 w-12 rounded-full object-cover border shrink-0" />
                  {:else}
                    <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 uppercase text-xs">
                      {t.name.charAt(0)}
                    </div>
                  {/if}
                  <div class="min-w-0">
                    <p class="text-sm font-bold truncate leading-tight">{t.name}</p>
                    <p class="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 italic">
                      "{t.testimonial.replace(/<[^>]*>/g, '')}"
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="py-12 text-center border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center gap-2">
              <MessageSquare class="size-8 text-muted-foreground/30" />
              <p class="text-sm text-muted-foreground font-medium">No testimonials featured</p>
              <p class="text-xs text-muted-foreground/70">Pick the best voices to show on the front page</p>
            </div>
          {/if}
          
          <div class="pt-2 border-t border-border/40">
            <Button variant="link" href="/admin/testimonials" class="text-xs font-bold gap-1 p-0 h-auto">
              Manage all testimonials in the Testimonials Manager
              <ArrowRight class="size-3" />
            </Button>
          </div>
        </Card.Content>
      </Card.Root>
    </section>
  </div>
</div>
