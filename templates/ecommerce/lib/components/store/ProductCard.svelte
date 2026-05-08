<script lang="ts">
  import {
    Heart,
    Plus,
    Star,
    Truck,
    Eye,
    Zap,
    ShoppingCart,
    Minus,
    Loader2,
  } from "@lucide/svelte";
  import { formatPrice } from "$lib/fxns";
  import { cart } from "$lib/store/cart.svelte";
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { cn } from "$lib/utils.js";
  import QuickView from "./QuickView.svelte";
  import QuickPurchaseDialog from "./QuickPurchaseDialog.svelte";
  import RatingStars from "./RatingStars.svelte";
  import AdvancedCartAction from "./AdvancedCartAction.svelte";
  import { useSession } from "$lib/auth-client";
  import { page } from "$app/state";

  interface Props {
    class?: string;
    product: {
      id: string;
      name: string;
      basePrice: string;
      compareAtPrice?: string | null;
      stockQuantity: number;
      isFeatured?: boolean;
      images?: { url: string; altText?: string | null }[];
      category?: { name: string } | null;
      averageRating?: number;
      reviewCount?: number;
      sizes?: any[];
    };
    viewMode?: "grid" | "list" | "box";
    dealLabel?: string;
    showOfficialBadge?: boolean;
    isWishlisted?: boolean;
    onWishlistToggle?: (isWishlisted: boolean) => void;
  }

  let props: Props = $props();
  let {
    class: className = "",
    product,
    dealLabel,
    showOfficialBadge = false,
    onWishlistToggle,
  } = props;

  // Make viewMode reactive
  const viewMode = $derived(props.viewMode ?? "grid");

  const session = useSession();
  let isWishlisted = $state(props.isWishlisted ?? false);

  $effect(() => {
    // Sync with prop if provided
    if (props.isWishlisted !== undefined) {
      isWishlisted = props.isWishlisted;
    } else if (product?.id) {
      // Otherwise sync with global wishlist data from layout
      const ids = page.data.wishlistProductIds || [];
      isWishlisted = ids.includes(product.id);
    }
  });
  let isHovered = $state(false);
  let showQuickView = $state(false);
  let showQuickPurchase = $state(false);
  let fullProductData = $state<any>(null);
  let isLoadingProduct = $state(false);

  const primaryImage = $derived(
    product.images?.[0]?.url || "/placeholder-product.jpg",
  );
  const hasDiscount = $derived(
    !!(
      product.compareAtPrice &&
      parseFloat(product.compareAtPrice) > parseFloat(product.basePrice)
    ),
  );

  const discountPercent = $derived.by(() => {
    if (!hasDiscount) return 0;
    const original = parseFloat(product.compareAtPrice!);
    const current = parseFloat(product.basePrice);
    return Math.round(((original - current) / original) * 100);
  });

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

      onWishlistToggle?.(isWishlisted);
    } catch (error) {
      isWishlisted = previousState;
      toast.error("Failed to update wishlist");
    }
  };

  const productInCart = $derived(
    cart.items.find((item) => item.productId === product.id),
  );
  const cartQuantity = $derived(productInCart ? productInCart.quantity : 0);

  const categoryInitial = (categoryName: string) => {
    return categoryName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const openQuickView = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isLoadingProduct = true;
    showQuickView = true;

    try {
      // Fetch full product data including sizes
      const response = await fetch(`/api/products/${product.id}`);
      const result = await response.json();

      if (result.success && result.data) {
        fullProductData = result.data;
      } else {
        // Fallback to basic product data
        fullProductData = product;
      }
    } catch (error) {
      console.error("Failed to load product details:", error);
      fullProductData = product;
    } finally {
      isLoadingProduct = false;
    }
  };
</script>

{#snippet quantityWidget(isMobileMode: boolean)}
  <AdvancedCartAction
    {product}
    showLabel={!isMobileMode}
    onclick={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
    onkeydown={(e) => {
      e.stopPropagation();
    }}
  />
{/snippet}

{#snippet actionButtons()}
  <div class="flex items-center gap-2">
    <Button
      variant="outline"
      size="icon"
      class="border-none bg-muted/20 hover:bg-primary/10 hover:text-primary"
      onclick={openQuickView}
      title="Quick View"
    >
      <Eye class="h-4 w-4" />
    </Button>
    <Button
      variant="default"
      size="icon"
      class="shadow-lg shadow-primary/20"
      onclick={(e) => {
        e.preventDefault();
        showQuickPurchase = true;
      }}
      title="Buy Now"
    >
      <Zap class="h-4 w-4 fill-current" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      class={cn(
        "rounded-xl transition-all duration-300",
        isWishlisted
          ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/20"
          : "bg-background/20 backdrop-blur-md text-foreground hover:bg-background/40 hover:text-primary",
      )}
      onclick={toggleWishlist}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        class={cn(
          "h-5 w-5 transition-transform duration-300",
          isWishlisted && "scale-110",
        )}
        fill={isWishlisted ? "currentColor" : "none"}
      />
    </Button>
  </div>
{/snippet}

<article
  class={cn(
    "group relative overflow-hidden bg-card transition-all duration-300 hover:shadow-lg",
    viewMode === "list"
      ? "flex flex-col rounded-xl border border-border"
      : "flex flex-col rounded-xl border border-border",
    className,
  )}
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
>
  <!-- Main Content Area (Image + Info) -->
  <div class={cn("flex flex-1", viewMode === "list" ? "flex-row" : "flex-col")}>
    <!-- Image Area -->
    <a
      href="/products/{product.id}"
      class={cn(
        "relative overflow-hidden bg-muted/50 transition-colors hover:bg-muted",
        viewMode === "list"
          ? "w-32 h-32 flex-shrink-0 sm:w-36 sm:h-36 rounded-l-xl"
          : "aspect-square w-full rounded-t-xl",
      )}
    >
      <!-- Campaign/Deal Badge -->
      {#if dealLabel}
        <div
          class="absolute left-2 top-2 z-10 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-primary-foreground shadow-lg"
        >
          {dealLabel}
        </div>
      {/if}

      <!-- Discount Badge -->
      {#if hasDiscount}
        <span
          class="absolute bottom-2 left-2 z-10 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm"
        >
          -{discountPercent}%
        </span>
      {/if}

      <img
        src={primaryImage}
        alt={product.images?.[0]?.altText || product.name}
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      <!-- Out of Stock -->
      {#if product.stockQuantity === 0}
        <div
          class="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]"
        >
          <span
            class="rounded-md bg-destructive px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground shadow-sm"
          >
            Sold Out
          </span>
        </div>
      {/if}
    </a>

    <!-- Info Area -->
    <div
      class={cn(
        "flex min-w-0 flex-1 flex-col",
        viewMode === "list" ? "p-3 justify-center" : "p-2 pb-0",
      )}
    >
      <!-- Badge Section -->
      <div class="flex min-h-[1.25rem] flex-wrap items-center gap-2">
        {#if product.category}
          <small
            class="flex h-5 items-center justify-center rounded border border-border bg-muted px-2 text-[10px] font-bold uppercase text-muted-foreground"
          >
            <span class="md:hidden"
              >{categoryInitial(product.category.name)}</span
            >
            <span class="hidden md:inline">{product.category.name}</span>
          </small>
        {/if}
      </div>

      <!-- Name -->
      <a href="/products/{product.id}" class="group/name mt-1">
        <h3
          class="line-clamp-1 text-sm font-medium leading-snug text-foreground transition-colors group-hover/name:text-primary"
        >
          {product.name}
        </h3>
      </a>

      <!-- Price Section -->
      <div
        class={cn(
          "mt-1 flex gap-2",
          viewMode === "list" ? "flex-row items-baseline" : "flex-col gap-0.5",
        )}
      >
        <div class="text-lg font-bold leading-tight text-foreground">
          {formatPrice(product.basePrice)}
        </div>
        {#if hasDiscount}
          <div
            class="text-[11px] text-muted-foreground decoration-destructive/50 line-through"
          >
            {formatPrice(product.compareAtPrice!)}
          </div>
        {/if}
      </div>

      <!-- Rating (List view specific info row) -->
      {#if viewMode === "list"}
        <div class="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          {#if product.averageRating}
            <div class="flex items-center gap-1.5">
              <RatingStars
                rating={product.averageRating}
                count={product.reviewCount}
                showCount
              />
              <span class="text-xs font-bold text-primary">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          {/if}
          {#if product.stockQuantity > 0}
            <div class="flex items-center gap-1">
              <Truck class="h-4 w-4 text-primary" />
              <span class="text-xs">In Stock</span>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Action Area -->
  {#if viewMode === "list"}
    <!-- List Actions: Always below content on all screen sizes -->
    <div
      class="flex items-center gap-3 p-3 bg-muted/5 border-t border-border/50"
    >
      <div class="w-fit">
        {@render quantityWidget(true)}
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="default"
          size="icon"
          class="shadow-lg shadow-primary/20 shrink-0"
          onclick={(e) => {
            e.preventDefault();
            showQuickPurchase = true;
          }}
          title="Buy Now"
        >
          <Zap class="h-4 w-4 fill-current" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="border-none bg-muted/20 hover:bg-primary/10 hover:text-primary shrink-0"
          onclick={openQuickView}
          title="Quick View"
        >
          <Eye class="h-4 w-4" />
        </Button>
      </div>
    </div>
  {:else}
    <!-- Grid Mode Actions -->
    <div class="p-2">
      <div class="flex flex-col gap-2">
        <!-- Row 1: Quick View, Buy Now, Wishlist, Rating -->
        <div class="flex items-center justify-between">
          {@render actionButtons()}
          <div class="flex flex-col items-end gap-1">
            {#if product.averageRating}
              <div class="flex items-center gap-1">
                <RatingStars rating={product.averageRating} />
                <span class="text-[10px] font-bold text-primary">
                  {product.averageRating.toFixed(1)}
                </span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</article>

<QuickView
  bind:open={showQuickView}
  product={fullProductData || product}
  isLoading={isLoadingProduct}
  onClose={() => {
    showQuickView = false;
    fullProductData = null;
  }}
/>
<QuickPurchaseDialog
  bind:open={showQuickPurchase}
  {product}
  quantity={cartQuantity > 0 ? cartQuantity : 1}
  onClose={() => (showQuickPurchase = false)}
/>

<style>
  /* Custom hover transition for better feel */
  a {
    will-change: transform, box-shadow;
  }
</style>
