<script lang="ts">
  import type { iFile } from "$lib/interface";
  import { Button } from "$lib/components/ui/button";
  import {
    X,
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    Maximize2,
    Minimize2,
    Download,
  } from "@lucide/svelte";
  import { fade } from "svelte/transition";
  import { onMount, onDestroy } from "svelte";

  interface Props {
    images: iFile[];
    startIndex: number;
    onClose: () => void;
  }

  let { images, startIndex, onClose }: Props = $props();

  let currentIndex = $state(0);

  $effect.pre(() => {
    currentIndex = startIndex;
  });

  // The previous $effect.pre is no longer needed if currentIndex is initialized directly
  // and we don't need to react to changes in startIndex after initial render.
  // If startIndex could change and currentIndex should update, the $effect.pre would be needed.
  // For a gallery where startIndex is typically set once, direct initialization is fine.

  let isAutoplay = $state(true);
  let isFullscreen = $state(false);
  let interval: any;

  // Touch support state
  let touchStartX = 0;
  let touchEndX = 0;

  const next = () => {
    currentIndex = (currentIndex + 1) % images.length;
  };

  const prev = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  };

  const toggleAutoplay = () => {
    isAutoplay = !isAutoplay;
  };

  const toggleFullscreen = () => {
    const doc = window.document as any;
    const docEl = document.documentElement as any;

    const requestFullScreen =
      docEl.requestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.webkitRequestFullScreen ||
      docEl.msRequestFullscreen;
    const cancelFullScreen =
      doc.exitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.webkitExitFullscreen ||
      doc.msExitFullscreen;

    if (
      !doc.fullscreenElement &&
      !doc.mozFullScreenElement &&
      !doc.webkitFullscreenElement &&
      !doc.msFullscreenElement
    ) {
      if (requestFullScreen) requestFullScreen.call(docEl);
      isFullscreen = true;
    } else {
      if (cancelFullScreen) cancelFullScreen.call(doc);
      isFullscreen = false;
    }
  };

  const handleDownload = async () => {
    const image = images[currentIndex];
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = image.name || `gallery-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      window.open(image.url, "_blank");
    }
  };

  // Preloading logic
  const preloadImage = (url: string) => {
    if (typeof window !== "undefined") {
      const img = new Image();
      img.src = url;
    }
  };

  $effect(() => {
    if (images.length > 0) {
      const nextIdx = (currentIndex + 1) % images.length;
      const prevIdx = (currentIndex - 1 + images.length) % images.length;
      preloadImage(images[nextIdx].url);
      preloadImage(images[prevIdx].url);
    }
  });

  $effect(() => {
    if (isAutoplay && images.length > 1) {
      interval = setInterval(next, 4000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  });

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      isAutoplay = false;
      next();
    }
    if (e.key === "ArrowLeft") {
      isAutoplay = false;
      prev();
    }
    if (e.key === "Escape") {
      closeGallery();
    }
    if (e.key === " ") {
      e.preventDefault();
      toggleAutoplay();
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const threshold = 50;
    if (touchEndX < touchStartX - threshold) {
      isAutoplay = false;
      next();
    }
    if (touchEndX > touchStartX + threshold) {
      isAutoplay = false;
      prev();
    }
  };

  const closeGallery = () => {
    const doc = window.document as any;
    if (
      doc.fullscreenElement ||
      doc.mozFullScreenElement ||
      doc.webkitFullscreenElement ||
      doc.msFullscreenElement
    ) {
      const cancelFullScreen =
        doc.exitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.webkitExitFullscreen ||
        doc.msExitFullscreen;
      if (cancelFullScreen) cancelFullScreen.call(doc);
    }

    onClose();
  };

  const handleBackdropClick = (e: MouseEvent | KeyboardEvent) => {
    if (e.target === e.currentTarget) {
      closeGallery();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    document.body.style.overflow = "hidden";

    const fsHandler = () => {
      isFullscreen = !!document.fullscreenElement;
    };
    document.addEventListener("fullscreenchange", fsHandler);

    return () => {
      document.removeEventListener("fullscreenchange", fsHandler);
      window.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "auto";
    };
  });
</script>

<div
  class="fixed inset-0 z-[100] bg-black flex items-center justify-center select-none overflow-hidden"
  transition:fade={{ duration: 400 }}
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}
  onclick={handleBackdropClick}
  onkeydown={(e) => e.key === "Enter" && handleBackdropClick(e)}
  role="button"
  tabindex="0"
>
  <!-- Background Image Overlay (Deep Blur & Ambient Light) -->
  <div
    class="absolute inset-0 z-0 opacity-50 blur-[100px] pointer-events-none scale-150"
  >
    {#key currentIndex}
      <img
        src={images[currentIndex]?.url}
        alt=""
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        in:fade={{ duration: 1000 }}
        out:fade={{ duration: 1000 }}
      />
    {/key}
  </div>

  <!-- Header Controls -->
  <div
    class="absolute top-0 left-0 right-0 p-4 md:p-8 z-50 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent"
  >
    <div class="flex flex-col gap-0.5 text-white">
      <h3
        class="text-base md:text-xl font-bold truncate max-w-[200px] md:max-w-xl drop-shadow-2xl"
      >
        {images[currentIndex]?.name || "Gallery Moment"}
      </h3>
      <span
        class="text-xs md:text-sm font-bold opacity-80 tracking-widest text-primary"
      >
        {currentIndex + 1} / {images.length}
      </span>
    </div>

    <div
      class="flex items-center gap-1 md:gap-3 bg-white/10 backdrop-blur-2xl p-2 rounded-full border border-white/20 shadow-2xl"
    >
      <Button
        variant="ghost"
        size="icon"
        class="text-white hover:bg-white/20 h-9 w-9 md:h-11 md:w-11 rounded-full transition-all"
        onclick={toggleAutoplay}
        title={isAutoplay ? "Pause" : "Play"}
      >
        {#if isAutoplay}
          <Pause class="h-5 w-5" />
        {:else}
          <Play class="h-5 w-5" />
        {/if}
      </Button>
      <div class="w-px h-6 bg-white/20 mx-1"></div>
      <Button
        variant="ghost"
        size="icon"
        class="text-white hover:bg-white/20 h-9 w-9 md:h-11 md:w-11 rounded-full transition-all hidden sm:flex"
        onclick={toggleFullscreen}
      >
        {#if isFullscreen}
          <Minimize2 class="h-5 w-5" />
        {:else}
          <Maximize2 class="h-5 w-5" />
        {/if}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="text-white hover:bg-white/20 h-9 w-9 md:h-11 md:w-11 rounded-full transition-all"
        onclick={handleDownload}
        title="Download"
      >
        <Download class="h-5 w-5" />
      </Button>
      <div class="w-px h-6 bg-white/20 mx-1"></div>
      <Button
        variant="ghost"
        size="icon"
        class="text-white hover:bg-destructive hover:text-white h-9 w-9 md:h-11 md:w-11 rounded-full border-2 border-transparent transition-all cursor-pointer"
        onclick={closeGallery}
      >
        <X class="h-6 w-6" />
      </Button>
    </div>
  </div>

  <!-- Main Image Display (Perfect Fit, No Cropping) -->
  <div
    class="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-8 lg:p-12 pointer-events-none"
  >
    <div class="relative w-full h-full flex items-center justify-center">
      {#each images as img, i}
        {#if i === currentIndex}
          <div
            class="absolute inset-0 flex items-center justify-center"
            in:fade={{ duration: 700 }}
            out:fade={{ duration: 700 }}
          >
            <div
              class="relative w-full h-full flex items-center justify-center pointer-events-auto"
            >
              <img
                src={img.url}
                alt={img.name || "Gallery image"}
                class="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
              />

              {#if isAutoplay}
                <div
                  class="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-md"
                >
                  <div
                    class="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]"
                    style="animation: progress 4s linear infinite"
                  ></div>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Navigation Arrows -->
  <div class="hidden lg:flex absolute inset-y-0 left-0 items-center p-8 z-30">
    <Button
      variant="ghost"
      size="icon"
      class="h-20 w-20 rounded-full text-white bg-black/40 hover:bg-primary hover:scale-110 backdrop-blur-xl border border-white/20 transition-all duration-500 shadow-2xl group"
      onclick={() => {
        isAutoplay = false;
        prev();
      }}
    >
      <ChevronLeft
        class="h-12 w-12 group-hover:-translate-x-1 transition-transform"
      />
    </Button>
  </div>
  <div class="hidden lg:flex absolute inset-y-0 right-0 items-center p-8 z-30">
    <Button
      variant="ghost"
      size="icon"
      class="h-20 w-20 rounded-full text-white bg-black/40 hover:bg-primary hover:scale-110 backdrop-blur-xl border border-white/20 transition-all duration-500 shadow-2xl group"
      onclick={() => {
        isAutoplay = false;
        next();
      }}
    >
      <ChevronRight
        class="h-12 w-12 group-hover:translate-x-1 transition-transform"
      />
    </Button>
  </div>

  <!-- Thumbnail Strip -->
  <div
    class="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-end gap-3 md:gap-5 overflow-x-auto bg-gradient-to-t from-black/95 via-black/40 to-transparent z-30 no-scrollbar pb-10"
  >
    {#each images as img, i}
      <button
        class="relative h-12 w-12 md:h-20 md:w-20 rounded-xl overflow-hidden shrink-0 transition-all duration-500 ring-2 {i ===
        currentIndex
          ? 'ring-primary scale-110 z-10 shadow-[0_0_20px_rgba(var(--primary),0.5)]'
          : 'ring-transparent opacity-40 scale-90 hover:opacity-100 hover:scale-100'}"
        onclick={() => {
          currentIndex = i;
          isAutoplay = false;
        }}
      >
        <img src={img.url} alt="" class="w-full h-full object-cover" />
      </button>
    {/each}
  </div>
</div>

<style>
  @keyframes progress {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  :global(body) {
    overscroll-behavior-y: contain;
  }
</style>
