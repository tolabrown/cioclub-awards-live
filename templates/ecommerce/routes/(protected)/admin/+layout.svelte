<script lang="ts">
  import type { LayoutProps } from "./$types";
  import { Breadcrumb } from "$lib/components/ui/breadcrumb";

  let { children }: LayoutProps = $props();
</script>

<div class="flex flex-1 flex-col gap-4">
  {@render children()}
</div>
