<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Calendar,
    ArrowLeft,
    Share2,
    Facebook,
    Twitter,
    Linkedin,
    Copy,
    ArrowRight,
  } from "@lucide/svelte";
  import type { PageProps } from "./$types";
  import { toast } from "svelte-sonner";

  let { data }: PageProps = $props();
  let article = $derived(data.article);
  let relatedNews = $derived(data.relatedNews || []);

  function shareArticle(platform: string) {
    const url = window.location.href;
    const text = article.title;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
          "_blank",
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
        break;
    }
  }
</script>

<svelte:head>
  <title>{article.title} | CIO Club Africa</title>
  <meta name="description" content={article.caption} />
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Hero / Header -->
  <section class="relative h-[60vh] min-h-[400px] flex items-end">
    {#if article.image?.url}
      <img
        src={article.image.url}
        alt=""
        class="absolute inset-0 w-full h-full object-cover"
      />
    {/if}
    <div
      class="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"
    ></div>

    <div class="container mx-auto px-4 relative z-10 pb-12">
      <div class="max-w-4xl space-y-6">
        <a
          href="/news"
          class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
        >
          <ArrowLeft class="size-4" /> Back to News
        </a>
        <div class="flex items-center gap-4">
          <Badge class="bg-primary text-black font-semibold text-xs px-4 py-1">
            {article.category}
          </Badge>
          <span
            class="text-white/60 text-sm font-medium flex items-center gap-2"
          >
            <Calendar class="size-4" />
            {new Date(article.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold text-white leading-tight">
          {article.title}
        </h1>
        <p
          class="text-xl text-white/80 font-medium leading-relaxed italic border-l-4 border-primary pl-6 max-w-2xl"
        >
          {article.caption || ""}
        </p>
      </div>
    </div>
  </section>

  <!-- Content & Share -->
  <section class="py-20 relative z-10">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-12 gap-12">
        <!-- Main Content -->
        <main class="lg:col-span-8 space-y-12">
          <div class="prose dark:prose-invert max-w-none">
            {@html article.content}
          </div>

          <!-- Share Section -->
          <div
            class="pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div class="space-y-1">
              <h3 class="font-semibold text-white text-xs">
                Share this insight
              </h3>
              <p class="text-muted-foreground text-sm">
                Help spread knowledge across the continent.
              </p>
            </div>
            <div class="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                class="rounded-full hover:bg-primary hover:text-black transition-all"
                onclick={() => shareArticle("facebook")}
              >
                <Facebook class="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                class="rounded-full hover:bg-primary hover:text-black transition-all"
                onclick={() => shareArticle("twitter")}
              >
                <Twitter class="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                class="rounded-full hover:bg-primary hover:text-black transition-all"
                onclick={() => shareArticle("linkedin")}
              >
                <Linkedin class="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                class="rounded-full hover:bg-primary hover:text-black transition-all"
                onclick={() => shareArticle("copy")}
              >
                <Copy class="size-4" />
              </Button>
            </div>
          </div>
        </main>

        <!-- Sidebar / Related -->
        <aside class="lg:col-span-4 space-y-12">
          <div class="sticky top-24 space-y-8">
            <h3 class="font-bold text-white text-2xl flex items-center gap-3">
              <Share2 class="size-6 text-primary" />
              Related News
            </h3>

            <div class="grid gap-6">
              {#each relatedNews as item}
                <a
                  href="/news/{item.id}"
                  class="group flex flex-col gap-4 p-4 rounded-xl bg-card border border-white/5 hover:border-primary/20 transition-all"
                >
                  <div
                    class="aspect-video rounded-lg overflow-hidden shrink-0 bg-muted"
                  >
                    {#if item.image?.url}
                      <img
                        src={item.image.url}
                        alt=""
                        class="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    {/if}
                  </div>
                  <div class="space-y-2">
                    <p class="text-[10px] font-semibold text-primary">
                      {item.category}
                    </p>
                    <h4
                      class="font-semibold text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors"
                    >
                      {item.title}
                    </h4>
                    <p class="text-xs text-muted-foreground line-clamp-2">
                      {item.caption || ""}
                    </p>
                  </div>
                </a>
              {/each}
              {#if relatedNews.length === 0}
                <p class="text-sm text-muted-foreground">
                  No related news found.
                </p>
              {/if}
            </div>

            <!-- CTA -->
            <div
              class="p-8 rounded-2xl bg-primary text-black space-y-6 relative overflow-hidden group"
            >
              <div class="relative z-10 space-y-4">
                <h4 class="font-bold text-3xl leading-tight">
                  Stay ahead of the pulse.
                </h4>
                <p class="text-sm font-semibold opacity-80 leading-relaxed">
                  Join 5,000+ tech executives and leaders in Africa's premier
                  digital community.
                </p>
                <Button
                  class="bg-black text-white w-full"
                  href="/membership"
                >
                  Join The Club
                </Button>
              </div>
              <div
                class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"
              >
                <Share2 class="size-32" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</div>
