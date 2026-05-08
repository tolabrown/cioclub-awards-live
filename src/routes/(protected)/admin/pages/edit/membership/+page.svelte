<script lang="ts">
  import type { PageProps } from "./$types";
  import { deserialize } from "$app/forms";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import { Badge } from "$lib/components/ui/badge";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { toast } from "svelte-sonner";
  import { untrack } from "svelte";
  import { resizeImage } from "$lib/authentication/imageresize";
  import {
    CreditCard,
    LayoutDashboard,
    Sparkles,
    Shield,
    Users,
    User,
    Check,
    Plus,
    Trash2,
    Loader2,
    Zap,
    Crown,
    CheckCircle2,
    MoveUp,
    MoveDown,
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
  let pageTitle = $state("Membership Plans - CIO Club Africa");
  let pageDescription = $state("Join Africa's elite IT network");
  let ogImage = $state("");

  let content = $state({
    hero: {
      badge: "Membership",
      title: "Join Africa's Elite IT Network",
      description: "Unlock exclusive opportunities...",
    },
    tiers: [] as any[],
    joinSteps: [] as any[],
    corporate: {
      title: "Corporate Memberships",
      description: "Interested in institutional packages...",
      cta: "Inquire About Corporate",
    },
  });

  const defaultTier = {
    name: "Individual",
    tagline: "Professional Leader",
    price: "₦200k",
    period: "($150)/year",
    description: "For active IT managers...",
    features: [{ text: "Update this feature", included: true }],
    cta: "Join Now",
    popular: false,
    iconName: "User",
    color: "text-primary",
    bgColor: "bg-primary/10",
  };

  const defaultStep = {
    title: "Step Title",
    desc: "Step description text...",
  };

  // Sync data from server
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || "Membership Plans - CIO Club Africa";
        pageDescription = meta.description || "Join Africa's elite IT network";
        ogImage = meta.ogImage || "";
      });
    }
    if (data.content) {
      untrack(() => {
        content = {
          hero: { ...content.hero, ...data.content.hero },
          tiers: data.content.tiers || [],
          joinSteps: data.content.joinSteps || [],
          corporate: { ...content.corporate, ...data.content.corporate },
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
        toast.success("Membership page content saved successfully");
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

  async function onImageUpload(e: Event) {
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

  function addItem(type: "tiers" | "joinSteps") {
    if (type === "tiers") {
      content.tiers = [
        ...content.tiers,
        { ...defaultTier, features: [...defaultTier.features] },
      ];
    } else {
      content.joinSteps = [...content.joinSteps, { ...defaultStep }];
    }
  }

  function removeItem(type: "tiers" | "joinSteps", index: number) {
    if (type === "tiers") {
      content.tiers = content.tiers.filter((_, i) => i !== index);
    } else {
      content.joinSteps = content.joinSteps.filter((_, i) => i !== index);
    }
  }

  function addFeature(tierIndex: number) {
    content.tiers[tierIndex].features = [
      ...content.tiers[tierIndex].features,
      { text: "New Feature", included: true },
    ];
  }

  function removeFeature(tierIndex: number, featureIndex: number) {
    content.tiers[tierIndex].features = content.tiers[
      tierIndex
    ].features.filter((_: any, i: number) => i !== featureIndex);
  }

  const jumpLinks = [
    { id: "seo", label: "SEO", icon: Sparkles },
    { id: "hero", label: "Hero", icon: LayoutDashboard },
    { id: "tiers", label: "Tiers", icon: CreditCard },
    { id: "steps", label: "Join Steps", icon: CheckCircle2 },
    { id: "corporate", label: "Corporate", icon: Users },
  ];
</script>

<div class="flex flex-col gap-4 pb-20 w-full">
  <EditorHeader title="Edit Membership" {isSubmitting} onSave={handleSave} />

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
      description="Pricing page introduction"
      icon={LayoutDashboard}
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Badge Text</Label
          >
          <Input bind:value={content.hero.badge} placeholder="Membership" />
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Main Title</Label
          >
          <Input
            bind:value={content.hero.title}
            placeholder="Join Africa's Elite..."
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

    <!-- Tiers Section -->
    <SectionWrapper
      id="tiers"
      title="Membership Tiers"
      description="Manage the different pricing levels"
      icon={CreditCard}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => addItem("tiers")}
          class="gap-2 rounded-lg text-primary"
        >
          <Plus class="size-4" /> Add Tier
        </Button>
      {/snippet}

      <div class="grid gap-8 lg:grid-cols-2">
        {#each content.tiers as tier, i}
          <div
            class="relative group p-6 rounded-xl border-2 border-border/40 bg-card hover:border-primary/30 transition-all shadow-md space-y-4"
          >
            <div class="absolute top-4 right-4 flex items-center gap-4">
              <div class="flex items-center space-x-2">
                <Checkbox id="popular-{i}" bind:checked={tier.popular} />
                <Label for="popular-{i}" class="text-xs font-bold uppercase"
                  >Most Popular</Label
                >
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-full text-destructive"
                onclick={() => removeItem("tiers", i)}
              >
                <Trash2 class="size-4" />
              </Button>
            </div>

            <div class="grid gap-4 md:grid-cols-2 mt-4">
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase text-muted-foreground"
                  >Tier Name</Label
                >
                <Input bind:value={tier.name} placeholder="Individual" />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase text-muted-foreground"
                  >Tagline</Label
                >
                <Input bind:value={tier.tagline} placeholder="Elite Network" />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase text-muted-foreground"
                  >Price Display</Label
                >
                <Input bind:value={tier.price} placeholder="₦200k" />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase text-muted-foreground"
                  >Period</Label
                >
                <Input bind:value={tier.period} placeholder="($150)/year" />
              </div>
            </div>

            <div class="space-y-2">
              <Label
                class="text-[10px] font-bold uppercase text-muted-foreground"
                >Summary</Label
              >
              <Textarea
                bind:value={tier.description}
                rows={2}
                placeholder="Brief summary..."
              />
            </div>

            <div class="space-y-4">
              <IconPicker label="Icon" bind:value={tier.iconName} />
              <ColorPicker label="Color" bind:value={tier.color} mode="text" />
            </div>

            <div class="space-y-4 pt-4 border-t">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-bold uppercase tracking-widest">
                  Included Features
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onclick={() => addFeature(i)}
                  class="h-7 text-xs gap-1 text-primary"
                >
                  <Plus class="size-3" /> Add Feature
                </Button>
              </div>
              <div class="space-y-3">
                {#each tier.features as feature, fi}
                  <div class="flex items-center gap-2">
                    <Checkbox bind:checked={feature.included} />
                    <Input
                      bind:value={feature.text}
                      class="h-8 text-xs flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 text-muted-foreground"
                      onclick={() => removeFeature(i, fi)}
                    >
                      <Trash2 class="size-3" />
                    </Button>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Join Steps -->
    <SectionWrapper
      id="steps"
      title="How to Join"
      description="The application and onboarding process"
      icon={CheckCircle2}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => addItem("joinSteps")}
          class="gap-2 rounded-lg text-primary"
        >
          <Plus class="size-4" /> Add Step
        </Button>
      {/snippet}

      <div class="grid gap-6 md:grid-cols-2">
        {#each content.joinSteps as step, i}
          <div
            class="relative group p-6 rounded-xl border bg-card hover:border-primary/30 transition-all flex gap-6"
          >
            <div
              class="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0"
            >
              {i + 1}
            </div>
            <div class="flex-1 space-y-4">
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase text-muted-foreground"
                  >Step Title</Label
                >
                <Input bind:value={step.title} placeholder="Step Title" />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase text-muted-foreground"
                  >Step Description</Label
                >
                <Textarea
                  bind:value={step.desc}
                  rows={2}
                  placeholder="Step detail..."
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="text-muted-foreground self-start h-8 w-8 hover:bg-destructive/10"
              onclick={() => removeItem("joinSteps", i)}
            >
              <Trash2 class="size-4" />
            </Button>
          </div>
        {/each}
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Corporate Section -->
    <SectionWrapper
      id="corporate"
      title="Corporate CTA"
      description="Banner for enterprise inquiries"
      icon={Users}
    >
      <div class="space-y-4">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-2">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >CTA Title</Label
            >
            <Input
              bind:value={content.corporate.title}
              placeholder="Corporate Memberships"
            />
          </div>
          <div class="space-y-2">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Button Text</Label
            >
            <Input
              bind:value={content.corporate.cta}
              placeholder="Inquire Now"
            />
          </div>
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >CTA Description</Label
          >
          <Textarea
            bind:value={content.corporate.description}
            rows={3}
            placeholder="Enterprise details..."
          />
        </div>
      </div>
    </SectionWrapper>
  </div>
</div>
