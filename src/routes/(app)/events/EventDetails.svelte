<script lang="ts">
  import { MapPin, Calendar, Clock, Info, ArrowRight } from "@lucide/svelte";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import { ScrollArea } from "$lib/components/ui/scroll-area";

  let { event } = $props();

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<div class="grid gap-6">
  {#if event.image?.directUrl || event.image?.url || event.coverImage?.directUrl || event.coverImage?.url}
    <div
      class="relative w-full max-h-[500px] overflow-hidden -mx-8 -mt-8 mb-4 bg-[#050A18] flex items-center justify-center p-4 min-h-[300px]"
    >
      <img
        src={event.image?.directUrl || event.image?.url || event.coverImage?.directUrl || event.coverImage?.url}
        alt={event.title}
        class="max-w-full max-h-[480px] w-auto h-auto object-contain transition-transform duration-500 hover:scale-105"
      />
      <div class="absolute top-4 left-4">
        <Badge
          variant={event.status === "upcoming" ? "default" : "secondary"}
          class="rounded-lg px-4 py-1 text-[10px] uppercase font-bold tracking-widest"
        >
          {event.status}
        </Badge>
      </div>
    </div>
  {/if}

  <div class="space-y-4">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold uppercase tracking-tight text-foreground">
        {event.title}
      </h2>
      <div
        class="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground"
      >
        <div class="flex items-center gap-2">
          <Calendar class="size-4 text-primary" />
          {formatDate(event.date)}
        </div>
        {#if event.location}
          <div class="flex items-center gap-2">
            <MapPin class="size-4 text-primary" />
            {event.location}
          </div>
        {/if}
      </div>
    </div>

    <div class="h-px bg-border/50"></div>

    <div class="space-y-4">
      <div
        class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"
      >
        <Info class="size-3" />
        About the Event
      </div>

      <ScrollArea class="max-h-[60vh] pr-4">
        <div
          class="text-base leading-relaxed text-muted-foreground font-normal whitespace-pre-wrap wrap-break-word"
        >
          {#each event.description.split(/(\s+)/) as part}
            {#if part.match(/^https?:\/\/\S+/) || part.match(/^www\.\S+/)}
              <a
                href={part.startsWith("http") ? part : `https://${part}`}
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary hover:underline"
              >
                {part}
              </a>
            {:else}
              {part}
            {/if}
          {/each}
        </div>
      </ScrollArea>

      {#if event.registrationLink}
        <div class="pt-4">
          <a
            href={event.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Register Now
            <ArrowRight class="size-3" />
          </a>
          <p
            class="text-[10px] text-muted-foreground mt-2 break-all opacity-60"
          >
            Link: <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" class="hover:underline text-primary">{event.registrationLink}</a>
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
