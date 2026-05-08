<script lang="ts">
  import { cn } from "$lib/utils.js";
</script>

<div
  class="relative overflow-hidden rounded-xl border-none bg-white/70 shadow-sm backdrop-blur-md dark:bg-white/5 py-0 gap-0"
>
  <div class="flex">
    <!-- Image Skeleton -->
    <div
      class="h-32 w-32 shrink-0 bg-slate-100 animate-pulse dark:bg-slate-900 sm:w-40 sm:h-40"
    ></div>

    <!-- Info Skeleton -->
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex flex-1 flex-col p-4 pb-2">
        <div
          class="flex flex-col md:flex-row items-start justify-between gap-2"
        >
          <div class="min-w-0 flex-1 space-y-2">
            <div
              class="h-4 w-16 bg-slate-200 animate-pulse rounded dark:bg-slate-800"
            ></div>
            <div
              class="h-5 w-3/4 bg-slate-200 animate-pulse rounded dark:bg-slate-800"
            ></div>
            <div
              class="h-4 w-1/4 bg-slate-200 animate-pulse rounded dark:bg-slate-800"
            ></div>
          </div>
          <div class="flex flex-col items-end gap-1">
            <div
              class="h-6 w-20 bg-slate-200 animate-pulse rounded dark:bg-slate-800"
            ></div>
            <div
              class="h-3 w-12 bg-slate-200 animate-pulse rounded dark:bg-slate-800"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Actions Skeleton -->
  <div class="border-t border-border/50 p-4 pt-3">
    <div class="flex items-center justify-between gap-4">
      <div
        class="h-9 w-28 bg-slate-100 animate-pulse rounded-xl dark:bg-slate-900"
      ></div>
      <div class="flex items-center gap-4">
        <div class="hidden sm:flex flex-col items-end gap-1">
          <div
            class="h-3 w-8 bg-slate-200 animate-pulse rounded dark:bg-slate-800"
          ></div>
          <div
            class="h-5 w-16 bg-slate-200 animate-pulse rounded dark:bg-slate-800"
          ></div>
        </div>
        <div
          class="h-9 w-9 bg-slate-100 animate-pulse rounded-full dark:bg-slate-900"
        ></div>
      </div>
    </div>
  </div>
</div>
