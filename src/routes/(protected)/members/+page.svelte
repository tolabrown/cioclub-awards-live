<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Users,
    Search,
    Building2,
    Briefcase,
    ShieldCheck,
    Calendar,
    ArrowRight,
    Loader2,
    XCircle,
    CheckCircle2,
    Clock
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import { format } from "date-fns";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let search = $state(page.url.searchParams.get("search") || "");
  let searchTimeout = $state<number | null>(null);
  let isSearching = $state(false);
  let isLoadingMore = $state(false);
  let allMembers = $state<any[]>([]);
  let observerElement = $state<HTMLElement | null>(null);

  // Sync search state with URL changes
  $effect(() => {
    search = page.url.searchParams.get("search") || "";
  });

  // Update when data changes
  $effect(() => {
    if (data.pagination.page === 1) {
      allMembers = [...data.members];
    } else {
      const newItems = data.members.filter(
        (newItem: any) => !allMembers.some((item) => item.fullName === newItem.fullName && item.organization === newItem.organization),
      );
      allMembers = [...allMembers, ...newItems];
    }
    isSearching = false;
  });

  // Infinite Scroll Observer
  $effect(() => {
    if (!observerElement || !data.pagination.hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerElement);
    return () => observer.disconnect();
  });

  function handleSearch(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    search = value;
    isSearching = true;
    
    if (searchTimeout) clearTimeout(searchTimeout);
    
    searchTimeout = window.setTimeout(async () => {
      const url = new URL(page.url);
      if (value) {
        url.searchParams.set("search", value);
      } else {
        url.searchParams.delete("search");
      }
      url.searchParams.set("page", "1");
      
      await goto(url.toString(), { 
        keepFocus: true, 
        replaceState: true,
        noScroll: true
      });
    }, 400);
  }

  async function handleLoadMore() {
    if (isLoadingMore || !data.pagination.hasMore) return;

    isLoadingMore = true;
    const nextPage = data.pagination.page + 1;
    const url = new URL(page.url);
    url.searchParams.set("page", nextPage.toString());

    try {
      const response = await fetch(url.toString(), {
        headers: { "x-sveltekit-load": "true" },
      });
      if (response.ok) {
        await goto(url.toString(), { 
          replaceState: true, 
          noScroll: true, 
          keepFocus: true 
        });
      }
    } catch (e) {
      console.error("Failed to load more:", e);
    } finally {
      isLoadingMore = false;
    }
  }

  const getDayStatus = (endsAt: string | null) => {
    if (!endsAt) return { label: "Inactive", color: "text-muted-foreground bg-muted/20" };
    const days = Math.ceil((new Date(endsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days > 0) return { label: "Active Member", color: "text-emerald-600 bg-emerald-500/10 border-emerald-200" };
    return { label: "Membership Expired", color: "text-destructive bg-destructive/10 border-destructive/20" };
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "individual":
        return "bg-primary/10 text-primary border-primary/20";
      case "corporate":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-200";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200";
    }
  };
</script>

<div class="flex flex-col gap-8 w-full pb-20 max-w-7xl mx-auto">
  <!-- Header Section -->
  <div class="flex flex-col gap-6 pt-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
        <div class="bg-primary/10 p-2.5 rounded-2xl text-primary flex items-center justify-center">
          <Users class="size-8" />
        </div>
        Member Directory
      </h1>
      <p class="text-muted-foreground font-medium max-w-2xl">
        Search and discover other members of the community. Connect and verify membership status.
      </p>
    </div>

    <!-- Search Section -->
    <div class="relative group max-w-xl">
      <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
        {#if isSearching}
          <Loader2 class="size-5 animate-spin text-primary" />
        {:else}
          <Search class="size-5" />
        {/if}
      </div>
      <input
        type="text"
        value={search}
        oninput={handleSearch}
        placeholder="Search members by name or organization..."
        class="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border-border/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-base font-medium shadow-sm"
      />
      <div class="absolute right-4 inset-y-0 flex items-center pointer-events-none">
        {#if isSearching}
          <span class="text-xs font-bold text-muted-foreground animate-pulse">Searching...</span>
        {:else if data.pagination.total > 0}
          <Badge variant="outline" class="bg-background/80 backdrop-blur-sm font-bold text-[10px] uppercase px-3 py-1 border-primary/20 text-primary">
            {data.pagination.total} Recorded
          </Badge>
        {/if}
      </div>
    </div>
  </div>

  <!-- Main Directory Grid -->
  {#if isSearching && allMembers.length === 0}
    <div class="py-20 flex flex-col items-center text-center space-y-4">
      <Loader2 class="size-10 animate-spin text-primary" />
      <p class="text-muted-foreground font-medium">Searching members...</p>
    </div>
  {:else if allMembers.length > 0}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each allMembers as member, i}
        {@const status = getDayStatus(member.subscriptionEndsAt)}
        <Card.Root class="group border-border/60 hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/5 bg-card/50 backdrop-blur-sm flex flex-col overflow-hidden rounded-2xl">
          <Card.Content class="p-6 flex flex-col flex-1 space-y-5">
            <!-- Top Section: Avatar & Badges -->
            <div class="flex items-start justify-between">
              <div class="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shadow-inner group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                {member.fullName.charAt(0)}
              </div>
              <div class="flex flex-col items-end gap-2">
                <Badge variant="outline" class={cn("font-bold text-[10px] uppercase px-2 py-0.5", getTierColor(member.tier))}>
                  {member.tier}
                </Badge>
                <Badge variant="outline" class={cn("font-bold text-[9px] uppercase px-2 py-0.5 border flex items-center gap-1.5", status.color)}>
                  {#if status.label === "Active Member"}
                    <CheckCircle2 class="size-3" />
                  {:else if status.label === "Membership Expired"}
                    <Clock class="size-3" />
                  {:else}
                    <XCircle class="size-3" />
                  {/if}
                  {status.label}
                </Badge>
              </div>
            </div>

            <!-- Content Section -->
            <div class="space-y-1">
              <h3 class="text-lg font-bold group-hover:text-primary transition-colors leading-tight truncate">
                {member.fullName}
              </h3>
              <div class="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                <Briefcase class="size-3.5 shrink-0" />
                <span class="truncate">{member.jobTitle}</span>
              </div>
            </div>

            <div class="flex items-center gap-2.5 p-3 bg-muted/30 rounded-xl border border-border/10">
              <Building2 class="size-4 text-muted-foreground shrink-0" />
              <div class="min-w-0">
                <p class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Organization</p>
                <p class="text-xs font-bold truncate leading-tight">{member.organization}</p>
              </div>
            </div>
          </Card.Content>
          <div class="px-6 py-4 bg-muted/10 border-t border-border/10 mt-auto">
            <span class="text-[10px] font-bold text-muted-foreground italic">
              {#if member.subscriptionEndsAt}
                Valid until {format(new Date(member.subscriptionEndsAt), "MMM yyyy")}
              {:else}
                Pending activation
              {/if}
            </span>
          </div>
        </Card.Root>
      {/each}
    </div>

    <!-- Load More Section -->
    {#if data.pagination.hasMore}
      <div
        bind:this={observerElement}
        class="flex justify-center pt-4 pb-8"
      >
        <Button
          variant="outline"
          size="lg"
          onclick={handleLoadMore}
          disabled={isLoadingMore}
          class="gap-3 rounded-2xl font-bold min-w-[200px] shadow-sm active:scale-95 transition-all hover:bg-primary/5 hover:text-primary hover:border-primary/30"
        >
          {#if isLoadingMore}
            <Loader2 class="size-5 animate-spin" />
            Loading more...
          {:else}
            Load More Members
            <ArrowRight class="size-4" />
          {/if}
        </Button>
      </div>
    {/if}
  {:else}
    <div class="py-32 flex flex-col items-center text-center space-y-6 bg-card/30 rounded-3xl border border-dashed border-border/60">
      <div class="bg-muted/50 p-6 rounded-full text-muted-foreground/30 shadow-inner">
        <Users class="size-16" />
      </div>
      <div class="max-w-md space-y-2 px-6">
        <h3 class="text-2xl font-bold tracking-tight">No Members Found</h3>
        <p class="text-muted-foreground font-medium">
          We couldn't find any members matching "{search}". Try searching for a different name or organization.
        </p>
      </div>
      <Button 
        variant="outline" 
        class="rounded-xl font-bold px-8 active:scale-95 transition-all"
        onclick={() => { search = ""; handleSearch({ target: { value: "" } } as any); }}
      >
        Clear Search
      </Button>
    </div>
  {/if}
</div>
