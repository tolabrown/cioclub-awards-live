<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { browser } from '$app/environment';

	let { ref = $bindable(null), ...restProps }: DrawerPrimitive.CloseProps = $props();
</script>

{#if browser}
	<DrawerPrimitive.Close bind:ref data-slot="drawer-close" {...restProps} />
{/if}
