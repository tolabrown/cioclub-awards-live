<script lang="ts">
	import "../app.css";
	import { Toaster } from "svelte-sonner";
	import { ModeWatcher } from "mode-watcher";
	import type { iMeta } from "$lib/interface";

	let { children } = $props();
	const meta: iMeta = {
		title: "RCN Lagos Children Department",
		description: "Raising Total Kingdom Children",
		ogimage: "https://children.rcnlagos.org/screenshot-wide.webp",
		link: "https://children.rcnlagos.org",
		keywords: [
			"children",
			"children department",
			"children department Lagos",
			"children department RCN Lagos",
			"children department Lagos RCN",
		],
	};
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{meta.title}</title>
	<meta name="title" content={meta.title} />
	<meta name="description" content={meta.description} />
	<meta name="keywords" content={meta.keywords.join(", ")} />

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
