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
    Headset,
    LayoutDashboard,
    Sparkles,
    Mail,
    Phone,
    MapPin,
    Handshake,
    Plus,
    Trash2,
    Loader2,
    ImageIcon,
    Upload,
    UserCircle,
    MoveUp,
    MoveDown,
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
  let isUploadingPerson = $state(false);

  // Initialize state
  let pageTitle = $state("Contact - The CIO Club Africa");
  let pageDescription = $state("Connect with the Future of African Tech");
  let ogImage = $state("");

  let content = $state({
    hero: {
      badge: "Member Support",
      title: "Connect with the Future",
      description: "Whether you're looking to join...",
    },
    formSection: {
      title: "Direct Inquiry",
      quote: "Advancing leadership through meaningful connections.",
    },
    inquiryTypes: [] as any[],
    contactMethods: [] as any[],
    partnershipCard: {
      title: "Corporate & Strategic Support",
      description: "Join forces with Africa's most influential...",
      personName: "Adesewa Jethro",
      personRole: "Head of Partnerships",
      personImage: "",
      cta: "Connect",
    },
  });

  const defaultType = { value: "other", label: "Other Inquiry" };
  const defaultMethod = {
    label: "Email Us",
    value: "info@thecioclubafrica.com",
    description: "Send us a message anytime.",
    iconName: "Mail",
  };

  // Sync data from server
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || "Contact - The CIO Club Africa";
        pageDescription =
          meta.description || "Connect with the Future of African Tech";
        ogImage = meta.ogImage || "";
      });
    }
    if (data.content) {
      untrack(() => {
        content = {
          hero: { ...content.hero, ...data.content.hero },
          formSection: { ...content.formSection, ...data.content.formSection },
          inquiryTypes: data.content.inquiryTypes || [],
          contactMethods: data.content.contactMethods || [],
          partnershipCard: {
            ...content.partnershipCard,
            ...data.content.partnershipCard,
          },
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
        toast.success("Contact page content saved successfully");
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

  async function onImageUpload(e: Event, type: "og" | "person") {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (type === "og") isUploadingOg = true;
    else isUploadingPerson = true;

    try {
      const resizedFile = await resizeImage(file, {
        maxWidth: type === "og" ? 1200 : 400,
        maxHeight: type === "og" ? 630 : 400,
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
        if (type === "og") ogImage = result.data.image.url;
        else {
          content.partnershipCard.personImage = result.data.image.url;
          // We could store imageId if needed, but for now we maintain consistency with the existing data structure.
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
      isUploadingPerson = false;
      input.value = "";
    }
  }

  function addItem(type: "inquiry" | "methods") {
    if (type === "inquiry") {
      content.inquiryTypes = [...content.inquiryTypes, { ...defaultType }];
    } else {
      content.contactMethods = [
        ...content.contactMethods,
        { ...defaultMethod },
      ];
    }
  }

  function removeItem(type: "inquiry" | "methods", index: number) {
    if (type === "inquiry") {
      content.inquiryTypes = content.inquiryTypes.filter((_, i) => i !== index);
    } else {
      content.contactMethods = content.contactMethods.filter(
        (_, i) => i !== index,
      );
    }
  }

  const jumpLinks = [
    { id: "seo", label: "SEO", icon: Sparkles },
    { id: "hero", label: "Hero", icon: LayoutDashboard },
    { id: "form", label: "Form Settings", icon: Mail },
    { id: "methods", label: "Methods", icon: Phone },
    { id: "partnership", label: "Partnership Card", icon: Handshake },
  ];
</script>

<div class="flex flex-col gap-4 pb-20 w-full">
  <EditorHeader title="Edit Contact" {isSubmitting} onSave={handleSave} />

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
      description="Main banner of the contact page"
      icon={LayoutDashboard}
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Badge Text</Label
          >
          <Input bind:value={content.hero.badge} placeholder="Member Support" />
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Main Title</Label
          >
          <Input
            bind:value={content.hero.title}
            placeholder="Connect with the Future"
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

    <!-- Form Settings -->
    <SectionWrapper
      id="form"
      title="Contact Form Settings"
      description="Manage inquiry types and form headers"
      icon={Mail}
    >
      <div class="space-y-4">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-2">
            <Label class="text-[10px] font-bold uppercase text-muted-foreground"
              >Form Title</Label
            >
            <Input bind:value={content.formSection.title} />
          </div>
          <div class="space-y-2">
            <Label class="text-[10px] font-bold uppercase text-muted-foreground"
              >Form Quote</Label
            >
            <Input bind:value={content.formSection.quote} />
          </div>
        </div>

        <div class="space-y-4 pt-4 border-t">
          <div class="flex items-center justify-between">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Inquiry Types (Dropdown)</Label
            >
            <Button
              variant="ghost"
              size="sm"
              onclick={() => addItem("inquiry")}
              class="h-7 text-xs gap-1 text-primary"
            >
              <Plus class="size-3" /> Add Type
            </Button>
          </div>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each content.inquiryTypes as type, i}
              <div
                class="flex items-center gap-2 p-3 border rounded-lg bg-muted/30"
              >
                <div class="flex-1 space-y-2">
                  <Input
                    bind:value={type.label}
                    placeholder="Label"
                    class="h-8 text-xs font-bold"
                  />
                  <Input
                    bind:value={type.value}
                    placeholder="value (slug)"
                    class="h-7 text-[10px]"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-muted-foreground"
                  onclick={() => removeItem("inquiry", i)}
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

    <!-- Contact Methods -->
    <SectionWrapper
      id="methods"
      title="Contact Methods"
      description="Direct contact details shown on the right"
      icon={Phone}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => addItem("methods")}
          class="gap-2 rounded-lg text-primary"
        >
          <Plus class="size-4" /> Add Method
        </Button>
      {/snippet}

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each content.contactMethods as method, i}
          <div
            class="relative group p-6 rounded-xl border-2 border-border/40 bg-card hover:border-primary/30 transition-all shadow-md space-y-4"
          >
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-2 right-2 text-muted-foreground h-8 w-8 hover:bg-destructive/10 rounded-full"
              onclick={() => removeItem("methods", i)}
            >
              <Trash2 class="size-4" />
            </Button>

            <div class="space-y-4">
              <IconPicker label="Icon" bind:value={method.iconName} />
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase text-muted-foreground"
                  >Label</Label
                >
                <Input bind:value={method.label} placeholder="Email Us" />
              </div>
            </div>
            <div class="space-y-2">
              <Label
                class="text-[10px] font-bold uppercase text-muted-foreground"
                >Value</Label
              >
              <Input bind:value={method.value} placeholder="info@..." />
            </div>
            <div class="space-y-2">
              <Label
                class="text-[10px] font-bold uppercase text-muted-foreground"
                >Description</Label
              >
              <Textarea
                bind:value={method.description}
                rows={2}
                placeholder="Mon-Fri..."
              />
            </div>
          </div>
        {/each}
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Partnership Card -->
    <SectionWrapper
      id="partnership"
      title="Partnership Highlight"
      description="Institutional partners callout card"
      icon={Handshake}
    >
      <div class="grid gap-12 lg:grid-cols-2">
        <div class="space-y-6">
          <div class="space-y-2">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Card Title</Label
            >
            <Input bind:value={content.partnershipCard.title} />
          </div>
          <div class="space-y-2">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Description</Label
            >
            <Textarea
              bind:value={content.partnershipCard.description}
              rows={4}
            />
          </div>
        </div>

        <div
          class="p-6 rounded-xl border-2 border-primary/20 bg-primary/5 space-y-6"
        >
          <h4 class="text-sm font-bold uppercase tracking-widest text-primary">
            Representative Details
          </h4>
          <div class="flex items-center gap-6">
            <div
              class="relative size-24 rounded-full overflow-hidden border-2 border-primary/30 shrink-0 bg-muted group/person"
            >
              {#if content.partnershipCard.personImage}
                <img
                  src={content.partnershipCard.personImage}
                  alt="Person"
                  class="w-full h-full object-cover"
                />
                <div
                  class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/person:opacity-100 transition-opacity"
                >
                  <label class="cursor-pointer">
                    <Upload class="size-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      onchange={(e) => onImageUpload(e, "person")}
                    />
                  </label>
                </div>
              {:else}
                <div class="flex items-center justify-center h-full">
                  <UserCircle class="size-12 text-muted-foreground/40" />
                  <label
                    class="absolute inset-0 cursor-pointer flex items-center justify-center"
                  >
                    <Upload class="size-6 transition-opacity" />
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      onchange={(e) => onImageUpload(e, "person")}
                    />
                  </label>
                </div>
              {/if}
              {#if isUploadingPerson}
                <div
                  class="absolute inset-0 bg-background/80 flex items-center justify-center"
                >
                  <Loader2 class="size-4 animate-spin text-primary" />
                </div>
              {/if}
            </div>
            <div class="flex-1 space-y-4">
              <div class="space-y-1">
                <Label class="text-[10px] font-bold uppercase">Name</Label>
                <Input bind:value={content.partnershipCard.personName} />
              </div>
              <div class="space-y-1">
                <Label class="text-[10px] font-bold uppercase">Role</Label>
                <Input bind:value={content.partnershipCard.personRole} />
              </div>
            </div>
          </div>
          <div class="space-y-2 pt-4 border-t border-primary/10">
            <Label class="text-[10px] font-bold uppercase">Button Text</Label>
            <Input bind:value={content.partnershipCard.cta} />
          </div>
        </div>
      </div>
    </SectionWrapper>
  </div>
</div>
