<script lang="ts">
  import type { PageProps } from "./$types";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import {
    ProductCard,
    ProductDetailsView,
  } from "$lib/components/store/index.js";
  import { formatPrice } from "$lib/fxns";
  import {
    Heart,
    Share2,
    ShoppingCart,
    Minus,
    Plus,
    Star,
    Truck,
    Shield,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
  } from "@lucide/svelte";
  import { cart } from "$lib/store/cart.svelte";
  import { toast } from "svelte-sonner";

  import { untrack } from "svelte";
  import { navigating } from "$app/stores";

  let { data }: PageProps = $props();

  const product = $derived(data.product);
  const images = $derived(product?.images || []);
  const relatedProducts = $derived(data.relatedProducts || []);

  let quantity = $state(1);
  let selectedSize = $state<string | null>(null);
  let currentImageIndex = $state(0);
  let isWishlisted = $state(false);

  const hasDiscount = $derived(
    !!(
      product?.compareAtPrice &&
      parseFloat(product.compareAtPrice) > parseFloat(product.basePrice)
    ),
  );
  const discountPercent = $derived(
    hasDiscount
      ? Math.round(
          ((parseFloat(product.compareAtPrice!) -
            parseFloat(product.basePrice)) /
            parseFloat(product.compareAtPrice!)) *
            100,
        )
      : 0,
  );

  const incrementQuantity = () => {
    if (quantity < (product?.stockQuantity || 10)) quantity++;
  };

  const decrementQuantity = () => {
    if (quantity > 1) quantity--;
  };

  const nextImage = () => {
    currentImageIndex = (currentImageIndex + 1) % images.length;
  };

  const prevImage = () => {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  };

  const addToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      cart.addItem(product);
    }
    toast.success(`${product.name} added to cart`, {
      description: `${quantity} items added. View cart in the header.`,
      position: "top-center",
    });
  };

  // Personalization: Track viewed product
  $effect(() => {
    if (product) {
      untrack(() => cart.addViewed(product));
    }
  });

  // SEO: Prepare meta data
  const siteUrl = "https://laniastores.toolsntuts.com";
  const storeName = $derived(data.settings?.storeName || "Lania Stores");
  const pageTitle = $derived(`${product?.name} | ${storeName}`);
  const pageDescription = $derived(
    `${product?.name} - ${product?.description?.replace(/<[^>]*>/g, "").slice(0, 150)}... Buy for only ${formatPrice(product?.basePrice || "0")}`,
  );
  const ogImage = $derived(
    product?.images?.[0]?.url ||
      product?.images?.[0]?.imageFile?.url ||
      `${siteUrl}/og-default.png`,
  );
  const productUrl = $derived(`${siteUrl}/products/${product?.id}`);
</script>

<svelte:head>
  {#if product}
    <!-- Primary Meta Tags -->
    <title>{pageTitle}</title>
    <meta name="title" content={pageTitle} />
    <meta name="description" content={pageDescription} />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product" />
    <meta property="og:url" content={productUrl} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={pageDescription} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content={storeName} />

    <!-- Product-specific OG tags -->
    <meta property="product:price:amount" content={product.basePrice} />
    <meta property="product:price:currency" content="NGN" />
    {#if product.stockQuantity > 0}
      <meta property="product:availability" content="in stock" />
    {:else}
      <meta property="product:availability" content="out of stock" />
    {/if}
    {#if product.category}
      <meta property="product:category" content={product.category.name} />
    {/if}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content={productUrl} />
    <meta name="twitter:title" content={pageTitle} />
    <meta name="twitter:description" content={pageDescription} />
    <meta name="twitter:image" content={ogImage} />

    <!-- Additional Meta Tags -->
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow" />
    <link rel="canonical" href={productUrl} />

    <!-- Schema.org Structured Data -->
    {@html `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "${product.name}",
      "description": "${pageDescription.replace(/"/g, '\\"')}",
      "image": "${ogImage}",
      "sku": "${product.sku}",
      "offers": {
        "@type": "Offer",
        "url": "${productUrl}",
        "priceCurrency": "NGN",
        "price": "${product.basePrice}",
        "availability": "${product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"}",
        "seller": {
          "@type": "Organization",
          "name": "Lania Stores - Your Trusted Retail"
        }
      }
    }
    <\/script>`}
  {/if}
</svelte:head>

{#if product}
  <div class="center py-6">
    <!-- Breadcrumb -->
    <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/" class="hover:text-foreground">Home</a>
      <span>/</span>
      <a href="/products" class="hover:text-foreground">Products</a>
      {#if product.category}
        <span>/</span>
        <a
          href="/category/{product.category.id}"
          class="hover:text-foreground line-clamp-1 max-w-[100px] sm:max-w-none"
          >{product.category.name}</a
        >
      {/if}
      <span>/</span>
      <span class="text-foreground line-clamp-1 max-w-[150px] sm:max-w-none"
        >{product.name}</span
      >
    </nav>

    {#if $navigating}
      <ProductDetailsView.Skeleton />
    {:else}
      <ProductDetailsView
        {product}
        reviewStats={data.reviewStats}
        reviews={data.reviews}
      />
    {/if}

    <!-- Related Products -->
    {#if relatedProducts.length > 0}
      <div class="mt-12">
        <h2 class="mb-6 text-xl font-bold text-foreground">Related Products</h2>
        <div class="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {#each relatedProducts.slice(0, 4) as related}
            <ProductCard product={related} />
          {/each}
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="center px-4 py-12 text-center">
    <p class="text-lg text-muted-foreground">Product not found</p>
    <Button class="mt-4" href="/products">Browse Products</Button>
  </div>
{/if}
