<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import {
    Home,
    Package,
    SlidersHorizontal,
    MoreHorizontal,
    ShoppingCart,
    User as UserIcon,
    Store,
    Phone,
    ArrowUpDown,
    LayoutDashboard,
    History,
    Search,
    Heart,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import Cookie from "$lib/components/icons/Cookie.svelte";
  import WhatsApp from "$lib/components/icons/WhatsApp.svelte";
  import { COMPANY_INFO, SITE_NAME } from "$lib/constants/index";
  import * as CookieConsent from "vanilla-cookieconsent";

  let drawerOpen = $state(false);
  let searchDrawerOpen = $state(false);
  let searchQuery = $state("");

  // Dynamic import for Drawer
  let Drawer: any = $state(null);

  $effect(() => {
    if (browser) {
      import("$lib/components/ui/drawer/index.js").then((module) => {
        Drawer = module;
      });
    }
  });

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Package },
    { name: "Categories", href: "/categories", icon: Store },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  const isActive = (href: string) => {
    const pathname = page.url.pathname;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isProductsPage = $derived(
    page.url.pathname === "/products" || page.url.pathname === "/products/",
  );

  const whatsappNumber = COMPANY_INFO.phone;
  const message = `Hello ${SITE_NAME}, I have an inquiry about your products.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodeURIComponent(message)}`;

  const toggleSort = () => {
    window.dispatchEvent(new CustomEvent("open-sort"));
  };

  const toggleFilters = () => {
    window.dispatchEvent(new CustomEvent("open-filters"));
  };

  const handleSearch = (e: SubmitEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchDrawerOpen = false;
      goto(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const showCookiePreferences = () => {
    drawerOpen = false;
    CookieConsent.showPreferences();
  };
</script>

<div
  class="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-1 border-t border-border bg-card pb-safe lg:hidden"
>
  <!-- WhatsApp -->
  <a
    href={whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-medium text-muted-foreground hover:text-[#25D366] transition-colors"
  >
    <div class="relative">
      <WhatsApp class="h-5 w-5 fill-current" />
      <div class="absolute -top-1 -right-1 flex h-2 w-2">
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
        ></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"
        ></span>
      </div>
    </div>
    <span>WhatsApp</span>
  </a>

  <!-- Home -->
  <a
    href="/"
    class="flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-medium transition-colors {isActive(
      '/',
    )
      ? 'text-primary'
      : 'text-muted-foreground'}"
  >
    <Home class="h-5 w-5" />
    <span>Home</span>
  </a>

  <!-- Products -->
  <a
    href="/products"
    class="flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-bold transition-colors {isActive(
      '/products',
    )
      ? 'text-primary'
      : 'text-muted-foreground'}"
  >
    <Package class="h-5 w-5" />
    <span>Products</span>
  </a>

  <!-- Search -->
  {#if !isProductsPage}
    <button
      onclick={() => (searchDrawerOpen = true)}
      class="flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
    >
      <Search class="h-5 w-5" />
      <span>Search</span>
    </button>
  {/if}

  <!-- Sort (Products Page only) -->
  {#if isProductsPage}
    <button
      onclick={toggleSort}
      class="flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
    >
      <ArrowUpDown class="h-5 w-5" />
      <span>Sort</span>
    </button>
  {/if}

  <!-- Filter (Products Page only) -->
  {#if isProductsPage}
    <button
      onclick={toggleFilters}
      class="flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
    >
      <SlidersHorizontal class="h-5 w-5" />
      <span>Filter</span>
    </button>
  {/if}

  <!-- More Drawer -->
  <div class="flex flex-1 justify-center">
    {#if browser && Drawer}
      <Drawer.Root bind:open={drawerOpen}>
        <Drawer.Trigger
          class="flex flex-col items-center gap-1 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal class="h-5 w-5" />
          <span>More</span>
        </Drawer.Trigger>
        <Drawer.Content>
          <div
            class="mx-auto w-full max-w-sm px-6 py-4 flex flex-col max-h-[70vh]"
          >
            <Drawer.Header class="px-0 pt-0 shrink-0">
              <Drawer.Title>Navigation</Drawer.Title>
              <Drawer.Description
                >Quick access to other pages</Drawer.Description
              >
            </Drawer.Header>
            <div class="overflow-y-auto flex-1 py-4">
              <div class="grid grid-cols-2 gap-3">
                {#each navLinks as link}
                  <a
                    href={link.href}
                    onclick={() => (drawerOpen = false)}
                    class="flex flex-col items-center gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-accent"
                  >
                    <link.icon class="h-5 w-5 text-primary" />
                    <span class="text-xs font-medium">{link.name}</span>
                  </a>
                {/each}

                {#if page.data.user?.role === "admin"}
                  <a
                    href="/admin"
                    onclick={() => (drawerOpen = false)}
                    class="flex flex-col items-center gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-accent"
                  >
                    <LayoutDashboard class="h-5 w-5 text-red-500" />
                    <span class="text-xs font-medium text-red-500 font-bold"
                      >Admin</span
                    >
                  </a>
                {/if}

                <a
                  href="/account"
                  onclick={() => (drawerOpen = false)}
                  class="flex flex-col items-center gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-accent"
                >
                  <UserIcon class="h-5 w-5 text-primary" />
                  <span class="text-xs font-medium">Account</span>
                </a>
                <a
                  href="/wishlist"
                  onclick={() => (drawerOpen = false)}
                  class="flex flex-col items-center gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-accent"
                >
                  <Heart class="h-5 w-5 text-primary" />
                  <span class="text-xs font-medium">Wishlist</span>
                </a>
                <a
                  href="/cart"
                  onclick={() => (drawerOpen = false)}
                  class="flex flex-col items-center gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-accent"
                >
                  <ShoppingCart class="h-5 w-5 text-primary" />
                  <span class="text-xs font-medium">Cart</span>
                </a>
                <a
                  href="/orders"
                  onclick={() => (drawerOpen = false)}
                  class="flex flex-col items-center gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-accent"
                >
                  <History class="h-5 w-5 text-primary" />
                  <span class="text-xs font-medium">Orders</span>
                </a>
                <button
                  onclick={showCookiePreferences}
                  class="flex flex-col items-center gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-accent"
                >
                  <Cookie class="h-5 w-5 text-primary" />
                  <span class="text-xs font-medium">Cookies</span>
                </button>
              </div>
            </div>
            <Drawer.Footer
              class="px-0 pb-0 pt-4 shrink-0 border-t border-border"
            >
              <Button
                variant="outline"
                class="w-full"
                onclick={() => (drawerOpen = false)}>Close</Button
              >
            </Drawer.Footer>
          </div>
        </Drawer.Content>
      </Drawer.Root>
    {:else}
      <button
        class="flex flex-col items-center gap-1 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
      >
        <MoreHorizontal class="h-5 w-5" />
        <span>More</span>
      </button>
    {/if}
  </div>
</div>

<!-- Search Drawer -->
{#if browser && Drawer}
  <Drawer.Root bind:open={searchDrawerOpen}>
    <Drawer.Content>
      <div class="mx-auto w-full max-w-sm px-6 py-8">
        <Drawer.Header class="px-0 pt-0">
          <div class="flex items-center gap-3 mb-2">
            <div
              class="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary"
            >
              <Search class="h-5 w-5" />
            </div>
            <Drawer.Title class="text-xl font-bold"
              >Search Products</Drawer.Title
            >
          </div>
          <Drawer.Description>
            Find exactly what you're looking for
          </Drawer.Description>
        </Drawer.Header>
        <form onsubmit={handleSearch} class="flex flex-col gap-4 mt-6">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder="Search for products..."
              bind:value={searchQuery}
              class="pl-10"
            />
          </div>
          <Button type="submit">Find Products</Button>
        </form>
        <Drawer.Footer class="px-0 pb-0 pt-6">
          <Button variant="outline" onclick={() => (searchDrawerOpen = false)}
            >Cancel</Button
          >
        </Drawer.Footer>
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}
