<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button";
  import {
    LayoutDashboard,
    Package,
    LayoutList,
    ShoppingCart,
    Users,
    UserCog,
    Star,
    Box,
    Image as ImageIcon,
    Tag,
    Ruler,
    Settings,
    BarChart3,
    User as UserIcon,
    ShoppingBag,
    ArrowRight,
  } from "@lucide/svelte";
  import { page } from "$app/state";

  const user = $derived(page.data.user);
  const isAdmin = $derived(user?.role === "admin");

  const platformItems = [
    {
      title: "Profile",
      description:
        "Manage your personal information, security settings, and account preferences.",
      href: "/profile",
      icon: UserIcon,
    },
    {
      title: "My Orders",
      description:
        "Track your purchase history, view order status, and manage active deliveries.",
      href: "/orders",
      icon: ShoppingBag,
    },
  ];

  const adminItems = [
    {
      title: "Dashboard",
      description:
        "Get a high-level overview of sales, performance metrics, and store activity.",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Products",
      description:
        "Manage your entire product catalog, including descriptions, pricing, and images.",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Categories",
      description:
        "Organize products into groups and manage store navigation structures.",
      href: "/admin/categories",
      icon: LayoutList,
    },
    {
      title: "Orders",
      description:
        "Track and manage customer orders, fulfillment status, and order details.",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Customers",
      description:
        "View customer profiles, purchase history, and manage customer relations.",
      href: "/admin/customers",
      icon: Users,
    },
    {
      title: "Users",
      description:
        "Manage administrative staff accounts, roles, and system access levels.",
      href: "/admin/users",
      icon: UserCog,
    },
    {
      title: "Reviews",
      description:
        "Monitor and moderate product feedback and customer testimonials.",
      href: "/admin/reviews",
      icon: Star,
    },
    {
      title: "Inventory",
      description:
        "Track stock levels across variants and monitor inventory movements.",
      href: "/admin/inventory",
      icon: Box,
    },
    {
      title: "Media Library",
      description:
        "Centralized storage for all product images, banners, and digital assets.",
      href: "/admin/media",
      icon: ImageIcon,
    },
    {
      title: "Tags",
      description:
        "Manage descriptive labels for products to improve search and filtering.",
      href: "/admin/tags",
      icon: Tag,
    },
    {
      title: "Sizes",
      description:
        "Standardize and manage product size variants for consistent cataloging.",
      href: "/admin/sizes",
      icon: Ruler,
    },
    {
      title: "Settings",
      description:
        "Configure global store settings, branding, appearance, and integrations.",
      href: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Analytics",
      description:
        "In-depth reports on traffic, conversion rates, and revenue generation.",
      href: "/admin/analytics",
      icon: BarChart3,
    },
  ];
</script>

<div class="flex flex-col gap-10 pb-16">
  <!-- Page Header -->
  <div class="space-y-3">
    <h1 class="text-4xl font-bold tracking-tight text-foreground">
      Documentation
    </h1>
    <p class="text-xl text-muted-foreground font-medium">
      Your comprehensive guide to the Lania Stores platform tools and features.
    </p>
  </div>

  <!-- Platform Section -->
  <section class="space-y-6">
    <div class="flex items-center gap-3">
      <div class="h-8 w-1 bg-primary rounded-full"></div>
      <h2 class="text-2xl font-bold tracking-tight text-foreground">
        Platform
      </h2>
    </div>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {#each platformItems as item}
        <Card.Root
          class="group rounded-xl border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/20"
        >
          <Card.Header class="pb-3">
            <div class="flex items-center gap-3 mb-2">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
              >
                <item.icon class="h-5 w-5" />
              </div>
              <Card.Title class="text-lg font-bold">{item.title}</Card.Title>
            </div>
          </Card.Header>
          <Card.Content class="space-y-4">
            <p
              class="text-sm leading-relaxed text-muted-foreground min-h-[4rem]"
            >
              {item.description}
            </p>
            <Button
              variant="outline"
              href={item.href}
              class="w-full rounded-lg font-medium group-hover:bg-primary group-hover:text-primary-foreground"
            >
              Open Tool <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </section>

  <!-- Admin Section -->
  {#if isAdmin}
    <section class="space-y-6 pt-4">
      <div class="flex items-center gap-3">
        <div class="h-8 w-1 bg-primary rounded-full"></div>
        <h2 class="text-2xl font-bold tracking-tight text-foreground">
          Administration
        </h2>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {#each adminItems as item}
          <Card.Root
            class="group rounded-xl border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/20"
          >
            <Card.Header class="pb-3">
              <div class="flex items-center gap-3 mb-2">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  <item.icon class="h-5 w-5" />
                </div>
                <Card.Title class="text-lg font-bold">{item.title}</Card.Title>
              </div>
            </Card.Header>
            <Card.Content class="space-y-4">
              <p
                class="text-sm leading-relaxed text-muted-foreground min-h-[4rem]"
              >
                {item.description}
              </p>
              <Button
                variant="outline"
                href={item.href}
                class="w-full rounded-lg font-medium group-hover:bg-primary group-hover:text-primary-foreground"
              >
                Open Tool <ArrowRight class="ml-2 h-4 w-4" />
              </Button>
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
    </section>
  {/if}
</div>
