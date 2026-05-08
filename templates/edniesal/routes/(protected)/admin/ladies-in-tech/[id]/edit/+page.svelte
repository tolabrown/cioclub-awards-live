<script lang="ts">
  import {
    Calendar,
    Search,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    MapPin,
    Link,
    CreditCard,
    X,
    ImageIcon,
    Clock,
    Heart,
    ChevronLeft,
    Save,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import RichEditor from "$lib/components/ui/editor/rich-editor.svelte";
  import * as Card from "$lib/components/ui/card";
  import { toast } from "svelte-sonner";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import { resizeImage } from "$lib/authentication/imageresize";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  let { data } = $props();
  let eventToEdit = $state<any>({
    title: "",
    description: "",
    date: "",
    location: "",
    registrationUrl: "",
    paymentUrl: "",
    imageUrl: "",
    imageId: "",
    category: "ladies-in-tech",
    status: "upcoming",
  });

  $effect.pre(() => {
    if (data.event) {
      eventToEdit = { ...data.event };
    }
  });

  let isSubmitting = $state(false);
  let uploadingImage = $state(false);
  let deletingImage = $state(false);

  const statusOptions = [
    { label: "Upcoming", value: "upcoming" },
    { label: "Past", value: "past" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const categoryOptions = [
    { label: "Ladies in Tech", value: "ladies-in-tech" },
    { label: "Leadership", value: "leadership" },
  ];

  async function onImageUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    uploadingImage = true;

    try {
      const resizedFile = await resizeImage(file, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.8,
      });

      const formData = new FormData();
      formData.append("file", resizedFile);

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        eventToEdit.imageUrl = result.url;
        eventToEdit.imageId = result.id;
        toast.success("Event image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      uploadingImage = false;
      input.value = "";
    }
  }

  async function handleDeleteImage() {
    if (!eventToEdit.imageId) return;
    deletingImage = true;
    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        body: JSON.stringify({ id: eventToEdit.imageId }),
      });
      if (response.ok) {
        eventToEdit.imageUrl = "";
        eventToEdit.imageId = "";
        toast.success("Image removed");
      }
    } catch (error) {
      toast.error("Failed to remove image");
    } finally {
      deletingImage = false;
    }
  }

  async function handleSaveEvent(e: Event) {
    e.preventDefault();
    isSubmitting = true;
    try {
      const response = await fetch("/api/admin/ladies-in-tech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventToEdit),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        goto("/admin/ladies-in-tech");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error saving event");
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div
  class="container max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500"
>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        href="/admin/ladies-in-tech"
        class="rounded-full"
      >
        <ChevronLeft class="size-5" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          {eventToEdit.id ? "Edit Event" : "Create New Event"}
        </h1>
        <p
          class="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1"
        >
          Ladies in Tech Event Management
        </p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <Button
        variant="outline"
        href="/admin/ladies-in-tech"
        class="rounded-xl font-bold"
      >
        Cancel
      </Button>
      <Button
        onclick={handleSaveEvent}
        disabled={isSubmitting}
        class="gap-2 shadow-lg shadow-primary/20 rounded-xl px-8 font-bold uppercase tracking-widest text-xs"
      >
        {#if isSubmitting}
          <Loader2 class="size-4 animate-spin" />
          Saving...
        {:else}
          <Save class="size-4" />
          Save Changes
        {/if}
      </Button>
    </div>
  </div>

  <Card.Root
    class="border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border-2 border-pink-500/10"
  >
    <div
      class="p-8 bg-pink-500/5 border-b border-border/50 flex items-center gap-4"
    >
      <div
        class="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm"
      >
        <Heart class="size-6 text-pink-500" />
      </div>
      <div>
        <h2 class="text-xl font-bold uppercase tracking-tight">
          Event Details
        </h2>
        <p
          class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60"
        >
          Complete the form below to update the event information
        </p>
      </div>
    </div>

    <form onsubmit={handleSaveEvent} class="p-8 space-y-8">
      <div class="grid gap-8">
        <!-- Image Upload -->
        <div class="space-y-4">
          <Label
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
          >
            Event Display Image
          </Label>
          <div class="flex items-center gap-8">
            <div
              class="relative size-48 rounded-3xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0 group"
            >
              {#if uploadingImage || deletingImage}
                <div
                  class="absolute inset-0 bg-background/80 flex items-center justify-center z-10 backdrop-blur-sm"
                >
                  <Loader2 class="size-6 animate-spin text-pink-500" />
                </div>
              {/if}
              {#if eventToEdit.imageUrl}
                <img
                  src={eventToEdit.imageUrl}
                  alt="Event"
                  class="w-full h-full object-cover"
                />
              {:else}
                <div class="flex flex-col items-center gap-2 p-6 text-center">
                  <ImageIcon
                    class="size-8 text-muted-foreground/40 group-hover:text-pink-500/60 transition-colors"
                  />
                  <span
                    class="text-[10px] text-muted-foreground font-bold uppercase tracking-widest"
                    >Upload Header Image</span
                  >
                </div>
                <input
                  type="file"
                  accept="image/*"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                  onchange={onImageUpload}
                />
              {/if}
            </div>
            <div class="space-y-3 flex-1">
              {#if eventToEdit.imageUrl}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  class="h-10 px-4 gap-2 text-destructive border-destructive/20 hover:bg-destructive/5 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                  onclick={handleDeleteImage}
                >
                  <X class="size-4" /> Remove Image
                </Button>
              {/if}
              <p
                class="text-xs text-muted-foreground font-medium leading-relaxed"
              >
                Aim for a high-quality landscape image (approx 1200x800px). This
                image will be the primary visual for the event.
              </p>
            </div>
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-2 md:col-span-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
              >Event Title</Label
            >
            <Input
              bind:value={eventToEdit.title}
              placeholder="Empowering Women in Tech Summit"
              class="h-14 rounded-2xl font-bold bg-background/50 border-border/50 text-lg"
              required
            />
          </div>

          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
              >Date & Time</Label
            >
            <div class="relative">
              <Calendar
                class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                type="datetime-local"
                bind:value={eventToEdit.date}
                class="h-12 pl-12 rounded-xl bg-background/50 border-border/50"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
              >Status</Label
            >
            <SelectComponent
              name="status"
              placeholder="Select Status"
              options={statusOptions}
              bind:value={eventToEdit.status}
              class="h-12 rounded-xl bg-background/50 border-border/50"
            />
          </div>

          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
              >Category</Label
            >
            <SelectComponent
              name="category"
              placeholder="Select Category"
              options={categoryOptions}
              bind:value={eventToEdit.category}
              class="h-12 rounded-xl bg-background/50 border-border/50"
            />
          </div>

          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
              >Location</Label
            >
            <div class="relative">
              <MapPin
                class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                bind:value={eventToEdit.location}
                placeholder="Accra, Ghana / Zoom Online"
                class="h-12 pl-12 rounded-xl bg-background/50 border-border/50"
              />
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <Label
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
            >Content Description</Label
          >
          <div
            class="rounded-2xl border border-border/50 bg-background/50 overflow-hidden min-h-[400px]"
          >
            <RichEditor bind:value={eventToEdit.description} />
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-2 pt-4">
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
              >External Registration Link</Label
            >
            <div class="relative">
              <Link
                class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                bind:value={eventToEdit.registrationUrl}
                placeholder="https://..."
                class="h-12 pl-12 rounded-xl bg-background/50 border-border/50 text-xs"
              />
            </div>
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
              >External Payment Link</Label
            >
            <div class="relative">
              <CreditCard
                class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                bind:value={eventToEdit.paymentUrl}
                placeholder="https://..."
                class="h-12 pl-12 rounded-xl bg-background/50 border-border/50 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        class="pt-8 border-t border-border/50 flex flex-col sm:flex-row gap-4"
      >
        <Button
          type="submit"
          class="flex-1 h-14 rounded-2xl uppercase font-bold tracking-widest text-xs shadow-xl shadow-primary/20"
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <Loader2 class="size-5 animate-spin mr-2" /> Saving Changes
          {:else}
            <Save class="size-5 mr-2" /> Save Event Information
          {/if}
        </Button>
      </div>
    </form>
  </Card.Root>
</div>
