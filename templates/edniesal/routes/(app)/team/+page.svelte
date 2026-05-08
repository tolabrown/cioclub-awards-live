<script lang="ts">
  import MeshGradient from "$lib/components/widgets/MeshGradient.svelte";
  import ExecutiveProfiles from "$lib/components/sections/ExecutiveProfiles.svelte";
  import CVApplicationModal from "$lib/components/sections/CVApplicationModal.svelte";
  import {
    Linkedin,
    Mail,
    ArrowRight,
    Users,
    Award,
    Shield,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";

  let { data } = $props();
  const page = $derived(data.page.data);
  let cvModalOpen = $state(false);
</script>

<svelte:head>
  <title>{data.page.title}</title>
  <meta name="description" content={data.page.description} />
</svelte:head>

<div
  class="bg-background min-h-screen text-foreground relative overflow-hidden"
>
  <!-- Grid Pattern -->
  <div
    class="fixed inset-0 pointer-events-none opacity-5 -z-20 [mask-image:linear-gradient(180deg,var(--foreground),transparent)]"
    style="background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, currentColor 39px, currentColor 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, currentColor 39px, currentColor 40px);"
  ></div>

  <!-- Hero Section -->
  <section
    class="relative py-32 overflow-hidden flex items-center justify-center text-center min-h-[50vh]"
  >
    <MeshGradient />
    <div class="container mx-auto px-4 relative z-10">
      <div
        class="inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 mb-6 animate-in fade-in slide-in-from-bottom-4"
      >
        <Users class="w-4 h-4 text-primary mr-2" />
        <span class="text-xs font-bold text-primary tracking-widest uppercase"
          >The Brains Behind the Vision</span
        >
      </div>
      <h1
        class="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        World-Class <span class="text-primary italic">Leadership</span>
      </h1>
      <p
        class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        {page.overview}
      </p>
    </div>
  </section>

  <!-- Board of Directors -->
  <ExecutiveProfiles leaders={page.board} title="Board of Directors" />

  <!-- Management Team -->
  <section class="py-24 relative">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16 animate-in fade-in duration-700">
        <div
          class="inline-flex items-center rounded-xl border border-accent/20 bg-accent/5 px-4 py-2 mb-4"
        >
          <Award class="w-4 h-4 text-accent mr-2" />
          <span class="text-xs font-bold text-accent tracking-widest uppercase"
            >Management Excellence</span
          >
        </div>
        <h2 class="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
          Our Executive Team
        </h2>
        <p class="text-muted-foreground font-medium max-w-xl mx-auto">
          The driving force behind our day-to-day excellence and strategic
          implementation across Africa.
        </p>
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
      >
        {#each page.team || [] as member, i}
          <div
            class="group relative animate-in fade-in slide-in-from-bottom-8 duration-700"
            style="animation-delay: {i * 100}ms"
          >
            <div
              class="absolute -inset-2 bg-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
            <Card.Root
              class="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:border-primary/30 transition-all pt-0"
            >
              <div class="aspect-square overflow-hidden relative">
                <img
                  src={member.image?.url ||
                    member.imageUrl ||
                    "/team/placeholder.webp"}
                  alt={member.name}
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6"
                >
                  <div class="flex gap-2">
                    {#if member.linkedinUrl}
                      <Button
                        href={member.linkedinUrl}
                        target="_blank"
                        variant="outline"
                        size="icon"
                        class="rounded-full border-white/20 text-white hover:bg-white/10 bg-transparent! backdrop-blur-md"
                      >
                        <Linkedin class="w-4 h-4" />
                      </Button>
                    {/if}
                  </div>
                </div>
              </div>
              <Card.Header class="p-6">
                <Card.Title
                  class="text-xl font-bold group-hover:text-primary transition-colors"
                  >{member.name}</Card.Title
                >
                <Card.Description
                  class="text-primary font-bold text-xs uppercase tracking-widest"
                  >{member.role}</Card.Description
                >
              </Card.Header>
              {#if member.bio}
                <Card.Content class="px-6 pb-6 pt-0">
                  <p
                    class="text-muted-foreground text-sm font-medium line-clamp-3 leading-relaxed"
                  >
                    {member.bio}
                  </p>
                </Card.Content>
              {/if}
            </Card.Root>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Culture Section -->
  <section class="py-24 relative overflow-hidden">
    <div class="container mx-auto px-4">
      <div
        class="glass border-border p-12 rounded-2xl relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 shadow-xl"
      >
        <div class="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          <div class="flex-1 text-center md:text-left">
            <div
              class="inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 px-3 py-1 mb-4"
            >
              <Shield class="w-4 h-4 text-primary mr-2" />
              <span
                class="text-xs font-bold text-primary tracking-widest uppercase"
                >ECL Culture</span
              >
            </div>
            <h2 class="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Join Our Vision
            </h2>
            <p
              class="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl"
            >
              We are always looking for exceptional talent with grit and an
              entrepreneurial spirit to join our growing global team. Diversity
              and respect for individual differences are our touchstones.
            </p>
          </div>
          <div class="shrink-0">
            <Button type="button" onclick={() => (cvModalOpen = true)}>
              Send Your CV <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <CVApplicationModal bind:open={cvModalOpen} />
</div>
