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
  } from "@lucide/svelte";
  import GalleryOverlay from "$lib/components/admin/gallery/GalleryOverlay.svelte";
  import type { iFile } from "$lib/interface";
  import { fade, fly } from "svelte/transition";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import { onMount, untrack } from "svelte";
  import { Loader2 } from "@lucide/svelte";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";

  let { data } = $props();
  const album = $derived(data.album);

  let showGallery = $state(false);
  let galleryStartIndex = $state(0);
  let currentIndex = $state(0);
  let isPaused = $state(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let observerNode = $state<HTMLElement | null>(null);

  const galleryQuery = infiniteScroll.listQuery<any>(
    () => ({ albumId: album.id }),
    "",
    "gallery",
  );

  const isMobile = new IsMobile();

  onMount(() => {
    if (!observerNode) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && $galleryQuery.hasNextPage) {
          $galleryQuery.fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "400px" },
    );
    observer.observe(observerNode);
    return () => observer.disconnect();
  });

  // Map media objects to iFile interface - Relaxed filtering to ensure visibility
  const images = $derived(
    (
      ($galleryQuery.data?.results?.length
        ? $galleryQuery.data.results
        : album.media) || []
    ).map(
      (file: any) =>
        ({
          id: file.id,
          url: file.url,
          name: file.name || album.title,
        }) as iFile,
    ),
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
    intervalId = setInterval(nextImage, 5000); // 5 seconds per slide
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

<div class="min-h-screen bg-background">
  <!-- Premium Auto-Sliding Hero Carousel -->
  <section
    class="relative h-[80vh] min-h-[600px] w-full overflow-hidden"
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
              class="w-full h-full object-cover scale-105 animate-slow-zoom"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent"
            ></div>
            <div class="absolute inset-0 bg-black/40"></div>
          </div>
        {/if}
      {/each}

      <!-- Hero Content Overlay -->
      <div
        class="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 space-y-8"
      >
        <div
          in:fly={{ y: 20, duration: 800, delay: 200 }}
          class="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/20 border border-white/20 text-white text-xs font-bold uppercase tracking-[0.3em] backdrop-blur-xl shadow-2xl"
        >
          <Calendar class="size-4" />
          {album.year} Visual Archive
        </div>

        <h1
          in:fly={{ y: 30, duration: 1000, delay: 400 }}
          class="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl"
        >
          {album.title}
        </h1>

        <div
          in:fly={{ y: 20, duration: 800, delay: 600 }}
          class="flex flex-wrap items-center justify-center gap-10 text-white/80 font-bold uppercase text-[12px] tracking-[0.4em]"
        >
          <div class="flex items-center gap-4 group">
            <div class="size-2 rounded-full bg-primary animate-ping"></div>
            <MapPin
              class="size-5 text-primary group-hover:scale-110 transition-transform"
            />
            <span class="drop-shadow-md">{album.location}</span>
          </div>
          <div class="flex items-center gap-4 group">
            <div class="size-2 rounded-full bg-primary animate-ping"></div>
            <Camera
              class="size-5 text-primary group-hover:scale-110 transition-transform"
            />
            <span class="drop-shadow-md"
              >{album.media?.length || 0} Assets Captured</span
            >
          </div>
        </div>

        <!-- Progress Bar (Backend Style) -->
        {#if !isPaused && images.length > 1}
          <div
            class="w-64 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-md mt-10"
          >
            <div
              class="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)]"
              style="animation: progress 5s linear infinite"
            ></div>
          </div>
        {/if}
      </div>

      <!-- Carousel Controls -->
      <div
        class="absolute inset-x-0 bottom-12 z-20 container mx-auto px-4 flex items-center justify-between pointer-events-none"
      >
        <div class="flex gap-3 pointer-events-auto">
          <Button
            variant="outline"
            size="icon"
            class="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md size-12 bg-transparent! transition-all hover:scale-110 active:scale-90"
            onclick={() => {
              isPaused = true;
              prevImage();
            }}
          >
            <ChevronLeft class="size-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md size-12 bg-transparent! transition-all hover:scale-110 active:scale-90"
            onclick={() => {
              isPaused = true;
              nextImage();
            }}
          >
            <ChevronRight class="size-6" />
          </Button>
        </div>

        <!-- Pagination Dots -->
        <div class="flex gap-3 items-center pointer-events-auto">
          {#each images.slice(0, 8) as _, i}
            <button
              class="h-1.5 rounded-full transition-all duration-500 {currentIndex ===
              i
                ? 'bg-primary w-12'
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
              class="text-white/40 text-[10px] font-black uppercase tracking-widest pl-2"
              >+{images.length - 8} More</span
            >
          {/if}
        </div>
      </div>
    {:else}
      <!-- Fallback Hero when no images -->
      <div class="absolute inset-0 bg-muted flex items-center justify-center">
        <div class="text-center space-y-4">
          <ImageIcon class="size-16 mx-auto text-muted-foreground opacity-20" />
          <h2
            class="text-4xl font-black text-muted-foreground uppercase tracking-widest"
          >
            {album.title}
          </h2>
        </div>
      </div>
    {/if}
  </section>

  <!-- Navigation & Action Bar -->
  <div
    class="sticky top-20 z-40 bg-background/80 backdrop-blur-xl border-y border-border/40"
  >
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <Button
        variant="ghost"
        class="group font-bold text-xs uppercase tracking-widest hover:text-primary transition-all rounded-xl gap-3"
        href="/gallery"
      >
        <ArrowLeft
          class="size-4 group-hover:-translate-x-1 transition-transform"
        />
        Archives
      </Button>

      <div class="hidden md:flex items-center gap-4">
        <span
          class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
        >
          Now Viewing: {album.title}
        </span>
      </div>
    </div>
  </div>

  <!-- Immersive Grid Section -->
  <section class="py-20 relative overflow-hidden">
    <!-- Subtle Background Accents -->
    <div
      class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10"
    ></div>
    <div
      class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10"
    ></div>

    <div class="container mx-auto px-4">
      <div class="max-w-7xl mx-auto">
        {#if album.description}
          <div class="mb-20 max-w-3xl ml-0 md:ml-0">
            <p
              class="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed italic border-l-4 border-primary pl-10 py-2"
            >
              "{album.description}"
            </p>
          </div>
        {/if}

        <div class="bento-grid">
          {#each images as img, i}
            <div
              in:fade={{ duration: 600, delay: i * 50 }}
              class="bento-item group relative overflow-hidden bg-muted border border-border/50 shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer {(i %
                7 ===
                0 ||
                i % 7 === 3) &&
              !isMobile.current
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
                class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />

              <!-- Premium Overlay -->
              <div
                class="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]"
              >
                <div
                  class="size-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100"
                >
                  <Maximize2 class="size-6" />
                </div>
                <span
                  class="text-white text-[10px] font-bold uppercase tracking-[0.3em] translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-150"
                >
                  Expand Capture
                </span>
              </div>
            </div>
          {/each}

          {#if $galleryQuery.isFetchingNextPage}
            {#each Array(4) as _}
              <div
                class="aspect-square rounded-xl bg-muted animate-pulse border border-border/50"
              ></div>
            {/each}
          {/if}

          {#if $galleryQuery.hasNextPage}
            <div class="col-span-full py-12 flex justify-center">
              <Button
                variant="outline"
                class="rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 px-12 h-14 font-bold uppercase tracking-widest transition-all shadow-xl active:scale-95"
                onclick={() => $galleryQuery.fetchNextPage()}
                disabled={$galleryQuery.isFetchingNextPage}
              >
                {#if $galleryQuery.isFetchingNextPage}
                  <Loader2 class="size-5 animate-spin mr-3" />
                  Processing Assets...
                {:else}
                  <ImageIcon class="size-5 mr-3" />
                  Load More Captures
                {/if}
              </Button>
            </div>
          {/if}

          <div bind:this={observerNode} class="col-span-full h-4"></div>

          {#if images.length === 0}
            <div
              class="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl bg-muted/20 gap-6"
            >
              <div
                class="size-20 rounded-full bg-primary/5 flex items-center justify-center"
              >
                <ImageIcon class="size-10 text-primary/20" />
              </div>
              <div class="text-center space-y-2">
                <h4 class="text-xl font-bold uppercase tracking-tight">
                  Archive Incomplete
                </h4>
                <p class="text-muted-foreground font-medium max-w-xs mx-auto">
                  We are currently processing the assets for this event. Please
                  check back later.
                </p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <!-- <section class="pb-32 container mx-auto px-4">
    <div
      class="max-w-5xl mx-auto rounded-[3rem] bg-slate-900 text-white p-12 md:p-20 relative overflow-hidden shadow-2xl border border-white/5"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(19,91,236,0.15),transparent)]"
      ></div>
      <div class="relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div class="space-y-6">
          <h2 class="text-3xl md:text-5xl font-bold leading-tight">
            Relive the experience through film?
          </h2>
          <p class="text-slate-400 font-medium text-lg leading-relaxed">
            Our video highlights capture the spirit, the speakers, and the
            dynamic energy of the summit beyond still captures.
          </p>
          <Button variant="outline">Watch Highlights</Button>
        </div>
        <div
          class="relative group aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        >
          <img
            src={album.image}
            alt=""
            class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
          />
          <div class="absolute inset-0 flex items-center justify-center">
            <div
              class="size-20 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary),0.5)] group-hover:scale-110 transition-transform"
            >
              <div
                class="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section> -->
</div>

{#if showGallery && images.length > 0}
  <GalleryOverlay
    {images}
    startIndex={galleryStartIndex}
    onClose={() => (showGallery = false)}
  />
{/if}

<style>
  @keyframes slow-zoom {
    from {
      transform: scale(1.05);
    }
    to {
      transform: scale(1.15);
    }
  }

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
    border-radius: 1.5rem;
  }

  :global(.no-scrollbar::-webkit-scrollbar) {
    display: none;
  }
</style>
