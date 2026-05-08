<script lang="ts">
  import {
    Calendar,
    Clock,
    MapPin,
    ArrowLeft,
    ArrowRight,
    Share2,
    CreditCard,
    Heart,
    ShieldCheck,
    Users,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import MeshGradient from "$lib/components/widgets/MeshGradient.svelte";

  let { data } = $props();
  const event = $derived(data.event);

  function handleShare() {
    if (navigator.share) {
      navigator
        .share({
          title: event.title,
          text:
            event?.description?.replace(/<[^>]*>/g, "").slice(0, 100) + "...",
          url: window.location.href,
        })
        .catch(console.error);
    }
  }
</script>

<svelte:head>
  <title>{event.title} | Ladies in Tech</title>
  <meta
    name="description"
    content={event.description?.replace(/<[^>]*>/g, "").slice(0, 160)}
  />
</svelte:head>

<div class="bg-background min-h-screen relative overflow-hidden py-8">
  <MeshGradient />

  <div
    class="fixed inset-0 pointer-events-none opacity-5 -z-20 [mask-image:linear-gradient(180deg,var(--foreground),transparent)]"
    style="background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, currentColor 39px, currentColor 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, currentColor 39px, currentColor 40px);"
  ></div>

  <div class="container mx-auto px-4 max-w-6xl">
    <!-- Back Button -->
    <Button
      variant="ghost"
      href="/ladies-in-tech"
      class="mb-8 gap-2 rounded-xl text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft class="size-4" /> Back to Calendar
    </Button>

    <div class="grid lg:grid-cols-3 gap-12">
      <!-- Main Content -->
      <div
        class="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700"
      >
        <!-- Hero Image -->
        <div
          class="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 group"
        >
          {#if event.imageUrl}
            <img
              src={event.imageUrl}
              alt={event.title}
              class="w-full h-full object-cover"
            />
          {:else}
            <div
              class="w-full h-full bg-gradient-to-br from-pink-500/20 to-primary/10 flex items-center justify-center"
            >
              <Heart class="size-24 text-pink-500/20" />
            </div>
          {/if}
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
          ></div>
          <div
            class="absolute bottom-6 left-6 right-6 flex items-end justify-between"
          >
            <Badge
              class="bg-pink-600 text-white border-none px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
            >
              {event.category?.replace("-", " ") || "Community"}
            </Badge>
          </div>
        </div>

        <!-- Header -->
        <div class="space-y-4">
          <h1
            class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none text-foreground"
          >
            {event.title}
          </h1>
          <div
            class="flex flex-wrap gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest"
          >
            <div class="flex items-center gap-2">
              <Calendar class="size-4 text-pink-500" />
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div class="flex items-center gap-2">
              <Clock class="size-4 text-pink-500" />
              {new Date(event.date).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        <!-- Description -->
        <Card.Root
          class="border-none bg-card/40 backdrop-blur-md p-4 rounded-3xl shadow-xl"
        >
          <div
            class="prose prose-pink dark:prose-invert max-w-none text-lg font-medium leading-relaxed"
          >
            {@html event.description}
          </div>
        </Card.Root>
      </div>

      <!-- Sticky Registration Sidebar -->
      <div class="lg:col-span-1">
        <div
          class="sticky top-32 space-y-6 animate-in fade-in slide-in-from-right-5 duration-700 delay-200"
        >
          <Card.Root
            class="overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl border-2 border-pink-500/10 pt-0"
          >
            <div class="p-6 bg-pink-500/5 border-b border-border/50">
              <div class="flex items-center gap-3">
                <div
                  class="size-10 rounded-xl bg-pink-500/10 flex items-center justify-center"
                >
                  <Heart class="size-5 text-pink-500" />
                </div>
                <div>
                  <h3 class="font-bold text-lg uppercase tracking-tight">
                    Event Details
                  </h3>
                  <p
                    class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    Join us for this experience
                  </p>
                </div>
              </div>
            </div>

            <Card.Content class="p-4 pt-0 space-y-8">
              <div class="space-y-6">
                <div class="flex gap-4">
                  <div
                    class="size-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 border border-border/50"
                  >
                    <MapPin class="size-5 text-pink-500" />
                  </div>
                  <div>
                    <p
                      class="text-[10px] font-bold uppercase text-pink-600 tracking-widest mb-1"
                    >
                      Location
                    </p>
                    <p class="font-bold text-foreground">
                      {event.location || "Online / To be Announced"}
                    </p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div
                    class="size-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 border border-border/50"
                  >
                    <ShieldCheck class="size-5 text-pink-500" />
                  </div>
                  <div>
                    <p
                      class="text-[10px] font-bold uppercase text-pink-600 tracking-widest mb-1"
                    >
                      Status
                    </p>
                    <p class="font-bold text-foreground capitalize">
                      {event.status}
                    </p>
                  </div>
                </div>
              </div>

              <div class="space-y-4 pt-4">
                {#if event.status === "upcoming"}
                  <Button
                    href={event.registrationUrl ||
                      `/ladies-in-tech/${event.id}/register`}
                    class="w-full shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Register Now <ArrowRight class="ml-2 size-4" />
                  </Button>

                  {#if event.paymentUrl}
                    <Button
                      href={event.paymentUrl}
                      variant="outline"
                      target="_blank"
                      class="w-full border-pink-500/20 text-pink-600 hover:bg-pink-500/5"
                    >
                      Make Payment <CreditCard class="ml-2 size-4" />
                    </Button>
                  {/if}
                {:else}
                  <Button
                    variant="outline"
                    disabled
                    class="w-full rounded-2xl uppercase opacity-60"
                  >
                    Registration Closed
                  </Button>
                {/if}

                <Button
                  variant="ghost"
                  onclick={handleShare}
                  class="w-full text-muted-foreground hover:text-foreground"
                >
                  <Share2 class="mr-2 size-4" /> Share Event
                </Button>
              </div>
            </Card.Content>
          </Card.Root>

          <!-- Community Card -->
          <div
            class="p-8 rounded-3xl bg-primary/5 border border-primary/10 text-center space-y-4"
          >
            <Users class="size-10 text-primary mx-auto opacity-40" />
            <h4 class="font-bold uppercase tracking-tighter text-lg">
              Community Impact
            </h4>
            <p
              class="text-sm font-medium text-muted-foreground leading-relaxed"
            >
              Every event supports our mission to empower women in the tech
              ecosystem across Africa.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :global(.prose-pink h1, .prose-pink h2, .prose-pink h3) {
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.025em;
    color: var(--primary);
  }

  :global(.prose-pink p) {
    margin-bottom: 1.5rem;
  }
</style>
