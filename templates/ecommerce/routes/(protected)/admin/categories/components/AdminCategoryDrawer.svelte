<script lang="ts">
  import { browser } from "$app/environment";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import {
    Pencil,
    Trash2,
    FolderTree,
    Calendar,
    Info,
    Tag,
    ExternalLink,
  } from "@lucide/svelte";

  interface Props {
    open: boolean;
    category: any;
    onOpenChange: (open: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
  }

  let {
    open = $bindable(),
    category,
    onOpenChange,
    onEdit,
    onDelete,
  }: Props = $props();

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  // Dynamic imports
  let Drawer: any = $state(null);

  $effect(() => {
    if (browser) {
      import("$lib/components/ui/drawer/index.js").then((module) => {
        Drawer = module;
      });
    }
  });
</script>

{#if Drawer}
  <Drawer.Root bind:open {onOpenChange}>
    <Drawer.Content class="max-h-[85vh]">
      {#if category}
        <div class="mx-auto w-full max-w-lg overflow-y-auto px-4 pb-8">
          <Drawer.Header class="px-0">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-4">
                <div
                  class="h-16 w-16 overflow-hidden rounded-2xl border bg-muted shrink-0"
                >
                  {#if category.imageFile?.url}
                    <img
                      src={category.imageFile.url}
                      alt={category.name}
                      class="h-full w-full object-cover"
                    />
                  {:else}
                    <div
                      class="flex h-full w-full items-center justify-center text-primary"
                    >
                      <FolderTree class="h-8 w-8" />
                    </div>
                  {/if}
                </div>
                <div>
                  <Drawer.Title class="text-xl font-bold"
                    >{category.name}</Drawer.Title
                  >
                  <Drawer.Description class="line-clamp-1"
                    >{category.description ||
                      "No description"}</Drawer.Description
                  >
                </div>
              </div>
              <Badge
                variant={category.isActive ? "default" : "secondary"}
                class={category.isActive
                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                  : "bg-orange-500/10 text-orange-600 border-orange-500/20"}
              >
                {category.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </Drawer.Header>

          <div class="mt-6 flex flex-col gap-6">
            <!-- Info Grid -->
            <div class="grid grid-cols-2 gap-4">
              <div
                class="rounded-xl border bg-muted/30 p-3 flex flex-col gap-1"
              >
                <div
                  class="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold"
                >
                  <Tag class="h-3 w-3" />
                  Products
                </div>
                <div class="text-sm font-bold">
                  {category.productCount || 0} items
                </div>
              </div>
              <div
                class="rounded-xl border bg-muted/30 p-3 flex flex-col gap-1"
              >
                <div
                  class="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold"
                >
                  <Calendar class="h-3 w-3" />
                  Created
                </div>
                <div class="text-sm font-bold">
                  {formatDate(category.createdAt)}
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="rounded-xl border p-4 bg-muted/10">
              <div
                class="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2"
              >
                <Info class="h-3 w-3" />
                Description
              </div>
              <p class="text-sm leading-relaxed text-foreground">
                {category.description ||
                  "No detailed description provided for this category."}
              </p>
            </div>

            <!-- Actions -->
            <div class="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                class="h-12 rounded-xl gap-2 border-primary/20 text-primary hover:bg-primary/5"
                onclick={onEdit}
              >
                <Pencil class="h-4 w-4" />
                Edit Category
              </Button>
              <Button
                variant="outline"
                class="h-12 rounded-xl gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onclick={onDelete}
              >
                <Trash2 class="h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="secondary"
                class="col-span-2 h-12 rounded-xl gap-2"
                href={`/category/${category.id}`}
                target="_blank"
              >
                <ExternalLink class="h-4 w-4" />
                View on Storefront
              </Button>
            </div>
          </div>
        </div>
      {/if}
    </Drawer.Content>
  </Drawer.Root>
{/if}
