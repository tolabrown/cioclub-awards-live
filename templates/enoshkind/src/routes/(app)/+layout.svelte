<script lang="ts">
	import type { LayoutProps } from './$types';
	import Footer from '$lib/components/sections/footer.svelte';
	import Header from '$lib/components/sections/header.svelte';

	let { children }: LayoutProps = $props();
</script>

<Header />
<div class="flex flex-col gap-4 animate-in fade-in min-h-screen">
	{@render children()}
</div>
<Footer />
