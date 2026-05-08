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
    Users,
    LayoutDashboard,
    Sparkles,
    ShieldCheck,
    Quote,
    Linkedin,
    Plus,
    Trash2,
    Loader2,
    ImageIcon,
    Upload,
    UserCircle,
    Pencil,
    Search,
    X,
  } from "@lucide/svelte";
  import EditorHeader from "$lib/components/admin/editor/EditorHeader.svelte";
  import EditorJumpLinks from "$lib/components/admin/editor/EditorJumpLinks.svelte";
  import SEOSection from "$lib/components/admin/editor/SEOSection.svelte";
  import SectionWrapper from "$lib/components/admin/editor/SectionWrapper.svelte";
  import { invalidateAll } from "$app/navigation";
  import * as Drawer from "$lib/components/ui/drawer";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";

  let { data }: PageProps = $props();

  let isSubmitting = $state(false);
  let isUploadingOg = $state(false);
  let uploadingImageKey = $state<string | null>(null);

  // Trustee CRUD state
  let isEditingTrustee = $state(false);
  let isSavingTrustee = $state(false);
  let isDeletingImage = $state(false);
  let isDeletingQuoteImage = $state(false);
  let trusteeSearch = $state("");
  let editingTrustee = $state({
    id: "new",
    name: "",
    position: "",
    role: "",
    bio: "",
    imageId: "",
    image: "",
    linkedinUrl: "",
    displayOrder: 0,
  });

  // Page Content state
  let pageTitle = $state("Our Leadership - CIO Club Africa");
  let pageDescription = $state(
    "Meet the visionaries driving the digital empowered future of Africa.",
  );
  let ogImage = $state("");

  let content = $state({
    hero: {
      badge: "Governance & Leadership",
      title: "Our Leadership",
      description: "Meet the distinguished visionaries...",
    },
    sections: [] as any[],
    values: {
      title: "Guided by Excellence",
      subtitle: "Our leadership team operates under a shared vision...",
      items: [] as any[],
    },
    quote: {
      text: "We are defined by the impact of our decisions today...",
      author: "Abiola Laseinde",
      role: "Founder's Vision",
      image:
        "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1770778607374-abiola_laseinde.webp&version_id=null",
      imageId: "",
    },
  });

  // Filtered trustees
  let filteredTrustees = $derived(
    data.trustees?.filter(
      (t: any) =>
        t.name?.toLowerCase().includes(trusteeSearch.toLowerCase()) ||
        t.position?.toLowerCase().includes(trusteeSearch.toLowerCase()),
    ) || [],
  );

  // Sync data from server
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || "Our Leadership - CIO Club Africa";
        pageDescription = meta.description || "Meet the visionaries...";
        ogImage = meta.ogImage || "";
      });
    }
    if (data.content) {
      untrack(() => {
        content = {
          hero: { ...content.hero, ...data.content.hero },
          sections: data.content.sections || [],
          values: {
            title: data.content.values?.title || content.values.title,
            subtitle: data.content.values?.subtitle || content.values.subtitle,
            items: data.content.values?.items || [],
          },
          quote: {
            ...content.quote,
            ...data.content.quote,
          },
        };
      });
    }
  });

  async function handleSavePage() {
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
        toast.success("Page configuration saved");
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

  function openAddTrustee() {
    editingTrustee = {
      id: "new",
      name: "",
      position: "",
      role: "",
      bio: "",
      imageId: "",
      image: "",
      linkedinUrl: "",
      displayOrder: data.trustees?.length || 0,
    };
    isEditingTrustee = true;
  }

  function openEditTrustee(t: any) {
    editingTrustee = { ...t, linkedinUrl: t.linkedinUrl || "" };
    isEditingTrustee = true;
  }

  async function handleUpsertTrustee() {
    isSavingTrustee = true;
    const formData = new FormData();
    Object.entries(editingTrustee).forEach(([key, value]) => {
      formData.append(key, value?.toString() || "");
    });

    try {
      const response = await fetch("?/upsertTrustee", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text());
      if (result.type === "success") {
        toast.success("Trustee saved successfully");
        isEditingTrustee = false;
        await invalidateAll();
      } else {
        toast.error("Failed to save trustee");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      isSavingTrustee = false;
    }
  }

  async function handleDeleteTrustee(id: string) {
    if (!confirm("Are you sure you want to delete this trustee?")) return;
    const formData = new FormData();
    formData.append("id", id);
    try {
      const response = await fetch("?/deleteTrustee", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text());
      if (result.type === "success") {
        toast.success("Trustee deleted");
        await invalidateAll();
      } else {
        toast.error("Failed to delete trustee");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  }

  async function handleDeleteImage() {
    if (!editingTrustee.imageId) return;
    if (!confirm("Permanently delete this photo from storage?")) return;

    isDeletingImage = true;
    const formData = new FormData();
    formData.append("imageId", editingTrustee.imageId);

    try {
      const response = await fetch("?/deleteImage", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      if (result.type === "success") {
        editingTrustee.image = "";
        editingTrustee.imageId = "";
        toast.success("Image deleted permanently");
      } else {
        toast.error("Failed to delete image");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      isDeletingImage = false;
    }
  }

  async function handleDeleteQuoteImage() {
    if (!content.quote.imageId) {
      // If we don't have an imageId but have an image URL, we should still allow clearing from UI
      content.quote.image = "";
      return;
    }
    if (!confirm("Permanently delete this leadership photo?")) return;

    isDeletingQuoteImage = true;
    const formData = new FormData();
    formData.append("imageId", content.quote.imageId);

    try {
      const response = await fetch("?/deleteImage", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      if (result.type === "success") {
        content.quote.image = "";
        content.quote.imageId = "";
        toast.success("Image deleted permanently");
      } else {
        toast.error("Failed to delete image");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      isDeletingQuoteImage = false;
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
        maxWidth: 800,
        maxHeight: 1000,
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
        const id = result.data.image.id;
        if (key === "og") ogImage = url;
        else if (key === "quote") {
          content.quote.image = url;
          content.quote.imageId = id;
        } else if (key === "trustee") {
          editingTrustee.image = url;
          editingTrustee.imageId = id;
        }
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      toast.error("Failed to process image");
    } finally {
      isUploadingOg = false;
      uploadingImageKey = null;
      input.value = "";
    }
  }

  const jumpLinks = [
    { id: "seo", label: "SEO", icon: Sparkles },
    { id: "hero", label: "Hero", icon: LayoutDashboard },
    { id: "trustees", label: "Trustees", icon: Users },
    { id: "values", label: "Values", icon: Users },
    { id: "quote", label: "Quote", icon: Quote },
  ];
</script>

<div class="flex flex-col gap-6 pb-20 w-full">
  <EditorHeader
    title="Edit Leadership Team"
    {isSubmitting}
    onSave={handleSavePage}
  />

  <EditorJumpLinks links={jumpLinks} />

  <div class="space-y-6">
    <SEOSection
      bind:title={pageTitle}
      bind:description={pageDescription}
      bind:ogImage
      {isUploadingOg}
      onImageUpload={(e: any) => onImageUpload(e, "og")}
    />

    <Separator class="bg-border/40" />

    <!-- Hero -->
    <SectionWrapper
      id="hero"
      title="Hero Section"
      description="Customize the team page banner"
      icon={LayoutDashboard}
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Badge</Label
          >
          <Input bind:value={content.hero.badge} class="rounded-lg" />
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Title</Label
          >
          <Input bind:value={content.hero.title} class="rounded-lg" />
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
          class="rounded-lg"
        />
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Trustee Management -->
    <SectionWrapper
      id="trustees"
      title="Team Members"
      description="Manage trustees and key personnel"
      icon={Users}
    >
      {#snippet headerAction()}
        <Button
          variant="default"
          size="sm"
          onclick={openAddTrustee}
          class="gap-2 shadow-sm rounded-lg"
        >
          <Plus class="size-4" /> Add Member
        </Button>
      {/snippet}

      <div class="space-y-4">
        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          />
          <Input
            placeholder="Search members..."
            bind:value={trusteeSearch}
            class="pl-10 rounded-xl"
          />
        </div>

        <div class="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table.Root>
            <Table.Header class="bg-muted/30">
              <Table.Row>
                <Table.Head class="w-12"></Table.Head>
                <Table.Head>Member</Table.Head>
                <Table.Head>Position / Role</Table.Head>
                <Table.Head class="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each filteredTrustees as t}
                <Table.Row class="group transition-colors">
                  <Table.Cell>
                    <div
                      class="size-10 rounded-full overflow-hidden bg-muted border shadow-sm"
                    >
                      {#if t.image}
                        <img
                          src={t.image}
                          alt={t.name}
                          class="w-full h-full object-cover"
                        />
                      {:else}
                        <div
                          class="w-full h-full flex items-center justify-center opacity-40"
                        >
                          <UserCircle class="size-6" />
                        </div>
                      {/if}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div class="font-bold text-foreground">
                      {t.name}
                      {#if t.linkedinUrl}
                        <a
                          href={t.linkedinUrl}
                          target="_blank"
                          class="inline-flex ml-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Linkedin class="size-3" />
                        </a>
                      {/if}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      Order: {t.displayOrder}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="secondary" class="font-medium"
                      >{t.position}</Badge
                    >
                    {#if t.role}
                      <span class="text-xs text-muted-foreground ml-2"
                        >/ {t.role}</span
                      >
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="text-right">
                    <div class="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        class="size-8"
                        onclick={() => openEditTrustee(t)}
                      >
                        <Pencil class="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="size-8 text-destructive"
                        onclick={() => handleDeleteTrustee(t.id)}
                      >
                        <Trash2 class="size-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              {:else}
                <Table.Row>
                  <Table.Cell
                    colspan={4}
                    class="h-24 text-center text-muted-foreground"
                  >
                    No members found.
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      </div>
    </SectionWrapper>

    <Drawer.Root bind:open={isEditingTrustee}>
      <Drawer.Content class="max-h-[96vh] rounded-t-xl">
        <div class="mx-auto w-full max-w-2xl overflow-y-auto px-6 py-8">
          <Drawer.Header class="px-0">
            <Drawer.Title class="text-3xl font-bold tracking-tight">
              {editingTrustee.id === "new" ? "Add Team Member" : "Edit Member"}
            </Drawer.Title>
            <Drawer.Description class="text-lg">
              Provide the professional details of the team member.
            </Drawer.Description>
          </Drawer.Header>

          <div class="grid gap-8 py-8">
            <div class="flex flex-col md:flex-row gap-10">
              <div class="flex flex-col items-center gap-4">
                <div
                  class="relative size-40 rounded-xl overflow-hidden bg-muted border-2 border-dashed border-primary/20 group shadow-lg transition-all hover:border-primary/40"
                >
                  {#if editingTrustee.image}
                    <img
                      src={editingTrustee.image}
                      alt="Preview"
                      class="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      class="absolute top-2 right-2 size-8 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onclick={handleDeleteImage}
                      disabled={isDeletingImage}
                    >
                      {#if isDeletingImage}
                        <Loader2 class="size-4 animate-spin" />
                      {:else}
                        <Trash2 class="size-4" />
                      {/if}
                    </Button>
                  {:else}
                    <div
                      class="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center"
                    >
                      <UserCircle class="size-16 mb-2 opacity-10" />
                      <span
                        class="text-xs uppercase font-bold tracking-widest opacity-40"
                        >No Photo</span
                      >
                    </div>
                  {/if}
                  <label
                    class="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer"
                  >
                    <Upload class="size-8 text-white mb-2" />
                    <span
                      class="text-xs text-white font-bold uppercase tracking-wider"
                      >Upload Photo</span
                    >
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      onchange={(e) => onImageUpload(e, "trustee")}
                    />
                  </label>
                  {#if uploadingImageKey === "trustee"}
                    <div
                      class="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
                    >
                      <Loader2 class="size-8 animate-spin text-primary" />
                    </div>
                  {/if}
                </div>
                <p class="text-xs text-muted-foreground font-medium">
                  Recommended: Square Aspect Ratio
                </p>
              </div>

              <div class="flex-1 space-y-6">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label
                      class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                      >Full Name</Label
                    >
                    <Input
                      bind:value={editingTrustee.name}
                      placeholder="Abiola Laseinde"
                      class="rounded-lg"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label
                      class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                      >Primary Position</Label
                    >
                    <Input
                      bind:value={editingTrustee.position}
                      placeholder="Founder & Chairwoman"
                      class="rounded-lg"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label
                      class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                      >Specific Role</Label
                    >
                    <Input
                      bind:value={editingTrustee.role}
                      placeholder="Strategic Director"
                      class="rounded-lg"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label
                      class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                      >Display Order</Label
                    >
                    <Input
                      type="number"
                      bind:value={editingTrustee.displayOrder}
                      class="rounded-lg"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label
                    class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                    >LinkedIn URL</Label
                  >
                  <Input
                    bind:value={editingTrustee.linkedinUrl}
                    placeholder="https://linkedin.com/in/..."
                    class="rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >Professional Bio</Label
              >
              <Textarea
                bind:value={editingTrustee.bio}
                rows={6}
                placeholder="Detailed biography highlighting expertise and leadership..."
                class="rounded-xl bg-muted/10 focus:bg-background transition-all font-medium"
              />
            </div>
          </div>

          <Drawer.Footer class="px-0 flex-row justify-end gap-3 pt-6 border-t">
            <Drawer.Close>
              <Button variant="ghost" class="rounded-lg">Cancel</Button>
            </Drawer.Close>
            <Button
              disabled={isSavingTrustee}
              onclick={handleUpsertTrustee}
              class="rounded-lg min-w-35 shadow-lg"
            >
              {#if isSavingTrustee}
                <Loader2 class="size-4 animate-spin mr-2" /> Saving...
              {:else}
                Save Member
              {/if}
            </Button>
          </Drawer.Footer>
        </div>
      </Drawer.Content>
    </Drawer.Root>

    <Separator class="bg-border/40" />

    <!-- Values -->
    <SectionWrapper
      id="values"
      title="Institutional Values"
      description="Define the pillars of leadership"
      icon={Users}
    >
      <div class="grid gap-10 lg:grid-cols-5">
        <div class="lg:col-span-2 space-y-6">
          <div class="space-y-2">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Section Title</Label
            >
            <Input bind:value={content.values.title} class="rounded-lg" />
          </div>
          <div class="space-y-2">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Core Narrative</Label
            >
            <Textarea
              bind:value={content.values.subtitle}
              rows={4}
              class="rounded-lg"
            />
          </div>
        </div>
        <div class="lg:col-span-3 space-y-4">
          <div class="flex items-center justify-between pb-2">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Strategic Pillars</Label
            >
            <Button
              variant="ghost"
              size="sm"
              onclick={() =>
                (content.values.items = [
                  ...content.values.items,
                  { title: "New Pillar", desc: "" },
                ])}
              class="text-primary h-8 gap-1 rounded-lg hover:bg-primary/5"
            >
              <Plus class="size-3" /> Add Pillar
            </Button>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            {#each content.values.items as val, i}
              <div
                class="p-5 rounded-xl border bg-card/50 shadow-sm relative group hover:border-primary/20 transition-all"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  class="absolute -top-2 -right-2 size-7 p-1 bg-background border shadow-sm rounded-full opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                  onclick={() =>
                    (content.values.items = content.values.items.filter(
                      (_, idx) => idx !== i,
                    ))}
                >
                  <Trash2 class="size-3" />
                </Button>
                <Input
                  bind:value={val.title}
                  class="font-bold border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 mb-1"
                  placeholder="Pillar Title"
                />
                <Textarea
                  bind:value={val.desc}
                  rows={2}
                  class="text-xs border-0 bg-transparent p-0 focus-visible:ring-0 text-muted-foreground resize-none"
                  placeholder="Describe the value..."
                />
              </div>
            {/each}
          </div>
        </div>
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Quote -->
    <SectionWrapper
      id="quote"
      title="Leadership Statement"
      description="Featured quote or vision statement"
      icon={Quote}
    >
      <div class="grid gap-8 md:grid-cols-3">
        <div class="space-y-4">
          <div
            class="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted group shadow-md border"
          >
            {#if content.quote.image}
              <img
                src={content.quote.image}
                alt="Quote Author"
                class="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                class="absolute top-2 right-2 size-8 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onclick={handleDeleteQuoteImage}
                disabled={isDeletingQuoteImage}
              >
                {#if isDeletingQuoteImage}
                  <Loader2 class="size-4 animate-spin" />
                {:else}
                  <Trash2 class="size-4" />
                {/if}
              </Button>
            {:else}
              <div
                class="w-full h-full flex flex-col items-center justify-center text-muted-foreground"
              >
                <ImageIcon class="size-8 mb-2 opacity-20" />
                <span class="text-xs font-bold uppercase">No Image</span>
              </div>
            {/if}
            <label
              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
            >
              <Upload class="size-6 text-white" />
              <input
                type="file"
                accept="image/*"
                class="hidden"
                onchange={(e) => onImageUpload(e, "quote")}
              />
            </label>
            {#if uploadingImageKey === "quote"}
              <div
                class="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
              >
                <Loader2 class="size-6 animate-spin text-primary" />
              </div>
            {/if}
          </div>
        </div>
        <div class="md:col-span-2 space-y-6">
          <div class="space-y-2">
            <Label
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Statement Text</Label
            >
            <Textarea
              bind:value={content.quote.text}
              rows={5}
              class="rounded-xl text-lg italic tracking-tight font-medium"
            />
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >Attribution Name</Label
              >
              <Input
                bind:value={content.quote.author}
                class="rounded-lg h-10"
              />
            </div>
            <div class="space-y-2">
              <Label
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >Attribution Subtitle</Label
              >
              <Input bind:value={content.quote.role} class="rounded-lg h-10" />
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  </div>
</div>
