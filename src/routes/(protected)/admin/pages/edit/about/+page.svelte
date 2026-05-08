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
    Target,
    Eye,
    Shield,
    Lightbulb,
    Users,
    Zap,
    Scale,
    Trophy,
    Presentation,
    Handshake,
    Plus,
    Trash2,
    LayoutDashboard,
    Sparkles,
    Hash,
  } from "@lucide/svelte";
  import EditorHeader from "$lib/components/admin/editor/EditorHeader.svelte";
  import EditorJumpLinks from "$lib/components/admin/editor/EditorJumpLinks.svelte";
  import SEOSection from "$lib/components/admin/editor/SEOSection.svelte";
  import SectionWrapper from "$lib/components/admin/editor/SectionWrapper.svelte";
  import IconPicker from "$lib/components/ui/picker/IconPicker.svelte";
  import ColorPicker from "$lib/components/ui/picker/ColorPicker.svelte";
  import { invalidateAll } from "$app/navigation";

  let { data }: PageProps = $props();

  let isSubmitting = $state(false);
  let isUploadingOg = $state(false);

  // Initialize state
  let pageTitle = $state("About Us");
  let pageDescription = $state("About CIO Club Africa");
  let ogImage = $state("");

  let content = $state({
    hero: {
      subtitle: "",
      title: "",
      description: "",
    },
    mission: {
      title: "",
      description: "",
    },
    vision: {
      title: "",
      description: "",
    },
    coreValues: [] as any[],
    objectives: [] as any[],
  });

  // Default values for new items
  const defaultCoreValue = {
    title: "",
    description: "",
    iconName: "Shield",
    color: "text-primary",
    bgColor: "bg-primary/10",
  };

  const defaultObjective = {
    title: "",
    description: "",
    iconName: "Zap",
  };

  // Sync data from server
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || "About Us";
        pageDescription = meta.description || "About CIO Club Africa";
        ogImage = meta.ogImage || "";
      });
    }
    if (data.content) {
      untrack(() => {
        content = {
          hero: { ...content.hero, ...data.content.hero },
          mission: { ...content.mission, ...data.content.mission },
          vision: { ...content.vision, ...data.content.vision },
          coreValues: data.content.coreValues || [],
          objectives: data.content.objectives || [],
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
        toast.success("About page content saved successfully");
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

  async function onImageUpload(e: Event, type: "og" = "og") {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    isUploadingOg = true;

    try {
      const resizedFile = await resizeImage(file, {
        maxWidth: 1200,
        maxHeight: 630,
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
        ogImage = result.data.image.url;
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process image");
    } finally {
      isUploadingOg = false;
      input.value = "";
    }
  }

  function addItem(type: "coreValues" | "objectives") {
    if (type === "coreValues") {
      content.coreValues = [...content.coreValues, { ...defaultCoreValue }];
    } else {
      content.objectives = [...content.objectives, { ...defaultObjective }];
    }
  }

  function removeItem(type: "coreValues" | "objectives", index: number) {
    if (type === "coreValues") {
      content.coreValues = content.coreValues.filter((_, i) => i !== index);
    } else {
      content.objectives = content.objectives.filter((_, i) => i !== index);
    }
  }

  const jumpLinks = [
    { id: "seo", label: "SEO", icon: Sparkles },
    { id: "hero", label: "Hero", icon: LayoutDashboard },
    { id: "mission", label: "Mission & Vision", icon: Target },
    { id: "values", label: "Core Values", icon: Shield },
    { id: "objectives", label: "Objectives", icon: Hash },
  ];
</script>

<div class="flex flex-col gap-4 pb-20 w-full">
  <EditorHeader title="Edit About Page" {isSubmitting} onSave={handleSave} />

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
      description="The introduction to your About page"
      icon={LayoutDashboard}
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Subtitle / Tag</Label
          >
          <Input
            bind:value={content.hero.subtitle}
            placeholder="e.g. Established 2017"
          />
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Main Title</Label
          >
          <Input
            bind:value={content.hero.title}
            placeholder="Driving Africa's Digital Revolution"
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
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Mission & Vision -->
    <SectionWrapper
      id="mission"
      title="Mission & Vision"
      description="Core identity and future goals"
      icon={Target}
    >
      <div class="grid gap-8 md:grid-cols-2">
        <div class="space-y-4 p-4 rounded-xl border bg-muted/5">
          <div class="flex items-center gap-2 mb-2">
            <Target class="size-4 text-primary" />
            <h3 class="font-bold">Mission</h3>
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Title</Label
            >
            <Input
              bind:value={content.mission.title}
              placeholder="Our Mission"
            />
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Description</Label
            >
            <Textarea
              bind:value={content.mission.description}
              rows={4}
              placeholder="Empowering leaders..."
            />
          </div>
        </div>

        <div class="space-y-4 p-4 rounded-xl border bg-muted/5">
          <div class="flex items-center gap-2 mb-2">
            <Eye class="size-4 text-accent-gold" />
            <h3 class="font-bold">Vision</h3>
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Title</Label
            >
            <Input bind:value={content.vision.title} placeholder="Our Vision" />
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Description</Label
            >
            <Textarea
              bind:value={content.vision.description}
              rows={4}
              placeholder="Definitive catalyst..."
            />
          </div>
        </div>
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Core Values -->
    <SectionWrapper
      id="values"
      title="Core Values"
      description="Fundamental principles of the club"
      icon={Shield}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => addItem("coreValues")}
          class="gap-2 rounded-lg text-primary"
        >
          <Plus class="size-4" /> Add Value
        </Button>
      {/snippet}

      <div class="grid gap-6 md:grid-cols-2">
        {#each content.coreValues as value, i}
          <div
            class="relative group p-6 rounded-xl border-2 border-border/40 bg-card hover:border-primary/30 transition-all shadow-sm"
          >
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-8 w-8 hover:bg-destructive/10 rounded-full transition-all"
              onclick={() => removeItem("coreValues", i)}
            >
              <Trash2 class="size-4" />
            </Button>

            <div class="space-y-4 mt-2">
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Title</Label
                >
                <Input bind:value={value.title} placeholder="Excellence" />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Description</Label
                >
                <Textarea
                  bind:value={value.description}
                  rows={2}
                  placeholder="High standards..."
                />
              </div>
              <div class="space-y-4">
                <IconPicker label="Icon" bind:value={value.iconName} />
                <ColorPicker
                  label="Color"
                  bind:value={value.color}
                  mode="text"
                />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Objectives -->
    <SectionWrapper
      id="objectives"
      title="Key Objectives"
      description="Strategic goals for the term"
      icon={Hash}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => addItem("objectives")}
          class="gap-2 rounded-lg text-primary"
        >
          <Plus class="size-4" /> Add Objective
        </Button>
      {/snippet}

      <div class="space-y-4">
        {#each content.objectives as obj, i}
          <div
            class="relative group p-6 rounded-xl border bg-card hover:border-primary/30 transition-all"
          >
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
              onclick={() => removeItem("objectives", i)}
            >
              <Trash2 class="size-4" />
            </Button>

            <div class="flex flex-col md:flex-row gap-6">
              <div class="shrink-0">
                <IconPicker label="Icon" bind:value={obj.iconName} />
              </div>
              <div class="flex-1 space-y-4">
                <div class="space-y-2">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >Title</Label
                  >
                  <Input bind:value={obj.title} placeholder="Objective Title" />
                </div>
                <div class="space-y-2">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >Description</Label
                  >
                  <Textarea
                    bind:value={obj.description}
                    rows={2}
                    placeholder="Detail about this objective..."
                  />
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </SectionWrapper>
  </div>
</div>
