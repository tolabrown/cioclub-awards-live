<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import {
    MessageSquare,
    Plus,
    Search,
    Trash2,
    ArrowRight,
    Loader2,
    Building2,
    Globe,
    User,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { cn } from "$lib/utils";
  import type { PageProps } from "./$types";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import { Debounced } from "runed";
  import { onMount } from "svelte";

  let { data }: PageProps = $props();

  let processingId = $state<string | null>(null);

  // Search State
  let searchQuery = $state(page.url.searchParams.get("search") || "");
  let debouncedSearch = new Debounced(() => searchQuery, 500);

  // Infinite Scroll Query
  const testimonialsQuery = infiniteScroll.listQuery<any>(
    () => ({
      search: debouncedSearch.current,
    }),
    "",
    "admin/testimonials",
  );

  const results = $derived($testimonialsQuery.data?.results || []);
  let observerNode = $state<HTMLElement | null>(null);

  onMount(() => {
    if (!observerNode) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          $testimonialsQuery.hasNextPage &&
          !$testimonialsQuery.isFetching
        ) {
          $testimonialsQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(observerNode);
    return () => observer.disconnect();
  });

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    
    processingId = id;
    try {
      const formData = new FormData();
      formData.append("id", id);
      const response = await fetch("?/delete", {
        method: "POST",
        body: formData
      });
      
      if (response.ok) {
        toast.success("Testimonial deleted");
        await invalidateAll();
        $testimonialsQuery.refetch();
      } else {
        toast.error("Failed to delete testimonial");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      processingId = null;
    }
  }
</script>

<div class="flex flex-col gap-6 w-full pb-20">
  <!-- Header Section -->
  <div class="flex flex-col gap-4 pt-4 text-left">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <div class="bg-primary/10 p-2 rounded-xl text-primary">
            <MessageSquare class="size-7" />
          </div>
          Testimonials
        </h1>
        <p class="text-muted-foreground font-medium pl-1">
          Manage member testimonials shared about the CIO Club Africa.
        </p>
      </div>
      <Button href="/admin/testimonials/new" class="gap-2 rounded-xl shadow-lg shadow-primary/20">
        <Plus class="size-4" />
        <span class="hidden sm:inline">Add Testimonial</span>
      </Button>
    </div>

    <div class="flex flex-col md:flex-row flex-wrap md:items-center gap-3 w-full md:w-auto sticky top-0 z-10 bg-background py-2">
      <div class="relative flex-1 md:w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, company, or country..."
          class="pl-9 bg-card border-border/50 rounded-xl"
          bind:value={searchQuery}
        />
      </div>

      <div class="flex items-center gap-3 bg-card/50 backdrop-blur-md border border-border/50 p-1.5 rounded-xl shadow-sm ml-auto">
        <div class="px-3 py-1 flex items-center gap-2">
          <span class="size-2 rounded-full bg-primary animate-pulse"></span>
          <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {$testimonialsQuery.data?.total || 0} Testimonials
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <Card.Root class="border-border/60 shadow-lg overflow-hidden bg-card/30 backdrop-blur-sm">
    <!-- Desktop Table View -->
    <div class="hidden md:block">
      <Table.Root>
        <Table.Header class="bg-muted/50">
          <Table.Row>
            <Table.Head class="w-[250px] font-bold uppercase tracking-widest text-[10px]">Person</Table.Head>
            <Table.Head class="w-[180px] font-bold uppercase tracking-widest text-[10px]">Organization</Table.Head>
            <Table.Head class="w-[150px] font-bold uppercase tracking-widest text-[10px]">Country</Table.Head>
            <Table.Head class="hidden xl:table-cell font-bold uppercase tracking-widest text-[10px]">Testimonial Preview</Table.Head>
            <Table.Head class="w-[100px] text-right"></Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each results as t}
            <Table.Row class="group hover:bg-muted/30 transition-colors border-border/40">
              <Table.Cell>
                <div class="flex items-center gap-3 text-left">
                  {#if t.image?.url}
                    <img src={t.image.url} alt={t.name} class="size-10 rounded-full object-cover border border-border/50" />
                  {:else}
                    <div class="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                  {/if}
                  <div class="flex flex-col">
                    <span class="font-bold text-sm group-hover:text-primary transition-colors">{t.name}</span>
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell class="text-left font-medium text-sm">
                <div class="flex items-center gap-2">
                  <Building2 class="size-3.5 text-muted-foreground" />
                  {t.organization || "—"}
                </div>
              </Table.Cell>
              <Table.Cell class="text-left font-medium text-sm">
                <div class="flex items-center gap-2">
                  <Globe class="size-3.5 text-muted-foreground" />
                  {t.country || "—"}
                </div>
              </Table.Cell>
              <Table.Cell class="hidden xl:table-cell text-left max-w-[400px]">
                <p class="text-xs text-muted-foreground line-clamp-1 italic">
                  "{t.testimonial.replace(/<[^>]*>/g, '')}"
                </p>
              </Table.Cell>
              <Table.Cell class="text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <Button variant="ghost" size="icon" href="/admin/testimonials/{t.id}" class="h-8 w-8 rounded-full">
                    <ArrowRight class="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                    onclick={() => handleDelete(t.id)}
                    disabled={processingId === t.id}
                  >
                    {#if processingId === t.id}
                      <Loader2 class="size-4 animate-spin" />
                    {:else}
                      <Trash2 class="size-4" />
                    {/if}
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>

    <!-- Mobile Card View -->
    <div class="md:hidden space-y-4 text-left p-4">
      {#each results as t}
        <Card.Root class="border-border/60 hover:border-primary/40 transition-all">
          <Card.Content class="p-4 space-y-4">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-3">
                {#if t.image?.url}
                  <img src={t.image.url} alt={t.name} class="size-12 rounded-full object-cover border border-border/50" />
                {:else}
                  <div class="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {t.name.charAt(0)}
                  </div>
                {/if}
                <div class="space-y-0.5">
                  <h3 class="font-bold text-base">{t.name}</h3>
                  <div class="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 class="size-3" />
                    {t.organization || "—"}
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="icon" href="/admin/testimonials/{t.id}" class="h-8 w-8 rounded-full">
                  <ArrowRight class="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  class="h-8 w-8 rounded-full text-destructive border-destructive/20 hover:bg-destructive/10"
                  onclick={() => handleDelete(t.id)}
                  disabled={processingId === t.id}
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </div>

            <div class="bg-muted/30 p-3 rounded-lg border border-border/20">
              <p class="text-xs text-muted-foreground line-clamp-3 italic">
                "{t.testimonial.replace(/<[^>]*>/g, '')}"
              </p>
            </div>

            <div class="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              <Globe class="size-3" />
              {t.country || "International"}
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>

    <div bind:this={observerNode} class="h-10 flex items-center justify-center p-4">
      {#if $testimonialsQuery.isFetchingNextPage}
        <Loader2 class="size-6 animate-spin text-primary/40" />
      {/if}
    </div>

    {#if results.length === 0 && !$testimonialsQuery.isFetching}
      <div class="py-20 text-center space-y-4">
        <div class="bg-muted/50 p-4 rounded-full size-16 mx-auto flex items-center justify-center text-muted-foreground/30">
          <MessageSquare class="size-8" />
        </div>
        <div class="space-y-1">
          <p class="text-foreground font-bold">No Testimonials Found</p>
          <p class="text-muted-foreground text-sm">
            Try adjusting your search query.
          </p>
        </div>
      </div>
    {/if}
  </Card.Root>
</div>
