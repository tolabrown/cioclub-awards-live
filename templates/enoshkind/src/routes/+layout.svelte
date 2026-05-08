<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	import { ModeWatcher } from 'mode-watcher';
	import type { iMeta } from '$lib/interface';
	import WhatsAppFAB from '$lib/components/widgets/WhatsAppFAB.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';
	import CookieConsent from '$lib/components/widgets/CookieConsent.svelte';

	let { children } = $props();
	const meta: iMeta = {
		title: 'EnoshKind Health Intelligence',
		description:
			'AI-powered health intelligence designed specifically for Nigerian men. Culturally-relevant, personalized health insights.',
		ogimage: 'https://enoshkind.com/hero_mobile.webp',
		link: 'https://enoshkind.com',
		keywords: [
			'Nigerian men health',
			'AI health',
			'health intelligence',
			'African health',
			"men's health Nigeria",
			'personalized health'
		]
	};
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{meta.title}</title>
	<meta name="title" content={meta.title} />
	<meta name="description" content={meta.description} />
	<meta name="keywords" content={meta.keywords.join(', ')} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={meta.link} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:image" content={meta.ogimage} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={meta.link} />
	<meta property="twitter:title" content={meta.title} />
	<meta property="twitter:description" content={meta.description} />
	<meta property="twitter:image" content={meta.ogimage} />
</svelte:head>
<Toaster richColors position="top-center" />
<ModeWatcher disableTransitions={true} />
{@render children?.()}
<WhatsAppFAB />
<BottomBar />
<CookieConsent />
