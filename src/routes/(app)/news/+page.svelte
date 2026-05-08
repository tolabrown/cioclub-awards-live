<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import {
    Search,
    Filter,
    ArrowRight,
    Calendar,
    Clock,
    Newspaper,
    ChevronRight,
    TrendingUp,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import { onMount } from "svelte";

  import type { PageProps } from "./$types";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import { Loader2 } from "@lucide/svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";

  let { data }: PageProps = $props();

  let newsItems = $derived(data.newsItems || []);
  let hero = $derived(
    data.hero || {
      badge: "Insights & Media",
      title: "Africa's Digital Pulse",
      description:
        "Stay updated with the latest trends and leadership stories from across the continent.",
    },
  );

  let selectedCategory = $state("All News");
  let searchQuery = $state("");
  let observerNode = $state<HTMLElement | null>(null);
  let submitting = $state(false);

  const newsQuery = infiniteScroll.listQuery<any>(
    () => ({
      category: selectedCategory,
      search: searchQuery,
    }),
    "",
    "news",
  );

  const results = $derived($newsQuery.data?.results || []);
  const total = $derived($newsQuery.data?.total || 0);

  onMount(() => {
    if (!observerNode) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && $newsQuery.hasNextPage) {
          $newsQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(observerNode);
    return () => observer.disconnect();
  });

  const categories = $derived([
    "All News",
    ...new Set(newsItems.map((item) => item.category)),
  ]);

  const featuredArticle = $derived(
    newsItems.find((item) => item.isFeatured) || newsItems[0],
  );

  const regularItems = $derived(
    results.filter((item: any) => item.id !== featuredArticle?.id),
  );
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
      class="container mx-auto px-4 relative z-10 text-center space-y-4 pt-20"
    >
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground text-xs font-semibold backdrop-blur-sm"
      >
        <TrendingUp class="size-4" />
        Insights & Media
      </div>
      <h1
        class="text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight tracking-tight"
      >
        {hero.title}
      </h1>
      <p
        class="text-xl text-primary-foreground/80 max-w-2xl mx-auto font-medium"
      >
        {hero.description}
      </p>
    </div>
  </section>

  <!-- Featured Article -->
  <section class="py-32 bg-background relative -mt-16 z-20">
    <div class="container mx-auto px-4">
      <div
        class="group relative overflow-hidden rounded-xl bg-card border border-border shadow-lg"
      >
        {#if featuredArticle}
          <div class="grid lg:grid-cols-2">
            <div
              class="relative aspect-video lg:aspect-auto overflow-hidden bg-muted"
            >
              {#if featuredArticle.image?.url}
                <img
                  src={featuredArticle.image.url}
                  alt={featuredArticle.title}
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              {/if}
              <div class="absolute top-8 left-8">
                <Badge
                  class="bg-primary text-primary-foreground px-4 py-1.5 rounded-xl text-xs font-semibold border-0"
                >
                  {featuredArticle.category}
                </Badge>
              </div>
            </div>
            <div class="p-10 lg:p-20 flex flex-col justify-center space-y-4">
              <div
                class="flex items-center gap-4 text-sm font-semibold text-muted-foreground"
              >
                <span class="flex items-center gap-1.5"
                  ><Calendar class="size-4" />
                  {new Date(
                    featuredArticle.createdAt,
                  ).toLocaleDateString()}</span
                >
              </div>
              <a href="/news/{featuredArticle.id}">
                <h2
                  class="text-4xl lg:text-5xl font-bold leading-tight tracking-tight hover:text-primary transition-colors cursor-pointer text-foreground"
                >
                  {featuredArticle.title}
                </h2>
              </a>
              <p
                class="text-xl text-muted-foreground leading-relaxed font-medium line-clamp-4"
              >
                {featuredArticle.caption || ""}
              </p>
              <div
                class="flex items-center justify-between pt-4 border-t border-border/50"
              >
                <Button
                  variant="ghost"
                  class="text-primary font-semibold text-xs gap-2 group p-0 hover:bg-transparent"
                  href="/news/{featuredArticle.id}"
                >
                  Read Full Story
                  <ArrowRight
                    class="size-4 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </div>
            </div>
          </div>
        {:else}
          <div class="p-20 text-center">
            <p class="text-muted-foreground font-semibold">
              No featured news available yet.
            </p>
          </div>
        {/if}
      </div>
    </div>
  </section>

  <!-- Filter & Grid -->
  <section class="py-32 bg-slate-50 dark:bg-slate-900/50">
    <div class="container mx-auto px-4">
      <div
        class="flex flex-col lg:flex-row gap-4 justify-between items-end mb-16"
      >
        <div class="space-y-4 flex-1 max-w-xl">
          <h2 class="text-3xl font-bold tracking-tight text-foreground">
            Latest Updates
          </h2>
          <div class="relative group">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors"
            />
            <Input
              bind:value={searchQuery}
              placeholder="Search insights, news, or reports..."
              class="pl-12 rounded-xl bg-card border-border/50 shadow-sm focus:ring-primary focus:border-primary transition-all text-base font-medium"
            />
          </div>
        </div>
        <div class="flex flex-wrap gap-4">
          {#each categories as cat}
            <Button
              variant={cat === selectedCategory ? "default" : "outline"}
              onclick={() => (selectedCategory = cat)}
              class={cn(
                "rounded-full transition-all",
                cat === selectedCategory
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border-border/50",
              )}
            >
              {cat}
            </Button>
          {/each}
        </div>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each regularItems as item (item.id)}
          <a
            href="/news/{item.id}"
            class="group bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500"
          >
            <div class="relative aspect-video overflow-hidden bg-muted">
              {#if item.image?.url}
                <img
                  src={item.image.url}
                  alt={item.title}
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              {/if}
              <div class="absolute bottom-4 left-4">
                <Badge
                  class="bg-card/90 backdrop-blur-md text-foreground px-4 py-1.5 rounded-xl text-[10px] font-semibold border-0 shadow-md"
                >
                  {item.category}
                </Badge>
              </div>
            </div>
            <div class="p-8 space-y-4 flex flex-col h-[300px]">
              <div
                class="flex items-center justify-between text-[10px] font-semibold text-muted-foreground"
              >
                <span class="flex items-center gap-1.5"
                  ><Calendar class="size-3" />
                  {new Date(item.createdAt).toLocaleDateString()}</span
                >
              </div>
              <h3
                class="text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 text-foreground"
              >
                {item.title}
              </h3>
              <p
                class="text-muted-foreground font-medium leading-relaxed line-clamp-3 flex-1"
              >
                {item.caption || ""}
              </p>
              <div class="pt-6 border-t border-border/50">
                <Button
                  variant="ghost"
                  class="w-full group/btn rounded-xl bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  Continue Reading
                  <ChevronRight
                    class="ml-2 size-4 group-hover/btn:translate-x-1 transition-transform"
                  />
                </Button>
              </div>
            </div>
          </a>
        {/each}
      </div>

      {#if $newsQuery.isFetchingNextPage}
        <div class="flex justify-center p-12">
          <Loader2 class="size-8 animate-spin text-primary" />
        </div>
      {/if}

      <!-- Infinite Scroll Trigger -->
      <div bind:this={observerNode} class="h-4"></div>

      {#if !$newsQuery.hasNextPage && results.length > 0}
        <div class="text-center py-12">
          <p
            class="text-sm font-bold text-muted-foreground opacity-40 uppercase tracking-[0.2em]"
          >
            End of News List
          </p>
        </div>
      {/if}

      {#if results.length === 0 && !$newsQuery.isLoading}
        <div
          class="text-center py-24 bg-card rounded-2xl border border-dashed border-border"
        >
          <TrendingUp class="size-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 class="text-xl font-bold text-foreground">No insights found</h3>
          <p class="text-muted-foreground mt-2">
            Try adjusting your search or category filter
          </p>
        </div>
      {/if}
    </div>
  </section>

  <!-- Newsletter Section -->
  <section class="py-32 bg-background">
    <div class="container mx-auto px-4 text-center">
      <div
        class="bg-primary text-primary-foreground rounded-xl p-12 lg:p-24 space-y-4 relative overflow-hidden shadow-lg border border-primary-foreground/5 shadow-lg"
      >
        <div class="absolute inset-0 bg-grid-white opacity-5"></div>
        <div class="max-w-2xl mx-auto space-y-4 relative z-10">
          <Newspaper
            class="size-16 mx-auto text-primary-foreground opacity-20"
          />
          <h2
            class="text-4xl lg:text-6xl font-bold text-primary-foreground leading-tight"
          >
            Continental Intelligence
          </h2>
          <p
            class="text-xl text-primary-foreground/80 font-medium leading-relaxed"
          >
            Subscribe to our weekly digest of industry-shaping news, policy
            updates, and executive exclusive reports.
          </p>
          <form
            method="POST"
            action="?/subscribe"
            use:enhance={() => {
              submitting = true;
              return async ({ result }) => {
                submitting = false;
                const data = (result as any).data;
                if (result.type === "success") {
                  toast.success("Subscribed!", {
                    description: "Thank you for subscribing to our newsletter.",
                  });
                } else if (result.type === "failure") {
                  if (data?.already_subscribed) {
                    toast.info("Already Subscribed", {
                      description: String(data.message),
                    });
                  } else {
                    toast.error("Subscription Failed", {
                      description: String(
                        data?.message || "Please try again later.",
                      ),
                    });
                  }
                }
              };
            }}
            class="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
          >
            <Input
              name="email"
              type="email"
              required
              placeholder="Your professional email"
              class="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 px-6 text-base"
            />
            <Button
              type="submit"
              disabled={submitting}
              class="font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md transition-all"
            >
              {#if submitting}
                <Loader2 class="mr-2 size-4 animate-spin" />
                Subscribing...
              {:else}
                Subscribe Free
              {/if}
            </Button>
          </form>
          <p class="text-sm">Join 5,000+ tech leaders already in the loop.</p>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  :global(.bg-grid-white) {
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    );
    background-size: 24px 24px;
  }
</style>
