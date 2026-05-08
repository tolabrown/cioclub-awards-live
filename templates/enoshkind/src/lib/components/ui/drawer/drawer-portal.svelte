<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { onMount } from 'svelte';

	let { ...restProps }: any = $props();

	let mounted = $state(false);
	onMount(() => (mounted = true));
</script>

{#if mounted}
	<DrawerPrimitive.Portal {...restProps} />
{/if}
