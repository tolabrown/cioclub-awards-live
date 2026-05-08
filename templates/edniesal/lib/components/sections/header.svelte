<script lang="ts">
  import { page } from "$app/state";
  import BrandLink from "$lib/components/widgets/BrandLink.svelte";
  import {
    Home,
    LayoutDashboard,
    ChevronDown,
    Heart,
    Trophy,
    Book,
    Users,
    Globe,
    ExternalLink,
    Zap,
  } from "@lucide/svelte";
  import ModeToggle from "$lib/components/widgets/ModeToggle.svelte";
  import { Button } from "$lib/components/ui/button";
  import type { User } from "$lib/auth";
  import { Role, getNavigation } from "$lib/constants";
  import AuthDialog from "$lib/authentication/ui/user/auth-dialog.svelte";
  import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
  } from "$lib/components/ui/navigation-menu";

  const user = page.data.user as User | undefined;
  const navData = getNavigation(page.url.pathname);
  const navigation = $derived(user ? navData.privateNav : navData.publicNav);
  const isActive = (path: string) => page.url.pathname === path;
</script>

<div class="fixed top-0 left-0 right-0 z-[50] p-4">
  <header
    class="center rounded-xl h-16 md:h-20 flex items-center justify-between border-border shadow-lg backdrop-blur-md bg-background/80"
  >
    <BrandLink />

    <div class="flex items-center gap-4">
      <nav class="hidden lg:flex items-center gap-2">
        <NavigationMenu viewport={false}>
          <NavigationMenuList class="gap-1">
            {#each navigation as item, i}
              {#if !user || (user && item.roles.includes(user.role as Role))}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href={item.href}
                    target={item.target}
                    class="group flex flex-row w-max items-center justify-center rounded-md px-4 py-2 text-sm font-bold transition-colors hover:bg-accent/10 hover:text-primary focus:bg-accent/10 focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 {isActive(
                      item.href,
                    )
                      ? 'text-primary bg-accent/5'
                      : 'text-muted-foreground'}"
                  >
                    <item.icon class="mr-2 h-4 w-4 hidden" />
                    {item.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              {/if}
            {/each}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      <div class="h-6 w-[1px] bg-border hidden md:block"></div>

      <div class="flex items-center gap-2">
        <ModeToggle />
        <AuthDialog />
      </div>
    </div>
  </header>
</div>

<div class="h-16"></div>
<!-- Spacer for fixed header -->
