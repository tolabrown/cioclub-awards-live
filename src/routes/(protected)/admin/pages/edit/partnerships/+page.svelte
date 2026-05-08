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
    Handshake,
    LayoutDashboard,
    Sparkles,
    Shield,
    Star,
    Award,
    Plus,
    Trash2,
    Loader2,
    FileText,
    Zap,
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
  let pageTitle = $state("Partnerships - CIO Club Africa");
  let pageDescription = $state("Partner with Africa's Tech Decision Makers");
  let ogImage = $state("");

  let content = $state({
    hero: {
      badge: "Partnerships",
      title: "Partner with Africa's Tech Decision Makers",
      description: "Join the ecosystem that is defining the digital future...",
    },
    advantage: {
      title: "The Strategic Advantage",
      description:
        "Partnering with CIO Club Africa gives you an unparalleled platform...",
      props: [] as string[],
    },
    prospectus: {
      tag: "Partnership Commitment",
      title: "Ready to explore a partnership?",
      description: "Read our Partnership Commitment...",
      cta: "Read Partnership Commitment",
    },
    tiers: [] as any[],
  });

  const defaultTier = {
    level: "Diamond",
    description: "Maximum visibility and strategic participation...",
    iconName: "Shield",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  };

  // Sync data from server
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || "Partnerships - CIO Club Africa";
        pageDescription =
          meta.description || "Partner with Africa's Tech Decision Makers";
        ogImage = meta.ogImage || "";
      });
    }
    if (data.content) {
      untrack(() => {
        content = {
          hero: { ...content.hero, ...data.content.hero },
          advantage: { ...content.advantage, ...data.content.advantage },
          prospectus: { ...content.prospectus, ...data.content.prospectus },
          tiers: data.content.tiers || [],
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
        toast.success("Partnerships page content saved successfully");
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

  function addItem(type: "tiers" | "props") {
    if (type === "tiers") {
      content.tiers = [...content.tiers, { ...defaultTier }];
    } else {
      content.advantage.props = [...content.advantage.props, "New Benefit"];
    }
  }

  function removeItem(type: "tiers" | "props", index: number) {
    if (type === "tiers") {
      content.tiers = content.tiers.filter((_, i) => i !== index);
    } else {
      content.advantage.props = content.advantage.props.filter(
        (_, i) => i !== index,
      );
    }
  }

  const jumpLinks = [
    { id: "seo", label: "SEO", icon: Sparkles },
    { id: "hero", label: "Hero", icon: LayoutDashboard },
    { id: "advantage", label: "Advantage", icon: Zap },
    { id: "prospectus", label: "Commitment", icon: FileText },
    { id: "tiers", label: "Tiers", icon: Award },
  ];
</script>

<div class="flex flex-col gap-4 pb-20 w-full">
  <EditorHeader title="Edit Partnerships" {isSubmitting} onSave={handleSave} />

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
      description="Main banner of the partnerships page"
      icon={LayoutDashboard}
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Badge Text</Label
          >
          <Input bind:value={content.hero.badge} placeholder="Partnerships" />
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Main Title</Label
          >
          <Input
            bind:value={content.hero.title}
            placeholder="Partner with Africa's Tech leaders"
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

    <!-- Strategic Advantage -->
    <SectionWrapper
      id="advantage"
      title="Strategic Advantage"
      description="List of benefits for partners"
      icon={Zap}
    >
      <div class="space-y-4">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-2">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Section Title</Label
            >
            <Input
              bind:value={content.advantage.title}
              placeholder="The Strategic Advantage"
            />
          </div>
          <div class="space-y-2">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Description</Label
            >
            <Textarea
              bind:value={content.advantage.description}
              rows={2}
              placeholder="Partnering with CIO Club Africa..."
            />
          </div>
        </div>

        <div class="space-y-4 pt-4 border-t">
          <div class="flex items-center justify-between">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Value Propositions</Label
            >
            <Button
              variant="ghost"
              size="sm"
              onclick={() => addItem("props")}
              class="h-7 text-xs gap-1 text-primary"
            >
              <Plus class="size-3" /> Add Prop
            </Button>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            {#each content.advantage.props as prop, i}
              <div class="flex items-center gap-2">
                <Input
                  bind:value={content.advantage.props[i]}
                  class="h-10 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-muted-foreground hover:bg-destructive/10"
                  onclick={() => removeItem("props", i)}
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Prospectus Section -->
    <SectionWrapper
      id="prospectus"
      title="Partnership Commitment Callout"
      description="Call to action for the commitment modal"
      icon={FileText}
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label class="text-[10px] font-bold uppercase text-muted-foreground"
              >Tagline</Label
            >
            <Input
              bind:value={content.prospectus.tag}
              placeholder="Get the Prospectus"
            />
          </div>
          <div class="space-y-2">
            <Label class="text-[10px] font-bold uppercase text-muted-foreground"
              >CTA Title</Label
            >
            <Input
              bind:value={content.prospectus.title}
              placeholder="Ready to explore?"
            />
          </div>
          <div class="space-y-2">
            <Label class="text-[10px] font-bold uppercase text-muted-foreground"
              >Button Text</Label
            >
            <Input
              bind:value={content.prospectus.cta}
              placeholder="Download Now"
            />
          </div>
        </div>
        <div class="space-y-2">
          <Label class="text-[10px] font-bold uppercase text-muted-foreground"
            >Description</Label
          >
          <Textarea
            bind:value={content.prospectus.description}
            rows={6}
            placeholder="Download details..."
          />
        </div>
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Tiers Section -->
    <SectionWrapper
      id="tiers"
      title="Partnership Tiers"
      description="Levels of engagement and investment"
      icon={Award}
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

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {#each content.tiers as tier, i}
          <div
            class="relative group p-6 rounded-xl border-2 border-border/40 bg-card hover:border-primary/30 transition-all shadow-md space-y-4"
          >
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-2 right-2 text-muted-foreground h-8 w-8 hover:bg-destructive/10 rounded-full"
              onclick={() => removeItem("tiers", i)}
            >
              <Trash2 class="size-4" />
            </Button>

            <div class="space-y-2">
              <Label
                class="text-[10px] font-bold uppercase text-muted-foreground"
                >Level Name</Label
              >
              <Input bind:value={tier.level} placeholder="Diamond" />
            </div>

            <div class="space-y-2">
              <Label
                class="text-[10px] font-bold uppercase text-muted-foreground"
                >Summary</Label
              >
              <Textarea
                bind:value={tier.description}
                rows={3}
                placeholder="Visibility details..."
              />
            </div>

            <div class="space-y-4 pt-2 border-t">
              <IconPicker label="Icon" bind:value={tier.iconName} />
              <ColorPicker
                label="Color Theme"
                bind:value={tier.color}
                mode="any"
              />
            </div>
          </div>
        {/each}
      </div>
    </SectionWrapper>
  </div>
</div>
