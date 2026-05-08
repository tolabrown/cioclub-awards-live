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
    UserCircle,
    MoreHorizontal,
    Newspaper,
    Image as ImageIcon,
    Library,
    Search,
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
    Megaphone,
    Shield,
    Mail,
  } from "@lucide/svelte";
  import type { User as AuthUser } from "$lib/auth";
  import * as CookieConsent from "vanilla-cookieconsent";
  import { onMount } from "svelte";

  import { Role } from "$lib/constants";

  let { onOpenPopup } = $props<{ onOpenPopup: () => void }>();

  const user = $derived(page.data.user as AuthUser | undefined);
  const isAdmin = $derived(
    user?.role === Role.ADMIN || user?.role === "superadmin",
  );
  const canSeeDashboard = $derived(user && user.role !== Role.USER);

  const isActive = (path: string) => page.url.pathname === path;

  const mainNav = [
    { label: "Home", href: "/", icon: Home },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Team", href: "/team", icon: Users },
    { label: "Profile", href: "/dashboard", icon: User },
  ];

  const aboutNav = [
    { label: "About Us", href: "/about", icon: Info },
    { label: "Activities", href: "/activities", icon: Zap },
    { label: "Objectives", href: "/about#objectives", icon: Trophy },
    { label: "Board of Trustees", href: "/about#board", icon: Shield },
    { label: "Partnerships", href: "/partnerships", icon: Handshake },
    { label: "News", href: "/news", icon: Newspaper },
    { label: "Contact", href: "/contact", icon: Mail },
    { label: "Staff Team", href: "/team", icon: Users },
    { label: "Gallery", href: "/gallery", icon: ImageIcon },
  ];

  const membershipNav = [
    { label: "Overview", href: "/membership", icon: LayoutDashboard },
    { label: "Benefits", href: "/membership#benefits", icon: Heart },
    { label: "Membership Tiers", href: "/membership#cadres", icon: Award },
    { label: "How to Join", href: "/membership#join", icon: UserPlus },
  ];

  const awardsNav = [
    { label: "Awards Hub", href: "/awards", icon: Trophy },
    { label: "Categories", href: "/awards/categories", icon: Zap },
    // { label: "Submit Entry", href: "/awards/entry", icon: FileEdit },
    { label: "Nominate here", href: "/awards/nominate", icon: UserPlus },
    { label: "Awards Jury", href: "/awards/jury", icon: ShieldCheck },
    { label: "Project Team", href: "/awards/team", icon: Users },
    { label: "Past Winners", href: "/awards/winners", icon: Award },
    { label: "Sponsorship", href: "/awards/sponsorship", icon: HandCoins },
    // { label: "Get Tickets", href: "/awards/tickets", icon: Ticket },
    { label: "FAQ", href: "/faq", icon: HelpCircle },
  ];

  const toolsNav = [
    { label: "Resources", href: "/resources", icon: Library },
    { label: "Search", href: "/search", icon: Search },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const adminNav = [
    { label: "Admin Panel", href: "/admin", icon: ShieldCheck },
    { label: "Page Editor", href: "/admin/pages", icon: FileEdit },
    { label: "Manage Users", href: "/users", icon: UserCog },
  ];

  let drawerOpen = $state(false);
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
  });
</script>

<nav
  class="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border pb-safe md:hidden"
>
  <div class="max-w-md mx-auto flex justify-around items-center py-3 px-2">
    {#each mainNav as item, i}
      {#if i === 2}
        <button
          onclick={onOpenPopup}
          class="flex flex-col items-center gap-1 text-primary hover:scale-110 transition-transform duration-200"
        >
          <div class="relative">
            <Megaphone class="size-6" />
            <span class="absolute -top-1 -right-1 flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          </div>
          <span class="text-[10px] font-bold">Campaigns</span>
        </button>
      {/if}
      {#if item.href !== "/dashboard" || canSeeDashboard}
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
          <span class="text-[10px] font-medium">{item.label}</span>
        </a>
      {/if}
    {/each}

    {#if mounted}
      <Drawer.Root bind:open={drawerOpen}>
        <Drawer.Trigger>
          {#snippet child({ props })}
            <button
              {...props}
              class="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <MoreHorizontal class="size-6" />
              <span class="text-[10px] font-medium">More</span>
            </button>
          {/snippet}
        </Drawer.Trigger>
        <Drawer.Content>
          <div
            class="mx-auto w-full max-w-sm p-6 pb-12 max-h-[80vh] overflow-y-auto"
          >
            <!-- About Group -->
            <div class="mt-6">
              <div class="flex items-center gap-2 mb-4">
                <Info class="size-4 text-primary" />
                <h3
                  class="text-xs font-black uppercase tracking-[0.2em] text-foreground"
                >
                  About
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
              </div>
            </div>

            <!-- Membership Group -->
            <div class="mt-8">
              <div class="flex items-center gap-2 mb-4">
                <UserCircle class="size-4 text-emerald-500" />
                <h3
                  class="text-xs font-black uppercase tracking-[0.2em] text-foreground"
                >
                  Membership
                </h3>
              </div>
              <div class="grid grid-cols-3 gap-4">
                {#each membershipNav as item}
                  <a
                    href={item.href}
                    class="flex flex-col items-center gap-2 group"
                    onclick={() => (drawerOpen = false)}
                  >
                    <div
                      class="size-12 rounded-xl bg-card border border-border flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm"
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

            <!-- Awards Group -->
            <div class="mt-8">
              <div class="flex items-center gap-2 mb-4">
                <Trophy class="size-4 text-accent-gold" />
                <h3
                  class="text-xs font-black uppercase tracking-[0.2em] text-foreground"
                >
                  Awards
                </h3>
              </div>
              <div class="grid grid-cols-3 gap-4">
                {#each awardsNav as item}
                  <a
                    href={item.href}
                    class="flex flex-col items-center gap-2 group"
                    onclick={() => (drawerOpen = false)}
                  >
                    <div
                      class="size-12 rounded-xl bg-card border border-border flex items-center justify-center group-hover:bg-accent-gold group-hover:text-black transition-all duration-300 shadow-sm"
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

            <!-- Tools Group -->
            <div class="mt-8">
              <div class="flex items-center gap-2 mb-4">
                <Settings class="size-4 text-muted-foreground" />
                <h3
                  class="text-xs font-black uppercase tracking-[0.2em] text-foreground"
                >
                  Tools
                </h3>
              </div>
              <div class="grid grid-cols-3 gap-4">
                {#each toolsNav as item}
                  <a
                    href={item.href}
                    class="flex flex-col items-center gap-2 group"
                    onclick={() => (drawerOpen = false)}
                  >
                    <div
                      class="size-12 rounded-xl bg-card border border-border flex items-center justify-center group-hover:bg-muted group-hover:text-foreground transition-all duration-300 shadow-sm"
                    >
                      <item.icon class="size-5" />
                    </div>
                    <span
                      class="text-[9px] font-bold text-center leading-tight text-muted-foreground uppercase opacity-70 group-hover:opacity-100"
                      >{item.label}</span
                    >
                  </a>
                {/each}

                <!-- Campaigns Action -->
                <button
                  class="flex flex-col items-center gap-2 group"
                  onclick={() => {
                    drawerOpen = false;
                    onOpenPopup();
                  }}
                >
                  <div
                    class="size-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm"
                  >
                    <Megaphone class="size-5" />
                  </div>
                  <span
                    class="text-[9px] font-bold text-center leading-tight text-muted-foreground uppercase opacity-70 group-hover:opacity-100"
                    >Campaigns</span
                  >
                </button>

                <!-- Dashboard Link -->
                {#if user && canSeeDashboard}
                  <a
                    href="/dashboard"
                    class="flex flex-col items-center gap-2 group"
                    onclick={() => (drawerOpen = false)}
                  >
                    <div
                      class="size-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm relative"
                    >
                      <LayoutDashboard class="size-5" />
                      <span class="absolute -top-1 -right-1 flex h-3 w-3">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    </div>
                    <span
                      class="text-[9px] font-bold text-center leading-tight text-primary uppercase"
                      >Dashboard</span
                    >
                  </a>
                {/if}

                <!-- Cookie Settings Action -->
                <button
                  class="flex flex-col items-center gap-2 group"
                  onclick={() => {
                    drawerOpen = false;
                    CookieConsent.showPreferences();
                  }}
                >
                  <div
                    class="size-12 rounded-xl bg-card border border-border flex items-center justify-center group-hover:bg-muted group-hover:text-foreground transition-all duration-300 shadow-sm"
                  >
                    <Cookie class="size-5" />
                  </div>
                  <span
                    class="text-[9px] font-bold text-center leading-tight text-muted-foreground uppercase opacity-70 group-hover:opacity-100"
                    >Cookie Settings</span
                  >
                </button>
              </div>
            </div>

            <!-- Admin Group -->
            {#if isAdmin}
              <div class="mt-12 pt-8 border-t border-border">
                <div class="flex items-center gap-2 mb-4">
                  <ShieldCheck class="size-4 text-destructive" />
                  <h3
                    class="text-xs font-black uppercase tracking-[0.2em] text-foreground"
                  >
                    Admin Control
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
          </div>
        </Drawer.Content>
      </Drawer.Root>
    {:else}
      <button
        class="flex flex-col items-center gap-1 text-muted-foreground opacity-50 transition-colors duration-200"
      >
        <MoreHorizontal class="size-6" />
        <span class="text-[10px] font-medium">More</span>
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
