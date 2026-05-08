<div class="grid gap-8 lg:grid-cols-2">
  <!-- Image Gallery Skeleton -->
  <div class="w-full space-y-4">
    <div class="aspect-square w-full rounded-xl bg-muted animate-pulse"></div>
    <div class="flex gap-2 overflow-x-auto">
      {#each Array(4) as _}
        <div
          class="h-20 w-20 shrink-0 rounded-lg bg-muted animate-pulse border-2 border-transparent"
        ></div>
      {/each}
    </div>
  </div>

  <!-- Product Info Skeleton -->
  <div class="space-y-6">
    <div class="space-y-2">
      <div class="h-8 w-3/4 bg-muted animate-pulse rounded-lg"></div>
      <div class="h-4 w-1/4 bg-muted animate-pulse rounded"></div>
    </div>

    <div class="flex items-center gap-2">
      <div class="flex gap-1">
        {#each Array(5) as _}
          <div class="h-5 w-5 bg-muted animate-pulse rounded-full"></div>
        {/each}
      </div>
      <div class="h-4 w-20 bg-muted animate-pulse rounded"></div>
    </div>

    <div class="space-y-2">
      <div class="h-10 w-1/3 bg-muted animate-pulse rounded-lg"></div>
      <div class="h-4 w-1/4 bg-muted animate-pulse rounded"></div>
    </div>

    <div class="h-5 w-1/2 bg-muted animate-pulse rounded"></div>

    <div class="h-12 w-full bg-muted animate-pulse rounded-xl"></div>

    <div
      class="grid grid-cols-3 gap-4 rounded-xl border border-border p-4 bg-muted/5"
    >
      {#each Array(3) as _}
        <div class="flex flex-col items-center gap-2">
          <div class="h-5 w-5 bg-muted animate-pulse rounded-full"></div>
          <div class="h-3 w-12 bg-muted animate-pulse rounded"></div>
        </div>
      {/each}
    </div>
  </div>
</div>
