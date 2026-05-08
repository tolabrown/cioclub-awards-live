<script lang="ts">
  import { enhance, deserialize } from "$app/forms";
  import { untrack } from "svelte";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Separator } from "$lib/components/ui/separator";
  import * as Table from "$lib/components/ui/table";
  import {
    Plus,
    Trash2,
    Save,
    Upload,
    ExternalLink,
    Loader2,
    Image as ImageIcon,
  } from "@lucide/svelte";
  import SectionWrapper from "$lib/components/admin/SectionWrapper.svelte";
  import { LIT_DEFAULT } from "$lib/constants/defaults";
  import IconPicker from "$lib/components/ui/picker/IconPicker.svelte";
  import ColorPicker from "$lib/components/ui/picker/ColorPicker.svelte";
  import LadiesInTechEditor from "$lib/components/admin/LadiesInTechEditor.svelte";
  import LadiesInTechArchiveEditor from "$lib/components/admin/LadiesInTechArchiveEditor.svelte";

  let { data } = $props();

  function initializePageData(rawJson: string) {
    const parsed = JSON.parse(rawJson);
    // Deep merge/fallback to ensure new nested properties exist
    return {
      ...LIT_DEFAULT,
      ...parsed,
      hero: {
        ...LIT_DEFAULT.hero,
        ...parsed.hero,
        // Backwards compatibility: if old banner exists but new hero image doesn't
        desktopImage:
          parsed.hero?.desktopImage ||
          parsed.bannerImage ||
          LIT_DEFAULT.hero.desktopImage,
      },
      pillars: (parsed.pillars || LIT_DEFAULT.pillars).map(
        (p: any, i: number) => ({
          ...LIT_DEFAULT.pillars[i],
          ...p,
        }),
      ),
      ctaSection: { ...LIT_DEFAULT.ctaSection, ...parsed.ctaSection },
    };
  }

  let pageData = $state(
    untrack(() => initializePageData(data.pageContent.data)),
  );
  let pageTitle = $state(untrack(() => data.pageContent.title));
  let pageDescription = $state(untrack(() => data.pageContent.description));
  let pageOgImage = $state(untrack(() => data.pageContent.ogimage));

  let partners = $state(untrack(() => data.partners));

  // Sync state when data props change (e.g. after invalidateAll)
  $effect(() => {
    pageData = initializePageData(data.pageContent.data);
    pageTitle = data.pageContent.title;
    pageDescription = data.pageContent.description;
    pageOgImage = data.pageContent.ogimage;
    partners = data.partners;
  });

  let isSavingPage = $state(false);
  let isUploadingBanner = $state(false);
  let isUploadingPartnerLogo = $state(false);
  let uploadingPartnerId = $state<string | null>(null);

  // New Partner form state
  let newPartner = $state({
    name: "",
    websiteUrl: "",
    type: "Sponsor",
    logoId: "",
    logoUrl: "",
    displayOrder: 0,
  });
  let isAddingPartner = $state(false);

  async function handleImageUpload(file: File) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("?/uploadImage", {
      method: "POST",
      body: formData,
    });

    const result = deserialize(await response.text());
    console.log("Upload result (deserialized):", result);

    if (result.type === "success" && result.data) {
      const data = result.data as any;
      const image = data.image;
      console.log("Final image data:", image);
      return image;
    } else {
      console.error("Upload failure:", result);
      toast.error("Failed to upload image");
      return null;
    }
  }
</script>

<div class="space-y-8 pb-16">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">
        Edit Ladies in Tech Page
      </h1>
      <p class="text-muted-foreground">
        Manage page content and brand partners.
      </p>
    </div>
    <form
      action="?/update"
      method="POST"
      use:enhance={() => {
        isSavingPage = true;
        return async ({ result }) => {
          isSavingPage = false;
          if (result.type === "success") {
            toast.success("Page updated successfully");
            invalidateAll();
          } else {
            toast.error("Failed to update page");
          }
        };
      }}
    >
      <input type="hidden" name="data" value={JSON.stringify(pageData)} />
      <input type="hidden" name="title" value={pageTitle} />
      <input type="hidden" name="description" value={pageDescription} />
      <input type="hidden" name="ogimage" value={pageOgImage} />
      <Button type="submit" disabled={isSavingPage}>
        {#if isSavingPage}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        <Save class="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </form>
  </div>

  <div class="space-y-8 w-full">
    <!-- Page Settings First -->
    <SectionWrapper id="seo" title="Page Meta (SEO)">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="meta-title">Title Tag</Label>
            <Input id="meta-title" bind:value={pageTitle} />
          </div>
          <div class="space-y-2">
            <Label for="meta-desc">Meta Description</Label>
            <Textarea id="meta-desc" bind:value={pageDescription} rows={4} />
          </div>
        </div>
        <div class="space-y-2">
          <Label>Social Image (OG Image)</Label>
          <div class="flex items-center gap-4">
            <div
              class="h-32 w-56 overflow-hidden rounded-lg border bg-muted flex items-center justify-center"
            >
              {#if pageOgImage}
                <img
                  src={pageOgImage}
                  alt="OG Preview"
                  class="h-full w-full object-cover"
                />
              {:else}
                <ImageIcon class="h-8 w-8 text-muted-foreground/50" />
              {/if}
            </div>
            <Button
              variant="outline"
              type="button"
              class="relative overflow-hidden"
            >
              <Upload class="mr-2 h-4 w-4" />
              Upload OG Image
              <input
                type="file"
                class="absolute inset-0 cursor-pointer opacity-0"
                accept="image/*"
                onchange={async (e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) {
                    const res = await handleImageUpload(file);
                    if (res) pageOgImage = res.directUrl || res.url;
                  }
                }}
              />
            </Button>
          </div>
        </div>
      </div>
    </SectionWrapper>

    <!-- Main Content In a Single Column -->
    <div class="space-y-8">
      <SectionWrapper id="hero" title="Section 1: Hero & Banner">
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Desktop Banner (1920x720)</Label>
              <div class="flex flex-col gap-4">
                {#if pageData.hero.desktopImage}
                  <div
                    class="relative aspect-[21/9] w-full overflow-hidden rounded-lg border bg-muted"
                  >
                    <img
                      src={pageData.hero.desktopImage}
                      alt="Desktop Banner"
                      class="h-full w-full object-cover"
                    />
                  </div>
                {/if}
                <Button
                  variant="outline"
                  type="button"
                  class="relative overflow-hidden"
                  disabled={isUploadingBanner}
                >
                  {#if isUploadingBanner}
                    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                  {:else}
                    <Upload class="mr-2 h-4 w-4" />
                  {/if}
                  {pageData.hero.desktopImage ? "Replace" : "Upload"} Desktop
                  <input
                    type="file"
                    class="absolute inset-0 cursor-pointer opacity-0"
                    accept="image/*"
                    onchange={async (e) => {
                      const file = e.currentTarget.files?.[0];
                      if (file) {
                        isUploadingBanner = true;
                        const res = await handleImageUpload(file);
                        if (res)
                          pageData.hero.desktopImage = res.directUrl || res.url;
                        isUploadingBanner = false;
                      }
                    }}
                  />
                </Button>
              </div>
            </div>
            <div class="space-y-2">
              <Label>Mobile Banner (1920x1080)</Label>
              <div class="flex flex-col gap-4">
                {#if pageData.hero.mobileImage}
                  <div
                    class="relative aspect-[9/16] w-full h-[200px] overflow-hidden rounded-lg border bg-muted"
                  >
                    <img
                      src={pageData.hero.mobileImage}
                      alt="Mobile Banner"
                      class="h-full w-full object-cover"
                    />
                  </div>
                {/if}
                <Button
                  variant="outline"
                  type="button"
                  class="relative overflow-hidden"
                  disabled={isUploadingBanner}
                >
                  {#if isUploadingBanner}
                    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                  {:else}
                    <Upload class="mr-2 h-4 w-4" />
                  {/if}
                  {pageData.hero.mobileImage ? "Replace" : "Upload"} Mobile
                  <input
                    type="file"
                    class="absolute inset-0 cursor-pointer opacity-0"
                    accept="image/*"
                    onchange={async (e) => {
                      const file = e.currentTarget.files?.[0];
                      if (file) {
                        isUploadingBanner = true;
                        const res = await handleImageUpload(file);
                        if (res)
                          pageData.hero.mobileImage = res.directUrl || res.url;
                        isUploadingBanner = false;
                      }
                    }}
                  />
                </Button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="hero-badge">Badge Text</Label>
              <Input id="hero-badge" bind:value={pageData.hero.badge} />
            </div>
            <div class="space-y-2">
              <Label for="hero-title">Main Title</Label>
              <Input id="hero-title" bind:value={pageData.hero.title} />
            </div>
            <div class="space-y-2">
              <Label for="hero-subtitle">Subtitle (Italic)</Label>
              <Input id="hero-subtitle" bind:value={pageData.hero.subtitle} />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="hero-desc">Hero Description</Label>
            <Textarea
              id="hero-desc"
              bind:value={pageData.hero.description}
              rows={3}
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="hero-cta-text">CTA Button Text</Label>
              <Input id="hero-cta-text" bind:value={pageData.hero.ctaText} />
            </div>
            <div class="space-y-2">
              <Label for="hero-cta-href">CTA Link (URL)</Label>
              <Input id="hero-cta-href" bind:value={pageData.hero.ctaHref} />
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="mission-policy"
        title="Section 2: Mission & Executive Policy"
      >
        <div class="space-y-6">
          <div class="space-y-2">
            <Label for="page-mission">Our Mission Statement</Label>
            <Textarea
              id="page-mission"
              bind:value={pageData.mission}
              rows={3}
            />
          </div>
          <div class="space-y-2">
            <Label for="page-policy">Executive Policy</Label>
            <Textarea id="page-policy" bind:value={pageData.policy} rows={3} />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="pillars" title="Section 3: Pillars of Impact">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          {#each pageData.pillars as pillar, i}
            <div
              class="space-y-4 p-6 rounded-xl border bg-card/50 shadow-sm relative group"
            >
              <div class="flex items-center justify-between">
                <h4
                  class="font-bold text-sm uppercase tracking-widest text-muted-foreground"
                >
                  Pillar {i + 1}
                </h4>
              </div>
              <div class="grid gap-4">
                <IconPicker bind:value={pillar.icon} label="Lucide Icon" />
                <ColorPicker bind:value={pillar.color} label="Color Class" />
                <div class="space-y-2">
                  <Label>Title</Label>
                  <Input bind:value={pillar.title} placeholder="Pillar Title" />
                </div>
                <div class="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    bind:value={pillar.desc}
                    placeholder="Description"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          {/each}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="cta-section"
        title="Section 4: Call to Action (Footer)"
      >
        <div class="space-y-6">
          <div class="space-y-2">
            <Label for="cta-title">CTA Title</Label>
            <Input id="cta-title" bind:value={pageData.ctaSection.title} />
          </div>
          <div class="space-y-2">
            <Label for="cta-desc">CTA Description</Label>
            <Textarea
              id="cta-desc"
              bind:value={pageData.ctaSection.description}
              rows={2}
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="cta-btn-text">Button Text</Label>
              <Input
                id="cta-btn-text"
                bind:value={pageData.ctaSection.buttonText}
              />
            </div>
            <div class="space-y-2">
              <Label for="cta-btn-href">Button Link</Label>
              <Input
                id="cta-btn-href"
                bind:value={pageData.ctaSection.buttonHref}
              />
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="brands" title="Section 5: Sponsored Brands">
        <p class="mb-6 text-sm text-muted-foreground">
          Logos of organizations collaborating with the Ladies In Tech &
          Leadership Network.
        </p>

        <!-- Add New Partner (Exact Replication) -->
        <div
          class="mb-10 p-4 sm:p-6 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5"
        >
          <h5 class="text-sm font-bold mb-6 flex items-center gap-2">
            <Plus class="size-4" /> Add New Partner
          </h5>
          <div
            class="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end"
          >
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground"
                >Name</Label
              >
              <Input
                bind:value={newPartner.name}
                placeholder="Partner Name"
                class="bg-background"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground"
                >Partner Type</Label
              >
              <Input
                bind:value={newPartner.type}
                placeholder="e.g. Strategic Partner"
                class="bg-background"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground"
                >Website URL</Label
              >
              <Input
                bind:value={newPartner.websiteUrl}
                placeholder="https://..."
                class="bg-background"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground"
                >Logo</Label
              >
              <div class="flex items-center gap-4">
                <div
                  class="size-12 rounded-lg bg-background border flex items-center justify-center overflow-hidden shrink-0 relative"
                >
                  {#if newPartner.logoUrl}
                    <img
                      src={newPartner.logoUrl}
                      alt="Preview"
                      class="w-full h-full object-contain p-1"
                    />
                  {:else}
                    <ImageIcon class="size-6 text-muted-foreground/40" />
                  {/if}
                  {#if isUploadingPartnerLogo}
                    <div
                      class="absolute inset-0 bg-background/80 flex items-center justify-center"
                    >
                      <Loader2 class="size-5 animate-spin text-primary" />
                    </div>
                  {/if}
                </div>
                <label class="cursor-pointer">
                  <div
                    class="px-3 py-1.5 bg-background border rounded-lg text-xs font-bold hover:bg-muted transition-colors"
                  >
                    Upload
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    onchange={async (e) => {
                      const file = e.currentTarget.files?.[0];
                      if (file) {
                        isUploadingPartnerLogo = true;
                        const res = await handleImageUpload(file);
                        if (res) {
                          newPartner.logoId = res.id;
                          newPartner.logoUrl = res.directUrl || res.url;
                        }
                        isUploadingPartnerLogo = false;
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div class="flex items-end">
              <form
                action="?/savePartner"
                method="POST"
                use:enhance={() => {
                  isAddingPartner = true;
                  return async ({ result }) => {
                    isAddingPartner = false;
                    if (result.type === "success") {
                      toast.success("Brand added successfully");
                      newPartner = {
                        name: "",
                        websiteUrl: "",
                        type: "Sponsor",
                        logoId: "",
                        logoUrl: "",
                        displayOrder: 0,
                      };
                      invalidateAll();
                    } else {
                      toast.error("Failed to add brand");
                    }
                  };
                }}
                class="w-full"
              >
                <input type="hidden" name="name" value={newPartner.name} />
                <input
                  type="hidden"
                  name="websiteUrl"
                  value={newPartner.websiteUrl}
                />
                <input type="hidden" name="logoId" value={newPartner.logoId} />
                <input type="hidden" name="type" value={newPartner.type} />
                <input type="hidden" name="displayOrder" value="0" />
                <Button
                  type="submit"
                  class="w-full gap-2 rounded-xl"
                  disabled={!newPartner.name ||
                    !newPartner.logoId ||
                    isAddingPartner ||
                    isUploadingPartnerLogo}
                >
                  {#if isAddingPartner}
                    <Loader2 class="size-4 animate-spin mr-2" />
                  {/if}
                  Add Partner
                </Button>
              </form>
            </div>
          </div>
        </div>

        <!-- Existing Partners (Responsive Row Style) -->
        <div class="grid gap-4">
          {#each partners || [] as partner, i}
            <div
              class="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 rounded-2xl border bg-card/50 shadow-sm group"
            >
              <div
                class="size-20 sm:size-16 rounded-xl bg-background border flex items-center justify-center overflow-hidden shrink-0 p-3 sm:p-2 relative shadow-inner"
              >
                {#if partner.logo}
                  <img
                    src={partner.logo.directUrl || partner.logo.url}
                    alt={partner.name}
                    class="w-full h-full object-contain"
                  />
                {/if}
                <label
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <Upload class="size-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    onchange={async (e) => {
                      const file = e.currentTarget.files?.[0];
                      if (file) {
                        uploadingPartnerId = partner.id;
                        const res = await handleImageUpload(file);
                        if (res) {
                          partner.logoId = res.id;
                          const finalUrl = res.directUrl || res.url;
                          if (partner.logo) partner.logo.url = finalUrl;
                          else partner.logo = { url: finalUrl } as any;
                        }
                        uploadingPartnerId = null;
                      }
                    }}
                  />
                </label>
                {#if uploadingPartnerId === partner.id}
                  <div
                    class="absolute inset-0 bg-background/80 flex items-center justify-center"
                  >
                    <Loader2 class="size-5 animate-spin text-primary" />
                  </div>
                {/if}
              </div>

              <div
                class="flex-1 grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full"
              >
                <div class="space-y-1">
                  <Label
                    class="text-[10px] uppercase font-bold text-muted-foreground"
                    >Partner Name</Label
                  >
                  <Input bind:value={partner.name} class="h-8 text-sm" />
                </div>
                <div class="space-y-1">
                  <Label
                    class="text-[10px] uppercase font-bold text-muted-foreground"
                    >Website</Label
                  >
                  <Input bind:value={partner.websiteUrl} class="h-8 text-sm" />
                </div>
                <div class="space-y-1">
                  <Label
                    class="text-[10px] uppercase font-bold text-muted-foreground"
                    >Partner Type</Label
                  >
                  <Input bind:value={partner.type} class="h-8 text-sm" />
                </div>
                <div class="space-y-1">
                  <Label
                    class="text-[10px] uppercase font-bold text-muted-foreground"
                    >Order</Label
                  >
                  <Input
                    type="number"
                    bind:value={partner.displayOrder}
                    class="h-8 text-sm"
                  />
                </div>
              </div>

              <div
                class="flex sm:flex-col items-center gap-2 w-full sm:w-auto justify-end sm:justify-start pt-2 sm:pt-0"
              >
                <form
                  action="?/savePartner"
                  method="POST"
                  use:enhance={() => {
                    return async ({ result }) => {
                      if (result.type === "success") {
                        toast.success("Partner updated");
                        invalidateAll();
                      } else {
                        toast.error("Failed to update partner");
                      }
                    };
                  }}
                >
                  <input type="hidden" name="id" value={partner.id} />
                  <input type="hidden" name="name" value={partner.name} />
                  <input
                    type="hidden"
                    name="websiteUrl"
                    value={partner.websiteUrl}
                  />
                  <input type="hidden" name="logoId" value={partner.logoId} />
                  <input type="hidden" name="type" value={partner.type} />
                  <input
                    type="hidden"
                    name="displayOrder"
                    value={partner.displayOrder}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    type="submit"
                    class="h-8 w-8 rounded-lg"
                  >
                    <Save class="size-4" />
                  </Button>
                </form>

                <form
                  action="?/deletePartner"
                  method="POST"
                  use:enhance={() => {
                    return async ({ result }) => {
                      if (result.type === "success") {
                        toast.success("Partner deleted");
                        invalidateAll();
                      } else {
                        toast.error("Failed to delete partner");
                      }
                    };
                  }}
                >
                  <input type="hidden" name="id" value={partner.id} />
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </form>
              </div>
            </div>
          {:else}
            <div
              class="h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground gap-2 opacity-50"
            >
              <ImageIcon class="size-8" />
              <p>No brands listed yet.</p>
            </div>
          {/each}
        </div>
      </SectionWrapper>

      <LadiesInTechEditor />
      <LadiesInTechArchiveEditor />
    </div>
  </div>
</div>
