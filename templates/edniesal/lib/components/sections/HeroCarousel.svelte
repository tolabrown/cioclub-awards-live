<script lang="ts">
  import { getStyle } from "$lib/constants";
  import { Button } from "$lib/components/ui/button";
  import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
  } from "@lucide/svelte";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";

  let { items = [] } = $props();

  let currentHeroIndex = $state(0);
  let isPaused = $state(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function nextHero() {
    if (items.length === 0) return;
    currentHeroIndex = (currentHeroIndex + 1) % items.length;
  }

  function prevHero() {
    if (items.length === 0) return;
    currentHeroIndex = (currentHeroIndex - 1 + items.length) % items.length;
  }

  function togglePause() {
    isPaused = !isPaused;
    if (isPaused && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    } else if (!isPaused) {
      startAutoAdvance();
    }
  }

  function startAutoAdvance() {
    if (intervalId) clearInterval(intervalId);
    if (items.length > 1) {
      intervalId = setInterval(nextHero, 15000); // 15 seconds per slide
    }
  }

  onMount(() => {
    startAutoAdvance();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });
</script>

<section
  class="relative aspect-[340/640] w-full overflow-hidden sm:aspect-[340/488] md:aspect-[768/472] lg:aspect-[1024/520] xl:aspect-[1440/520]"
>
  {#if items.length > 0}
    {#each items as hero, i}
      {#if currentHeroIndex === i}
        <div class="absolute inset-0 z-0" transition:fade={{ duration: 1000 }}>
          <!-- Background images -->
          <div
            class="absolute size-full sm:hidden"
            style={getStyle(hero.mobileImage)}
          >
            <div class="size-full bg-black/50 dark:bg-background/70"></div>
          </div>
          <div
            class="absolute size-full hidden sm:block"
            style={getStyle(hero.desktopImage)}
          >
            <div class="size-full bg-black/50 dark:bg-background/70"></div>
          </div>

          <!-- Content -->
          <div
            class="absolute top-1/2 left-1/2 z-1 mx-auto flex h-full w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
          >
            <div class="flex flex-col gap-4 text-center max-w-5xl">
              <!-- Subtitle badge -->
              <div
                class="rounded-xl inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-primary/20 text-white border border-white/20 self-center backdrop-blur-md"
              >
                <span class="relative flex h-2 w-2">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex rounded-full h-2 w-2 bg-white"
                  ></span>
                </span>
                {hero.subtitle}
              </div>

              <h1
                class="animate-float text-4xl font-bold md:text-6xl lg:text-7xl text-white tracking-tight"
              >
                {hero.title}
              </h1>
              <p
                class="mx-auto mb-6 max-w-3xl opacity-90 text-white sm:text-xl leading-relaxed font-medium"
              >
                {hero.description}
              </p>

              <!-- CTA buttons -->
              <div class="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  href={hero.primaryCta.href}
                  class="w-full sm:w-auto shadow-lg shadow-primary/20 group rounded-xl font-bold"
                >
                  {hero.primaryCta.text}
                  <ArrowRight
                    class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </Button>
                <Button
                  href={hero.secondaryCta.href}
                  variant="outline"
                  class="w-full sm:w-auto border-white/20 text-white bg-transparent transition-all rounded-xl backdrop-blur-md font-bold hover:bg-white/10"
                >
                  {hero.secondaryCta.text}
                </Button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/each}

    {#if items.length > 1}
      <!-- Carousel Controls -->
      <div class="absolute inset-x-0 bottom-8 z-10 pointer-events-none">
        <div
          class="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <div class="flex gap-2 pointer-events-auto">
            <Button
              variant="outline"
              size="icon"
              class="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md size-10 bg-transparent!"
              onclick={prevHero}
              aria-label="Previous slide"
            >
              <ChevronLeft class="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md size-10 bg-transparent!"
              onclick={nextHero}
              aria-label="Next slide"
            >
              <ChevronRight class="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md size-10 bg-transparent!"
              onclick={togglePause}
              aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
            >
              {#if isPaused}
                <Play class="h-5 w-5" />
              {:else}
                <Pause class="h-5 w-5" />
              {/if}
            </Button>
          </div>

          <!-- Dots -->
          <div class="flex gap-2 pointer-events-auto items-center">
            {#each items as _, i}
              <button
                class="h-2 rounded-full transition-all {currentHeroIndex === i
                  ? 'bg-primary w-6'
                  : 'bg-white/40 w-2'}"
                onclick={() => (currentHeroIndex = i)}
                aria-label="Go to slide {i + 1}"
              ></button>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  {/if}
</section>

<style>
  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
</style>
