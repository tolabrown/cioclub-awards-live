<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "$lib/components/ui/tabs";
  import {
    Search,
    SearchX,
    ArrowRight,
    ChevronRight,
    Newspaper,
    Calendar,
    Users,
    FileText,
    History,
    TrendingUp,
    X,
    Clock,
    User,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  import { goto } from "$app/navigation";

  let { data } = $props();
  let searchQuery = $state(data.searchQuery || "");
  let activeTab = $state("news");

  const results = $derived(data.results);

  $effect(() => {
    if (data.searchQuery !== undefined) {
      searchQuery = data.searchQuery || "";
    }
  });

  function handleSearch() {
    if (searchQuery.trim()) {
      goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  const hasResults = $derived(
    searchQuery.length > 0 &&
      (results.news.length > 0 ||
        results.events.length > 0 ||
        results.members.length > 0),
  );

  const stats = $derived({
    total: results.news.length + results.events.length + results.members.length,
    news: results.news.length,
    events: results.events.length,
    members: results.members.length,
  });

  const categories = $derived([
    {
      value: "news",
      label: "News & Analysis",
      icon: Newspaper,
      count: stats.news,
    },
    { value: "events", label: "Events", icon: Calendar, count: stats.events },
    { value: "members", label: "Members", icon: Users, count: stats.members },
  ]);

  const quickLinks = [
    { label: "Membership Plans", href: "/membership" },
    { label: "Upcoming Summit", href: "/events" },
    { label: "Latest News", href: "/news" },
    { label: "Resource Library", href: "/resources" },
  ];
</script>

<div class="min-h-screen bg-white dark:bg-slate-950">
  <!-- Search Hero Section -->
  <section
    class="relative py-32 bg-primary text-primary-foreground overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(#135bec22_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
    ></div>
    <div
      class="container mx-auto px-4 relative z-10 text-center space-y-4 pt-20"
    >
      <div class="space-y-4">
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
        >
          <Search class="size-4" />
          Global Search
        </div>
        <h1
          class="text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight tracking-tight"
        >
          Explore Insights
        </h1>
      </div>

      <div class="max-w-3xl mx-auto relative group">
        <div
          class="absolute -inset-1 bg-gradient-to-r from-accent-gold/50 to-primary/50 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"
        ></div>
        <div
          class="relative bg-card rounded-xl p-4 flex items-center shadow-lg"
        >
          <div class="pl-6 pr-4 text-muted-foreground">
            <Search class="size-8" />
          </div>
          <input
            type="text"
            bind:value={searchQuery}
            onkeydown={handleKeyDown}
            placeholder="Search news, events, members..."
            class="flex-1 bg-transparent border-none focus:ring-0 text-2xl font-bold placeholder:text-muted-foreground/30 h-16"
          />
          {#if searchQuery}
            <button
              onclick={() => (searchQuery = "")}
              class="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors mr-2"
            >
              <X class="size-6 text-muted-foreground" />
            </button>
          {/if}
          <Button
            size="lg"
            onclick={handleSearch}
            class="h-14 font-bold uppercase tracking-widest text-sm shadow-md transition-all"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  </section>

  <!-- Results Section -->
  <main class="py-20">
    <div class="container mx-auto px-4">
      {#if hasResults}
        <div class="space-y-4">
          <!-- Stats & Tabs Header -->
          <div
            class="flex flex-col lg:flex-row justify-between items-end gap-4 pb-8 border-b border-border"
          >
            <div class="space-y-4">
              <h2 class="text-3xl font-bold tracking-tight text-foreground">
                Results for <span class="text-primary italic"
                  >"{searchQuery}"</span
                >
              </h2>
              <p class="text-muted-foreground font-medium">
                Found {stats.total} matching items across the platform
              </p>
            </div>

            <Tabs bind:value={activeTab} class="w-full lg:w-auto">
              <TabsList class="h-14 bg-muted rounded-xl p-1.5 gap-4">
                {#each categories as cat}
                  <TabsTrigger
                    value={cat.value}
                    class="rounded-lg px-6 h-11 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                  >
                    <cat.icon class="size-4" />
                    {cat.label}
                    <Badge
                      variant="secondary"
                      class="ml-1 text-[10px] h-5 min-w-5 flex items-center justify-center p-0"
                    >
                      {cat.count}
                    </Badge>
                  </TabsTrigger>
                {/each}
              </TabsList>
            </Tabs>
          </div>

          <!-- Tabs Content -->
          <div class="min-h-[400px]">
            {#if activeTab === "news"}
              <div class="grid md:grid-cols-2 gap-4">
                {#each results.news as item}
                  <div
                    class="group flex flex-col bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden"
                  >
                    <div class="relative aspect-video overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div
                        class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                      ></div>
                      <div class="absolute top-6 left-6">
                        <Badge
                          class="bg-primary text-primary-foreground border-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg"
                        >
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <div class="p-10 space-y-4 flex-1 flex flex-col">
                      <div
                        class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                      >
                        <Clock class="size-3" />
                        {item.time}
                      </div>
                      <h3
                        class="text-2xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors flex-1 text-foreground"
                      >
                        {item.title}
                      </h3>
                      <p
                        class="text-muted-foreground font-medium line-clamp-2 italic"
                      >
                        "{item.excerpt}"
                      </p>
                      <div
                        class="pt-6 border-t border-border flex items-center justify-between"
                      >
                        <div class="flex items-center gap-4">
                          <div
                            class="size-10 rounded-full bg-muted flex items-center justify-center text-primary font-bold uppercase text-xs"
                          >
                            {item.author.charAt(0)}
                          </div>
                          <span
                            class="text-sm font-bold tracking-tight text-foreground"
                            >{item.author}</span
                          >
                        </div>
                        <Button
                          variant="ghost"
                          class="group/btn gap-2 font-bold uppercase text-[10px] tracking-widest text-primary hover:bg-primary/10"
                        >
                          Read More
                          <ArrowRight
                            class="size-4 group-hover/btn:translate-x-1 transition-transform"
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {:else if activeTab === "events"}
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each results.events as event}
                  <div
                    class="group bg-card border border-border rounded-xl p-8 space-y-4 hover:border-primary/50 transition-all"
                  >
                    <div
                      class="aspect-[4/3] rounded-xl overflow-hidden border border-border shadow-sm"
                    >
                      <img
                        src={event.image}
                        alt={event.title}
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div class="space-y-4">
                      <div
                        class="flex items-center gap-4 text-primary font-bold uppercase text-[10px] tracking-widest"
                      >
                        <Calendar class="size-3" />
                        {event.date}
                      </div>
                      <h4
                        class="text-xl font-bold leading-tight text-foreground"
                      >
                        {event.title}
                      </h4>
                      <div class="flex items-center justify-between pt-2">
                        <span class="text-sm font-medium text-muted-foreground"
                          >{event.location}</span
                        >
                        <Button
                          size="sm"
                          class="font-bold uppercase text-[10px] tracking-widest"
                          >View Details</Button
                        >
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {:else if activeTab === "members"}
              <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {#each results.members as member}
                  <div
                    class="bg-card border border-border rounded-xl p-6 text-center space-y-4 shadow-sm hover:shadow-lg transition-all"
                  >
                    <div
                      class="size-24 rounded-full overflow-hidden mx-auto border-4 border-slate-50 dark:border-slate-800 shadow-lg"
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 class="font-bold tracking-tight text-foreground">
                        {member.name}
                      </h4>
                      <p
                        class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1"
                      >
                        {member.role}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-full font-bold uppercase text-[10px] tracking-widest"
                      >View Profile</Button
                    >
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <!-- No Results State -->
        <div class="max-w-4xl mx-auto py-20">
          <div
            class="flex flex-col items-center justify-center text-center space-y-4"
          >
            <div class="relative">
              <div
                class="absolute -inset-8 bg-primary/5 rounded-full blur-3xl"
              ></div>
              <div
                class="relative size-40 lg:size-48 rounded-xl bg-muted border border-border flex items-center justify-center text-primary shadow-lg"
              >
                <SearchX class="size-20 lg:size-24 stroke-1 opacity-50" />
                <div
                  class="absolute -bottom-2 -right-2 bg-primary size-12 rounded-lg flex items-center justify-center text-primary-foreground shadow-lg"
                >
                  <TrendingUp class="size-6" />
                </div>
              </div>
            </div>

            <div class="space-y-4 max-w-xl">
              <h3 class="text-4xl font-bold tracking-tight text-foreground">
                No Results Found
              </h3>
              <p
                class="text-lg text-muted-foreground font-medium leading-relaxed"
              >
                We couldn't find any matches for <span
                  class="text-primary italic">"{searchQuery}"</span
                >. Try refining your keywords or explore our popular collections
                below.
              </p>
            </div>

            <div class="w-full grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {#each quickLinks as link}
                <a
                  href={link.href}
                  class="flex items-center justify-between p-6 rounded-xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all group"
                >
                  <span class="font-bold uppercase text-[10px] tracking-widest"
                    >{link.label}</span
                  >
                  <ChevronRight
                    class="size-4 text-primary group-hover:translate-x-1 transition-transform"
                  />
                </a>
              {/each}
            </div>

            <div
              class="w-full max-w-lg p-8 rounded-xl bg-muted border-2 border-dashed border-border flex flex-col items-center gap-4"
            >
              <div class="flex items-center gap-3">
                <History class="size-5 text-muted-foreground" />
                <span
                  class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  >Recent Searches</span
                >
              </div>
              <div class="flex flex-wrap justify-center gap-2">
                {#each ["Summit 2024", "AI Policy", "Leadership", "Cloud Strategy"] as term}
                  <button
                    onclick={() => (searchQuery = term)}
                    class="px-5 py-2 rounded-full bg-white dark:bg-slate-800 border border-border text-xs font-bold hover:border-primary transition-all active:scale-95"
                  >
                    {term}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </main>

  <!-- Community CTA -->
  <section
    class="py-32 bg-primary text-primary-foreground relative overflow-hidden"
  >
    <div
      class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white dark:from-slate-950 to-transparent"
    ></div>
    <div class="container mx-auto px-4 relative z-10 text-center space-y-4">
      <h2
        class="text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight tracking-tight max-w-3xl mx-auto"
      >
        Can't find what you're looking for?
      </h2>
      <p
        class="text-xl text-primary-foreground/80 max-w-2xl mx-auto font-medium"
      >
        Our support team is available to help you navigate our resources and
        members benefits.
      </p>
      <div class="flex flex-wrap gap-4 justify-center">
        <Button
          size="lg"
          variant="secondary"
          class="font-bold shadow-lg transition-all"
        >
          Contact Support
        </Button>
        <Button
          size="lg"
          variant="outline"
          class="font-bold border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 transition-all"
        >
          Explore Members Benefits
        </Button>
      </div>
    </div>
  </section>
</div>
