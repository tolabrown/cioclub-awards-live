<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import {
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Megaphone,
    Calendar,
    Mail,
    Send,
    CheckCircle,
    AlertCircle,
    Loader2,
    Trophy,
  } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/state";

  let {
    nominationPeriod = null,
    upcomingEvent = null,
    show = true,
    open = $bindable(false),
  }: {
    nominationPeriod?: any;
    upcomingEvent?: any;
    show?: boolean;
    open?: boolean;
  } = $props();

  let currentSlide = $state(0);
  let email = $state("");
  let status = $state<"idle" | "loading" | "success" | "error">("idle");
  let message = $state("");

  // Build slides array based on available data
  const slideList = $derived.by(() => {
    const s: Array<{ type: "nomination" | "event" | "newsletter"; data?: any }> = [];
    
    // Awards slide
    if (nominationPeriod && nominationPeriod.status !== "closed") {
      s.push({ type: "nomination", data: nominationPeriod });
    }
    
    // Upcoming event if available
    if (upcomingEvent) {
      s.push({ type: "event", data: upcomingEvent });
    }
    
    // Newsletter as the last slide
    s.push({ type: "newsletter" });
    return s;
  });

  const totalSlides = $derived(slideList.length);
  const currentSlideData = $derived(slideList[currentSlide]);

  const DISMISS_KEY = "popup_last_shown_date";

  function getTodayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }

  function shouldAutoShow(): boolean {
    if (!browser) return false;
    if (!show) return false;
    const lastShown = localStorage.getItem(DISMISS_KEY);
    // If shown today, don't auto-show again
    if (lastShown === getTodayKey()) return false;
    return true;
  }

  function dismiss() {
    if (!browser) return;
    localStorage.setItem(DISMISS_KEY, getTodayKey());
    open = false;
  }

  function openPopup() {
    open = true;
    currentSlide = 0;
  }

  function nextSlide() {
    if (totalSlides <= 1) return;
    currentSlide = (currentSlide + 1) % totalSlides;
  }

  function prevSlide() {
    if (totalSlides <= 1) return;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  }

  async function handleSubscribe(e: Event) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    status = "loading";
    message = "";

    try {
      const res = await fetch("/api/popup-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await res.json();
      status = data.success ? "success" : "error";
      message = data.message;

      if (data.success) {
        email = "";
        setTimeout(() => dismiss(), 2000);
      }
    } catch {
      status = "error";
      message = "Network error. Please try again.";
    }
  }

  let hasShownThisSession = $state(false);

  onMount(() => {
    // Check if we should auto-show
    if (shouldAutoShow() && !hasShownThisSession) {
      hasShownThisSession = true;
      // Short delay for better UX
      setTimeout(() => {
        if (shouldAutoShow()) openPopup();
      }, 2000);
    }
  });

  function formatDate(dateStr: string | Date) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  function handleOpenChange(isOpen: boolean) {
    if (!isOpen && browser) {
      localStorage.setItem(DISMISS_KEY, getTodayKey());
    }
    open = isOpen;
  }
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
  <Dialog.Content
    class="sm:max-w-[500px] p-0 overflow-hidden bg-background border-border rounded-xl shadow-lg max-h-[90vh] flex flex-col"
  >
    <Dialog.Title class="sr-only">Special Announcement</Dialog.Title>
    <Dialog.Description class="sr-only">Latest updates from CIO Club Africa</Dialog.Description>
    
    <div class="relative flex items-center justify-between px-6 pt-5 pb-2">
      <Badge
        variant="secondary"
        class="px-3 py-0.5 rounded-full uppercase text-[10px] font-bold tracking-widest bg-primary/10 text-primary border-none"
      >
        {currentSlideData?.type === "nomination"
          ? "🏆 Awards"
          : currentSlideData?.type === "event"
            ? "📅 Upcoming Event"
            : "✉️ Newsletter"}
      </Badge>
    </div>

    <!-- Slide Content -->
    <div class="px-6 pb-8 flex-1 overflow-y-auto min-h-[350px] flex flex-col justify-center">
      {#if currentSlideData?.type === "nomination"}
        <div class="py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="rounded-xl overflow-hidden mb-6 aspect-video shadow-md border border-border/50">
            <img
              src="/awards_nomination.webp"
              alt="The CIO C-Suite Awards"
              class="size-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <h2 class="text-2xl font-bold leading-tight mb-3">The CIO & C-Suite Awards</h2>
          <p class="text-muted-foreground text-sm leading-relaxed mb-8 line-clamp-3">
            Recognizing excellence in digital leadership across Africa. Join the elite circle of technology visionaries and lead the next Africa.
          </p>
          <Button
            href="https://zfrmz.com/ehOL2qeENHenXNdwxiLi"
            target="_blank"
            class="w-full font-bold group"
            onclick={dismiss}
          >
            Nominate Now
            <ArrowRight class="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      {:else if currentSlideData?.type === "event" && currentSlideData?.data}
        {@const event = currentSlideData.data}
        <div class="py-4 animate-in fade-in slide-in-from-right-4 duration-500">
          {#if event.coverImage?.url || event.image?.url}
            <div class="rounded-xl overflow-hidden mb-6 aspect-video shadow-md border border-border/50">
              <img
                src={event.coverImage?.url || event.image?.url}
                alt={event.title}
                class="size-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          {/if}
          <h2 class="text-2xl font-bold leading-tight mb-3">{event.title}</h2>
          <p class="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
            {event.description || "Join us for our next signature event defining the pulse of Africa's digital leadership."}
          </p>
          <div class="flex items-center gap-3 mb-8">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-xs text-muted-foreground font-medium">
              <Calendar class="size-3.5 text-primary" />
              <span>Aug 2026</span>
            </div>
          </div>
          <Button
            href="/events"
            class="w-full font-bold group"
            onclick={dismiss}
          >
            View Event Details
            <ArrowRight class="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      {:else}
        <!-- Newsletter Card -->
        <div class="py-6 text-center animate-in fade-in slide-in-from-right-4 duration-500">
          <div class="size-20 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary mx-auto mb-6 shadow-sm border border-primary/10">
            <Mail class="size-10" />
          </div>
          <h2 class="text-3xl font-bold leading-tight mb-2">Stay Connected</h2>
          <p class="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Get the latest insights on digital leadership, tech trends, and community updates delivered to your inbox.
          </p>

          {#if status === "success"}
            <div class="flex flex-col items-center gap-3 py-6 bg-primary/5 rounded-2xl border border-primary/10">
              <div class="size-14 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle class="size-8 text-primary" />
              </div>
              <p class="text-base font-bold text-primary">{message}</p>
            </div>
          {:else if status === "error"}
            <div class="flex flex-col items-center gap-3 py-6 bg-destructive/5 rounded-2xl border border-destructive/10">
              <div class="size-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle class="size-8 text-destructive" />
              </div>
              <p class="text-sm font-medium text-destructive mb-3">{message}</p>
              <Button
                variant="outline"
                size="sm"
                class="rounded-lg"
                onclick={() => {
                  status = "idle";
                  message = "";
                }}
              >
                Try Again
              </Button>
            </div>
          {:else}
            <form onsubmit={handleSubscribe} class="space-y-4 max-w-sm mx-auto">
              <div class="relative group">
                <Mail
                  class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors"
                />
                <Input
                  type="email"
                  bind:value={email}
                  placeholder="Enter your professional email"
                  required
                  disabled={status === "loading"}
                  class="pl-12 bg-muted/30 border-border focus-visible:ring-primary/20"
                />
              </div>
              <Button
                type="submit"
                class="w-full font-bold group"
                disabled={status === "loading"}
              >
                {#if status === "loading"}
                  <Loader2 class="mr-2 size-5 animate-spin" />
                  Subscribing...
                {:else}
                  Subscribe Now
                  <Send class="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                {/if}
              </Button>
              <p class="text-xs text-muted-foreground italic mt-4">
                We respect your privacy. No spam, ever.
              </p>
            </form>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Carousel Navigation -->
    {#if totalSlides > 1}
      <div class="flex items-center justify-between px-6 py-5 border-t border-border bg-muted/20">
        <div class="flex gap-2">
          {#each slideList as _, i}
            <button
              class="h-1.5 rounded-full transition-all duration-300 {currentSlide === i
                ? 'w-10 bg-primary'
                : 'w-2.5 bg-primary/20 hover:bg-primary/40'}"
              onclick={() => (currentSlide = i)}
              aria-label="Go to slide {i + 1}"
            ></button>
          {/each}
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            class="rounded-full size-10 hover:bg-background shadow-sm"
            onclick={prevSlide}
          >
            <ChevronLeft class="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="rounded-full size-10 hover:bg-background shadow-sm"
            onclick={nextSlide}
          >
            <ChevronRight class="size-5" />
          </Button>
        </div>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
