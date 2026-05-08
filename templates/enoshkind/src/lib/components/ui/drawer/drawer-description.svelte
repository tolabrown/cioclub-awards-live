<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { cn } from '$lib/utils.js';
	import { browser } from '$app/environment';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DrawerPrimitive.DescriptionProps = $props();
</script>

{#if browser}
	<DrawerPrimitive.Description
		bind:ref
		data-slot="drawer-description"
		class={cn('text-muted-foreground text-sm', className)}
		{...restProps}
	/>
{/if}
