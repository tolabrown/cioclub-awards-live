<script lang="ts">
  import * as Icons from "@lucide/svelte";
  import {
    Search,
    FileText,
    Video,
    Image as ImageIcon,
    Download,
    Eye,
    ExternalLink,
    Calendar,
    Tag,
    Filter,
    X,
    PlayCircle,
    FileDown,
    ChevronRight,
    Music,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Badge } from "$lib/components/ui/badge";
  import * as Tabs from "$lib/components/ui/tabs";
  import * as Card from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { cn } from "$lib/utils";

  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";

  interface PageData {
    content: { hero: { badge: string; title: string; description: string } };
    resources: any[];
  }

  let { data }: { data: PageData } = $props();
  const isMobile = new IsMobile();

  const content = $derived(data.content);
  const resources = $derived(data.resources || []);

  function getIcon(name: string) {
    return (Icons as any)[name] || Icons.FileText;
  }

  function getColorClass(color: string, type: "text" | "bg") {
    if (!color) return type === "text" ? "text-primary" : "bg-primary/10";
    if (color.startsWith("text-") || color.startsWith("bg-")) {
      const base = color.split("-").slice(1).join("-").replace("/10", "");
      return type === "text" ? `text-${base}` : `bg-${base}/10`;
    }
    return type === "text" ? `text-${color}` : `bg-${color}/10`;
  }

  let searchQuery = $state("");
  let activeCategory = $state("All");
  let selectedResource = $state<any>(null);
  let viewerOpen = $state(false);

  const categories = [
    "All",
    "Report",
    "Whitepaper",
    "Case Study",
    "Video",
    "Audio",
    "Image",
  ];

  const filteredResources = $derived(
    resources.filter((r: any) => {
      const title = r.title || "";
      const description = r.description || "";
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || r.category === activeCategory;
      return matchesSearch && matchesCategory;
    }),
  );

  function getResourceIcon(category: string) {
    switch (category) {
      case "Video":
        return Video;
      case "Image":
        return ImageIcon;
      case "Audio":
        return Icons.Music;
      default:
        return FileText;
    }
  }

  function openViewer(item: any) {
    selectedResource = item;
    viewerOpen = true;
  }
</script>

<div class="min-h-screen">
  <!-- Hero Section -->
  <section
    class="relative py-32 bg-primary text-primary-foreground overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(#135bec22_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
    ></div>
    <div
      class="container mx-auto px-4 relative z-10 text-center space-y-8 pt-20"
    >
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
      >
        <FileText class="size-4" />
        {content.hero.badge}
      </div>
      <h1
        class="text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight tracking-tight"
      >
        {content.hero.title}
      </h1>
      <p
        class="text-xl text-primary-foreground/80 max-w-2xl mx-auto font-medium"
      >
        {content.hero.description}
      </p>
    </div>
  </section>

  <!-- Filter & Search Section -->
  <section
    class="py-12 bg-muted/30 border-b border-border sticky top-20 z-30 backdrop-blur-md"
  >
    <div class="container mx-auto px-4">
      <div class="flex flex-col lg:flex-row gap-8 items-center justify-between">
        <div class="flex flex-wrap items-center gap-2">
          {#each categories as category}
            <button
              onclick={() => (activeCategory = category)}
              class={cn(
                "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                activeCategory === category
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-background border border-border/50 text-muted-foreground hover:border-primary/30",
              )}
            >
              {category}
            </button>
          {/each}
        </div>

        <div class="relative w-full lg:w-96">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground opacity-50"
          />
          <Input
            bind:value={searchQuery}
            placeholder="Search resources..."
            class="pl-12 h-14 bg-background border-border/50 rounded-xl shadow-sm focus:ring-primary"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- Resources Grid -->
  <section class="py-24 bg-background min-h-[600px]">
    <div class="container mx-auto px-4">
      {#if filteredResources.length > 0}
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {#each filteredResources as item}
            {@const Icon = getResourceIcon(item.category)}
            <div
              class="group flex flex-col bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
            >
              <!-- Preview Area -->
              <button
                class="relative aspect-video overflow-hidden bg-muted w-full text-left cursor-pointer group/btn"
                onclick={() => openViewer(item)}
              >
                {#if item.coverImage}
                  <img
                    src={item.coverImage.directUrl || item.coverImage.url}
                    alt={item.title}
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                {:else}
                  <div
                    class="w-full h-full flex items-center justify-center opacity-10"
                  >
                    <Icon class="size-20" />
                  </div>
                {/if}

                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <div
                    class="bg-secondary text-secondary-foreground px-4 py-2 rounded-full shadow-2xl scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 font-bold"
                  >
                    View Material
                  </div>
                </div>

                <div
                  class="absolute top-4 right-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Badge variant="secondary" class="font-bold uppercase"
                    >{item.category}</Badge
                  >
                </div>

                {#if item.category === "Video"}
                  <div
                    class="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div
                      class="size-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-all duration-500"
                    >
                      <PlayCircle class="size-8" />
                    </div>
                  </div>
                {/if}
              </button>

              <!-- Content Area -->
              <div class="p-8 flex-1 flex flex-col space-y-6">
                <div class="space-y-3 flex-1 text-left">
                  <button
                    class="text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors leading-tight text-left w-full"
                    onclick={() => openViewer(item)}
                  >
                    {item.title}
                  </button>
                  {#if item.description}
                    <p
                      class="text-muted-foreground font-medium line-clamp-3 leading-relaxed"
                    >
                      {item.description}
                    </p>
                  {/if}
                </div>

                <div
                  class="pt-6 border-t border-border/50 flex items-center justify-between"
                >
                  <span
                    class="text-xs font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    {item.publishedDate
                      ? new Date(item.publishedDate).toLocaleDateString(
                          "en-US",
                          { month: "long", year: "numeric" },
                        )
                      : "Recently Added"}
                  </span>

                  <div class="flex items-center gap-2">
                    {#if item.media && item.media[0]?.file}
                      <Button
                        variant="ghost"
                        size="sm"
                        onclick={() => openViewer(item)}
                        class="size-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                        title="View Online"
                      >
                        <Eye class="size-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        href={item.media[0].file.directUrl || item.media[0].file.url}
                        target="_blank"
                        class="size-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                        title="Download"
                      >
                        <Download class="size-5" />
                      </Button>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div
          class="py-32 text-center space-y-8 animate-in fade-in zoom-in duration-500"
        >
          <div
            class="size-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto border-2 border-dashed border-border"
          >
            <Filter class="size-10 text-muted-foreground opacity-20" />
          </div>
          <div class="space-y-2">
            <h3 class="text-2xl font-bold text-foreground">
              No resources found
            </h3>
            <p class="text-muted-foreground font-medium">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </div>
          <Button
            onclick={() => {
              searchQuery = "";
              activeCategory = "All";
            }}
            variant="outline"
            class="rounded-xl font-bold"
          >
            Reset Filters
          </Button>
        </div>
      {/if}
    </div>
  </section>

  <!-- Request Section -->
  <section
    class="py-32 bg-primary text-primary-foreground relative overflow-hidden"
  >
    <div class="absolute inset-0 bg-grid-white opacity-5"></div>
    <div class="container mx-auto px-4 relative z-10 text-center space-y-10">
      <h2 class="text-4xl font-bold tracking-tight uppercase max-w-2xl mx-auto">
        Can't find what you need?
      </h2>
      <p
        class="text-xl text-primary-foreground/80 font-medium max-w-2xl mx-auto"
      >
        Our research team is constantly working on new insights. Request a
        specific topic or case study.
      </p>
      <Button
        variant="secondary"
        size="lg"
        href="/contact"
        class="font-bold uppercase tracking-widest h-14 px-10 shadow-xl active:scale-95 transition-all"
      >
        Contact Research Team
      </Button>
    </div>
  </section>
</div>

<!-- Resource Viewer Dialog/Drawer -->
{#if viewerOpen && selectedResource}
  {#if !isMobile.current}
    <Dialog.Root open={true} onOpenChange={(o) => !o && (viewerOpen = false)}>
      <Dialog.Content
        class="max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl"
      >
        {@render ResourceViewer()}
      </Dialog.Content>
    </Dialog.Root>
  {:else}
    <Drawer.Root open={true} onOpenChange={(o) => !o && (viewerOpen = false)}>
      <Drawer.Content class="p-0 rounded-t-[2rem] max-h-[95vh] flex flex-col">
        <div class="overflow-y-auto p-4 flex-1">
          {@render ResourceViewer()}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  {/if}
{/if}

{#snippet ResourceViewer()}
  <div class="bg-card flex flex-col">
    <div
      class="p-6 border-b flex items-center justify-between sticky top-0 bg-card z-10"
    >
      <div class="flex items-center gap-4">
        <div
          class="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
        >
          {#if getResourceIcon(selectedResource.category)}
            {@const Icon = getResourceIcon(selectedResource.category)}
            <Icon class="size-5" />
          {/if}
        </div>
        <div>
          <h2 class="text-xl font-bold leading-tight">
            {selectedResource.title}
          </h2>
          <p class="text-xs text-muted-foreground uppercase tracking-widest">
            {selectedResource.category} • {new Date(
              selectedResource.publishedDate,
            ).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        {#if selectedResource.media?.[0]?.file}
          <Button
            variant="outline"
            size="sm"
            href={selectedResource.media[0].file.directUrl || selectedResource.media[0].file.url}
            target="_blank"
            class="rounded-xl gap-2 font-bold"
          >
            <Download class="size-4" /> Download
          </Button>
        {/if}
        {#if !isMobile.current}
          <Button
            variant="ghost"
            size="icon"
            onclick={() => (viewerOpen = false)}
            class="rounded-full"
          >
            <X class="size-5" />
          </Button>
        {/if}
      </div>
    </div>

    <div class="p-6 space-y-8">
      <!-- Media Content Renderer -->
      <div class="rounded-2xl overflow-hidden bg-black/5 shadow-inner">
        {#if selectedResource.media?.[0]?.file}
          {#if selectedResource.category === "Video" || selectedResource.media[0].file.type?.includes("video")}
            <video controls class="w-full aspect-video rounded-2xl shadow-2xl">
              <source
                src={selectedResource.media[0].file.directUrl ||
                  selectedResource.media[0].file.url}
                type={selectedResource.media[0].file.type}
              />
              Your browser does not support the video tag.
            </video>
          {:else if selectedResource.category === "Audio" || selectedResource.media[0].file.type?.includes("audio")}
            <div
              class="p-12 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-primary/5 to-primary/10"
            >
              <div
                class="size-24 rounded-full bg-white shadow-xl flex items-center justify-center text-primary animate-pulse"
              >
                <Music class="size-10" />
              </div>
              <audio controls class="w-full max-w-md">
                <source
                  src={selectedResource.media[0].file.directUrl ||
                    selectedResource.media[0].file.url}
                  type={selectedResource.media[0].file.type}
                />
              </audio>
              <p class="text-xs font-bold uppercase tracking-widest opacity-50">
                Playing Audio Material
              </p>
            </div>
          {:else if selectedResource.media[0].file.type?.includes("pdf") || selectedResource.title
              .toLowerCase()
              .endsWith(".pdf")}
            <iframe
              src={selectedResource.media[0].file.viewUrl}
              title={selectedResource.title}
              class="w-full h-[75vh] rounded-2xl border shadow-lg bg-white"
            ></iframe>
          {:else}
            <div
              class="aspect-video flex flex-col items-center justify-center gap-4 text-muted-foreground"
            >
              <FileText class="size-16 opacity-10" />
              <p class="text-sm font-medium">
                This file type cannot be previewed online.
              </p>
              <Button
                variant="outline"
                href={selectedResource.media[0].file.directUrl ||
                  selectedResource.media[0].file.url}>Download to View</Button
              >
            </div>
          {/if}
        {:else}
          <div
            class="aspect-video flex items-center justify-center text-muted-foreground italic"
          >
            No media file attached to this resource.
          </div>
        {/if}
      </div>

      <!-- Description & Metadata -->
      <div class="flex flex-col gap-10">
        <div class="space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-widest opacity-50">
            About this material
          </h3>
          <p class="text-lg leading-relaxed font-medium">
            {selectedResource.description || "No description available."}
          </p>
        </div>
        <div class="space-y-6">
          <div class="p-8 rounded-2xl bg-muted/30 border space-y-6">
            <h4 class="text-xs font-bold uppercase tracking-widest opacity-50">
              Details
            </h4>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Type</span>
                <span class="font-bold">{selectedResource.category}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Release Date</span>
                <span class="font-bold"
                  >{new Date(
                    selectedResource.publishedDate,
                  ).toLocaleDateString()}</span
                >
              </div>
              {#if selectedResource.media?.[0]?.file}
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">File Size</span>
                  <span class="font-bold"
                    >{(
                      selectedResource.media[0].file.size /
                      (1024 * 1024)
                    ).toFixed(2)} MB</span
                  >
                </div>
              {/if}
            </div>
          </div>
          <Button
            class="w-full font-bold uppercase gap-2 shadow-xl active:scale-95 transition-all"
            onclick={() => (viewerOpen = false)}
          >
            Close Viewer
          </Button>
        </div>
      </div>
    </div>
  </div>
{/snippet}

<style>
  :global(.bg-grid-white) {
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    );
    background-size: 24px 24px;
  }
</style>
