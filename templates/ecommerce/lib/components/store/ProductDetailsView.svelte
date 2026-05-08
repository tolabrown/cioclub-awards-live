<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
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
    Loader2,
  } from "@lucide/svelte";
  import { cart } from "$lib/store/cart.svelte";
  import { toast } from "svelte-sonner";
  import { Zap } from "@lucide/svelte";
  import RatingStars from "./RatingStars.svelte";
  import AdvancedCartAction from "./AdvancedCartAction.svelte";
  import { useSession } from "$lib/auth-client";
  import { format } from "date-fns";
  import { Check } from "@lucide/svelte";
  import { Label } from "../ui/label";
  import { Input } from "../ui/input";
    import { cn } from "$lib/utils";
    import QuickPurchaseDialog from "./QuickPurchaseDialog.svelte";
    import { page } from "$app/state";

  let showQuickPurchase = $state(false);

  interface Props {
    product: any;
    reviewStats?: any;
    reviews?: any[];
    showTabs?: boolean;
    onAddToCart?: (qty: number) => void;
  }

  let {
    product,
    reviewStats,
    reviews = [],
    showTabs = true,
    onAddToCart,
  }: Props = $props();

  const session = useSession();
  const images = $derived(product?.images || []);
  let selectedSize = $state<string | null>(null);
  let currentImageIndex = $state(0);
  let isWishlisted = $state(false);

  // Sync wishlist status from page data or prop
  $effect(() => {
    if (product?.id) {
      const ids = page.data.wishlistProductIds || [];
      isWishlisted = ids.includes(product.id);
    }
  });

  // Get selected size object
  const selectedSizeData = $derived(
    product?.sizes?.find((s: any) => s.id === selectedSize) || null,
  );

  // Calculate current price: base price + size additional price
  const currentPrice = $derived(() => {
    const base = parseFloat(product?.basePrice || "0");
    const additional = selectedSizeData
      ? parseFloat(selectedSizeData.additionalPrice || "0")
      : 0;
    return base + additional;
  });

  const productInCart = $derived(
    cart.items.find((item) => item.product.id === product.id),
  );
  const cartQuantity = $derived(productInCart ? productInCart.quantity : 0);

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

  const nextImage = () => {
    currentImageIndex = (currentImageIndex + 1) % images.length;
  };

  const prevImage = () => {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  };

  const handleShare = async () => {
    // ... existing code ...
    const productUrl = `${window.location.origin}/products/${product.id}`;
    const shareData = {
      title: product.name,
      text: `${product.name} - ${formatPrice(currentPrice())}`,
      url: productUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(productUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (error: any) {
      // User cancelled share or error occurred
      if (error.name !== "AbortError") {
        toast.error("Failed to share");
      }
    }
  };

  const toggleWishlist = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentUser = $session.data?.user || page.data.user;

    if (!currentUser) {
      toast.error("Please login to use wishlist", {
        description: "You need an account to save items for later.",
        action: {
          label: "Login",
          onClick: () => (window.location.href = "/auth/login"),
        },
      });
      return;
    }

    const previousState = isWishlisted;
    isWishlisted = !isWishlisted;

    try {
      const response = await fetch("/api/wishlist", {
        method: isWishlisted ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to update wishlist");
      }

      toast.success(
        isWishlisted ? "Added to wishlist" : "Removed from wishlist",
        {
          position: "bottom-right",
        },
      );
    } catch (error) {
      isWishlisted = previousState;
      toast.error("Failed to update wishlist");
    }
  };
</script>

<div class="grid gap-8 lg:grid-cols-2">
  <!-- Image Gallery -->
  <div class="w-full space-y-4 overflow-hidden">
    <div
      class="relative aspect-square w-full font-normal overflow-hidden rounded-xl bg-muted"
    >
      {#if images.length > 0}
        <img
          src={images[currentImageIndex].url}
          alt={images[currentImageIndex].altText || product.name}
          class="h-full w-full object-cover"
        />
        {#if images.length > 1}
          <button
            onclick={prevImage}
            class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 backdrop-blur-sm shadow-sm"
          >
            <ChevronLeft class="h-5 w-5" />
          </button>
          <button
            onclick={nextImage}
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 backdrop-blur-sm shadow-sm"
          >
            <ChevronRight class="h-5 w-5" />
          </button>
        {/if}
      {:else}
        <div
          class="flex h-full items-center justify-center text-muted-foreground"
        >
          No image available
        </div>
      {/if}

      {#if hasDiscount}
        <Badge class="absolute left-4 top-4 bg-primary"
          >-{discountPercent}%</Badge
        >
      {/if}
    </div>

    <!-- Thumbnails -->
    {#if images.length > 1}
      <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {#each images as image, i}
          <button
            onclick={() => (currentImageIndex = i)}
            class="h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all {currentImageIndex ===
            i
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-border hover:border-primary/50'}"
          >
            <img src={image.url} alt="" class="h-full w-full object-cover" />
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Product Info -->
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground lg:text-3xl">
        {product.name}
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">SKU: {product.sku}</p>
    </div>

    <!-- Rating -->
    {#if reviewStats && reviewStats.totalReviews > 0}
      <div class="flex items-center gap-2">
        <RatingStars
          rating={reviewStats.averageRating}
          count={reviewStats.totalReviews}
          showCount
          size="md"
        />
        <span class="text-xs font-bold text-primary"
          >{reviewStats.averageRating.toFixed(1)}</span
        >
      </div>
    {/if}

    <!-- Price -->
    <div class="flex flex-col gap-1">
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-bold text-foreground"
          >{formatPrice(currentPrice())}</span
        >
        {#if selectedSizeData && parseFloat(selectedSizeData.additionalPrice) > 0}
          <span class="text-sm text-muted-foreground"
            >(+{formatPrice(selectedSizeData.additionalPrice)} for size)</span
          >
        {/if}
      </div>
      {#if hasDiscount}
        <div class="flex items-center gap-2">
          <span class="text-base text-muted-foreground line-through"
            >{formatPrice(product.compareAtPrice!)}</span
          >
          <Badge
            variant="secondary"
            class="bg-primary/10 text-primary border-none"
          >
            Save {discountPercent}%
          </Badge>
        </div>
      {/if}
    </div>

    <!-- Stock Status -->
    <div>
      {#if product.stockQuantity > 0}
        <span class="text-sm text-foreground font-medium"
          >✓ In Stock ({product.stockQuantity} available)</span
        >
      {:else}
        <span class="text-sm text-destructive font-medium">✗ Out of Stock</span>
      {/if}
    </div>

    <!-- Sizes -->
    {#if product.sizes && product.sizes.length > 0}
      <div>
        <h4 class="mb-2 font-medium text-foreground">Size</h4>
        <div class="flex flex-wrap gap-2">
          {#each product.sizes as ps}
            <button
              onclick={() => (selectedSize = ps.id)}
              disabled={!ps.isAvailable}
              class="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors {selectedSize ===
              ps.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-background hover:border-primary text-foreground'} disabled:opacity-50"
            >
              {ps.size.name}
              {#if parseFloat(ps.additionalPrice) > 0}
                <span class="text-xs opacity-75">
                  (+{formatPrice(ps.additionalPrice)})
                </span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Actions Toggle -->
    <div class="flex flex-col gap-4">
      {#if !cart.isReady}
        <Button
          class="w-full rounded-xl font-bold bg-muted/10 text-muted-foreground h-12 border-none animate-pulse"
          variant="outline"
          disabled
        >
          <Loader2 class="mr-2 h-5 w-5 animate-spin text-primary" />
          <span class="text-sm">Loading...</span>
        </Button>
      {:else}
        <div class="space-y-4">
          <AdvancedCartAction {product} sizeId={selectedSize} class="w-full" />

          <Button
            class="w-full rounded-xl shadow-lg shadow-primary/20"
            onclick={() => (showQuickPurchase = true)}
            disabled={product.stockQuantity === 0}
          >
            <Zap class="mr-2 h-5 w-5 fill-current" />
            Buy {cartQuantity > 0 ? cartQuantity : ""} Now
          </Button>
        </div>
      {/if}

      <div class="flex gap-3 mt-2">
        <Button
          variant="ghost"
          size="icon"
          class={cn(
            "rounded-xl transition-all duration-300",
            isWishlisted
              ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/20"
              : "bg-muted/20 text-foreground hover:bg-muted/40 hover:text-primary",
          )}
          onclick={toggleWishlist}
        >
          <Heart
            class={cn(
              "h-5 w-5 transition-transform duration-300",
              isWishlisted && "scale-110",
            )}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="rounded-xl border-none bg-muted/20 hover:bg-primary/10 hover:text-primary"
          onclick={handleShare}
        >
          <Share2 class="h-5 w-5" />
        </Button>
      </div>
    </div>

    <!-- Features -->
    <div
      class="grid grid-cols-3 gap-4 rounded-xl border border-border p-4 bg-muted/10 shadow-sm"
    >
      <div class="flex flex-col items-center gap-1 text-center">
        <Truck class="h-5 w-5 text-primary" />
        <span
          class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >Free Ship</span
        >
      </div>
      <div class="flex flex-col items-center gap-1 text-center">
        <Shield class="h-5 w-5 text-primary" />
        <span
          class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >Secure</span
        >
      </div>
      <div class="flex flex-col items-center gap-1 text-center">
        <RotateCcw class="h-5 w-5 text-primary" />
        <span
          class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >Easy Return</span
        >
      </div>
    </div>
  </div>
</div>

{#snippet stackedContent()}
  <div class="space-y-12">
    <!-- Specifications Section -->
    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="h-8 w-1 bg-primary rounded-full"></div>
        <h3 class="text-xl font-bold tracking-tight">Specifications</h3>
      </div>
      <div
        class="prose prose-sm max-w-none dark:prose-invert text-muted-foreground bg-muted/20 p-6 rounded-xl border border-border/50 shadow-sm"
      >
        {@html product.description}
      </div>
    </section>

    <!-- Features Section -->
    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="h-8 w-1 bg-primary rounded-full"></div>
        <h3 class="text-xl font-bold tracking-tight">Key Features</h3>
      </div>
      {#if product.features && product.features.length > 0}
        <div class="grid gap-3 sm:grid-cols-2">
          {#each product.features as feature}
            <div
              class="flex items-start gap-3 bg-muted/20 p-4 rounded-xl border border-border/50 shadow-sm"
            >
              <div
                class="mt-1 h-5 w-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Plus class="h-3 w-3 text-primary" />
              </div>
              <div class="flex flex-col">
                <span
                  class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >{feature.name}</span
                >
                <span class="text-sm font-medium text-foreground"
                  >{feature.value}</span
                >
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div
          class="bg-muted/10 p-6 rounded-xl border border-dashed text-center"
        >
          <p class="text-sm text-muted-foreground">
            No specific features listed for this product.
          </p>
        </div>
      {/if}
    </section>

    <!-- Reviews Section -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-8 w-1 bg-primary rounded-full"></div>
          <h3 class="text-xl font-bold tracking-tight">Customer Reviews</h3>
        </div>
        <Badge variant="outline" class="rounded-lg font-bold">
          {reviewStats?.totalReviews || 0} reviews
        </Badge>
      </div>

      {@render reviewsList()}
    </section>
  </div>
{/snippet}

{#snippet reviewsList()}
  <div class="space-y-6">
    {#if reviews && reviews.length > 0}
      {#each reviews as review}
        <div
          class="flex gap-4 items-start pb-6 border-b border-border last:border-0 last:pb-0"
        >
          <div
            class="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden"
          >
            {#if review.user?.image}
              <img
                src={review.user.image}
                alt={review.user.name}
                class="h-full w-full object-cover"
              />
            {:else}
              <span class="text-xs font-bold text-muted-foreground"
                >{review.user?.name?.charAt(0).toUpperCase() || "U"}</span
              >
            {/if}
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <h5 class="text-sm font-bold">
                  {review.user?.name || "Anonymous"}
                </h5>
                <div class="flex items-center gap-2">
                  <RatingStars rating={review.rating} size="sm" />
                  {#if review.isVerifiedPurchase}
                    <span
                      class="flex items-center gap-0.5 text-[9px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded border border-primary/20"
                    >
                      <Check class="h-2.5 w-2.5" /> Verified
                    </span>
                  {/if}
                </div>
              </div>
              <span
                class="text-[10px] text-muted-foreground uppercase font-medium"
                >{format(new Date(review.createdAt), "MMM dd, yyyy")}</span
              >
            </div>
            {#if review.title}
              <h6 class="text-sm font-bold text-foreground">{review.title}</h6>
            {/if}
            <p class="text-sm text-muted-foreground leading-relaxed">
              {review.comment}
            </p>
          </div>
        </div>
      {/each}
    {:else}
      <div
        class="bg-muted/10 p-8 rounded-xl border border-dashed text-center shadow-sm"
      >
        <div class="mb-4 flex justify-center">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <Star class="h-6 w-6" />
          </div>
        </div>
        <p class="text-sm text-muted-foreground font-medium italic">
          There are no reviews yet. Be the first to share your experience with
          this product!
        </p>
      </div>
    {/if}
  </div>
{/snippet}

<div class="mt-12">
  {#if showTabs}
    <!-- Desktop View: Tabs -->
    <div class="hidden lg:block">
      <Tabs.Root value="specifications">
        <Tabs.List
          class="w-full justify-start overflow-x-auto bg-muted/50 p-1 rounded-xl h-10 items-stretch"
        >
          <Tabs.Trigger value="specifications" class="rounded-lg px-6 h-auto"
            >Specifications</Tabs.Trigger
          >
          <Tabs.Trigger value="features" class="rounded-lg px-6 h-auto"
            >Features</Tabs.Trigger
          >
          <Tabs.Trigger value="reviews" class="rounded-lg px-6 h-auto"
            >Reviews ({reviewStats?.totalReviews || 0})</Tabs.Trigger
          >
        </Tabs.List>
        <Tabs.Content value="specifications" class="mt-6">
          <div class="prose prose-sm max-w-none dark:prose-invert">
            {@html product.description}
          </div>
        </Tabs.Content>
        <Tabs.Content value="features" class="mt-6">
          {#if product.features && product.features.length > 0}
            <ul class="grid gap-3 sm:grid-cols-2">
              {#each product.features as feature}
                <li
                  class="flex items-start gap-3 text-sm text-muted-foreground bg-card p-3 rounded-lg border border-border"
                >
                  <Plus class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span
                    ><span class="font-bold text-foreground"
                      >{feature.name}:</span
                    >
                    {feature.value}</span
                  >
                </li>
              {/each}
            </ul>
          {:else}
            <p class="text-muted-foreground">No features listed.</p>
          {/if}
        </Tabs.Content>
        <Tabs.Content value="reviews" class="mt-6">
          {@render reviewsList()}
        </Tabs.Content>
      </Tabs.Root>
    </div>

    <!-- Mobile/Tablet View -->
    <div class="lg:hidden">
      {@render stackedContent()}
    </div>
  {:else}
    <!-- Forced Stacked View (e.g. QuickView) -->
    {@render stackedContent()}
  {/if}
</div>

<QuickPurchaseDialog
  bind:open={showQuickPurchase}
  {product}
  quantity={cartQuantity > 0 ? cartQuantity : 1}
  onClose={() => (showQuickPurchase = false)}
/>
