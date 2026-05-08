<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Card from "$lib/components/ui/card";
  import {
    Plus,
    Trash2,
    LayoutDashboard,
    Target,
    Shield,
    Sparkles,
    BarChart3,
    Image as ImageIcon,
    ChevronDown,
    ChevronUp,
  } from "@lucide/svelte";
  import ImageUpload from "$lib/components/widgets/ImageUpload.svelte";
  import { slide } from "svelte/transition";

  let { data = $bindable(), onchange = () => {} } = $props();

  function ensureStructure(obj: any) {
    if (!obj) obj = {};
    if (!obj.hero) obj.hero = { slides: [] };
    if (!obj.mission) obj.mission = { title: "", content: "" };
    if (!obj.vision) obj.vision = { title: "", content: "" };
    if (!obj.eclEdge) obj.eclEdge = { title: "", content: "" };
    if (!obj.stats) obj.stats = [];
    return obj;
  }

  // Ensure structure for SSR
  data = ensureStructure(data);

  // Re-ensure structure on client for dynamic updates
  $effect.pre(() => {
    data = ensureStructure(data);
  });

  function addSlide() {
    data.hero.slides = [
      ...data.hero.slides,
      {
        title: "",
        subtitle: "",
        description: "",
        desktopImage: "",
        mobileImage: "",
        primaryCta: { text: "", href: "" },
        secondaryCta: { text: "", href: "" },
      },
    ];
  }

  function removeSlide(index: number) {
    data.hero.slides = data.hero.slides.filter(
      (_: any, i: number) => i !== index,
    );
  }

  function addStat() {
    data.stats = [...data.stats, { value: "", label: "", emoji: "✨" }];
  }

  function removeStat(index: number) {
    data.stats = data.stats.filter((_: any, i: number) => i !== index);
  }

  let expandedSlide = $state(0);
</script>

<div class="space-y-12">
  <!-- Hero Section -->
  <section id="hero" class="scroll-mt-32 space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="bg-primary/10 p-2.5 rounded-xl text-primary shadow-sm border border-primary/20"
        >
          <LayoutDashboard class="size-5" />
        </div>
        <div>
          <h2 class="text-xl font-bold tracking-tight">Hero Carousel</h2>
          <p
            class="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-70"
          >
            Manage your homepage slides and calls to action
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onclick={addSlide}
        class="rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 border-primary/20 hover:bg-primary/5 text-primary shadow-sm"
      >
        <Plus class="size-3.5" /> Add Slide
      </Button>
    </div>

    <div class="space-y-4">
      {#each data?.hero?.slides || [] as slide_item, i}
        <Card.Root
          class="overflow-hidden border-border/50 bg-card/30 backdrop-blur-sm shadow-md transition-all"
        >
          <button
            type="button"
            class="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
            onclick={() => (expandedSlide = expandedSlide === i ? -1 : i)}
          >
            <div class="flex items-center gap-4">
              <div
                class="size-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-[10px] font-bold text-primary"
              >
                {i + 1}
              </div>
              <div>
                <h3
                  class="font-bold text-sm truncate max-w-[200px] md:max-w-md"
                >
                  {slide_item.title || "Untitled Slide"}
                </h3>
                <p class="text-[10px] text-muted-foreground font-medium">
                  {slide_item.subtitle || "No subtitle"}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                class="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onclick={(e) => {
                  e.stopPropagation();
                  removeSlide(i);
                }}
              >
                <Trash2 class="size-4" />
              </Button>
              {#if expandedSlide === i}
                <ChevronUp class="size-4 text-muted-foreground" />
              {:else}
                <ChevronDown class="size-4 text-muted-foreground" />
              {/if}
            </div>
          </button>

          {#if expandedSlide === i}
            <div
              class="px-6 pb-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-4">
                  <div class="space-y-2">
                    <Label
                      class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                      >Main Title</Label
                    >
                    <Input
                      bind:value={slide_item.title}
                      placeholder="e.g. A Successful Strategy For Your Business"
                      class="rounded-xl h-11"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label
                      class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                      >Subtitle</Label
                    >
                    <Input
                      bind:value={slide_item.subtitle}
                      placeholder="e.g. Enterprise Governance"
                      class="rounded-xl h-11"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >Description</Label
                  >
                  <Textarea
                    bind:value={slide_item.description}
                    placeholder="Short summary for the slide..."
                    rows={4}
                    class="rounded-xl resize-none"
                  />
                </div>
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                <ImageUpload
                  label="Desktop Image (1400x525)"
                  bind:value={slide_item.desktopImage}
                  {onchange}
                  ondelete={onchange}
                />
                <ImageUpload
                  label="Mobile Image (1400x787)"
                  bind:value={slide_item.mobileImage}
                  {onchange}
                  ondelete={onchange}
                />
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                <div
                  class="p-4 rounded-2xl border border-primary/10 bg-primary/5 space-y-4"
                >
                  <h4
                    class="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2"
                  >
                    <Sparkles class="size-3" /> Primary Action
                  </h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <Label
                        class="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground"
                        >Button Text</Label
                      >
                      <Input
                        bind:value={slide_item.primaryCta.text}
                        placeholder="e.g. Get Started"
                        class="h-9 rounded-lg"
                      />
                    </div>
                    <div class="space-y-1">
                      <Label
                        class="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground"
                        >Target URL</Label
                      >
                      <Input
                        bind:value={slide_item.primaryCta.href}
                        placeholder="/services"
                        class="h-9 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="p-4 rounded-2xl border border-muted-foreground/10 bg-muted/5 space-y-4"
                >
                  <h4
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
                  >
                    <ImageIcon class="size-3" /> Secondary Action
                  </h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <Label
                        class="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground"
                        >Button Text</Label
                      >
                      <Input
                        bind:value={slide_item.secondaryCta.text}
                        placeholder="e.g. Learn More"
                        class="h-9 rounded-lg"
                      />
                    </div>
                    <div class="space-y-1">
                      <Label
                        class="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground"
                        >Target URL</Label
                      >
                      <Input
                        bind:value={slide_item.secondaryCta.href}
                        placeholder="/about"
                        class="h-9 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </Card.Root>
      {/each}

      {#if !data?.hero?.slides || data.hero.slides.length === 0}
        <div
          class="py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-muted/5 border-muted-foreground/20 text-center space-y-4"
        >
          <div
            class="size-16 rounded-full bg-muted/10 flex items-center justify-center text-muted-foreground/40"
          >
            <LayoutDashboard class="size-8" />
          </div>
          <div>
            <p class="font-bold text-muted-foreground">No slides configured</p>
            <p class="text-xs text-muted-foreground/60">
              Click the button above to add your first slide
            </p>
          </div>
        </div>
      {/if}
    </div>
  </section>

  <!-- Mission & Vision Section -->
  <section id="mission" class="scroll-mt-32 space-y-6">
    <div class="flex items-center gap-3">
      <div
        class="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-600 shadow-sm border border-emerald-500/20"
      >
        <Target class="size-5" />
      </div>
      <div>
        <h2 class="text-xl font-bold tracking-tight">Purpose & Values</h2>
        <p
          class="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-70"
        >
          Core mission, vision, and the ECL Edge
        </p>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Mission -->
      <Card.Root class="border-border/50 shadow-md">
        <Card.Header>
          <Card.Title
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600"
            >Our Mission</Card.Title
          >
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Title</Label
            >
            <Input
              bind:value={data.mission.title}
              placeholder="Section Heading"
              class="rounded-xl font-bold"
            />
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Content</Label
            >
            <Textarea
              bind:value={data.mission.content}
              placeholder="Enter mission statement..."
              rows={6}
              class="rounded-xl leading-relaxed"
            />
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Vision -->
      <Card.Root class="border-border/50 shadow-md">
        <Card.Header>
          <Card.Title
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600"
            >Our Vision</Card.Title
          >
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Title</Label
            >
            <Input
              bind:value={data.vision.title}
              placeholder="Section Heading"
              class="rounded-xl font-bold"
            />
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Content</Label
            >
            <Textarea
              bind:value={data.vision.content}
              placeholder="Enter vision statement..."
              rows={6}
              class="rounded-xl leading-relaxed"
            />
          </div>
        </Card.Content>
      </Card.Root>

      <!-- ECL Edge (Full Width) -->
      <Card.Root
        class="md:col-span-2 border-border/50 shadow-md bg-primary/[0.02]"
      >
        <Card.Header>
          <Card.Title
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2"
          >
            <Sparkles class="size-3.5 text-primary" /> The ECL Edge
          </Card.Title>
        </Card.Header>
        <Card.Content class="grid gap-6 md:grid-cols-3">
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Section Title</Label
            >
            <Input
              bind:value={data.eclEdge.title}
              placeholder="ECL Edge Heading"
              class="rounded-xl font-bold"
            />
          </div>
          <div class="md:col-span-2 space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Description</Label
            >
            <Textarea
              bind:value={data.eclEdge.content}
              placeholder="What makes Edniesal unique?"
              rows={3}
              class="rounded-xl leading-relaxed"
            />
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </section>

  <!-- Stats Section -->
  <section id="stats" class="scroll-mt-32 space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="bg-amber-500/10 p-2.5 rounded-xl text-amber-600 shadow-sm border border-amber-500/20"
        >
          <BarChart3 class="size-5" />
        </div>
        <div>
          <h2 class="text-xl font-bold tracking-tight">Impact Statistics</h2>
          <p
            class="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-70"
          >
            Numbers that highlight our achievements
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onclick={addStat}
        class="rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 border-amber-500/20 hover:bg-amber-500/5 text-amber-600 shadow-sm"
      >
        <Plus class="size-3.5" /> Add Statistic
      </Button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {#each data?.stats || [] as stat, i}
        <Card.Root
          class="relative group border-border/50 bg-card shadow-sm hover:border-amber-500/30 transition-all p-4"
        >
          <Button
            variant="ghost"
            size="icon"
            class="absolute top-1 right-1 size-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onclick={() => removeStat(i)}
          >
            <Trash2 class="size-3" />
          </Button>
          <div class="space-y-3 pt-2">
            <div class="flex items-center gap-3">
              <div
                class="size-10 rounded-xl bg-muted flex items-center justify-center text-lg"
              >
                <input
                  type="text"
                  bind:value={stat.emoji}
                  class="bg-transparent border-none text-center w-full focus:outline-none"
                />
              </div>
              <div class="flex-1">
                <Input
                  bind:value={stat.value}
                  placeholder="e.g. 100+"
                  class="h-8 font-bold text-center bg-muted/30 border-none"
                />
              </div>
            </div>
            <Input
              bind:value={stat.label}
              placeholder="Happy Clients"
              class="h-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center bg-muted/30 border-none"
            />
          </div>
        </Card.Root>
      {/each}

      {#if !data?.stats || data.stats.length === 0}
        <div
          class="col-span-full py-8 text-center bg-muted/5 border-2 border-dashed rounded-2xl border-muted-foreground/10"
        >
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40"
          >
            No stats added yet
          </p>
        </div>
      {/if}
    </div>
  </section>
</div>
