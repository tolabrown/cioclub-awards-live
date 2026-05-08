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
  import {
    LayoutDashboard,
    Sparkles,
    CreditCard,
    Heart,
    Plus,
    Trash2,
    Loader2,
    Target,
    MessageCircle,
  } from "@lucide/svelte";
  import EditorHeader from "$lib/components/admin/editor/EditorHeader.svelte";
  import EditorJumpLinks from "$lib/components/admin/editor/EditorJumpLinks.svelte";
  import SEOSection from "$lib/components/admin/editor/SEOSection.svelte";
  import SectionWrapper from "$lib/components/admin/editor/SectionWrapper.svelte";
  import { invalidateAll } from "$app/navigation";
  import { resizeImage } from "$lib/authentication/imageresize";

  let { data }: PageProps = $props();

  let isSubmitting = $state(false);
  let isUploadingOg = $state(false);

  let pageTitle = $state("Donate - The CIO Club Africa");
  let pageDescription = $state(
    "Support the CIO Club Africa's mission to empower technology leaders across the continent.",
  );
  let ogImage = $state("");

  let content = $state({
    hero: {
      badge: "Support Our Mission",
      title: "Sponsor a Project",
      description:
        "Your generous contribution helps us drive digital transformation and empower technology leaders across the African continent.",
    },
    bankDetails: {
      accountName: "Edniesal Consulting Ltd (Dollar account)",
      bankName: "First City Monument Bank (FCMB)",
      accountNumber: "6997978022",
      accountType: "Dollar Account",
      additionalNote:
        "Please use your name or organization as the transfer reference.",
    },
    impact: {
      title: "Your Impact",
      description:
        "Every contribution goes directly toward advancing technology leadership across Africa.",
      items: [] as { label: string; description: string }[],
    },
    cta: {
      title: "Questions About Donations?",
      description:
        "Our partnerships team is happy to discuss custom sponsorship packages, recurring support, or in-kind contributions.",
      buttonText: "Contact Our Team",
      buttonLink: "/contact",
    },
  });

  const defaultImpactItem = {
    label: "New Initiative",
    description: "Description of this initiative...",
  };

  // Sync data from server
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || pageTitle;
        pageDescription = meta.description || pageDescription;
        ogImage = meta.ogImage || "";
      });
    }
    if (data.content) {
      untrack(() => {
        content = {
          hero: { ...content.hero, ...data.content.hero },
          bankDetails: { ...content.bankDetails, ...data.content.bankDetails },
          impact: {
            ...content.impact,
            ...data.content.impact,
            items: data.content.impact?.items || [],
          },
          cta: { ...content.cta, ...data.content.cta },
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
        toast.success("Donate page saved successfully");
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

  async function onImageUpload(e: Event, type: "og") {
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

  function addImpactItem() {
    content.impact.items = [
      ...content.impact.items,
      { ...defaultImpactItem },
    ];
  }

  function removeImpactItem(index: number) {
    content.impact.items = content.impact.items.filter((_, i) => i !== index);
  }

  const jumpLinks = [
    { id: "seo", label: "SEO", icon: Sparkles },
    { id: "hero", label: "Hero", icon: LayoutDashboard },
    { id: "bank", label: "Bank Details", icon: CreditCard },
    { id: "impact", label: "Impact", icon: Target },
    { id: "cta", label: "CTA", icon: MessageCircle },
  ];
</script>

<div class="flex flex-col gap-4 pb-20 w-full">
  <EditorHeader title="Edit Donate Page" {isSubmitting} onSave={handleSave} />

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
      description="Main banner of the donate page"
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
            placeholder="Support Our Mission"
          />
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Main Title</Label
          >
          <Input
            bind:value={content.hero.title}
            placeholder="Sponsor a Project"
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

    <!-- Bank Details -->
    <SectionWrapper
      id="bank"
      title="Bank Account Details"
      description="These details are shown publicly on the donate page"
      icon={CreditCard}
    >
      <div
        class="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 space-y-6"
      >
        <div class="flex items-center gap-3">
          <div
            class="size-10 rounded-xl bg-primary/20 flex items-center justify-center"
          >
            <CreditCard class="size-5 text-primary" />
          </div>
          <h4
            class="text-sm font-bold uppercase tracking-widest text-primary"
          >
            Account Information
          </h4>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Account Name</Label
            >
            <Input
              bind:value={content.bankDetails.accountName}
              placeholder="e.g., Company Ltd"
            />
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Bank Name</Label
            >
            <Input
              bind:value={content.bankDetails.bankName}
              placeholder="e.g., First City Monument Bank"
            />
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Account Number</Label
            >
            <Input
              bind:value={content.bankDetails.accountNumber}
              placeholder="e.g., 1234567890"
              class="font-mono text-lg font-bold"
            />
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Account Type</Label
            >
            <Input
              bind:value={content.bankDetails.accountType}
              placeholder="e.g., Dollar Account"
            />
          </div>
        </div>
        <div class="space-y-2">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Additional Note (optional)</Label
          >
          <Textarea
            bind:value={content.bankDetails.additionalNote}
            placeholder="e.g., Please use your name as reference..."
            rows={2}
          />
        </div>
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Impact Section -->
    <SectionWrapper
      id="impact"
      title="Impact Section"
      description="Describe how donations make a difference"
      icon={Target}
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Section Title</Label
          >
          <Input
            bind:value={content.impact.title}
            placeholder="Your Impact"
          />
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Section Description</Label
          >
          <Input
            bind:value={content.impact.description}
            placeholder="Every contribution..."
          />
        </div>
      </div>

      <div class="space-y-4 pt-4 border-t">
        <div class="flex items-center justify-between">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Impact Items</Label
          >
          <Button
            variant="outline"
            size="sm"
            onclick={addImpactItem}
            class="gap-2 rounded-lg text-primary"
          >
            <Plus class="size-4" /> Add Item
          </Button>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          {#each content.impact.items as item, i}
            <div
              class="relative group p-6 rounded-xl border-2 border-border/40 bg-card hover:border-primary/30 transition-all shadow-sm space-y-4"
            >
              <Button
                variant="ghost"
                size="icon"
                class="absolute top-2 right-2 text-muted-foreground h-8 w-8 hover:bg-destructive/10 rounded-full"
                onclick={() => removeImpactItem(i)}
              >
                <Trash2 class="size-4" />
              </Button>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase text-muted-foreground"
                  >Label</Label
                >
                <Input
                  bind:value={item.label}
                  placeholder="Leadership Programs"
                />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase text-muted-foreground"
                  >Description</Label
                >
                <Textarea
                  bind:value={item.description}
                  rows={2}
                  placeholder="Fund executive training..."
                />
              </div>
            </div>
          {/each}
        </div>
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- CTA Section -->
    <SectionWrapper
      id="cta"
      title="Call to Action"
      description="Bottom section with contact prompt"
      icon={MessageCircle}
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Title</Label
          >
          <Input
            bind:value={content.cta.title}
            placeholder="Questions About Donations?"
          />
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Button Text</Label
          >
          <Input
            bind:value={content.cta.buttonText}
            placeholder="Contact Our Team"
          />
        </div>
      </div>
      <div class="space-y-2">
        <Label
          class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >Description</Label
        >
        <Textarea
          bind:value={content.cta.description}
          placeholder="Our partnerships team..."
          rows={3}
        />
      </div>
      <div class="space-y-2">
        <Label
          class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >Button Link</Label
        >
        <Input
          bind:value={content.cta.buttonLink}
          placeholder="/contact"
        />
      </div>
    </SectionWrapper>
  </div>
</div>
