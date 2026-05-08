<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { FileEdit, Calendar, Globe, Heart } from "@lucide/svelte";

  let { data } = $props();
</script>

<div class="space-y-6 pt-4">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Page Content Management</h1>
    <p
      class="text-sm font-bold text-muted-foreground uppercase tracking-widest"
    >
      Edit the dynamic content of various frontend pages
    </p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each data.editablePages as page}
      <Card.Root
        class="hover:border-primary/50 transition-colors border-border/50 bg-card/50 backdrop-blur-md shadow-lg"
      >
        <Card.Header
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <Card.Title class="text-xl font-bold">{page.name}</Card.Title>
          <div
            class="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
          >
            {#if page.path === "/ladies-in-tech"}
              <Heart class="size-5" />
            {:else}
              <Globe class="size-5" />
            {/if}
          </div>
        </Card.Header>
        <Card.Content>
          <div class="space-y-4">
            <p
              class="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 p-2 rounded-xl"
            >
              Path: <span class="text-foreground">{page.path}</span>
            </p>

            <div
              class="flex items-center gap-2 text-xs font-medium italic text-muted-foreground"
            >
              <Calendar class="size-3.5" />
              <span>
                {#if page.lastUpdated}
                  Last updated: {new Date(page.lastUpdated).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                {:else}
                  Using static template content
                {/if}
              </span>
            </div>

            <div class="flex items-center justify-between pt-2">
              <Badge
                variant={page.hasContent ? "default" : "secondary"}
                class="font-bold uppercase text-[10px] tracking-widest"
              >
                {page.hasContent ? "CMS Managed" : "Static Source"}
              </Badge>
              <Button
                href="/admin/pages/edit{page.path === '/'
                  ? '/home'
                  : page.path}"
                variant="outline"
                size="sm"
                class="gap-1 font-bold shadow-sm"
              >
                Edit Content <FileEdit class="size-4" />
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
</div>
