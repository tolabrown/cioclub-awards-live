<script lang="ts">
  import type { iChild } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { differenceInYears } from "date-fns";
  import { cn } from "$lib/utils";
  import { User, Calendar, Cake } from "@lucide/svelte";

  interface Props {
    child: iChild;
    onClick: () => void;
    columns?: number;
    isBirthday?: boolean;
  }

  let { child, onClick, columns = 2, isBirthday = false }: Props = $props();

  const age = $derived(
    child.dateOfBirth
      ? differenceInYears(new Date(), new Date(child.dateOfBirth))
      : null,
  );

  const getAgeGroupColor = (ageGroup?: string) => {
    switch (ageGroup) {
      case "Nursery":
        return "bg-purple-500/10 text-purple-500 border-purple-200";
      case "Toddlers":
        return "bg-orange-500/10 text-orange-500 border-orange-200";
      case "Beginners":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-200";
      case "Primary":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-200";
      case "Juniors":
        return "bg-red-500/10 text-red-500 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-200";
    }
  };
</script>

<button
  onclick={onClick}
  class={cn(
    "group relative overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
    columns === 1
      ? "flex flex-row h-32 sm:h-40"
      : "flex flex-col aspect-square w-full",
  )}
>
  <!-- Image Section -->
  <div
    class={cn(
      "relative overflow-hidden bg-muted",
      columns === 1 ? "w-1/3 sm:w-40 h-full shrink-0" : "w-full h-full",
    )}
  >
    {#if (child as any).image?.url}
      <img
        src={(child as any).image.url}
        alt={child.name}
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    {:else}
      <div
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5"
      >
        <User class="h-10 w-10 text-primary/40" />
      </div>
    {/if}

    <!-- Gradient Overlay for 2-column mode text readability -->
    {#if columns !== 1}
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
      ></div>
    {/if}

    <!-- Celebration Icon -->
    {#if isBirthday}
      <div class="absolute top-3 right-3 z-10">
        <div
          class="bg-primary/90 text-primary-foreground rounded-full p-1.5 shadow-lg border border-white/20 backdrop-blur-md animate-bounce-subtle pointer-events-none"
        >
          <Cake class="w-3.5 h-3.5" />
        </div>
      </div>
    {/if}
  </div>

  <!-- Content Section -->
  <div
    class={cn(
      "flex flex-col justify-center",
      columns === 1
        ? "flex-1 p-4 bg-gradient-to-br from-card to-card/50"
        : "absolute bottom-0 left-0 w-full p-3 pointer-events-none",
    )}
  >
    <div class="">
      <h3
        class={cn(
          "font-bold leading-tight line-clamp-1",
          columns === 1 ? "text-lg text-foreground" : "text-lg text-white",
        )}
      >
        {child.name}
      </h3>

      {#if columns === 1}
        <div class="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            class={cn("text-xs border", getAgeGroupColor(child.ageGroup))}
          >
            {child.ageGroup}
          </Badge>
          {#if age !== null}
            <Badge variant="secondary" class="text-xs">
              <Calendar class="mr-1 h-3 w-3" />
              {age}
              {age < 2 ? "yr" : "yrs"}
            </Badge>
          {/if}
          <Badge variant="secondary" class="text-xs capitalize">
            {child.gender}
          </Badge>
        </div>

        {#if child.parents && child.parents.length > 0}
          <div class="flex flex-col gap-1 mt-2">
            {#each child.parents.slice(0, 2) as parent}
              {#if typeof parent === "object" && parent !== null}
                <div
                  class="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <User class="h-3 w-3 opacity-70" />
                  <span class="line-clamp-1">{parent.name}</span>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      {:else}
        <div class="flex items-center gap-2">
          <span
            class="text-xs font-medium text-white/90 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/10"
          >
            {child.ageGroup}
          </span>
          {#if age !== null}
            <span class="text-xs text-white/80">
              {age}
              {age < 2 ? "yr" : "yrs"}
            </span>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</button>
