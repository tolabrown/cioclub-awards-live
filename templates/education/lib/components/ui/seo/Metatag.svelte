<script lang="ts">
	import { SiteMeta } from '$lib/constants';

	interface Props {
		title?: string;
		description?: string;
		keywords?: string[];
		ogImage?: string;
		ogType?: 'website' | 'article';
		ogUrl?: string;
		twitterCard?: 'summary' | 'summary_large_image';
		canonical?: string;
	}

	let {
		title = SiteMeta.title,
		description = SiteMeta.description,
		keywords = SiteMeta.keywords,
		ogImage = SiteMeta.ogimage,
		ogType = 'website',
		ogUrl = SiteMeta.link,
		twitterCard = 'summary_large_image',
		canonical = SiteMeta.link
	} = $props();

	// Format title: If it's the default, keep it. Otherwise, add the brand suffix.
	const displayTitle = $derived(title === SiteMeta.title ? title : (title.includes('DHUB') ? title : `${title} | DHUB Education`));
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{displayTitle}</title>
	<meta name="title" content={displayTitle} />
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords.join(', ')} />
	<link rel="canonical" href={canonical} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={ogType} />
	<meta property="og:url" content={ogUrl} />
	<meta property="og:title" content={displayTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />

	<!-- Twitter -->
	<meta property="twitter:card" content={twitterCard} />
	<meta property="twitter:url" content={ogUrl} />
	<meta property="twitter:title" content={displayTitle} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={ogImage} />
</svelte:head>
