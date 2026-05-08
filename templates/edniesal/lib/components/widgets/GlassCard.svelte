<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    class: className = "",
    hoverable = true,
    padding = "p-6",
    style = "",
    ...rest
  } = $props<{
    children: Snippet;
    class?: string;
    hoverable?: boolean;
    padding?: string;
    style?: string;
    [key: string]: any;
  }>();
</script>

<div
  class="glass rounded-2xl transition-all duration-300 {padding} {className} {hoverable
    ? 'hover:shadow-2xl hover:shadow-electric-blue/10 hover:-translate-y-1'
    : ''}"
  {style}
  {...rest}
>
  {@render children()}
</div>
