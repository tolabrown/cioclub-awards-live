<script lang="ts">
  import { page } from "$app/state";
  import type { iMemory, iFile } from "$lib/interface";
  import { Button } from "$lib/components/ui/button";
  import {
    Calendar,
    MapPin,
    ArrowLeft,
    Edit,
    Trash2,
    Image as ImageIcon,
    Film,
    Loader2,
  } from "@lucide/svelte";
  import { format } from "date-fns";
  import CrumbPath from "$lib/components/ui/crumb-path/crumb-path.svelte";
  import BentoGrid from "../components/BentoGrid.svelte";
  import VideoCarousel from "../components/VideoCarousel.svelte";
  import { editors, Role } from "$lib/constants";
  import type { User } from "$lib/auth";
  import { toast } from "svelte-sonner";

  const { data } = $props();
  const memory = data.memory as iMemory;
  const user = page.data.user as User;

  const images = $derived(
    (memory.files || []).filter((f) => !f.type?.startsWith("video")),
  );
  const videos = $derived(
    (memory.files || []).filter((f) => f.type?.startsWith("video")),
  );

  const coverUrl = $derived(
    memory.coverImage && typeof memory.coverImage === "object"
      ? memory.coverImage.url
      : "",
  );

  let isDeleting = $state(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this memory? This action cannot be undone.",
      )
    )
      return;

    isDeleting = true;
    try {
      const response = await fetch(`/api/memories/${memory.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);

      toast.success("Memory deleted successfully");
      location.href = "/memories";
    } catch (error: any) {
      toast.error(error.message || "Failed to delete memory");
    } finally {
      isDeleting = false;
    }
  };
</script>

<div class="flex flex-col gap-8 pb-20">
  <!-- Navigation and Actions -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div class="flex flex-col gap-2">
      <Button
        variant="ghost"
        size="sm"
        class="w-fit -ml-2"
        onclick={() => (location.href = "/memories")}
      >
        <ArrowLeft class="h-4 w-4 mr-2" /> Back to Memories
      </Button>
      <h1 class="text-3xl font-bold tracking-tight">{memory.name}</h1>
    </div>

    {#if editors.includes(user.role as Role)}
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          href={`/memories/${memory.id}/edit`}
        >
          <Edit class="h-4 w-4 mr-2" /> Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onclick={handleDelete}
          disabled={isDeleting}
        >
          {#if isDeleting}
            <Loader2 class="h-4 w-4 animate-spin mr-2" /> Deleting...
          {:else}
            <Trash2 class="h-4 w-4 mr-2" /> Delete
          {/if}
        </Button>
      </div>
    {/if}
  </div>

  <!-- Hero Section -->
  <div
    class="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-3xl overflow-hidden shadow-2xl bg-muted border border-white/10"
  >
    {#if coverUrl}
      <img
        src={coverUrl}
        alt={memory.name}
        class="w-full h-full object-cover"
      />
    {:else}
      <div class="w-full h-full flex items-center justify-center">
        <ImageIcon class="h-20 w-20 text-muted-foreground opacity-20" />
      </div>
    {/if}
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10"
    >
      <div class="flex flex-wrap items-center gap-6 text-white/90">
        <div class="flex items-center gap-2 text-lg">
          <Calendar class="h-5 w-5 text-primary" />
          <span>{format(new Date(memory.date), "do MMMM, yyyy")}</span>
        </div>
        {#if memory.location}
          <div class="flex items-center gap-2 text-lg">
            <MapPin class="h-5 w-5 text-primary" />
            <span>{memory.location}</span>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Description Section -->
  {#if memory.description}
    <div class="max-w-4xl">
      <h2 class="text-xl font-semibold mb-3">The Story</h2>
      <p
        class="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap"
      >
        {memory.description}
      </p>
    </div>
  {/if}

  <!-- Pictures Gallery -->
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <div
        class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <ImageIcon class="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 class="text-2xl font-bold">Captured Moments</h2>
        <p class="text-muted-foreground">{images.length} photos collected</p>
      </div>
    </div>

    {#if images.length > 0}
      <BentoGrid {images} />
    {:else}
      <div class="py-20 text-center border-2 border-dashed rounded-3xl">
        <ImageIcon
          class="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20"
        />
        <p class="text-lg font-medium text-muted-foreground">
          No photos yet for this memory
        </p>
      </div>
    {/if}
  </div>

  <!-- Videos Gallery -->
  {#if videos.length > 0}
    <div class="space-y-6 pt-10">
      <div class="flex items-center gap-3">
        <div
          class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Film class="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 class="text-2xl font-bold">Videos & Reels</h2>
          <p class="text-muted-foreground">{videos.length} videos available</p>
        </div>
      </div>

      <VideoCarousel {videos} />
    </div>
  {/if}
</div>
