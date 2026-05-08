<script lang="ts">
  import type { iTeacher } from "$lib/interface";
  import { cn } from "$lib/utils";
  import { User, MapPin, Briefcase } from "@lucide/svelte";
  import { Badge } from "$lib/components/ui/badge";

  interface Props {
    teacher: iTeacher;
    onClick: () => void;
    columns?: number;
  }

  let { teacher, onClick, columns = 2 }: Props = $props();

  const getTeacherTypeColor = (type?: string | null) => {
    switch (type) {
      case "Full Time":
        return "bg-blue-500/10 text-blue-500 border-blue-200";
      case "Volunteer":
        return "bg-green-500/10 text-green-500 border-green-200";
      case "Utility":
        return "bg-orange-500/10 text-orange-500 border-orange-200";
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
    {#if (teacher as any).image?.url}
      <img
        src={(teacher as any).image.url}
        alt={teacher.name}
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
  </div>

  <!-- Content Section -->
  <div
    class={cn(
      "flex flex-col justify-center",
      columns === 1
        ? "flex-1 p-4 bg-gradient-to-br from-card to-card/50"
        : "absolute bottom-0 left-0 w-full p-3",
    )}
  >
    <div class="">
      <h3
        class={cn(
          "font-bold leading-tight line-clamp-1",
          columns === 1 ? "text-lg text-foreground" : "text-lg text-white",
        )}
      >
        {teacher.name}
      </h3>

      {#if columns === 1}
        <div class="flex flex-wrap gap-2">
          {#if teacher.teacherType}
            <Badge
              variant="outline"
              class={cn(
                "text-xs border",
                getTeacherTypeColor(teacher.teacherType),
              )}
            >
              {teacher.teacherType}
            </Badge>
          {/if}

          {#if teacher.location}
            <Badge variant="secondary" class="text-xs">
              <MapPin class="mr-1 h-3 w-3" />
              {teacher.location}
            </Badge>
          {/if}

          {#if teacher.assignedClass}
            <Badge variant="secondary" class="text-xs">
              <Briefcase class="mr-1 h-3 w-3" />
              {teacher.assignedClass}
            </Badge>
          {/if}
        </div>
      {:else}
        <div class="flex flex-col gap-1">
          {#if teacher.location}
            <span
              class="self-start text-xs font-medium text-white/90 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/10"
            >
              <span class="line-clamp-1">{teacher.location}</span>
            </span>
          {/if} 
        </div>
      {/if}
    </div>
  </div>
</button>
