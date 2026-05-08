<script lang="ts">
  import type { PageProps } from "./$types";
  import { Card, CardContent } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Store, ChevronRight, Sparkles } from "@lucide/svelte";

  let { data }: PageProps = $props();
  const categories = $state(data.categories || []);
</script>

<div class="center px-4 py-8">
  <!-- Hero Section -->
  <div
    class="relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-primary/10 via-background to-primary/5 shadow-lg mb-12"
  >
    <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
    <div class="relative z-10 p-8 md:p-12 lg:p-16 text-center">
      <div
        class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary mb-6 animate-in"
      >
        <Sparkles class="size-3.5" />
        Explore Our Collection
      </div>
      <h1
        class="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4"
      >
        Discover by <span
          class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          >Category</span
        >
      </h1>
      <p class="max-w-2xl mx-auto text-lg text-muted-foreground">
        From premium electronics to high-performance kitchenware, find exactly
        what you need in our curated categories.
      </p>
    </div>
  </div>

  <!-- Categories Grid -->
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each categories as category}
      <a href="/products?category={category.id}" class="group block h-full">
        <Card
          class="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 rounded-lg bg-card border-border py-0"
        >
          <div class="relative aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={category.imageFile?.url || "/placeholder-category.jpg"}
              alt={category.name}
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6"
            >
              <Button variant="secondary" size="sm" class="w-full font-bold">
                Browse Products
              </Button>
            </div>
          </div>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <h3
                  class="text-xl font-bold text-foreground group-hover:text-primary transition-colors"
                >
                  {category.name}
                </h3>
                <p class="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {category.description ||
                    `Explore our ${category.name} collection`}
                </p>
              </div>
              <div
                class="rounded-full bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all"
              >
                <ChevronRight class="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </a>
    {/each}

    {#if categories.length === 0}
      <div class="col-span-full py-20 text-center">
        <div
          class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4"
        >
          <Store class="size-8 text-muted-foreground" />
        </div>
        <h3 class="text-xl font-bold">No categories found</h3>
        <p class="text-muted-foreground mt-2">
          We're updating our collection. Please check back later.
        </p>
        <Button href="/products" variant="outline" class="mt-6">
          Browse All Products
        </Button>
      </div>
    {/if}
  </div>

  <!-- Featured Collections Section -->
  <div class="mt-24 space-y-12 pb-12">
    <div
      class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6"
    >
      <div>
        <h2 class="text-3xl font-bold">
          Curated <span class="text-primary">Collections</span>
        </h2>
        <p class="text-muted-foreground mt-2 text-lg">
          Specially selected products for your lifestyle.
        </p>
      </div>
      <Button
        variant="ghost"
        class="font-bold underline-offset-4 hover:underline"
      >
        View all collections
      </Button>
    </div>

    <div class="grid gap-8 md:grid-cols-2">
      <!-- Feature Card 1 -->
      <div class="relative h-80 rounded-xl overflow-hidden group">
        <img
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"
          alt="Modern Essentials"
          class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-8 flex flex-col justify-center"
        >
          <h3 class="text-3xl font-bold text-white mb-2">Modern Essentials</h3>
          <p class="text-white/80 max-w-xs mb-6">
            Upgrade your daily routine with our premium selection.
          </p>
          <div class="flex">
            <Button variant="default" class="font-bold">Shop Selection</Button>
          </div>
        </div>
      </div>

      <!-- Feature Card 2 -->
      <div class="relative h-80 rounded-xl overflow-hidden group">
        <img
          src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800"
          alt="Home Tech"
          class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-8 flex flex-col justify-center"
        >
          <h3 class="text-3xl font-bold text-white mb-2">Home Innovation</h3>
          <p class="text-white/80 max-w-xs mb-6">
            Cutting-edge technology for the modern home.
          </p>
          <div class="flex">
            <Button variant="default" class="font-bold">Explore Tech</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .bg-grid-pattern {
    background-image:
      linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
      linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px);
    background-size: 40px 40px;
  }
</style>
