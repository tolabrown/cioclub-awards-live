<script lang="ts">
  import { page } from "$app/state";
  import BrandLink from "$lib/components/widgets/BrandLink.svelte";
  import { Home, LayoutDashboard, ShoppingCart, Heart } from "@lucide/svelte";
  import ModeToggle from "$lib/components/widgets/ModeToggle.svelte";
  import { Button } from "$lib/components/ui/button";
  import type { User } from "$lib/auth";
  import { Role, getNavigation, Constants } from "$lib/constants/index";
  import AuthDialog from "$lib/authentication/ui/user/auth-dialog.svelte";
  import { cart } from "$lib/store/cart.svelte";
  import Cookie from "$lib/components/icons/Cookie.svelte";
  import * as CookieConsent from "vanilla-cookieconsent";

  const user = page.data.user as User | undefined;
  const navData = getNavigation(page.url.pathname);
  const navigation = $derived(user ? navData.privateNav : navData.publicNav);
  const isActive = (path: string) => page.url.pathname === path;

  const showCookiePreferences = () => {
    CookieConsent.showPreferences();
  };
</script>

<div class="bg-background sticky top-0 left-0 z-49">
  <header class="border-b shadow-sm">
    <div class="center">
      <div class="flex h-16 items-center justify-between">
        <BrandLink />
        <div class="flex items-center space-x-4">
          <nav class="hidden space-x-2 lg:flex">
            {#each navigation as item}
              {#if !user || (user && item.roles.includes(user.role as Role))}
                <Button
                  href={item.href}
                  variant={isActive(item.href) ? "default" : "outline"}
                  size="sm"
                >
                  <item.icon class="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              {/if}
            {/each}
          </nav>

          <div class="flex items-center gap-2">
            <!-- Cookie Preferences (Desktop only) -->
            <Button
              onclick={showCookiePreferences}
              variant="outline"
              size="icon"
              class="hidden md:inline-flex cursor-pointer"
              aria-label="Cookie Preferences"
            >
              <Cookie class="size-4" />
            </Button>

            <ModeToggle />

            <Button
              variant="outline"
              size="icon"
              class="relative rounded-lg hover:text-primary transition-colors hidden md:inline-flex"
              href="/wishlist"
              aria-label="Wishlist"
            >
              <Heart class="size-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              class="relative rounded-lg"
              href="/cart"
            >
              <ShoppingCart class="size-5" />
              {#if cart.count > 0}
                <span
                  class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in"
                >
                  {cart.count}
                </span>
              {/if}
            </Button>

            <AuthDialog />
          </div>
        </div>
      </div>
    </div>
  </header>
</div>
