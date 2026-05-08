<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import {
    ChevronLeft,
    ChevronRight,
    X,
    ArrowRight,
    Megaphone,
    Newspaper,
    Mail,
    Send,
    CheckCircle,
    AlertCircle,
    Loader2,
    Phone,
  } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  let {
    popupCampaign = null,
    popupBlog = null,
    show = false,
    open = $bindable(false),
  }: {
    popupCampaign?: any;
    popupBlog?: any;
    show?: boolean;
    open?: boolean;
  } = $props();


  let currentSlide = $state(0);
  let email = $state("");
  let phone = $state("");
  let status = $state<"idle" | "loading" | "success" | "error">("idle");
  let message = $state("");

  // Build slides array based on available data
  const slideList = $derived.by(() => {
    const s: Array<{ type: "campaign" | "blog" | "newsletter"; data?: any }> = [];
    if (popupCampaign) s.push({ type: "campaign", data: popupCampaign });
    if (popupBlog) s.push({ type: "blog", data: popupBlog });
    s.push({ type: "newsletter" });
    return s;
  });

  const totalSlides = $derived(slideList.length);
  const currentSlideData = $derived(slideList[currentSlide]);

  const DISMISS_KEY = "popup_last_shown_date";

  function getTodayKey(): string {
    // Returns "YYYY-MM-DD" for today — used as the localStorage key value
    return new Date().toISOString().slice(0, 10);
  }

  function shouldShow(): boolean {
    if (!browser) return false;
    if (!show) return false;
    const lastShown = localStorage.getItem(DISMISS_KEY);
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
    if ((!email.trim() && !phone.trim()) || status === "loading") return;

    status = "loading";
    message = "";

    try {
      const res = await fetch("/api/popup-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json();
      status = data.success ? "success" : "error";
      message = data.message;

      if (data.success) {
        email = "";
        phone = "";
        dismiss();
      }
    } catch {
      status = "error";
      message = "Network error. Please try again.";
    }
  }

  let hasShown = $state(false);

  onMount(() => {
    if (shouldShow() && !hasShown) {
      hasShown = true;
      setTimeout(() => openPopup(), 800);
    }
  });

  function formatDate(dateStr: string | Date) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="sm:max-w-130 p-0 overflow-hidden bg-background border-primary/20 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
    showCloseButton={false}
  >
    <!-- Header with close button -->
    <div class="relative flex items-center justify-between px-6 pt-5 pb-2">
      <Badge
        variant="outline"
        class="border-primary/30 text-primary px-3 py-0.5 rounded-full uppercase text-[9px] font-bold tracking-widest"
      >
        {currentSlideData?.type === "campaign"
          ? "📢 Campaign"
          : currentSlideData?.type === "blog"
            ? "📰 Latest Blog"
            : "✉️ Newsletter"}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        class="rounded-full size-8 hover:bg-muted"
        onclick={dismiss}
      >
        <X class="size-4" />
      </Button>
    </div>

    <!-- Slide Content -->
    <div class="px-6 pb-4 flex-1 overflow-y-auto">
      {#if currentSlideData?.type === "campaign" && currentSlideData?.data}
        {@const campaign = currentSlideData.data}
        <div class="py-4">
          {#if campaign.imageUrl}
            <div class="rounded-xl overflow-hidden mb-6 aspect-video">
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                class="size-full object-cover"
              />
            </div>
          {/if}
          <h2 class="text-2xl font-bold leading-tight mb-3">{campaign.title}</h2>
          <p class="text-muted-foreground text-sm leading-relaxed mb-4">
            {campaign.description}
          </p>
          {#if campaign.startDate || campaign.endDate}
            <div class="flex items-center gap-3 mb-6 text-xs text-muted-foreground">
              {#if campaign.startDate}
                <span class="font-medium">
                  {campaign.startDate > new Date()
                    ? "Upcoming: "
                    : "Active until: "}
                  {campaign.startDate > new Date()
                    ? formatDate(campaign.startDate)
                    : formatDate(campaign.endDate || campaign.startDate)}
                </span>
              {/if}
            </div>
          {/if}
          <Button
            href="/campaigns/{campaign.id}"
            class="w-full rounded-xl font-bold group"
            onclick={dismiss}
          >
            Learn More
            <ArrowRight
              class="ml-2 size-4 transition-transform group-hover:translate-x-1"
            />
          </Button>
        </div>
      {:else if currentSlideData?.type === "blog" && currentSlideData?.data}
        {@const blog = currentSlideData.data}
        <div class="py-4">
          {#if blog.imageUrl}
            <div class="rounded-xl overflow-hidden mb-6 aspect-video">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                class="size-full object-cover"
              />
            </div>
          {/if}
          <h2 class="text-2xl font-bold leading-tight mb-3">{blog.title}</h2>
          <p class="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
            {blog.description}
          </p>
          <div class="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
            <Newspaper class="size-3" />
            <span class="font-medium">{formatDate(blog.createdAt)}</span>
          </div>
          <Button
            href="/blogs/{blog.id}"
            class="w-full rounded-xl font-bold group"
            onclick={dismiss}
          >
            Read Article
            <ArrowRight
              class="ml-2 size-4 transition-transform group-hover:translate-x-1"
            />
          </Button>
        </div>
      {:else}
        <!-- Newsletter Card -->
        <div class="py-6 text-center">
          <div
            class="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6"
          >
            <Mail class="size-8" />
          </div>
          <h2 class="text-2xl font-bold leading-tight mb-2">Stay Connected</h2>
          <p class="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Get the latest updates on study abroad opportunities, admissions tips,
            and exclusive offers delivered straight to your inbox.
          </p>

          {#if status === "success"}
            <div class="flex flex-col items-center gap-3 py-6">
              <div class="size-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle class="size-6 text-green-500" />
              </div>
              <p class="text-sm font-medium text-green-500">{message}</p>
            </div>
          {:else if status === "error"}
            <div class="flex flex-col items-center gap-3 py-4">
              <div class="size-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle class="size-6 text-red-500" />
              </div>
              <p class="text-sm font-medium text-red-500 mb-2">{message}</p>
              <Button
                variant="outline"
                class="rounded-lg text-xs"
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
              <div class="relative">
                <Mail
                  class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                />
                <Input
                  type="email"
                  bind:value={email}
                  placeholder="Email address"
                  disabled={status === "loading"}
                  class="pl-10 h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20"
                />
              </div>
              <div class="relative">
                <Phone
                  class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                />
                <Input
                  type="tel"
                  bind:value={phone}
                  placeholder="Phone number (optional)"
                  disabled={status === "loading"}
                  class="pl-10 h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20"
                />
              </div>
              <Button
                type="submit"
                class="w-full rounded-xl font-bold group"
                disabled={status === "loading"}
              >
                {#if status === "loading"}
                  <Loader2 class="mr-2 size-4 animate-spin" />
                  Subscribing...
                {:else}
                  Subscribe Now
                  <Send
                    class="ml-2 size-4 transition-transform group-hover:translate-x-1"
                  />
                {/if}
              </Button>
              <p class="text-xs text-muted-foreground">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Carousel Navigation -->
    {#if totalSlides > 1}
      <div class="flex items-center justify-between px-6 py-4 border-t border-muted">
        <div class="flex gap-2">
          {#each slideList as _, i}
            <button
              class="h-1.5 rounded-full transition-all {currentSlide === i
                ? 'w-8 bg-primary'
                : 'w-4 bg-muted-foreground/20 hover:bg-muted-foreground/40'}"
              onclick={() => (currentSlide = i)}
              aria-label="Go to slide {i + 1}"
            ></button>
          {/each}
        </div>
        <div class="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            class="rounded-full size-8 hover:bg-muted"
            onclick={prevSlide}
            disabled={totalSlides <= 1}
          >
            <ChevronLeft class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="rounded-full size-8 hover:bg-muted"
            onclick={nextSlide}
            disabled={totalSlides <= 1}
          >
            <ChevronRight class="size-4" />
          </Button>
        </div>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
