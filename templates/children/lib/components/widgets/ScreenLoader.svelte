<script lang="ts">
	import { cn } from "$lib/utils";

  interface Props {
    class?: string
  }

  let { class: className = '' }: Props = $props();
</script>

<div class={cn("flex min-h-screen items-center justify-center", className)}>
	<div class="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
</div>
