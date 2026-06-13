<script lang="ts">
  import { page } from "$app/state";
  import BrandLink from "$lib/components/widgets/BrandLink.svelte";
  import ModeToggle from "$lib/components/widgets/ModeToggle.svelte";
  import { Button } from "$lib/components/ui/button";
  import AuthDialog from "$lib/authentication/ui/user/auth-dialog.svelte";
  import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
  } from "$lib/components/ui/navigation-menu";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import {
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Youtube,
    Phone,
    Mail,
    Menu,
    Users,
    Trophy,
    Zap,
    Calendar,
    Shield,
    Heart,
    Award,
    UserPlus,
    LayoutDashboard,
    FileEdit,
    ShieldCheck,
    HandCoins,
    Ticket,
    Image as ImageIcon,
    Cookie,
    Settings,
    UserCog,
    ChevronDown,
    HelpCircle,
    Handshake,
    Newspaper,
    Info,
    Megaphone,
  } from "@lucide/svelte";
  import * as CookieConsent from "vanilla-cookieconsent";
  import { Role, Constants } from "$lib/constants";
  import type { User } from "$lib/auth";
  import * as Tooltip from "$lib/components/ui/tooltip";

  let { onOpenPopup } = $props<{ onOpenPopup: () => void }>();

  let mobileMenuOpen = $state(false);
  const isActive = (path: string) => page.url.pathname === path;

  const user = $derived(page.data.user as User | undefined);
  const isAdmin = $derived(
    user?.role === Role.ADMIN || user?.role === "superadmin",
  );
  const canSeeDashboard = $derived(user && user.role !== Role.USER);

  const socialLinks = [
    { icon: Facebook, href: Constants.FACEBOOK },
    { icon: Twitter, href: Constants.TWITTER },
    { icon: Linkedin, href: Constants.LINKEDIN },
    { icon: Instagram, href: Constants.INSTAGRAM },
    { icon: Youtube, href: Constants.YOUTUBE },
  ];
</script>

<header
  class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur"
>
  <!-- Top Bar -->
  <div class="bg-primary/5 border-b border-border/40 py-2">
    <div
      class="container mx-auto px-4 flex justify-between items-center text-xs font-bold text-muted-foreground/80"
    >
      <div class="hidden md:flex items-center gap-6">
        <a
          href="mailto:{Constants.SUPPORTEMAIL}"
          class="hover:text-primary transition-colors flex items-center gap-2"
        >
          <Mail class="size-3.5" />
          {Constants.SUPPORTEMAIL}
        </a>
        <div class="flex items-center gap-4">
          <a
            href="tel:{Constants.ADESEWA_PHONE}"
            class="flex items-center gap-2 hover:text-primary transition-colors border-l border-border/50 pl-4 h-4"
          >
            <Phone class="size-3.5" />
            <span>Adesewa Jethro: {Constants.ADESEWA_PHONE}</span>
          </a>
        </div>
      </div>
      <div class="flex items-center gap-5 md:gap-4 ml-auto md:ml-0">
        {#each socialLinks as social}
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-primary transition-colors"
          >
            <social.icon class="size-3.5 md:size-4" />
          </a>
        {/each}
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <BrandLink />

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-6">
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/"
                class={isActive("/") ? "text-primary font-bold" : "font-medium"}
                >Home</NavigationMenuLink
              >
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>About</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div class="grid w-96 gap-1 p-2">
                  <NavigationMenuLink
                    href="/about"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Info class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >About Us</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/activities"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Zap class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Activities</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/about#objectives"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Zap class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Objectives</span
                      >
                    </div>
                  </NavigationMenuLink>

                  <!-- Added Items -->
                  <NavigationMenuLink
                    href="/partnerships"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Handshake class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Partnerships</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/news"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Newspaper class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground">News</span
                      >
                    </div>
                  </NavigationMenuLink>

                  <NavigationMenuLink
                    href="/team"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Users class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground">Team</span
                      >
                    </div>
                  </NavigationMenuLink>

                  <NavigationMenuLink
                    href="/gallery"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <ImageIcon class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Gallery</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/contact"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Mail class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Contact</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/donate"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Heart class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Donate</span
                      >
                    </div>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                href="/events"
                class={isActive("/events")
                  ? "text-primary font-bold"
                  : "font-medium"}>Events</NavigationMenuLink
              >
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Membership</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div class="grid w-96 gap-1 p-2">
                  <NavigationMenuLink
                    href="/membership"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <LayoutDashboard class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Overview</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/membership#benefits"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Heart class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Benefits</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/membership#cadres"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-accent-gold/10 text-accent-gold flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Award class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Membership Tiers</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/membership#join"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <UserPlus class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >How to Join</span
                      >
                    </div>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Awards</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div class="grid w-96 gap-1 p-2">
                  <NavigationMenuLink
                    href="/awards"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Trophy class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Awards Hub</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/awards/categories"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Zap class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Award Categories</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <!-- <NavigationMenuLink
                    href="/awards/entry"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <FileEdit class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Submit Entry</span
                      >
                    </div>
                  </NavigationMenuLink> -->
                  <NavigationMenuLink
                    href="/awards/nominate"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <UserPlus class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Nominate here</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/awards/jury"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <ShieldCheck class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Awards Jury</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/awards/team"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Users class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Project Team</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/awards/winners"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-accent-gold/10 text-accent-gold flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Award class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Past Winners</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    href="/awards/sponsorship"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-amber-500/10 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <HandCoins class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Sponsorship</span
                      >
                    </div>
                  </NavigationMenuLink>
                  <!-- <NavigationMenuLink
                    href="/awards/tickets"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <Ticket class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground"
                        >Get Tickets</span
                      >
                    </div>
                  </NavigationMenuLink> -->
                  <NavigationMenuLink
                    href="/faq"
                    class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                  >
                    <div
                      class="size-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    >
                      <HelpCircle class="size-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground">FAQ</span>
                    </div>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {#if user && canSeeDashboard}
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/dashboard"
                  class={isActive("/dashboard")
                    ? "text-primary font-bold"
                    : "font-medium group relative"}
                >
                  <div class="flex items-center gap-2">
                    <div class="relative flex items-center justify-center">
                      <LayoutDashboard class="size-4" />
                      {#if !isActive("/dashboard")}
                        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75"></span>
                        <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary ml-[-2px] mt-[-8px]"></span>
                      {/if}
                    </div>
                    Dashboard
                  </div>
                </NavigationMenuLink>
              </NavigationMenuItem>
            {/if}

            {#if isAdmin}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div class="grid w-96 gap-1 p-2">
                    <NavigationMenuLink
                      href="/admin"
                      class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                    >
                      <div
                        class="size-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                      >
                        <LayoutDashboard class="size-5" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-sm font-bold text-foreground"
                          >Dashboard</span
                        >
                      </div>
                    </NavigationMenuLink>
                    <NavigationMenuLink
                      href="/admin/pages"
                      class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                    >
                      <div
                        class="size-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                      >
                        <FileEdit class="size-5" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-sm font-bold text-foreground"
                          >Page Editors</span
                        >
                      </div>
                    </NavigationMenuLink>
                    <NavigationMenuLink
                      href="/users"
                      class="flex flex-row items-center gap-4 p-2 rounded-xl hover:bg-primary/5 transition-all group text-left"
                    >
                      <div
                        class="size-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                      >
                        <UserCog class="size-5" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-sm font-bold text-foreground"
                          >Manage Users</span
                        >
                      </div>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            {/if}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      <!-- CTA Buttons -->
      <div class="hidden md:flex items-center gap-3">
        <Tooltip.Provider delayDuration={0}>
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                  <Button
                    variant="outline"
                    size="icon"
                    class="cursor-pointer size-9 rounded-xl"
                    {...props}
                    onclick={CookieConsent.showPreferences}
                  >
                  <Cookie class="size-[1.2rem]" />
                  <span class="sr-only">Cookie Preferences</span>
                </Button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>Cookie Preferences</Tooltip.Content>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <ModeToggle {...props} />
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>Toggle Theme</Tooltip.Content>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <Button 
                  variant="outline" 
                  size="icon" 
                  class="size-9 rounded-xl border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 animate-pulse shadow-sm shadow-primary/20"
                  {...props}
                  onclick={onOpenPopup}
                >
                  <Megaphone class="size-4" />
                </Button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>Latest Campaigns</Tooltip.Content>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <AuthDialog {...props} />
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>
              {user ? "Account Settings" : "Sign In / Register"}
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      <!-- Mobile Actions (minimalist) -->
      <div class="flex md:hidden items-center gap-2">
        {#if user && canSeeDashboard}
          <Button
            variant="ghost"
            size="icon"
            href="/dashboard"
            class="text-muted-foreground hover:text-primary"
          >
            <div class="relative">
              <LayoutDashboard class="size-5" />
              <span class="absolute -top-1 -right-1 flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-primary/80"></span>
              </span>
            </div>
          </Button>
        {/if}
        <Button
          variant="ghost"
          size="icon"
          onclick={onOpenPopup}
          class="text-muted-foreground hover:text-primary"
        >
          <Megaphone class="size-5" />
        </Button>
        <ModeToggle />
        <AuthDialog />
      </div>
    </div>
  </div>
</header>
