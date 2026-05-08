<script lang="ts">
	import type { LayoutProps } from './$types';
	import Footer from '$lib/components/sections/footer.svelte';
	import Header from '$lib/components/sections/header.svelte';
	import { setContext } from 'svelte';
    import type { User } from '$lib/auth';

	let { data, children }: LayoutProps = $props();

	setContext("me", data?.user as User)
</script>

<Header />
<div class="flex flex-col gap-4 animate-in fade-in">
{@render children()}
</div>
<Footer />
