<script lang="ts">
  import type { PageProps } from "./$types";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import {
    Plus,
    Search,
    Loader2,
    Grid2X2,
    Grid3X3,
    FolderTree,
    AlertCircleIcon,
  } from "@lucide/svelte";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import { invalidateAll, goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Debounced } from "runed";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import FilterButton, {
    type FilterField,
  } from "$lib/components/ui/filter/FilterButton.svelte";

  // Components
  import AdminCategoryListCard from "./components/AdminCategoryListCard.svelte";
  import AdminCategoryGridCard from "./components/AdminCategoryGridCard.svelte";
  import AdminCategoryDrawer from "./components/AdminCategoryDrawer.svelte";

  let { data }: PageProps = $props();

  let handleInput = $state(page.url.searchParams.get("search") || "");
  let isProcessing = $state(false);
  let gridColumns = $state(2);
  let selectedCategory = $state<any>(null);
  let drawerOpen = $state(false);

  const debouncedHandle = new Debounced(() => handleInput, 500);

  let filters = $state<FilterField[]>([
    {
      name: "active",
      label: "Status",
      type: "select",
      value: page.url.searchParams.get("active") || "",
      options: [
        { label: "All", value: "" },
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
  ]);

  const queryParams = $derived({
    active: filters.find((f) => f.name === "active")?.value || "",
  });

  const categoriesQuery = $derived(
    infiniteScroll.listQuery<any>(
      debouncedHandle.current,
      page.url.origin,
      "all-categories",
      queryParams,
    ),
  );

  async function deleteCategory(id: string) {
    if (
      !confirm(
        "Are you sure you want to delete this category? This might affect products linked to it.",
      )
    )
      return;

    isProcessing = true;
    try {
      const formData = new FormData();
      formData.append("id", id);
      const response = await fetch("?/delete", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        toast.success("Category deleted successfully");
        invalidateAll();
        $categoriesQuery.refetch();
        drawerOpen = false;
      } else {
        toast.error("Failed to delete category");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      isProcessing = false;
    }
  }

  // Intersection Observer for Infinite Scroll
  const observe = (node: HTMLElement) => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          $categoriesQuery.hasNextPage &&
          !$categoriesQuery.isFetchingNextPage
        ) {
          $categoriesQuery.fetchNextPage();
        }
      },
      {
        rootMargin: "200px",
      },
    );
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      },
    };
  };
</script>

<div class="flex flex-col gap-4 pb-20">
  <!-- Header -->
  <div class="flex flex-col gap-1">
    <h1
      class="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-3"
    >
      Categories
      {#if $categoriesQuery.isPending}
        <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
      {:else}
        <span class="text-muted-foreground font-normal"
          >({$categoriesQuery?.data?.total ?? 0})</span
        >
      {/if}
    </h1>
    <p class="text-muted-foreground">Organize your store's items and content</p>
  </div>

  <!-- Sticky Actions Bar -->
  <div
    class="sticky top-0 z-30 -mx-4 flex h-16 items-center gap-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:mx-0 sm:px-0"
  >
    <div class="relative w-full flex-1 sm:max-w-md">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
      />
      <Input
        placeholder="Search categories..."
        bind:value={handleInput}
        class="pl-9 bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary h-10"
      />
    </div>

    <div class="flex items-center gap-2">
      <FilterButton
        bind:filters
        onApply={() => $categoriesQuery.refetch()}
        onReset={() => {
          filters.forEach((f) => (f.value = ""));
          $categoriesQuery.refetch();
        }}
      />

      <!-- Mobile Column Toggle -->
      <Button
        variant="outline"
        size="icon"
        class="lg:hidden h-10 w-10 shrink-0 border-muted-foreground/10"
        onclick={() => (gridColumns = gridColumns === 1 ? 2 : 1)}
      >
        {#if gridColumns === 1}
          <Grid2X2 class="h-4 w-4" />
        {:else}
          <Grid3X3 class="h-4 w-4" />
        {/if}
      </Button>

      <Button
        href="/admin/categories/create"
        class="flex shrink-0 items-center justify-center gap-2 h-10 px-3 sm:px-4 aspect-square sm:aspect-auto"
      >
        <Plus class="h-5 w-5 sm:h-4 sm:w-4" />
        <span class="hidden sm:inline">Add Category</span>
      </Button>
    </div>
  </div>

  {#if $categoriesQuery.isPending}
    <!-- Loading Skeletons -->
    <div class="hidden lg:block border rounded-xl overflow-hidden bg-card">
      <Table.Root>
        <Table.Header class="bg-muted/30">
          <Table.Row>
            <Table.Head class="w-12">#</Table.Head>
            <Table.Head>Category</Table.Head>
            <Table.Head>ID</Table.Head>
            <Table.Head>Usage</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head class="text-right">Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each Array(6) as _}
            <Table.Row>
              {#each Array(6) as __}
                <Table.Cell><Skeleton class="h-5 w-3/4" /></Table.Cell>
              {/each}
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
    <div class="grid gap-4 lg:hidden" class:grid-cols-2={gridColumns === 2}>
      {#each Array(6) as _}
        <Skeleton class="aspect-square rounded-xl" />
      {/each}
    </div>
  {:else if $categoriesQuery.error}
    <Alert.Root
      variant="destructive"
      class="rounded-xl border-destructive/20 bg-destructive/5"
    >
      <AlertCircleIcon class="h-4 w-4" />
      <Alert.Title>Failed to load categories</Alert.Title>
      <Alert.Description>
        Please try refreshing the page or check your connection.
      </Alert.Description>
    </Alert.Root>
  {:else if $categoriesQuery.data?.results.length === 0}
    <div
      class="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-muted-foreground/10"
    >
      <div
        class="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4"
      >
        <FolderTree class="h-10 w-10 text-muted-foreground/40" />
      </div>
      <h3 class="text-lg font-semibold">No categories found</h3>
      <p class="text-muted-foreground text-sm mb-6 text-center max-w-xs">
        Your search or filters didn't return any results. Try adjusting them or
        add a new category.
      </p>
      <Button href="/admin/categories/create" variant="outline" class="gap-2">
        <Plus class="h-4 w-4" /> Create Category
      </Button>
    </div>
  {:else}
    <div>
      <!-- Desktop Table -->
      <div
        class="hidden lg:block border rounded-xl overflow-hidden bg-card shadow-sm border-muted-foreground/10"
      >
        <Table.Root>
          <Table.Header class="bg-muted/30">
            <Table.Row class="hover:bg-transparent">
              <Table.Head class="w-12">#</Table.Head>
              <Table.Head class="font-bold">Category</Table.Head>
              <Table.Head class="font-bold">ID</Table.Head>
              <Table.Head class="font-bold">Usage</Table.Head>
              <Table.Head class="font-bold">Status</Table.Head>
              <Table.Head class="text-right font-bold w-28 pr-6"
                >Actions</Table.Head
              >
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each $categoriesQuery.data.results as category, i}
              <AdminCategoryListCard
                {category}
                {i}
                onView={(c) => {
                  selectedCategory = c;
                  drawerOpen = true;
                }}
                onDelete={(id) => deleteCategory(id)}
              />
            {/each}
          </Table.Body>
        </Table.Root>
      </div>

      <!-- Mobile Grid -->
      <div
        class="grid gap-3 lg:hidden"
        class:grid-cols-1={gridColumns === 1}
        class:grid-cols-2={gridColumns === 2}
      >
        {#each $categoriesQuery.data.results as category}
          <AdminCategoryGridCard
            {category}
            columns={gridColumns}
            onClick={() => {
              selectedCategory = category;
              drawerOpen = true;
            }}
          />
        {/each}
      </div>

      <!-- Infinite Scroll Loading Indicator -->
      <div class="mt-8 flex flex-col items-center">
        {#if $categoriesQuery.isFetchingNextPage}
          <div
            class="flex items-center gap-3 text-muted-foreground animate-pulse"
          >
            <Loader2 class="h-5 w-5 animate-spin" />
            <span class="text-sm font-medium">Loading more categories...</span>
          </div>
        {:else if $categoriesQuery.hasNextPage}
          <div use:observe class="h-20 w-full"></div>
        {:else if $categoriesQuery.data.results.length > 0}
          <div
            class="flex flex-col items-center gap-2 py-4 grayscale opacity-40"
          >
            <FolderTree class="h-6 w-6" />
            <span class="text-xs uppercase tracking-widest font-bold"
              >End of List</span
            >
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Drawer for Mobile Details & Actions -->
<AdminCategoryDrawer
  bind:open={drawerOpen}
  category={selectedCategory}
  onOpenChange={(open) => {
    if (!open) setTimeout(() => (selectedCategory = null), 300);
  }}
  onEdit={() => {
    if (selectedCategory) goto(`/admin/categories/${selectedCategory.id}/edit`);
    drawerOpen = false;
  }}
  onDelete={() => {
    if (selectedCategory) deleteCategory(selectedCategory.id);
  }}
/>
