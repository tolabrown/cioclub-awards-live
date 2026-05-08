<script lang="ts">
  import { onMount } from "svelte";
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
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import RichEditor from "$lib/components/ui/editor/rich-editor.svelte";
  import * as Card from "$lib/components/ui/card";
  import { toast } from "svelte-sonner";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import SectionWrapper from "./SectionWrapper.svelte";

  let { onchange = () => {} } = $props();

  let innerWidth = $state(0);
  let isMobile = $derived(innerWidth < 768);

  let events = $state<any[]>([]);
  let isLoading = $state(true);
  let isSubmitting = $state(false);
  let searchTerm = $state("");
  let statusFilter = $state("");

  const statusOptions = [
    { label: "Upcoming", value: "upcoming" },
    { label: "Past", value: "past" },
    { label: "Cancelled", value: "cancelled" },
  ];

  async function fetchEvents() {
    isLoading = true;
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(
        `/api/admin/ladies-in-tech?${params.toString()}`,
      );
      const result = await response.json();
      if (result.success) {
        events = result.results;
      }
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      isLoading = false;
    }
  }

  onMount(fetchEvents);

  $effect(() => {
    const debounced = setTimeout(fetchEvents, 300);
    return () => clearTimeout(debounced);
  });

  async function handleDeleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const response = await fetch("/api/admin/ladies-in-tech", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        toast.success("Event deleted");
        fetchEvents();
        if (onchange) onchange();
      }
    } catch (error) {
      toast.error("Error deleting event");
    }
  }
</script>

<svelte:window bind:innerWidth />

<SectionWrapper
  id="ladies-in-tech-events"
  title="Ladies in Tech Events"
  description="Manage upcoming and past events for the Ladies in Tech community"
  icon={Heart}
>
  {#snippet headerAction()}
    <Button
      variant="outline"
      size="sm"
      href="/admin/ladies-in-tech/new/edit"
      class="gap-2 rounded-lg text-primary border-primary/20 hover:bg-primary/10"
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
          bind:value={searchTerm}
          placeholder="Search events..."
          class="pl-10 h-11 rounded-xl border-border/50 focus:ring-primary/20"
        />
      </div>
      <div class="flex items-center gap-2 w-full md:w-[200px]">
        <SelectComponent
          name="status"
          placeholder="All Events"
          options={[{ label: "All Events", value: "" }, ...statusOptions]}
          bind:value={statusFilter}
          class="rounded-xl border-border/50"
        />
      </div>
    </div>

    <!-- Events List -->
    {#if isLoading}
      <div class="flex justify-center p-20">
        <Loader2 class="size-8 animate-spin text-primary/50" />
      </div>
    {:else}
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each events as event (event.id)}
          <div class="w-full h-full animate-in fade-in duration-300">
            <a
              href="/admin/ladies-in-tech/{event.id}/edit"
              class="group relative overflow-hidden rounded-2xl border bg-card/30 text-left transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex flex-col aspect-video w-full block"
            >
              <!-- Image Section -->
              <div class="relative overflow-hidden bg-muted w-full h-full">
                {#if event.imageUrl}
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                {:else}
                  <div
                    class="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-500/10 to-transparent"
                  >
                    <Calendar class="h-12 w-12 text-pink-500/20" />
                  </div>
                {/if}

                <!-- Gradient Overlay -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                ></div>

                <!-- Hover Action Buttons -->
                <div
                  class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Button
                    variant="secondary"
                    size="icon"
                    class="size-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/10 hover:bg-white/40"
                  >
                    <Edit2 class="size-4 text-white" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    class="size-8 rounded-lg"
                    onclick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteEvent(event.id);
                    }}
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </div>

              <!-- Content Overlay -->
              <div
                class="absolute bottom-0 left-0 w-full p-4 pointer-events-none"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md {event.status ===
                    'upcoming'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-white/90 backdrop-blur-sm'} border border-white/10"
                  >
                    {event.status}
                  </span>
                  <span
                    class="text-[9px] text-white/70 flex items-center gap-1"
                  >
                    <Clock class="size-3" />
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <h3
                  class="font-bold leading-tight line-clamp-1 text-sm text-white"
                >
                  {event.title}
                </h3>
                <p class="text-[10px] text-white/60 line-clamp-1">
                  {event.location || "Online / TBD"}
                </p>
              </div>
            </a>
          </div>
        {/each}

        {#if events.length === 0}
          <div
            class="col-span-full flex flex-col items-center justify-center p-20 text-muted-foreground bg-accent/5 rounded-2xl border-2 border-dashed"
          >
            <Calendar class="size-12 mb-4 opacity-20" />
            <p class="font-bold uppercase tracking-widest text-xs">
              No events found
            </p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</SectionWrapper>
