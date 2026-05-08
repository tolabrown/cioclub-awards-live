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
  import { FileEdit, Calendar, Globe, ArrowRight } from "@lucide/svelte";
  import { format } from "date-fns";

  let { data } = $props();
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Page Content Management</h1>
    <p class="text-muted-foreground">
      Manage and edit the content of various frontend pages.
    </p>
  </div>

  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {#each data.editablePages as page}
      <Card class="hover:border-primary/50 transition-colors">
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-xl font-bold">{page.name}</CardTitle>
          <div
            class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
          >
            <Globe class="size-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <p class="text-sm text-muted-foreground">
              Path: <code class="bg-muted px-1 rounded">{page.path}</code>
            </p>

            <div class="flex items-center gap-2 text-xs">
              <Calendar class="size-3.5" />
              <span>
                {#if page.lastUpdated}
                  Last updated: {format(
                    new Date(page.lastUpdated),
                    "MMM d, yyyy HH:mm",
                  )}
                {:else}
                  Not yet edited in CMS
                {/if}
              </span>
            </div>

            <div class="flex items-center justify-between pt-2">
              <Badge variant={page.hasContent ? "default" : "secondary"}>
                {page.hasContent ? "Published" : "Draft/Static"}
              </Badge>
              <Button
                href="/admin/pages/edit{page.path === '/'
                  ? '/home'
                  : page.path}"
                variant="ghost"
                size="sm"
                class="gap-1"
              >
                Edit <FileEdit class="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>
</div>
