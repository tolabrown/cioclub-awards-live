<script lang="ts">
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Button } from "$lib/components/ui/button";
  import {
    Home,
    Calendar,
    Users,
    User,
    MoreHorizontal,
    Newspaper,
    Mail,
    Shield,
    Settings,
    LayoutDashboard,
    Award,
    Zap,
    Trophy,
    Ticket,
    UserPlus,
    HandCoins,
    FileEdit,
    UserCog,
    ShieldCheck,
    Cookie,
    Info,
    Handshake,
    HelpCircle,
    Heart,
    Book,
  } from "@lucide/svelte";
  import type { User as AuthUser } from "$lib/auth";
  import * as CookieConsent from "vanilla-cookieconsent";
  import { onMount } from "svelte";

  const user = $derived(page.data.user as AuthUser | undefined);
  const isAdmin = $derived(
    user?.role === "admin" || user?.role === "superadmin",
  );

  const isActive = (path: string) => page.url.pathname === path;

  const mainNav = $derived([
    { label: "Home", href: "/", icon: Home },
    { label: "Services", href: "/services", icon: Book },
    { label: "Team", href: "/team", icon: Users },
    { label: "Profile", href: user ? "/dashboard" : "/login", icon: User },
  ]);

  const aboutNav = $derived([
    { label: "About Us", href: "/about", icon: Info },
    { label: "News", href: "/news", icon: Newspaper },
    { label: "Contact", href: "/contact", icon: Mail },
    { label: "Team", href: "/team", icon: Users },
    { label: "Ladies In Tech & Leadership", href: "/ladies-in-tech", icon: Heart },
  ]);

  const servicesNav = $derived([
    { label: "Services", href: "/services", icon: Book },
  ]);

  const adminNav = $derived([
    { label: "Admin Panel", href: "/admin", icon: ShieldCheck },
    { label: "Page Editor", href: "/admin/pages", icon: FileEdit },
    { label: "Manage Users", href: "/users", icon: UserCog },
  ]);

  let drawerOpen = $state(false);
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
  });
</script>

<nav
  class="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border pb-safe lg:hidden"
>
  <div class="max-w-md mx-auto flex justify-around items-center py-3 px-2">
    {#each mainNav as item}
      <a
        href={item.href}
        class={cn(
          "flex flex-col items-center gap-1 transition-colors duration-200",
          isActive(item.href)
            ? "text-primary"
            : "text-muted-foreground hover:text-primary",
        )}
      >
        <item.icon class="size-6" />
        <span class="text-[10px] font-bold uppercase">{item.label}</span>
      </a>
    {/each}

    {#if mounted}
      <Drawer.Root bind:open={drawerOpen}>
        <Drawer.Trigger>
          <button
            class="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <MoreHorizontal class="size-6" />
            <span class="text-[10px] font-bold uppercase">More</span>
          </button>
        </Drawer.Trigger>
        <Drawer.Content>
          <div
            class="mx-auto w-full max-w-sm p-6 pb-12 max-h-[80vh] overflow-y-auto"
          >
            <!-- Navigation Groups -->
            <div class="mt-6">
              <div class="flex items-center gap-2 mb-4">
                <Info class="size-4 text-primary" />
                <h3
                  class="text-xs font-bold uppercase tracking-[0.2em] text-foreground"
                >
                  Explore
                </h3>
              </div>
              <div class="grid grid-cols-3 gap-4">
                {#each aboutNav as item}
                  <a
                    href={item.href}
                    class="flex flex-col items-center gap-2 group"
                    onclick={() => (drawerOpen = false)}
                  >
                    <div
                      class="size-12 rounded-xl bg-card border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm"
                    >
                      <item.icon class="size-5" />
                    </div>
                    <span
                      class="text-[9px] font-bold text-center leading-tight text-muted-foreground uppercase opacity-70 group-hover:opacity-100"
                      >{item.label}</span
                    >
                  </a>
                {/each}

                <!-- Awards External Link -->
                <a
                  href="https://www.thecioclubafrica.com/awards"
                  target="_blank"
                  class="flex flex-col items-center gap-2 group"
                  onclick={() => (drawerOpen = false)}
                >
                  <div
                    class="size-12 rounded-xl bg-card border border-border flex items-center justify-center group-hover:bg-accent-gold group-hover:text-black transition-all duration-300 shadow-sm"
                  >
                    <Trophy class="size-5" />
                  </div>
                  <span
                    class="text-[9px] font-bold text-center leading-tight text-muted-foreground uppercase opacity-70 group-hover:opacity-100"
                    >Awards</span
                  >
                </a>
              </div>
            </div>

            <!-- Admin Group -->
            {#if isAdmin}
              <div class="mt-12 pt-8 border-t border-border">
                <div class="flex items-center gap-2 mb-4">
                  <ShieldCheck class="size-4 text-destructive" />
                  <h3
                    class="text-xs font-bold uppercase tracking-[0.2em] text-foreground"
                  >
                    Admin
                  </h3>
                </div>
                <div class="grid grid-cols-3 gap-4">
                  {#each adminNav as item}
                    <a
                      href={item.href}
                      class="flex flex-col items-center gap-2 group"
                      onclick={() => (drawerOpen = false)}
                    >
                      <div
                        class="size-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center group-hover:bg-destructive group-hover:text-destructive-foreground transition-all duration-300 shadow-sm"
                      >
                        <item.icon class="size-5" />
                      </div>
                      <span
                        class="text-[9px] font-bold text-center leading-tight text-muted-foreground uppercase opacity-70 group-hover:opacity-100"
                        >{item.label}</span
                      >
                    </a>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Cookie Settings -->
            <div class="mt-8 pt-8 border-t border-border">
              <button
                class="flex items-center gap-3 w-full p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                onclick={() => {
                  drawerOpen = false;
                  if (
                    typeof CookieConsent !== "undefined" &&
                    CookieConsent.showPreferences
                  ) {
                    CookieConsent.showPreferences();
                  } else {
                    console.warn("CookieConsent not initialized");
                    // Fallback to reload if necessary or just show notification
                  }
                }}
              >
                <Cookie class="size-5 text-muted-foreground" />
                <span class="text-xs font-bold uppercase text-foreground"
                  >Cookie Preferences</span
                >
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Root>
    {:else}
      <button
        class="flex flex-col items-center gap-1 text-muted-foreground opacity-50 transition-colors duration-200"
      >
        <MoreHorizontal class="size-6" />
        <span class="text-[10px] font-bold uppercase">More</span>
      </button>
    {/if}
  </div>
</nav>

<style>
  /* Add padding to bottom of page to prevent navigation bar overlapping content */
  :global(body) {
    padding-bottom: 5rem;
  }
  @media (min-width: 768px) {
    :global(body) {
      padding-bottom: 0;
    }
  }
</style>
