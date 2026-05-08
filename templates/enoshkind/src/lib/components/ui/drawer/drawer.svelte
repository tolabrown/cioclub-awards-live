<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let {
		shouldScaleBackground = true,
		open = $bindable(false),
		children,
		...restProps
	}: any = $props();

	let mounted = $state(false);
	onMount(() => (mounted = true));
</script>

{#if mounted}
	<DrawerPrimitive.Root {shouldScaleBackground} bind:open {...restProps}>
		{@render children?.()}
	</DrawerPrimitive.Root>
{/if}
