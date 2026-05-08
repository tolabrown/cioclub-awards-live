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
    LayoutDashboard,
    Sparkles,
    Target,
    Shield,
    Users,
    Globe,
    Plus,
    Trash2,
    Hash,
    ImageIcon,
  } from "@lucide/svelte";
  import EditorHeader from "$lib/components/admin/editor/EditorHeader.svelte";
  import EditorJumpLinks from "$lib/components/admin/editor/EditorJumpLinks.svelte";
  import SEOSection from "$lib/components/admin/editor/SEOSection.svelte";
  import SectionWrapper from "$lib/components/admin/editor/SectionWrapper.svelte";
  import IconPicker from "$lib/components/ui/picker/IconPicker.svelte";
  import { invalidateAll } from "$app/navigation";

  let { data }: PageProps = $props();

  let isSubmitting = $state(false);
  let isUploadingOg = $state(false);

  // Initialize state
  let pageTitle = $state("Ladies In Tech");
  let pageDescription = $state("Empowering Women in Technology across Africa");
  let ogImage = $state("");

  let content = $state({
    hero: {
      title: "Ladies In Tech",
      description:
        "Providing a nurturing ecosystem where women in technology can thrive, innovate, and lead the digital transformation across Africa.",
      bannerImage: "/ladies_in_tech_1920x720.webp",
      mobileBannerImage: "/ladies_in_tech_1920x1080.webp",
    },
    mission:
      "Our mission is to provide a nurturing ecosystem where women in technology can thrive, innovate, and lead the digital transformation across Africa through networking, mentorship, and empowerment.",
    policy:
      "We are committed to fostering an inclusive environment that promotes gender equality and professional growth for women in the technology sector.",
    pillars: [] as any[],
  });

  const defaultPillar = {
    iconName: "Users",
    title: "",
    desc: "",
  };

  // Sync data from server
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || "Ladies In Tech";
        pageDescription = meta.description || "Empowering Women in Tech";
        ogImage = meta.ogImage || "";
      });
    }
    if (data.content) {
      untrack(() => {
        content = {
          hero: { ...content.hero, ...data.content.hero },
          mission: data.content.mission || content.mission,
          policy: data.content.policy || content.policy,
          pillars: data.content.pillars || [],
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
        toast.success("Ladies In Tech page saved successfully");
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
    type: "og" | "hero" | "mobileHero" = "og",
  ) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (type === "og") isUploadingOg = true;

    try {
      const resizedFile = await resizeImage(file, {
        maxWidth: type === "og" ? 1200 : 1920,
        maxHeight: type === "og" ? 630 : 1080,
        quality: 0.8,
        maxSizeKB: 500,
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
        if (type === "og") ogImage = url;
        else if (type === "hero") content.hero.bannerImage = url;
        else if (type === "mobileHero") content.hero.mobileBannerImage = url;
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process image");
    } finally {
      if (type === "og") isUploadingOg = false;
      input.value = "";
    }
  }

  function addItem() {
    content.pillars = [...content.pillars, { ...defaultPillar }];
  }

  function removeItem(index: number) {
    content.pillars = content.pillars.filter((_, i) => i !== index);
  }

  const jumpLinks = [
    { id: "seo", label: "SEO", icon: Sparkles },
    { id: "hero", label: "Hero", icon: LayoutDashboard },
    { id: "mission", label: "Mission & Policy", icon: Target },
    { id: "pillars", label: "Pillars of Impact", icon: Shield },
  ];
</script>

<div class="flex flex-col gap-4 pb-20 w-full">
  <EditorHeader
    title="Edit Ladies In Tech Page"
    {isSubmitting}
    onSave={handleSave}
  />

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
      description="Main branding and introduction"
      icon={LayoutDashboard}
    >
      <div class="space-y-4">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-2">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Title</Label
            >
            <Input
              bind:value={content.hero.title}
              placeholder="Ladies In Tech"
            />
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >Banner (1920x720)</Label
              >
              <div class="flex items-center gap-2">
                <Input
                  value={content.hero.bannerImage}
                  readonly
                  class="bg-muted flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onclick={() =>
                    document.getElementById("hero-upload")?.click()}
                >
                  <ImageIcon class="size-4" />
                </Button>
                <input
                  type="file"
                  id="hero-upload"
                  class="hidden"
                  accept="image/*"
                  onchange={(e) => onImageUpload(e, "hero")}
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >Mobile Banner (1920x1080)</Label
              >
              <div class="flex items-center gap-2">
                <Input
                  value={content.hero.mobileBannerImage}
                  readonly
                  class="bg-muted flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onclick={() =>
                    document.getElementById("mobile-hero-upload")?.click()}
                >
                  <ImageIcon class="size-4" />
                </Button>
                <input
                  type="file"
                  id="mobile-hero-upload"
                  class="hidden"
                  accept="image/*"
                  onchange={(e) => onImageUpload(e, "mobileHero")}
                />
              </div>
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Description</Label
          >
          <Textarea
            bind:value={content.hero.description}
            rows={3}
            placeholder="Hero description..."
          />
        </div>
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Mission & Policy -->
    <SectionWrapper
      id="mission"
      title="Mission & Policy"
      description="Core messages for the community"
      icon={Target}
    >
      <div class="grid gap-8 md:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Our Mission</Label
          >
          <Textarea
            bind:value={content.mission}
            rows={6}
            placeholder="Describe the mission..."
          />
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Executive Policy</Label
          >
          <Textarea
            bind:value={content.policy}
            rows={6}
            placeholder="Describe the policy..."
          />
        </div>
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Pillars of Impact -->
    <SectionWrapper
      id="pillars"
      title="Pillars of Impact"
      description="Key focus areas"
      icon={Shield}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={addItem}
          class="gap-2 rounded-lg text-primary"
        >
          <Plus class="size-4" /> Add Pillar
        </Button>
      {/snippet}

      <div class="grid gap-6 md:grid-cols-3">
        {#each content.pillars as pillar, i}
          <div
            class="relative p-6 rounded-xl border-2 border-border/40 bg-card hover:border-primary/30 transition-all shadow-sm"
          >
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-8 w-8 hover:bg-destructive/10 rounded-full"
              onclick={() => removeItem(i)}
            >
              <Trash2 class="size-4" />
            </Button>

            <div class="space-y-4 mt-2">
              <IconPicker label="Icon" bind:value={pillar.iconName} />
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Title</Label
                >
                <Input bind:value={pillar.title} placeholder="Title" />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Description</Label
                >
                <Textarea
                  bind:value={pillar.desc}
                  rows={3}
                  placeholder="Description..."
                />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </SectionWrapper>
  </div>
</div>
