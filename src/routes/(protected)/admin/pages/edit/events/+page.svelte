<script lang="ts">
  import type { PageProps } from "./$types";
  import { deserialize } from "$app/forms";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$lib/components/ui/select";
  import { toast } from "svelte-sonner";
  import { untrack } from "svelte";
  import { resizeImage } from "$lib/authentication/imageresize";
  import {
    Calendar,
    LayoutDashboard,
    Sparkles,
    Users,
    MapPin,
    Plus,
    Trash2,
    ImageIcon,
    Upload,
    Loader2,
    Search,
    Edit3,
    Clock,
    CheckCircle2,
    AlertCircle,
  } from "@lucide/svelte";
  import EditorHeader from "$lib/components/admin/editor/EditorHeader.svelte";
  import EditorJumpLinks from "$lib/components/admin/editor/EditorJumpLinks.svelte";
  import SEOSection from "$lib/components/admin/editor/SEOSection.svelte";
  import SectionWrapper from "$lib/components/admin/editor/SectionWrapper.svelte";
  import { invalidateAll } from "$app/navigation";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import SearchableSelect from "$lib/components/ui/searchable-select/searchable-select.svelte";

  let { data }: PageProps = $props();
  const isMobile = new IsMobile();

  let isSubmitting = $state(false);
  let isUploadingOg = $state(false);

  // Layout State
  let pageTitle = $state("Events & Leadership - CIO Club Africa");
  let pageDescription = $state("Connecting Continental Visionaries");
  let ogImage = $state("");

  let content = $state({
    hero: {
      badge: "Events & Leadership",
      title: "Connecting Continental Visionaries",
      description: "Discover our annual initiatives...",
    },
    board: [] as any[], // Now stores list of trustee IDs or objects
  });

  // Event Management State
  let searchQuery = $state("");
  let selectedYear = $state("all");
  let isEditingEvent = $state(false);
  let currentEvent = $state<any>(null);
  let isSavingEvent = $state(false);
  
  let eventImageFile = $state<File | null>(null);
  let eventImagePreview = $state("");
  
  let eventCoverImageFile = $state<File | null>(null);
  let eventCoverImagePreview = $state("");

  // Filtered events
  let filteredEvents = $derived(
    data.events.filter((e: any) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear =
        selectedYear === "all" ||
        new Date(e.date).getFullYear().toString() === selectedYear;
      return matchesSearch && matchesYear;
    }),
  );

  // Sync data from server
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || "Events & Leadership - CIO Club Africa";
        pageDescription =
          meta.description || "Connecting Continental Visionaries";
        ogImage = meta.ogImage || "";
      });
    }
    if (data.content) {
      untrack(() => {
        content = {
          hero: { ...content.hero, ...data.content.hero },
          board: data.content.board || [],
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

      const result = deserialize(await response.text()) as any;

      if (result.type === "success") {
        toast.success("Page layout saved");
        await invalidateAll();
      } else {
        toast.error("Failed to save layout");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      isSubmitting = false;
    }
  }

  function openEventModal(event: any = null) {
    if (event) {
      currentEvent = {
        ...event,
        date: new Date(
          new Date(event.date).getTime() -
            new Date(event.date).getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16),
      };
      eventImagePreview = event.image?.url || "";
      eventCoverImagePreview = event.coverImage?.url || "";
    } else {
      currentEvent = {
        title: "",
        description: "",
        date: new Date(
          new Date().getTime() - new Date().getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16),
        location: "",
        status: "upcoming",
        imageId: null,
        coverImageId: null,
        registrationLink: "",
      };
      eventImagePreview = "";
      eventCoverImagePreview = "";
    }
    eventImageFile = null;
    eventCoverImageFile = null;
    isEditingEvent = true;
  }

  async function handleSaveEvent() {
    isSavingEvent = true;
    const formData = new FormData();
    if (currentEvent.id) formData.append("id", currentEvent.id);
    formData.append("title", currentEvent.title);
    formData.append("description", currentEvent.description);
    formData.append("date", currentEvent.date);
    formData.append("location", currentEvent.location);
    formData.append("status", currentEvent.status);
    formData.append("registrationLink", currentEvent.registrationLink || "");
    formData.append("imageId", currentEvent.imageId || "");
    formData.append("coverImageId", currentEvent.coverImageId || "");

    if (eventImageFile) {
      formData.append("image", eventImageFile);
    }
    if (eventCoverImageFile) {
      formData.append("coverImage", eventCoverImageFile);
    }

    try {
      const response = await fetch("?/saveEvent", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text()) as any;

      if (result.type === "success") {
        toast.success("Event saved");
        isEditingEvent = false;
        await invalidateAll();
      } else {
        const errorMsg = result.data?.error || "Failed to save event";
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("Error saving event");
    } finally {
      isSavingEvent = false;
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const formData = new FormData();
    formData.append("id", id);

    try {
      const response = await fetch("?/deleteEvent", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text()) as any;

      if (result.type === "success") {
        toast.success("Event deleted");
        await invalidateAll();
      } else {
        const errorMsg = result.data?.error || "Delete failed";
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("Error deleting event");
    }
  }

  async function onImageUpload(e: Event, key: string) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (key === "og") {
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
          toast.success("OG image uploaded");
        } else {
          toast.error("Upload failed");
        }
      } catch (error) {
        toast.error("Process error");
      } finally {
        isUploadingOg = false;
      }
    } else if (key === "event") {
      eventImageFile = file;
      eventImagePreview = URL.createObjectURL(file);
    } else if (key === "cover") {
      eventCoverImageFile = file;
      eventCoverImagePreview = URL.createObjectURL(file);
    }
    input.value = "";
  }

  async function upload(file: File) {
    const resized = await resizeImage(file, {
      maxWidth: 1200,
      quality: 0.8,
      format: "webp",
    });
    const formData = new FormData();
    formData.append("image", resized);
    const res = await fetch("?/uploadImage", {
      method: "POST",
      body: formData,
    });
    const result = deserialize(await res.text()) as any;
    if (result.type === "success") return result.data.image;
    toast.error("Upload failed");
    return null;
  }

  async function fetchTrustees(q: string) {
    const formData = new FormData();
    formData.append("q", q);
    const res = await fetch(`?/searchTrustees&q=${encodeURIComponent(q)}`, {
      method: "POST",
      body: formData,
    });
    const result = deserialize(await res.text()) as any;
    return result.data?.results || [];
  }

  function addTrustee() {
    content.board = [
      ...content.board,
      { trusteeId: "", title: "", trustee: null },
    ];
  }

  function removeTrustee(index: number) {
    content.board = content.board.filter((_, i) => i !== index);
  }

  const jumpLinks = [
    { id: "seo", label: "SEO", icon: Sparkles },
    { id: "hero", label: "Hero", icon: LayoutDashboard },
    { id: "events", label: "Events Registry", icon: Calendar },
    { id: "board", label: "Board", icon: Users },
  ];
</script>

<div class="flex flex-col gap-4 pb-20 w-full">
  <EditorHeader
    title="Edit Events Page"
    {isSubmitting}
    onSave={handleSavePage}
  />

  <EditorJumpLinks links={jumpLinks} />

  <div class="space-y-4">
    <SEOSection
      bind:title={pageTitle}
      bind:description={pageDescription}
      bind:ogImage
      {isUploadingOg}
      onImageUpload={(e: any) => onImageUpload(e, "og")}
    />

    <Separator class="bg-border/40" />

    <!-- Hero Section -->
    <SectionWrapper
      id="hero"
      title="Hero Section"
      description="Main banner of the events page"
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
            placeholder="Events & Leadership"
          />
        </div>
        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Main Title</Label
          >
          <Input
            bind:value={content.hero.title}
            placeholder="Connecting Visionaries"
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

    <!-- Events Registry Grid -->
    <SectionWrapper
      id="events"
      title="Events Registry"
      description="Register and manage upcoming and past events"
      icon={Calendar}
    >
      {#snippet headerAction()}
        <Button
          size="sm"
          onclick={() => openEventModal()}
          class="gap-2 rounded-xl"
        >
          <Plus class="size-4" /> Add Event
        </Button>
      {/snippet}

      <div class="space-y-6">
        <!-- Search & Filter Bar -->
        <div class="flex flex-col md:flex-row gap-4">
          <div class="relative flex-1">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              placeholder="Search by title or location..."
              class="pl-10 rounded-xl"
              bind:value={searchQuery}
            />
          </div>
          <Select type="single" bind:value={selectedYear}>
            <SelectTrigger class="w-full md:w-[180px] rounded-xl">
              {selectedYear === "all" ? "All Years" : selectedYear}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {#each data.availableYears as year}
                <SelectItem value={year.toString()}>{year}</SelectItem>
              {/each}
            </SelectContent>
          </Select>
        </div>

        <!-- Events Grid -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each filteredEvents as event (event.id)}
            <div
              class="group relative bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div class="aspect-video relative overflow-hidden bg-muted">
                {#if event.image?.url || event.coverImage?.url}
                  <img
                    src={event.image?.url || event.coverImage?.url}
                    alt={event.title}
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                {:else}
                  <div class="w-full h-full flex items-center justify-center">
                    <ImageIcon class="size-10 text-muted-foreground/20" />
                  </div>
                {/if}
                <div
                  class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end"
                >
                  <div
                    class="flex items-center gap-2 text-white/90 text-xs font-medium"
                  >
                    <Calendar class="size-3" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <h3 class="text-white font-bold truncate">{event.title}</h3>
                </div>
              </div>
              <div class="p-4 space-y-3">
                <div
                  class="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <MapPin class="size-3" />
                  {event.location}
                </div>
                <div class="flex gap-2">
                  <span
                    class="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase"
                    >{event.status}</span
                  >
                </div>
                <div class="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    class="flex-1 rounded-xl gap-2"
                    onclick={() => openEventModal(event)}
                  >
                    <Edit3 class="size-3" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    class="rounded-xl px-3 text-destructive hover:bg-destructive/10 border-destructive/20"
                    onclick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 class="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Board of Trustees (Linked) -->
    <SectionWrapper
      id="board"
      title="Board of Trustees"
      description="Select trustees to display on the events page"
      icon={Users}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={addTrustee}
          class="gap-2 rounded-xl"
        >
          <Plus class="size-4" /> Add Slot
        </Button>
      {/snippet}

      <div class="grid gap-6 sm:grid-cols-2">
        {#each content.board as item, i}
          <div
            class="relative p-6 rounded-2xl border-2 border-border/40 bg-card hover:border-primary/30 transition-all shadow-sm space-y-4"
          >
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-2 right-2 text-muted-foreground h-8 w-8 hover:bg-destructive/10 rounded-full"
              onclick={() => removeTrustee(i)}
            >
              <Trash2 class="size-4" />
            </Button>

            <SearchableSelect
              label="Select Trustee"
              entityName="Trustee"
              bind:value={item.trusteeId}
              bind:initialItem={item.trustee}
              fetchOptions={fetchTrustees}
              placeholder="Search trustees..."
            />
          </div>
        {/each}
      </div>
    </SectionWrapper>
  </div>
</div>

<!-- Event Editor Dialog/Drawer -->
{#if isEditingEvent}
  {#if !isMobile.current}
    <Dialog.Root
      open={true}
      onOpenChange={(o) => !o && (isEditingEvent = false)}
    >
      <Dialog.Content
        class="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl"
      >
        {@render EditorContent({
          handleSaveEvent,
          isSavingEvent,
          currentEvent,
          eventImagePreview,
          eventCoverImagePreview,
          onImageUpload,
        })}
      </Dialog.Content>
    </Dialog.Root>
  {:else}
    <Drawer.Root
      open={true}
      onOpenChange={(o) => !o && (isEditingEvent = false)}
    >
      <Drawer.Content class="p-0 rounded-t-4xl max-h-[95vh] flex flex-col">
        <div class="overflow-y-auto p-4 flex-1">
          {@render EditorContent({
            handleSaveEvent,
            isSavingEvent,
            currentEvent,
            eventImagePreview,
            eventCoverImagePreview,
            onImageUpload,
          })}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  {/if}
{/if}

{#snippet EditorContent({
  handleSaveEvent,
  isSavingEvent,
  currentEvent,
  eventImagePreview,
  eventCoverImagePreview,
  onImageUpload,
}: {
  handleSaveEvent: () => void;
  isSavingEvent: boolean;
  currentEvent: any;
  eventImagePreview: string;
  eventCoverImagePreview: string;
  onImageUpload: (e: Event, key: string) => void;
})}
  <div class="bg-card">
    <div
      class="p-6 border-b flex items-center justify-between sticky top-0 bg-card z-10"
    >
      <div>
        <h2 class="text-xl font-bold">
          {currentEvent.id ? "Edit Event" : "New Event"}
        </h2>
        <p class="text-xs text-muted-foreground">
          Manage event registration details
        </p>
      </div>
      <Button
        size="sm"
        onclick={handleSaveEvent}
        disabled={isSavingEvent}
        class="rounded-xl px-6"
      >
        {#if isSavingEvent}
          <Loader2 class="size-4 animate-spin mr-2" /> Saving...
        {:else}
          Save Event
        {/if}
      </Button>
    </div>

    <div class="p-6 space-y-8">
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Flier Image -->
        <div class="space-y-4">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Event Flier / Image</Label
          >
          <div
            class="relative group aspect-video rounded-3xl overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center"
          >
            {#if eventImagePreview}
              <img
                src={eventImagePreview}
                alt="Preview"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <label
                  class="cursor-pointer bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2"
                >
                  <Upload class="size-4" /> Change Flier
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    onchange={(e) => onImageUpload(e, "event")}
                  />
                </label>
              </div>
            {:else}
              <label class="cursor-pointer flex flex-col items-center gap-3">
                <div
                  class="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"
                >
                  <Upload class="size-8" />
                </div>
                <div class="text-center p-2">
                  <p class="font-bold text-sm">Upload Flier</p>
                  <p class="text-[10px] text-muted-foreground">
                    Square/Portrait
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onchange={(e) => onImageUpload(e, "event")}
                />
              </label>
            {/if}
          </div>
        </div>

        <!-- Cover Image -->
        <div class="space-y-4">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Event Cover Banner</Label
          >
          <div
            class="relative group aspect-video rounded-3xl overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center"
          >
            {#if eventCoverImagePreview}
              <img
                src={eventCoverImagePreview}
                alt="Cover Preview"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <label
                  class="cursor-pointer bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2"
                >
                  <Upload class="size-4" /> Change Cover
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    onchange={(e) => onImageUpload(e, "cover")}
                  />
                </label>
              </div>
            {:else}
              <label class="cursor-pointer flex flex-col items-center gap-3">
                <div
                  class="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"
                >
                  <Upload class="size-8" />
                </div>
                <div class="text-center p-2">
                  <p class="font-bold text-sm">Upload Cover</p>
                  <p class="text-[10px] text-muted-foreground">
                    Landscape (16:9)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onchange={(e) => onImageUpload(e, "cover")}
                />
              </label>
            {/if}
          </div>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-1">
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-muted-foreground"
            >Event Title</Label
          >
          <Input
            bind:value={currentEvent.title}
            placeholder="e.g. Annual Summit 2024"
            class="rounded-xl"
          />
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-muted-foreground"
            >Date</Label
          >
          <Input
            type="datetime-local"
            bind:value={currentEvent.date}
            class="rounded-xl"
          />
        </div>
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-muted-foreground"
            >Location</Label
          >
          <div class="relative">
            <MapPin
              class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              bind:value={currentEvent.location}
              placeholder="Lagos, Nigeria"
              class="pl-10 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <Label class="text-xs font-bold uppercase text-muted-foreground"
          >Full Description</Label
        >
        <div class="relative">
          <Textarea
            bind:value={currentEvent.description}
            placeholder="Detailed event information..."
            rows={4}
            class="rounded-xl resize-none wrap-break-word"
          />
        </div>
      </div>

      <div class="space-y-2">
        <Label class="text-xs font-bold uppercase text-muted-foreground"
          >Registration Link (Optional)</Label
        >
        <Input
          value={currentEvent.registrationLink || ""}
          oninput={(e) => (currentEvent.registrationLink = e.currentTarget.value)}
          placeholder="https://..."
          class="rounded-xl"
        />
      </div>

      <div class="space-y-2">
        <Label class="text-xs font-bold uppercase text-muted-foreground"
          >Status</Label
        >
        <Select type="single" bind:value={currentEvent.status}>
          <SelectTrigger class="rounded-xl">
            {currentEvent.status || "Select status"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="postponed">Postponed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
{/snippet}

<style>
  :global(.bento-item) {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  :global(.bento-item:hover) {
    transform: translateY(-4px);
  }
</style>
