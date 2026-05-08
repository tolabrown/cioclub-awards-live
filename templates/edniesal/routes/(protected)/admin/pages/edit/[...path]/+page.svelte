<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import {
    Save,
    ArrowLeft,
    Info,
    FileText,
    Loader2,
    LayoutDashboard,
    Globe,
    Target,
    BarChart3,
    Sparkles,
    Hash,
    ChevronLeft,
    Users,
    Heart,
    Archive,
  } from "@lucide/svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import JSONForm from "$lib/components/widgets/JSONForm.svelte";
  import HomeEditor from "$lib/components/admin/HomeEditor.svelte";
  import TeamEditor from "$lib/components/admin/TeamEditor.svelte";
  import LadiesInTechEditor from "$lib/components/admin/LadiesInTechEditor.svelte";
  import LadiesInTechArchiveEditor from "$lib/components/admin/LadiesInTechArchiveEditor.svelte";
  import ImageUpload from "$lib/components/widgets/ImageUpload.svelte";
  import { goto } from "$app/navigation";

  let { data, form } = $props();

  let submitting = $state(false);
  let pageContent = $state({
    path: "",
    title: "",
    description: "",
    ogimage: "",
    data: "{}",
    updatedBy: "",
    updatedAt: null as any,
  });
  let structuredData = $state<any>({});
  let lastServerSync = $state(0);

  function parseData(jsonStr: string) {
    try {
      return JSON.parse(jsonStr || "{}");
    } catch (e) {
      console.error("Invalid JSON in database", e);
      return {};
    }
  }

  // Handle server-to-client updates safely using a timestamp
  $effect.pre(() => {
    const serverTimestamp =
      (data.pageContent as any)?.updatedAt?.getTime() || 0;

    // Only update local state if server has newer data OR it's the first load
    if (pageContent.path === "" || serverTimestamp > lastServerSync) {
      const freshContent = {
        ...data.pageContent,
        ogimage: (data.pageContent as any).ogimage || "",
      };

      pageContent = freshContent as any;
      structuredData = parseData((freshContent as any).data);
      lastServerSync = serverTimestamp;
    }
  });

  // Function to persist changes immediately to the database (for ogimage, etc.)
  async function updateContent() {
    submitting = true;
    const formData = new FormData();
    formData.append("path", data.path);
    formData.append("data", JSON.stringify(structuredData));
    formData.append("title", pageContent.title || "");
    formData.append("description", pageContent.description || "");
    formData.append("ogimage", pageContent.ogimage || "");

    try {
      const response = await fetch("?/update", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      // Handle result if needed (SvelteKit actions normally redirect/update, but fetch gives us manual control)
      if (response.ok) {
        toast.success("Changes persisted");
      }
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      submitting = false;
    }
  }

  $effect(() => {
    if (form?.success) {
      toast.success("Content saved successfully");
      submitting = false;
    } else if (form?.message) {
      toast.error(form.message);
      submitting = false;
    }
  });

  function scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const isHome = $derived(data.path === "/");
  const isTeam = $derived(data.path === "/team");
  const isLadiesInTech = $derived(data.path === "/ladies-in-tech");
</script>

<div class="flex flex-col gap-4 pb-20 w-full animate-in fade-in duration-500">
  <!-- Sticky Toolbar -->
  <div
    class="sticky top-0 z-[60] bg-background/80 backdrop-blur-md border-b pb-4 -mx-4 px-4 pt-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm"
  >
    <div class="flex justify-start items-center gap-4 w-full md:w-fit">
      <Button
        variant="ghost"
        size="icon"
        href="/admin/pages"
        class="rounded-full hover:bg-muted/50"
      >
        <ChevronLeft class="size-5" />
      </Button>
      <div>
        <h1 class="text-xl font-bold tracking-tight">
          Edit Page: <span class="text-primary"
            >{isHome ? "Homepage" : data.path}</span
          >
        </h1>
        <p
          class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 leading-none mt-1"
        >
          {isHome ? "Specialized Visual Editor" : "Dynamic Content Management"}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-3 w-full md:w-fit">
      <Button
        type="submit"
        form="page-editor-form"
        disabled={submitting}
        class="gap-2 shadow-lg shadow-primary/20 rounded-xl w-full sm:min-w-[160px] font-bold uppercase tracking-widest text-xs"
      >
        {#if submitting}
          <Loader2 class="size-4 animate-spin" />
          Saving...
        {:else}
          <Save class="size-4" />
          Save Changes
        {/if}
      </Button>
    </div>
  </div>

  <!-- Jump Links navigation -->
  <div
    class="sticky top-[125px] md:top-[72px] z-[55] flex flex-wrap gap-2 p-1.5 bg-background/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm transition-all"
  >
    <Button
      variant="ghost"
      size="sm"
      onclick={() => scrollTo("seo")}
      class="gap-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
    >
      <Globe class="size-3.5" /> SEO
    </Button>

    {#if isHome}
      <Button
        variant="ghost"
        size="sm"
        onclick={() => scrollTo("hero")}
        class="gap-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
      >
        <LayoutDashboard class="size-3.5" /> Hero
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onclick={() => scrollTo("mission")}
        class="gap-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
      >
        <Target class="size-3.5" /> Mission
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onclick={() => scrollTo("stats")}
        class="gap-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
      >
        <BarChart3 class="size-3.5" /> Stats
      </Button>
    {:else if isTeam}
      <Button
        variant="ghost"
        size="sm"
        onclick={() => scrollTo("team-members")}
        class="gap-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
      >
        <Users class="size-3.5" /> Team Members
      </Button>
    {:else if isLadiesInTech}
      <Button
        variant="ghost"
        size="sm"
        onclick={() => scrollTo("ladies-in-tech-events")}
        class="gap-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
      >
        <Heart class="size-3.5" /> Events
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onclick={() => scrollTo("ladies-in-tech-archives")}
        class="gap-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
      >
        <Archive class="size-3.5" /> Archives
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onclick={() => scrollTo("content")}
        class="gap-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
      >
        <FileText class="size-3.5" /> Content
      </Button>
    {:else}
      <Button
        variant="ghost"
        size="sm"
        onclick={() => scrollTo("content")}
        class="gap-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
      >
        <FileText class="size-3.5" /> Content
      </Button>
    {/if}
  </div>

  <form
    id="page-editor-form"
    method="POST"
    action="?/update"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        await update();
        submitting = false;
      };
    }}
    class="space-y-12"
  >
    <input type="hidden" name="path" value={data.path} />
    <input type="hidden" name="data" value={JSON.stringify(structuredData)} />

    <!-- SEO Section -->
    <section id="seo" class="scroll-mt-40 space-y-6">
      <div class="flex items-center gap-3">
        <div
          class="bg-primary/10 p-2.5 rounded-xl text-primary shadow-sm border border-primary/20"
        >
          <Globe class="size-5" />
        </div>
        <div>
          <h2 class="text-xl font-bold tracking-tight">SEO & Meta Data</h2>
          <p
            class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60"
          >
            Visibility and search engine management
          </p>
        </div>
      </div>

      <Card.Root
        class="border-border/50 bg-card/20 backdrop-blur-md shadow-lg overflow-hidden"
      >
        <Card.Content class="p-8 grid gap-8 md:grid-cols-2">
          <div class="space-y-6">
            <div class="space-y-2">
              <Label
                for="title"
                class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                >Browser Tab Title</Label
              >
              <Input
                id="title"
                name="title"
                bind:value={pageContent.title}
                placeholder="e.g. Services | Edniesal Consulting"
                class="rounded-xl h-11 font-bold border-muted-foreground/20 focus-visible:ring-primary/20"
              />
            </div>
            <div class="space-y-2">
              <Label
                for="description"
                class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                >Meta Description</Label
              >
              <Textarea
                id="description"
                name="description"
                bind:value={pageContent.description}
                placeholder="Enter a brief summary for search results..."
                class="rounded-xl min-h-[120px] font-medium border-muted-foreground/20 focus-visible:ring-primary/20 resize-none"
              />
            </div>
          </div>

          <div class="space-y-6">
            <div class="space-y-4">
              <Label
                class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                >Social Share Image (OG Image)</Label
              >
              <div class="p-4 bg-muted/20 border-2 border-dashed rounded-2xl">
                <Input
                  type="hidden"
                  name="ogimage"
                  value={pageContent.ogimage || ""}
                />
                <ImageUpload
                  bind:value={pageContent.ogimage}
                  onchange={updateContent}
                  ondelete={() => {
                    pageContent.ogimage = "/ogimage.webp";
                    updateContent();
                  }}
                />
              </div>
              <p class="text-[10px] text-muted-foreground italic">
                Recommened size: 1200x630. This image appears when you share the
                link on WhatsApp, Twitter, etc.
              </p>
            </div>

            <div
              class="flex flex-col justify-center p-6 bg-primary/5 rounded-2xl border border-primary/10 items-center text-center space-y-3"
            >
              <div
                class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"
              >
                <Sparkles class="size-6" />
              </div>
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-widest text-primary mb-1"
                >
                  SEO Best Practices
                </p>
                <p
                  class="text-[10px] text-muted-foreground max-w-[250px] font-medium leading-relaxed"
                >
                  Aim for titles under 60 characters and descriptions under 160
                  characters for optimal display across devices.
                </p>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </section>

    <Separator class="bg-border/40 opacity-50" />

    <!-- Content Section -->
    <section
      id={isHome ? "home-sections" : isTeam ? "team-sections" : "content"}
      class="scroll-mt-40"
    >
      {#if isHome}
        <HomeEditor bind:data={structuredData} onchange={updateContent} />
      {:else if isTeam}
        <div class="space-y-12">
          <TeamEditor />
          <div class="space-y-6">
            <div class="flex items-center gap-3">
              <div
                class="bg-primary/10 p-2.5 rounded-xl text-primary shadow-sm border border-primary/20"
              >
                <FileText class="size-5" />
              </div>
              <div>
                <h2 class="text-xl font-bold tracking-tight">
                  Additional Page Content
                </h2>
                <p
                  class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 leading-none mt-1"
                >
                  Manage overview text and other meta data
                </p>
              </div>
            </div>
            <Card.Root
              class="border-border/50 bg-card/10 backdrop-blur-md shadow-xl p-6"
            >
              <JSONForm bind:data={structuredData} />
            </Card.Root>
          </div>
        </div>
      {:else if isLadiesInTech}
        <div class="space-y-12">
          <LadiesInTechEditor />
          <LadiesInTechArchiveEditor />
          <div class="space-y-6">
            <div class="flex items-center gap-3">
              <div
                class="bg-primary/10 p-2.5 rounded-xl text-primary shadow-sm border border-primary/20"
              >
                <FileText class="size-5" />
              </div>
              <div>
                <h2 class="text-xl font-bold tracking-tight">Page Content</h2>
                <p
                  class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 leading-none mt-1"
                >
                  Manage overview text and other meta data for Ladies in Tech
                </p>
              </div>
            </div>
            <Card.Root
              class="border-border/50 bg-card/10 backdrop-blur-md shadow-xl p-6"
            >
              <JSONForm bind:data={structuredData} />
            </Card.Root>
          </div>
        </div>
      {:else}
        <div class="space-y-6">
          <div class="flex items-center gap-3">
            <div
              class="bg-primary/10 p-2.5 rounded-xl text-primary shadow-sm border border-primary/20"
            >
              <FileText class="size-5" />
            </div>
            <div>
              <h2 class="text-xl font-bold tracking-tight">Page Content</h2>
              <p
                class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 leading-none mt-1"
              >
                Visual structure manager for this page
              </p>
            </div>
          </div>

          <Card.Root
            class="border-border/50 bg-card/10 backdrop-blur-md shadow-xl p-6"
          >
            <JSONForm bind:data={structuredData} />
          </Card.Root>
        </div>
      {/if}
    </section>
  </form>
</div>
