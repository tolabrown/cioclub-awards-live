<script lang="ts">
  import type { PageProps } from "./$types";
  import type { Settings as SettingsType } from "$lib/db/schema";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import {
    Save,
    Store,
    Truck,
    CreditCard,
    Globe,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Loader2,
    Palette,
    Image as ImageIcon,
    Layout,
    Search,
    Type,
    CircleDashed,
  } from "@lucide/svelte";
  import FilePreview from "$lib/components/admin/FilePreview.svelte";

  import { toast } from "svelte-sonner";

  let { data }: PageProps = $props();
  const settings = $derived(data.settings || ({} as Partial<SettingsType>));

  let isSaving = $state(false);

  // Form State
  let storeName = $state("");
  let storeEmail = $state("");
  let storePhone = $state("");
  let storeAddress = $state("");
  let storeCaption = $state("");
  let currency = $state("NGN");
  let taxRate = $state("0");
  let maintenanceMode = $state(false);
  let facebookUrl = $state("");
  let twitterUrl = $state("");
  let instagramUrl = $state("");

  // Theme & Branding
  let primaryColor = $state("#9f5f80");
  let borderRadius = $state("0.75rem");
  let logoId = $state("");
  let logoLightId = $state("");
  let logoDarkId = $state("");
  let faviconId = $state("");

  // Hero
  let heroTitle = $state("");
  let heroSubtitle = $state("");
  let heroDescription = $state("");
  let heroImageId = $state("");

  // SEO
  let metaTitle = $state("");
  let metaDescription = $state("");

  $effect(() => {
    if (data.settings) {
      storeName = data.settings.storeName || "";
      storeEmail = data.settings.storeEmail || "";
      storePhone = data.settings.storePhone || "";
      storeAddress = data.settings.storeAddress?.addressLine1 || "";
      storeCaption = data.settings.storeCaption || "";
      currency = data.settings.currency || "NGN";
      taxRate = data.settings.taxRate || "0";
      maintenanceMode = data.settings.maintenanceMode || false;
      facebookUrl = data.settings.socialLinks?.facebook || "";
      twitterUrl = data.settings.socialLinks?.twitter || "";
      instagramUrl = data.settings.socialLinks?.instagram || "";

      primaryColor = data.settings.primaryColor || "oklch(0.623 0.214 259.815)";
      borderRadius = data.settings.borderRadius || "0.75rem";
      logoId = data.settings.logoId || "";
      logoLightId = data.settings.logoLightId || "";
      logoDarkId = data.settings.logoDarkId || "";
      faviconId = data.settings.faviconId || "";

      heroTitle = data.settings.heroTitle || "";
      heroSubtitle = data.settings.heroSubtitle || "";
      heroDescription = data.settings.heroDescription || "";
      heroImageId = data.settings.heroImageId || "";

      metaTitle = data.settings.metaTitle || "";
      metaDescription = data.settings.metaDescription || "";
    }
  });

  const radiusOptions = [
    { label: "None (0px)", value: "0" },
    { label: "Small (0.125rem)", value: "0.125rem" },
    { label: "Medium (0.375rem)", value: "0.375rem" },
    { label: "Large (0.5rem)", value: "0.5rem" },
    { label: "Extra Large (0.75rem)", value: "0.75rem" },
  ];
</script>

<div class="space-y-6 pb-20">
  <div
    class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-foreground">
        Global Settings
      </h1>
      <p class="text-muted-foreground">
        Tailor your commerce platform to your brand identity.
      </p>
    </div>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      isSaving = true;
      return async ({ result }) => {
        isSaving = false;
        if (result.type === "success") {
          toast.success("Settings updated successfully");
          await invalidateAll();
        } else {
          toast.error("Failed to save settings");
        }
      };
    }}
  >
    <!-- Sticky Save Button -->
    <div class="fixed bottom-6 right-6 z-50">
      <Button
        type="submit"
        size="lg"
        class="rounded-full px-8 font-bold"
        disabled={isSaving}
      >
        {#if isSaving}
          <Loader2 class="mr-2 h-5 w-5 animate-spin" />
          Saving...
        {:else}
          <Save class="mr-2 h-5 w-5" />
          Save Changes
        {/if}
      </Button>
    </div>

    <Tabs.Root value="general" class="space-y-6">
      <div class="overflow-x-auto pb-1">
        <Tabs.List
          class="inline-flex w-full sm:w-auto h-12 p-1 bg-muted/50 rounded-xl"
        >
          <Tabs.Trigger
            value="general"
            class="rounded-lg px-6 font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Store class="mr-2 h-4 w-4" />
            General
          </Tabs.Trigger>
          <Tabs.Trigger
            value="branding"
            class="rounded-lg px-6 font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <ImageIcon class="mr-2 h-4 w-4" />
            Branding
          </Tabs.Trigger>
          <Tabs.Trigger
            value="theme"
            class="rounded-lg px-6 font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Palette class="mr-2 h-4 w-4" />
            Theme
          </Tabs.Trigger>
          <Tabs.Trigger
            value="hero"
            class="rounded-lg px-6 font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Layout class="mr-2 h-4 w-4" />
            Hero
          </Tabs.Trigger>
          <Tabs.Trigger
            value="seo"
            class="rounded-lg px-6 font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Search class="mr-2 h-4 w-4" />
            SEO
          </Tabs.Trigger>
        </Tabs.List>
      </div>

      <!-- General Tab -->
      <Tabs.Content
        value="general"
        class="space-y-6 animate-in slide-in-from-bottom-2 duration-300"
      >
        <div class="grid gap-6 lg:grid-cols-3">
          <div class="lg:col-span-2 space-y-6">
            <Card.Root
              class="rounded-xl shadow-sm border-border overflow-hidden"
            >
              <Card.Header class="bg-muted/30 border-b border-border/50">
                <Card.Title class="text-lg font-bold">Store Profile</Card.Title>
                <Card.Description
                  >Primary contact details for your business.</Card.Description
                >
              </Card.Header>
              <Card.Content class="p-6 space-y-4">
                <div class="space-y-2">
                  <Label for="storeName" class="font-bold">Store Name</Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    bind:value={storeName}
                    placeholder="Enter your business name"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="storeCaption" class="font-bold"
                    >Store Caption (Subline)</Label
                  >
                  <Input
                    id="storeCaption"
                    name="storeCaption"
                    bind:value={storeCaption}
                    placeholder="Enter the subline text for the header"
                  />
                </div>
                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-2">
                    <Label for="storeEmail" class="font-bold"
                      >Contact Email</Label
                    >
                    <Input
                      id="storeEmail"
                      name="storeEmail"
                      type="email"
                      bind:value={storeEmail}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label for="storePhone" class="font-bold"
                      >Contact Phone</Label
                    >
                    <Input
                      id="storePhone"
                      name="storePhone"
                      bind:value={storePhone}
                      placeholder="+234 ..."
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label for="storeAddress" class="font-bold"
                    >Business Address</Label
                  >
                  <Textarea
                    id="storeAddress"
                    name="storeAddress"
                    bind:value={storeAddress}
                    rows={3}
                    placeholder="Full physical address"
                  />
                </div>
              </Card.Content>
            </Card.Root>

            <Card.Root
              class="rounded-xl shadow-sm border-border overflow-hidden"
            >
              <Card.Header class="bg-muted/30 border-b border-border/50">
                <Card.Title class="text-lg font-bold"
                  >Market Configuration</Card.Title
                >
                <Card.Description
                  >Configure your financial and operating settings.</Card.Description
                >
              </Card.Header>
              <Card.Content class="p-6 space-y-4">
                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-2">
                    <Label for="currency" class="font-bold"
                      >Default Currency</Label
                    >
                    <Input
                      id="currency"
                      name="currency"
                      bind:value={currency}
                      readonly
                      class="bg-muted"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label for="taxRate" class="font-bold">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      name="taxRate"
                      type="number"
                      step="0.01"
                      bind:value={taxRate}
                    />
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          </div>

          <div class="space-y-6">
            <Card.Root
              class="rounded-xl shadow-sm border-border overflow-hidden"
            >
              <Card.Header class="bg-muted/30 border-b border-border/50">
                <Card.Title class="text-lg font-bold">Status</Card.Title>
              </Card.Header>
              <Card.Content class="p-6">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label for="maintenanceMode" class="font-bold"
                      >Maintenance Mode</Label
                    >
                    <p class="text-xs text-muted-foreground">
                      Take the store offline for updates.
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    name="maintenanceMode"
                    bind:checked={maintenanceMode}
                  />
                </div>
              </Card.Content>
            </Card.Root>

            <Card.Root
              class="rounded-xl shadow-sm border-border overflow-hidden"
            >
              <Card.Header class="bg-muted/30 border-b border-border/50">
                <Card.Title class="text-lg font-bold">Social Media</Card.Title>
              </Card.Header>
              <Card.Content class="p-6 space-y-4">
                <div class="flex items-center gap-3">
                  <Facebook class="h-5 w-5 text-muted-foreground" />
                  <Input
                    name="facebookUrl"
                    bind:value={facebookUrl}
                    placeholder="Facebook URL"
                  />
                </div>
                <div class="flex items-center gap-3">
                  <Twitter class="h-5 w-5 text-muted-foreground" />
                  <Input
                    name="twitterUrl"
                    bind:value={twitterUrl}
                    placeholder="X URL"
                  />
                </div>
                <div class="flex items-center gap-3">
                  <Instagram class="h-5 w-5 text-muted-foreground" />
                  <Input
                    name="instagramUrl"
                    bind:value={instagramUrl}
                    placeholder="Instagram URL"
                  />
                </div>
              </Card.Content>
            </Card.Root>
          </div>
        </div>
      </Tabs.Content>

      <!-- Branding Tab -->
      <Tabs.Content
        value="branding"
        class="space-y-6 animate-in slide-in-from-bottom-2 duration-300"
      >
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card.Root class="rounded-xl shadow-sm border-border overflow-hidden">
            <Card.Header class="bg-muted/30 border-b border-border/50">
              <Card.Title
                class="flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-primary"
              >
                <Store class="h-4 w-4" />
                Logo (Light Mode)
              </Card.Title>
            </Card.Header>
            <Card.Content class="p-6 space-y-6">
              <div
                class="flex aspect-video items-center justify-center overflow-hidden bg-white rounded-lg border"
              >
                <FilePreview fileId={logoLightId} />
              </div>
              <div class="space-y-2">
                <Label for="logoLightId" class="font-bold">File ID</Label>
                <Input
                  id="logoLightId"
                  name="logoLightId"
                  bind:value={logoLightId}
                  placeholder="Paste ID for light mode"
                />
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root class="rounded-xl shadow-sm border-border overflow-hidden">
            <Card.Header class="bg-muted/30 border-b border-border/50">
              <Card.Title
                class="flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-primary"
              >
                <Store class="h-4 w-4" />
                Logo (Dark Mode)
              </Card.Title>
            </Card.Header>
            <Card.Content class="p-6 space-y-6">
              <div
                class="flex aspect-video items-center justify-center overflow-hidden bg-slate-950 rounded-lg border border-slate-800"
              >
                <FilePreview fileId={logoDarkId} />
              </div>
              <div class="space-y-2">
                <Label for="logoDarkId" class="font-bold">File ID</Label>
                <Input
                  id="logoDarkId"
                  name="logoDarkId"
                  bind:value={logoDarkId}
                  placeholder="Paste ID for dark mode"
                />
              </div>
            </Card.Content>
          </Card.Root>

          <!-- Legacy / Default Logo (Hidden or kept for compat) -->
          <input type="hidden" name="logoId" value={logoId} />

          <Card.Root class="rounded-xl shadow-sm border-border overflow-hidden">
            <Card.Header class="bg-muted/30 border-b border-border/50">
              <Card.Title
                class="flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-primary"
              >
                <Type class="h-4 w-4" />
                Browser Icon (Favicon)
              </Card.Title>
            </Card.Header>
            <Card.Content class="p-6 space-y-6">
              <div
                class="flex h-32 items-center justify-center overflow-hidden"
              >
                <FilePreview fileId={faviconId} />
              </div>
              <div class="space-y-2">
                <Label for="faviconId" class="font-bold">File ID</Label>
                <Input
                  id="faviconId"
                  name="faviconId"
                  bind:value={faviconId}
                  placeholder="Enter file ID from Media Library"
                />
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      </Tabs.Content>

      <!-- Theme Tab -->
      <Tabs.Content
        value="theme"
        class="space-y-6 animate-in slide-in-from-bottom-2 duration-300"
      >
        <Card.Root
          class="rounded-xl shadow-lg border-border overflow-hidden bg-gradient-to-br from-background to-primary/5"
        >
          <Card.Header class="bg-muted/30 border-b border-border/50">
            <Card.Title class="flex items-center gap-2">
              <Palette class="h-5 w-5 text-primary" />
              Visual Style
            </Card.Title>
            <Card.Description
              >Define the look and feel of your storefront.</Card.Description
            >
          </Card.Header>
          <Card.Content class="p-8 space-y-8">
            <div class="grid gap-12 lg:grid-cols-2">
              <!-- Color Selection -->
              <div class="space-y-6">
                <div class="space-y-1">
                  <h3 class="text-lg font-bold">Primary Color</h3>
                  <p class="text-sm text-muted-foreground">
                    Used for buttons, links, and highlights.
                  </p>
                </div>
                <div class="flex items-center gap-6">
                  <input
                    type="color"
                    id="primaryColorPicker"
                    bind:value={primaryColor}
                    class="h-16 w-16 cursor-pointer rounded-xl border-4 border-background shadow-lg"
                  />
                  <div class="flex-1 space-y-2">
                    <Input
                      name="primaryColor"
                      bind:value={primaryColor}
                      class="font-mono font-bold"
                    />
                    <p
                      class="text-[10px] uppercase font-black text-muted-foreground tracking-widest"
                    >
                      Hex or OKLCH Code
                    </p>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  {#each ["oklch(0.623 0.214 259.815)", "oklch(0.645 0.246 16.439)", "oklch(0.577 0.245 27.325)", "oklch(0.696 0.17 162.48)", "oklch(0.488 0.243 264.376)"] as color}
                    <button
                      type="button"
                      class="h-8 w-8 rounded-full border shadow-sm transition-transform hover:scale-110"
                      style="background: {color}"
                      onclick={() => (primaryColor = color)}
                      aria-label="Select theme color {color}"
                    ></button>
                  {/each}
                </div>
              </div>

              <!-- Border Radius Selection -->
              <div class="space-y-6">
                <div class="space-y-1">
                  <h3 class="text-lg font-bold">Interface Roundness</h3>
                  <p class="text-sm text-muted-foreground">
                    Controls the corner radius of cards and inputs.
                  </p>
                </div>
                <div class="space-y-4">
                  <input
                    type="hidden"
                    name="borderRadius"
                    value={borderRadius}
                  />
                  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {#each radiusOptions as opt}
                      <button
                        type="button"
                        class="flex flex-col items-center gap-2 p-3 rounded-lg border transition-all {borderRadius ===
                        opt.value
                          ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                          : 'bg-card hover:bg-muted'}"
                        onclick={() => (borderRadius = opt.value)}
                      >
                        <div
                          class="h-6 w-12 border-2 border-current"
                          style="border-radius: {opt.value}"
                        ></div>
                        <span class="text-xs">{opt.label.split(" ")[0]}</span>
                      </button>
                    {/each}
                  </div>
                </div>
              </div>
            </div>

            <!-- Visual Preview Section (Mockup) -->
            <div class="pt-8 border-t border-border/50">
              <h3
                class="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 text-center"
              >
                Live Component Preview
              </h3>
              <div
                class="grid gap-8 rounded-2xl bg-muted/20 p-8 border border-border/50 lg:grid-cols-2"
              >
                <div class="space-y-4">
                  <div
                    class="p-6 shadow-lg border bg-card"
                    style="border-radius: {borderRadius}"
                  >
                    <h4 class="font-bold text-foreground mb-2">Sample Card</h4>
                    <p class="text-sm text-muted-foreground mb-4">
                      This mockup demonstrates how your settings will impact the
                      storefront UI elements.
                    </p>
                    <Button
                      style="background: {primaryColor}; border-radius: {borderRadius}; color: white"
                      >Primary Action</Button
                    >
                  </div>
                </div>
                <div class="flex items-center justify-center gap-4">
                  <div
                    class="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-primary"
                    style="color: {primaryColor}"
                  >
                    <Palette class="h-6 w-6" />
                  </div>
                  <div
                    class="h-2 w-32 bg-border relative rounded-full overflow-hidden"
                  >
                    <div
                      class="absolute inset-0 bg-primary h-full"
                      style="background: {primaryColor}; width: 65%"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      </Tabs.Content>

      <!-- Hero Tab -->
      <Tabs.Content
        value="hero"
        class="space-y-6 animate-in slide-in-from-bottom-2 duration-300"
      >
        <Card.Root class="rounded-xl shadow-sm border-border overflow-hidden">
          <Card.Header class="bg-muted/30 border-b border-border/50">
            <Card.Title class="flex items-center gap-2">
              <Layout class="h-5 w-5 text-primary" />
              Homepage Hero
            </Card.Title>
            <Card.Description
              >Configure the main introduction section on your homepage.</Card.Description
            >
          </Card.Header>
          <Card.Content class="p-6 space-y-6">
            <div class="grid gap-6 lg:grid-cols-2">
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label for="heroSubtitle" class="font-bold"
                    >Subtitle / Badge</Label
                  >
                  <Input
                    id="heroSubtitle"
                    name="heroSubtitle"
                    bind:value={heroSubtitle}
                    placeholder="Featured Selection"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="heroTitle" class="font-bold">Main Title</Label>
                  <Input
                    id="heroTitle"
                    name="heroTitle"
                    bind:value={heroTitle}
                    placeholder="Experience Retail Redefined"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="heroDescription" class="font-bold"
                    >Description Text</Label
                  >
                  <Textarea
                    id="heroDescription"
                    name="heroDescription"
                    bind:value={heroDescription}
                    rows={4}
                    placeholder="Tell your store's story in a few sentences..."
                  />
                </div>
              </div>
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label for="heroImageId" class="font-bold"
                    >Background Image (File ID)</Label
                  >
                  <Input
                    id="heroImageId"
                    name="heroImageId"
                    bind:value={heroImageId}
                    placeholder="Enter file ID"
                  />
                </div>
                <div
                  class="aspect-video flex flex-col items-center justify-center overflow-hidden"
                >
                  <FilePreview fileId={heroImageId} />
                </div>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      </Tabs.Content>

      <!-- SEO Tab -->
      <Tabs.Content
        value="seo"
        class="space-y-6 animate-in slide-in-from-bottom-2 duration-300"
      >
        <Card.Root class="rounded-xl shadow-sm border-border overflow-hidden">
          <Card.Header class="bg-muted/30 border-b border-border/50">
            <Card.Title class="flex items-center gap-2">
              <Search class="h-5 w-5 text-primary" />
              Search Engine Optimization
            </Card.Title>
            <Card.Description
              >Optimize how your store appears in Google and social shares.</Card.Description
            >
          </Card.Header>
          <Card.Content class="p-6 space-y-4">
            <div class="space-y-2">
              <Label for="metaTitle" class="font-bold">Meta Title</Label>
              <Input
                id="metaTitle"
                name="metaTitle"
                bind:value={metaTitle}
                placeholder="Brand Name | Premium E-commerce"
              />
              <p class="text-[10px] text-muted-foreground font-medium">
                Recommended: 50-60 characters
              </p>
            </div>
            <div class="space-y-2">
              <Label for="metaDescription" class="font-bold"
                >Meta Description</Label
              >
              <Textarea
                id="metaDescription"
                name="metaDescription"
                bind:value={metaDescription}
                rows={4}
                placeholder="Describe what makes your store unique..."
              />
              <p class="text-[10px] text-muted-foreground font-medium">
                Recommended: 150-160 characters
              </p>
            </div>

            <!-- Preview Mockup -->
            <div class="mt-8 pt-8 border-t">
              <h4
                class="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4"
              >
                Google Preview
              </h4>
              <div class="max-w-xl space-y-1">
                <p
                  class="text-[14px] text-[#1a0dab] font-medium leading-tight hover:underline cursor-pointer truncate"
                >
                  {metaTitle || "Brand Name | Shop Online"}
                </p>
                <p class="text-[12px] text-[#006621] leading-tight">
                  https://{storeName.toLowerCase().replace(/\s/g, "-")}.com
                </p>
                <p class="text-[13px] text-[#545454] leading-snug line-clamp-2">
                  {metaDescription ||
                    "Experience the best in retail with our premium selection of products. Quality and style meet convenience at our online store."}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      </Tabs.Content>
    </Tabs.Root>
  </form>
</div>
