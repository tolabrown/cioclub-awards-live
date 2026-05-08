<script lang="ts">
  import { page } from "$app/state";
  import BrandLink from "$lib/components/widgets/BrandLink.svelte";
  import { Constants } from "$lib/constants/index";

  const settings = $derived(page.data.settings);
</script>

<footer class="border-t border-border bg-card">
  <div class="center py-12">
    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <BrandLink />
      <div>
        <h4 class="font-medium text-foreground">Shop</h4>
        <ul class="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <a href="/products" class="hover:text-foreground">All Products</a>
          </li>
          <li>
            <a href="/categories" class="hover:text-foreground">Categories</a>
          </li>
          <li>
            <a href="/products?featured=true" class="hover:text-foreground"
              >Featured</a
            >
          </li>
        </ul>
      </div>
      <div>
        <h4 class="font-medium text-foreground">Account</h4>
        <ul class="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <a href="/dashboard" class="hover:text-foreground">My Account</a>
          </li>
          <li>
            <a href="/orders" class="hover:text-foreground">Orders</a>
          </li>
          <li><a href="/cart" class="hover:text-foreground">Cart</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-medium text-foreground">Support</h4>
        <ul class="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <a href="/contact" class="hover:text-foreground">Contact Us</a>
          </li>
          <li><a href="/faqs" class="hover:text-foreground">FAQ</a></li>
          <li>
            <a href="/shipping-info" class="hover:text-foreground"
              >Shipping Info</a
            >
          </li>
        </ul>
      </div>
    </div>
    <div
      class="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground"
    >
      <p>
        &copy; {new Date().getFullYear()}
        {settings?.storeName || Constants.BRANDNAME}. All rights reserved.
      </p>
    </div>
  </div>
</footer>
