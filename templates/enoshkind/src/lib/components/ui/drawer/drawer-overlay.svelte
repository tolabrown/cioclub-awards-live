<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { cn } from '$lib/utils.js';
	import { onMount } from 'svelte';

	let { ref = $bindable(null), class: className, ...restProps }: any = $props();

	let mounted = $state(false);
	onMount(() => (mounted = true));
</script>

{#if mounted}
	<DrawerPrimitive.Overlay
		bind:ref
		data-slot="drawer-overlay"
		class={cn('bg-background/80 fixed inset-0 z-50 backdrop-blur-sm', className)}
		{...restProps}
	/>
{/if}
