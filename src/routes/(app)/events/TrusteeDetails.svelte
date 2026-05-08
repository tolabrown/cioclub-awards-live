<script lang="ts">
  import { Linkedin, Info, Users } from "@lucide/svelte";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Button } from "$lib/components/ui/button";

  let { member } = $props();
</script>

<div class="grid gap-8 md:grid-cols-[200px_1fr] items-start">
  <!-- Profile Side -->
  <div class="space-y-6">
    <div class="relative group mx-auto md:mx-0">
      <div
        class="size-48 md:size-48 rounded-2xl border border-border overflow-hidden bg-muted flex items-center justify-center p-1 group-hover:border-primary/50 transition-colors duration-500 shadow-xl"
      >
        <div
          class="w-full h-full rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700"
        >
          {#if member.image}
            <img
              src={member.image}
              alt={member.name}
              class="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
          {:else}
            <Users class="size-16 text-muted-foreground/30" />
          {/if}
        </div>
      </div>

      <!-- Premium Badge Over Image -->
      <div
        class="absolute -bottom-3 left-1/2 -translate-x-1/2 md:left-4 md:translate-x-0"
      >
        <div
          class="bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
        >
          Board of Trustees
        </div>
      </div>
    </div>

    <!-- Social Links -->
    <div class="flex flex-col gap-3 pt-6">
      {#if member.linkedinUrl}
        <Button
          href={member.linkedinUrl}
          target="_blank"
          variant="outline"
          class="w-full h-11 rounded-xl border-primary/20 hover:border-primary hover:bg-primary/5 gap-3 group/link transition-all"
        >
          <div
            class="size-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover/link:bg-primary group-hover/link:text-white transition-colors"
          >
            <Linkedin class="size-3.5" />
          </div>
          <span
            class="text-[10px] font-bold uppercase tracking-widest text-foreground"
            >Connect on LinkedIn</span
          >
        </Button>
      {/if}
    </div>
  </div>

  <!-- Content Side -->
  <div class="space-y-6">
    <div class="space-y-2">
      <h2
        class="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground leading-none"
      >
        {member.name}
      </h2>
      <p
        class="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-primary italic"
      >
        {member.role}
      </p>
    </div>

    <div
      class="h-px bg-gradient-to-r from-border via-border to-transparent"
    ></div>

    <div class="space-y-4">
      <div
        class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
      >
        <Info class="size-3.5 text-primary" />
        Executive Biography
      </div>

      <ScrollArea class="h-[300px] md:h-[350px] pr-6">
        <div
          class="text-base leading-relaxed text-muted-foreground font-medium space-y-4"
        >
          {#if member.bio}
            {@html member.bio
              .split("\n")
              .map((p) => `<p>${p}</p>`)
              .join("")}
          {:else}
            <p>No biography available.</p>
          {/if}
        </div>
      </ScrollArea>
    </div>
  </div>
</div>
