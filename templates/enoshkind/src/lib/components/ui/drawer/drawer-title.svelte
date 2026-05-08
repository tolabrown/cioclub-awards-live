<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { cn } from '$lib/utils.js';
	import { browser } from '$app/environment';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DrawerPrimitive.TitleProps = $props();
</script>

{#if browser}
	<DrawerPrimitive.Title
		bind:ref
		data-slot="drawer-title"
		class={cn('text-foreground font-semibold', className)}
		{...restProps}
	/>
{/if}
