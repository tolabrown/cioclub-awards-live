<script lang="ts">
  import { SiteMeta, Constants } from "$lib/constants";

  let {
    title = SiteMeta.title,
    description = SiteMeta.description,
    ogimage = SiteMeta.ogimage,
    ogtype = "website",
    canonical = Constants.BRANDWEBSITE,
  } = $props();

  const siteTitle = $derived(
    title === SiteMeta.title ? title : `${title} | ${SiteMeta.title}`,
  );
  // Ensure absolute URL for ogimage for social platforms like WhatsApp
  const absoluteOgImage = $derived(
    ogimage.startsWith("http")
      ? ogimage
      : `${Constants.BRANDWEBSITE}${ogimage}`,
  );
</script>

<svelte:head>
  <title>{siteTitle}</title>
  <meta name="description" content={description} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={ogtype} />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content={siteTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={absoluteOgImage} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={canonical} />
  <meta property="twitter:title" content={siteTitle} />
  <meta property="twitter:description" content={description} />
  <meta property="twitter:image" content={absoluteOgImage} />

  <link rel="canonical" href={canonical} />
</svelte:head>
