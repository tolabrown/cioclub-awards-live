<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { cn } from "$lib/utils.js";
  import { Package, Star } from "@lucide/svelte";
  import { formatPrice } from "$lib/fxns";
  import QuickView from "./QuickView.svelte";

  import { useSession } from "$lib/auth-client";
  import { toast } from "svelte-sonner";
  import { Heart, Eye } from "@lucide/svelte";
  import { page } from "$app/state";
  import { cart } from "$lib/store/cart.svelte";
  import AdvancedCartAction from "./AdvancedCartAction.svelte";
  import { goto } from "$app/navigation";

  interface Props {
    product: any;
    dealLabel?: string;
    isWishlisted?: boolean;
    onWishlistToggle?: (isWishlisted: boolean) => void;
  }

  let props: Props = $props();
  let { product, dealLabel, onWishlistToggle } = props;
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

  let showQuickView = $state(false);
  let fullProductData = $state<any>(null);
  let isLoadingProduct = $state(false);

  const primaryImage = $derived(
    product.images?.[0]?.url || "/placeholder-product.jpg",
  );

  const productInCart = $derived(
    cart.items.find((item) => item.productId === product.id),
  );
  const cartQuantity = $derived(productInCart ? productInCart.quantity : 0);

  const openQuickView = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isLoadingProduct = true;
    showQuickView = true;

    try {
      // Fetch full product data including sizes and full description
      const response = await fetch(`/api/products/${product.id}`);
      const result = await response.json();

      if (result.success && result.data) {
        fullProductData = result.data;
      } else {
        // Fallback to basic product data if API fails
        fullProductData = product;
      }
    } catch (error) {
      console.error("Failed to load product details:", error);
      fullProductData = product;
    } finally {
      isLoadingProduct = false;
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

      onWishlistToggle?.(isWishlisted);
    } catch (error) {
      isWishlisted = previousState;
      toast.error("Failed to update wishlist");
    }
  };
</script>

<div
  class="group relative aspect-square w-full overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-lg"
>
  <!-- Clickable Image Layer -->
  <a href="/products/{product.id}" class="absolute inset-0 z-0 block">
    <!-- Image Layer -->
    <div class="absolute inset-0 z-0">
      {#if primaryImage && primaryImage !== "/placeholder-product.jpg"}
        <img
          src={primaryImage}
          alt={product.name}
          class="h-full w-full object-cover transition-transform duration-300 will-change-transform group-hover:scale-105"
          loading="lazy"
        />
      {:else}
        <div
          class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5"
        >
          <Package class="h-12 w-12 text-primary/20" />
        </div>
      {/if}

      <!-- Gradient Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"
      ></div>
    </div>
  </a>

  <!-- Action Buttons -->
  <div class="absolute right-2 top-2 z-20 flex flex-col gap-2">
    <button
      onclick={toggleWishlist}
      class={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200",
        isWishlisted
          ? "bg-primary/90 text-primary-foreground shadow-sm"
          : "bg-black/30 text-white hover:bg-black/70",
      )}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        class={cn("h-5 w-5", isWishlisted && "fill-current")}
        fill={isWishlisted ? "currentColor" : "none"}
      />
    </button>
    <button
      onclick={openQuickView}
      class="flex h-9 w-9 items-center justify-center rounded-xl bg-black/30 text-white hover:bg-black/70 transition-colors duration-200"
      title="Quick View"
    >
      <Eye class="h-5 w-5" />
    </button>
  </div>

  <!-- Bottom Content -->
  <div class="absolute bottom-0 left-0 z-10 w-full p-2 pointer-events-none">
    <h3
      class="text-base text-white line-clamp-1 leading-tight group-hover:text-primary transition-colors mb-0.5"
    >
      {product.name}
    </h3>
    <div class="flex items-end justify-between gap-2">
      <div class="flex flex-col flex-1">
        <span class="block text-base font-bold text-white leading-none mb-1.5">
          {formatPrice(product.basePrice)}
        </span>
      </div>

      <div class="flex flex-col items-end gap-1.5 pb-1">
        {#if product.averageRating}
          <div
            class="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-md"
          >
            <Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span class="text-[10px] font-bold text-white">
              {product.averageRating.toFixed(1)}
            </span>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<QuickView
  bind:open={showQuickView}
  product={fullProductData || product}
  isLoading={isLoadingProduct}
  onClose={() => {
    showQuickView = false;
    fullProductData = null;
  }}
/>
