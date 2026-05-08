<script lang="ts">
	import "../app.css";
	import { Toaster } from "svelte-sonner";
	import { ModeWatcher } from "mode-watcher";
	import { SiteMeta } from "$lib/constants/index";
	import type { LayoutData } from "./$types";

	let { children, data }: { children: any; data: LayoutData } = $props();
	import { page } from "$app/state";

	const settings = $derived(data.settings);
	const isProductPage = $derived(page.route.id === "/(store)/products/[id]");

	$effect(() => {
		if (typeof document !== "undefined" && settings) {
			const root = document.documentElement;
			if (settings.primaryColor) {
				root.style.setProperty("--primary", settings.primaryColor);
				root.style.setProperty("--primaryCol", settings.primaryColor);
				root.style.setProperty("--ring", settings.primaryColor);
				root.style.setProperty("--sidebar-primary", settings.primaryColor);
				root.style.setProperty("--sidebar-ring", settings.primaryColor);
			}
			if (settings.borderRadius) {
				root.style.setProperty("--radius", settings.borderRadius);
			}
		}
	});
</script>

<svelte:head>
	<!-- Google tag (gtag.js) -->
	<script
		async
		src="https://www.googletagmanager.com/gtag/js?id=G-34QJQLP35Z"
	></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag("js", new Date());
		gtag("config", "G-34QJQLP35Z");
	</script>

	{#if settings?.favicon?.url}
		<link rel="icon" type="image/png" href={settings.favicon.url} />
	{/if}

	{#if !isProductPage}
		<!-- Primary Meta Tags -->
		<title>{settings?.metaTitle || settings?.storeName || SiteMeta.title}</title
		>
		<meta
			name="title"
			content={settings?.metaTitle || settings?.storeName || SiteMeta.title}
		/>
		<meta
			name="description"
			content={settings?.metaDescription || SiteMeta.description}
		/>
		<meta
			name="keywords"
			content={settings?.socialLinks
				? Object.values(settings.socialLinks).filter(Boolean).join(", ")
				: SiteMeta.keywords.join(", ")}
		/>
	{/if}

	<style>
		:global(:root), :global(html), :global(body) {
			--primary: {settings?.primaryColor || 'oklch(0.623 0.214 259.815)'};
			--primaryCol: {settings?.primaryColor || 'oklch(0.623 0.214 259.815)'};
			--ring: {settings?.primaryColor || 'oklch(0.623 0.214 259.815)'};
			--sidebar-primary: {settings?.primaryColor || 'oklch(0.623 0.214 259.815)'};
			--sidebar-ring: {settings?.primaryColor || 'oklch(0.623 0.214 259.815)'};
			--radius: {settings?.borderRadius || '0.75rem'};
		}
		
		:global(html.dark), :global(body.dark), :global(.dark) {
			--primary: {settings?.primaryColor || 'oklch(0.623 0.214 259.815)'};
			--primaryCol: {settings?.primaryColor || 'oklch(0.623 0.214 259.815)'};
			--ring: {settings?.primaryColor || 'oklch(0.623 0.214 259.815)'};
			--sidebar-primary: {settings?.primaryColor || 'oklch(0.623 0.214 259.815)'};
			--sidebar-ring: {settings?.primaryColor || 'oklch(0.623 0.214 259.815)'};
		}
	</style>

	{#if !isProductPage}
		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="website" />
		<meta property="og:url" content={SiteMeta.link} />
		<meta property="og:title" content={SiteMeta.title} />
		<meta property="og:description" content={SiteMeta.description} />
		<meta property="og:image" content={SiteMeta.ogimage} />

		<!-- Twitter -->
		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:url" content={SiteMeta.link} />
		<meta property="twitter:title" content={SiteMeta.title} />
		<meta property="twitter:description" content={SiteMeta.description} />
		<meta property="twitter:image" content={SiteMeta.ogimage} />
	{/if}
</svelte:head>

<Toaster richColors position="top-center" />
<ModeWatcher disableTransitions={true} />
{@render children?.()}
