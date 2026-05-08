<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    MapPin,
    ArrowLeft,
    Image as ImageIcon,
    Camera,
    Calendar,
    Maximize2,
    ChevronLeft,
    ChevronRight,
    X,
  } from "@lucide/svelte";
  import { fade, fly } from "svelte/transition";
  import { onMount } from "svelte";

  let { data } = $props();
  const album = $derived(data.album);

  let showGallery = $state(false);
  let galleryStartIndex = $state(0);
  let currentIndex = $state(0);
  let isPaused = $state(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const images = $derived(
    (album.media || []).map((file: any, i: number) => ({
      id: file.fileId || `img-${i}`,
      url: file.url,
      name: album.title,
    })),
  );

  function nextImage() {
    if (images.length > 0) {
      currentIndex = (currentIndex + 1) % images.length;
    }
  }

  function prevImage() {
    if (images.length > 0) {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
    }
  }

  function startAutoAdvance() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(nextImage, 5000);
  }

  onMount(() => {
    startAutoAdvance();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });

  function openGallery(index: number) {
    galleryStartIndex = index;
    showGallery = true;
  }
</script>

<svelte:head>
  <title>{album.title} — Ladies in Tech Archive</title>
  <meta
    name="description"
    content={album.description || `Photo gallery from ${album.title}`}
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Hero Carousel -->
  <section
    class="relative h-[70vh] min-h-[500px] w-full overflow-hidden"
    aria-label="Gallery Hero Carousel"
    onmouseenter={() => (isPaused = true)}
    onmouseleave={() => {
      isPaused = false;
      startAutoAdvance();
    }}
  >
    {#if images.length > 0}
      {#each images as img, i}
        {#if currentIndex === i}
          <div
            class="absolute inset-0 z-0"
            transition:fade={{ duration: 1000 }}
          >
            <img
              src={img.url}
              alt={img.name}
              class="w-full h-full object-cover scale-105"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"
            ></div>
            <div class="absolute inset-0 bg-black/40"></div>
          </div>
        {/if}
      {/each}

      <!-- Hero Content -->
      <div
        class="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 space-y-8"
      >
        <div
          in:fly={{ y: 20, duration: 800, delay: 200 }}
          class="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/20 border border-white/20 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-xl shadow-lg"
        >
          <Calendar class="size-4" />
          {album.year} Visual Archive
        </div>

        <h1
          in:fly={{ y: 30, duration: 1000, delay: 400 }}
          class="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight drop-shadow-lg"
        >
          {album.title}
        </h1>

        <div
          in:fly={{ y: 20, duration: 800, delay: 600 }}
          class="flex flex-wrap items-center justify-center gap-8 text-white/80 font-bold uppercase text-[11px] tracking-widest"
        >
          {#if album.location}
            <div class="flex items-center gap-3">
              <MapPin class="size-4 text-primary" />
              <span>{album.location}</span>
            </div>
          {/if}
          <div class="flex items-center gap-3">
            <Camera class="size-4 text-primary" />
            <span>{images.length} Photos</span>
          </div>
        </div>

        <!-- Progress Bar -->
        {#if !isPaused && images.length > 1}
          <div
            class="w-48 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-md mt-8"
          >
            <div
              class="h-full bg-primary"
              style="animation: progress 5s linear infinite"
            ></div>
          </div>
        {/if}
      </div>

      <!-- Controls -->
      <div
        class="absolute inset-x-0 bottom-8 z-20 container mx-auto px-4 flex items-center justify-between pointer-events-none"
      >
        <div class="flex gap-3 pointer-events-auto">
          <Button
            variant="outline"
            size="icon"
            class="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md size-11 bg-transparent! transition-all"
            onclick={() => {
              isPaused = true;
              prevImage();
            }}
            aria-label="Previous image"
          >
            <ChevronLeft class="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md size-11 bg-transparent! transition-all"
            onclick={() => {
              isPaused = true;
              nextImage();
            }}
            aria-label="Next image"
          >
            <ChevronRight class="size-5" />
          </Button>
        </div>

        <div class="flex gap-2 items-center pointer-events-auto">
          {#each images.slice(0, 8) as _, i}
            <button
              class="h-1 rounded-full transition-all duration-500 {currentIndex ===
              i
                ? 'bg-primary w-10'
                : 'bg-white/30 w-3 hover:bg-white/50'}"
              onclick={() => {
                currentIndex = i;
                isPaused = true;
              }}
              aria-label="Go to image {i + 1}"
            ></button>
          {/each}
          {#if images.length > 8}
            <span
              class="text-white/40 text-[10px] font-bold uppercase tracking-widest pl-2"
            >
              +{images.length - 8}
            </span>
          {/if}
        </div>
      </div>
    {:else}
      <div class="absolute inset-0 bg-muted flex items-center justify-center">
        <div class="text-center space-y-4">
          <ImageIcon class="size-16 mx-auto text-muted-foreground opacity-20" />
          <h2 class="text-3xl font-bold text-muted-foreground tracking-tight">
            {album.title}
          </h2>
        </div>
      </div>
    {/if}
  </section>

  <!-- Navigation Bar -->
  <div
    class="sticky top-20 z-40 bg-background/80 backdrop-blur-xl border-y border-border/40"
  >
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <Button
        variant="ghost"
        class="group font-bold text-xs uppercase tracking-widest hover:text-primary transition-all rounded-xl gap-3"
        href="/ladies-in-tech"
      >
        <ArrowLeft
          class="size-4 group-hover:-translate-x-1 transition-transform"
        />
        Back to Ladies in Tech
      </Button>

      <div class="hidden md:flex items-center gap-4">
        <span
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60"
        >
          {album.title} — {images.length} captures
        </span>
      </div>
    </div>
  </div>

  <!-- Bento Gallery Grid -->
  <section class="py-16 relative overflow-hidden">
    <div
      class="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10"
    ></div>
    <div
      class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10"
    ></div>

    <div class="container mx-auto px-4">
      <div class="max-w-7xl mx-auto">
        {#if album.description}
          <div class="mb-16 max-w-3xl">
            <p
              class="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed italic border-l-4 border-primary pl-8 py-2"
            >
              "{album.description}"
            </p>
          </div>
        {/if}

        <div class="bento-grid">
          {#each images as img, i}
            <div
              in:fade={{ duration: 600, delay: Math.min(i * 50, 500) }}
              class="bento-item group relative overflow-hidden bg-muted border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer {i %
                7 ===
                0 || i % 7 === 3
                ? 'md:col-span-2 md:row-span-2'
                : ''}"
              onclick={() => openGallery(i)}
              role="button"
              tabindex="0"
              onkeydown={(e) => e.key === "Enter" && openGallery(i)}
            >
              <img
                src={img.url}
                alt={img.name}
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <!-- Hover Overlay -->
              <div
                class="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]"
              >
                <div
                  class="size-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white translate-y-4 group-hover:translate-y-0 transition-all duration-500"
                >
                  <Maximize2 class="size-5" />
                </div>
                <span
                  class="text-white text-[9px] font-bold uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100"
                >
                  View Photo
                </span>
              </div>
            </div>
          {/each}

          {#if images.length === 0}
            <div
              class="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/20 gap-4"
            >
              <div
                class="size-16 rounded-full bg-primary/5 flex items-center justify-center"
              >
                <ImageIcon class="size-8 text-primary/20" />
              </div>
              <div class="text-center space-y-2">
                <h4 class="text-lg font-bold uppercase tracking-tight">
                  Archive Pending
                </h4>
                <p
                  class="text-muted-foreground font-medium max-w-xs mx-auto text-sm"
                >
                  We are currently processing the photos for this event. Check
                  back later.
                </p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>
</div>

<!-- Full-Screen Gallery Overlay -->
{#if showGallery && images.length > 0}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
    onclick={() => (showGallery = false)}
  >
    <Button
      variant="ghost"
      size="icon"
      class="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
      onclick={() => (showGallery = false)}
      aria-label="Close gallery"
    >
      <X class="size-6" />
    </Button>

    {#if galleryStartIndex > 0}
      <Button
        variant="ghost"
        size="icon"
        class="absolute left-4 text-white hover:bg-white/10 z-10"
        onclick={(e: MouseEvent) => {
          e.stopPropagation();
          galleryStartIndex = Math.max(0, galleryStartIndex - 1);
        }}
        aria-label="Previous photo"
      >
        <ChevronLeft class="size-8" />
      </Button>
    {/if}

    {#if galleryStartIndex < images.length - 1}
      <Button
        variant="ghost"
        size="icon"
        class="absolute right-4 text-white hover:bg-white/10 z-10"
        onclick={(e: MouseEvent) => {
          e.stopPropagation();
          galleryStartIndex = Math.min(
            images.length - 1,
            galleryStartIndex + 1,
          );
        }}
        aria-label="Next photo"
      >
        <ChevronRight class="size-8" />
      </Button>
    {/if}

    <img
      src={images[galleryStartIndex]?.url}
      alt=""
      class="max-w-[90vw] max-h-[90vh] object-contain"
    />

    <div
      class="absolute bottom-6 text-white/50 text-xs font-bold uppercase tracking-widest"
    >
      {galleryStartIndex + 1} / {images.length}
    </div>
  </div>
{/if}

<style>
  @keyframes progress {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }

  .bento-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-flow: dense;
    gap: 1rem;
    width: 100%;
  }

  @media (min-width: 768px) {
    .bento-grid {
      grid-template-columns: repeat(4, 1fr);
      grid-auto-rows: 250px;
      gap: 1.5rem;
    }
  }

  .bento-item {
    border-radius: 0.75rem;
  }
</style>
