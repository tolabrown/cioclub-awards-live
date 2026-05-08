<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { browser } from '$app/environment';

	let {
		shouldScaleBackground = true,
		open = $bindable(false),
		activeSnapPoint = $bindable(null),
		...restProps
	}: DrawerPrimitive.RootProps = $props();
</script>

{#if browser}
	<DrawerPrimitive.NestedRoot
		{shouldScaleBackground}
		bind:open
		bind:activeSnapPoint
		{...restProps}
	/>
{/if}
