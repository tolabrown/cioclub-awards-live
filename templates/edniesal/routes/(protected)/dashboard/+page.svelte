<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button";
  import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Briefcase,
    UserPlus,
    FolderClosed,
    Users,
    Globe,
    Book,
    ArrowRight,
    Shield,
    Phone,
    Mail,
    MapPin,
  } from "@lucide/svelte";
  import type { User } from "$lib/auth";
  import { page } from "$app/state";
  import { Role, Constants } from "$lib/constants";

  const user = page.data.user as User;
  const isAdmin = $derived(user?.role === Role.ADMIN);
  const isEditor = $derived(user?.role === Role.EDITOR);
  const isPrivileged = $derived(isAdmin || isEditor);

  const adminLinks = [
    {
      title: "Edit Pages",
      description: "Update content on public pages",
      href: "/admin/pages",
      icon: FileText,
      roles: [Role.ADMIN, Role.EDITOR],
    },
    {
      title: "Contact Inquiries",
      description: "View messages from the contact form",
      href: "/admin/contacts",
      icon: MessageSquare,
      roles: [Role.ADMIN],
    },
    {
      title: "CV Applications",
      description: "Review job applications and CVs",
      href: "/admin/applications",
      icon: Briefcase,
      roles: [Role.ADMIN],
    },
    {
      title: "Memberships",
      description: "Manage membership requests",
      href: "/admin/memberships",
      icon: UserPlus,
      roles: [Role.ADMIN],
    },
    {
      title: "File Manager",
      description: "Upload and manage media files",
      href: "/admin/files",
      icon: FolderClosed,
      roles: [Role.ADMIN],
    },
    {
      title: "User Management",
      description: "Manage accounts and permissions",
      href: "/users",
      icon: Users,
      roles: [Role.ADMIN],
    },
  ];

  const filteredLinks = $derived(
    adminLinks.filter((link) => link.roles.includes(user?.role as Role)),
  );

  const publicPages = [
    {
      title: "Services",
      description: "Explore our consulting services",
      href: "/services",
      icon: Book,
    },
    {
      title: "Our Team",
      description: "Meet the people behind Edniesal",
      href: "/team",
      icon: Users,
    },
    {
      title: "Contact Us",
      description: "Get in touch with our team",
      href: "/contact",
      icon: Globe,
    },
  ];
</script>

<div class="space-y-6 pt-4 pb-20">
  <!-- Welcome Header -->
  <div>
    <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
      <LayoutDashboard class="size-8 text-primary" />
      Dashboard
    </h1>
    <p
      class="text-sm font-bold text-muted-foreground uppercase tracking-widest"
    >
      Welcome back, {user?.name || "User"}
    </p>
  </div>

  {#if isPrivileged}
    <!-- Admin / Editor Quick Links -->
    <div class="space-y-3">
      <p class="text-[10px] font-bold uppercase tracking-widest text-primary">
        Quick Actions
      </p>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each filteredLinks as link}
          <a href={link.href} class="group block">
            <Card.Root
              class="border-border/50 bg-card/50 backdrop-blur-md shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 h-full"
            >
              <Card.Content class="p-5">
                <div class="flex items-start gap-4">
                  <div
                    class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors"
                  >
                    <link.icon class="size-5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p
                      class="font-bold text-sm group-hover:text-primary transition-colors"
                    >
                      {link.title}
                    </p>
                    <p class="text-xs text-muted-foreground mt-0.5">
                      {link.description}
                    </p>
                  </div>
                  <ArrowRight
                    class="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                  />
                </div>
              </Card.Content>
            </Card.Root>
          </a>
        {/each}
      </div>
    </div>
  {:else}
    <!-- Regular User View — About Edniesal -->
    <div class="space-y-6">
      <Card.Root
        class="border-border/50 bg-card/50 backdrop-blur-md shadow-lg overflow-hidden"
      >
        <Card.Content class="p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
            >
              <Shield class="size-6" />
            </div>
            <div>
              <h2 class="text-xl font-bold">{Constants.BRANDNAME}</h2>
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                {Constants.TAGLINE}
              </p>
            </div>
          </div>
          <p class="text-sm text-muted-foreground leading-relaxed">
            Edniesal Consulting elevates corporate governance and business
            advisory to world-class standards across international markets. We
            provide strategic insights, expert advisory, and comprehensive
            solutions for organizations seeking excellence.
          </p>
          <div class="grid gap-3 sm:grid-cols-3 pt-2">
            <div
              class="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <Phone class="size-4 text-primary shrink-0" />
              <span class="text-xs font-medium truncate">{Constants.PHONE}</span
              >
            </div>
            <div
              class="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <Mail class="size-4 text-primary shrink-0" />
              <span class="text-xs font-medium truncate"
                >{Constants.SUPPORTEMAIL}</span
              >
            </div>
            <div
              class="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <MapPin class="size-4 text-primary shrink-0" />
              <span class="text-xs font-medium truncate"
                >{Constants.ADDRESS}</span
              >
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <div class="space-y-3">
        <p class="text-[10px] font-bold uppercase tracking-widest text-primary">
          Explore
        </p>
        <div class="grid gap-4 sm:grid-cols-3">
          {#each publicPages as pg}
            <a href={pg.href} class="group block">
              <Card.Root
                class="border-border/50 bg-card/50 backdrop-blur-md shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 h-full"
              >
                <Card.Content class="p-5">
                  <div class="flex items-start gap-4">
                    <div
                      class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors"
                    >
                      <pg.icon class="size-5" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="font-bold text-sm group-hover:text-primary transition-colors"
                      >
                        {pg.title}
                      </p>
                      <p class="text-xs text-muted-foreground mt-0.5">
                        {pg.description}
                      </p>
                    </div>
                    <ArrowRight
                      class="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                    />
                  </div>
                </Card.Content>
              </Card.Root>
            </a>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
