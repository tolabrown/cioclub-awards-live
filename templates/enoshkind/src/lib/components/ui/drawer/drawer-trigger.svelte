<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { onMount } from 'svelte';

	let { ref = $bindable(null), ...restProps }: any = $props();

	let mounted = $state(false);
	onMount(() => (mounted = true));
</script>

{#if mounted}
	<DrawerPrimitive.Trigger bind:ref data-slot="drawer-trigger" {...restProps} />
{/if}
