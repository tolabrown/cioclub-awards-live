<script lang="ts">
  import { page } from "$app/state";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import {
    Baby,
    GraduationCap,
    UserCircle,
    Trophy,
    Calendar,
    UserCheck,
    LayoutDashboard,
    Users,
    User,
    Shield,
    Eye,
    UserCog,
    BookOpen,
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Download,
    Upload,
  } from "@lucide/svelte";
  import type { User as AuthUser } from "$lib/auth";
  import { Role } from "$lib/constants";

  const user = page.data.user as AuthUser;

  const roleDescriptions = {
    [Role.ADMIN]: {
      title: "Administrator",
      icon: Shield,
      color: "text-red-600 dark:text-red-400",
      description:
        "Full system access with complete control over all features, users, and data.",
      permissions: [
        "Manage all users and assign roles",
        "Full CRUD access to all modules",
        "Access to system logs and audit trails",
        "Configure system settings",
        "Export and import data",
        "Delete any records",
      ],
    },
    [Role.EDITOR]: {
      title: "Editor",
      icon: Edit,
      color: "text-blue-600 dark:text-blue-400",
      description:
        "Content management access with ability to create, edit, and delete records.",
      permissions: [
        "Create, edit, and delete children records",
        "Manage teachers and parents",
        "Record and manage scores",
        "Create and manage meetings",
        "Track attendance",
        "View dashboard analytics",
      ],
    },
    [Role.TEACHER]: {
      title: "Teacher",
      icon: GraduationCap,
      color: "text-green-600 dark:text-green-400",
      description:
        "Teaching staff with access to manage children, scores, and attendance.",
      permissions: [
        "View and manage children records",
        "Record and update scores",
        "Manage meeting attendance",
        "View teacher directory",
        "Access dashboard",
        "View parent information",
      ],
    },
    [Role.LEADER]: {
      title: "Leader",
      icon: Eye,
      color: "text-purple-600 dark:text-purple-400",
      description:
        "Read-only access to view information without making changes.",
      permissions: [
        "View children records",
        "View teachers and parents",
        "View scores and leaderboards",
        "View meetings and attendance",
        "Access dashboard (read-only)",
        "Cannot create, edit, or delete",
      ],
    },
    [Role.PARENT]: {
      title: "Parent",
      icon: UserCircle,
      color: "text-orange-600 dark:text-orange-400",
      description:
        "Parent access to view own children's information and progress.",
      permissions: [
        "View own children's records",
        "View children's scores and progress",
        "View teacher directory",
        "Update own profile",
        "Cannot access other children's data",
      ],
    },
    [Role.USER]: {
      title: "User",
      icon: User,
      color: "text-gray-600 dark:text-gray-400",
      description: "Basic user access with limited viewing permissions.",
      permissions: [
        "View teacher directory",
        "View own profile",
        "Limited access to public information",
      ],
    },
  };

  import { ArrowRight } from "@lucide/svelte";

  const modules = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview of key metrics and recent activities",
      href: "/dashboard",
      roles: [Role.ADMIN, Role.EDITOR, Role.TEACHER, Role.LEADER, Role.PARENT],
      features: [
        "Total counts for children, teachers, parents, and meetings",
        "Recent activity feed",
        "Age group distribution chart",
        "Score type distribution",
        "Quick access to common actions",
      ],
    },
    {
      title: "Children",
      icon: Baby,
      description: "Manage children records and information",
      href: "/children",
      roles: [Role.ADMIN, Role.EDITOR, Role.TEACHER, Role.PARENT, Role.LEADER],
      features: [
        "View all children with search and filters",
        "Add new children with comprehensive form",
        "Edit child information including personal details, parents, medical info",
        "Upload and manage child photos and media",
        "Track age groups and status",
        "View parent relationships",
        "Bulk operations (Admin/Editor only)",
      ],
    },
    {
      title: "Teachers",
      icon: GraduationCap,
      description: "Manage teaching staff information",
      href: "/teachers",
      roles: [
        Role.ADMIN,
        Role.EDITOR,
        Role.TEACHER,
        Role.LEADER,
        Role.PARENT,
        Role.USER,
      ],
      features: [
        "View teacher directory",
        "Filter by type (Full Time, Volunteer, Utility)",
        "Filter by location and gender",
        "Add and edit teacher profiles",
        "Track contact information",
        "View teacher type distribution",
      ],
    },
    {
      title: "Parents",
      icon: UserCircle,
      description: "Manage parent and guardian information",
      href: "/parents",
      roles: [Role.ADMIN, Role.EDITOR, Role.TEACHER, Role.LEADER],
      features: [
        "View all parents with linked children",
        "Filter by parent type (Father, Mother, Guardian)",
        "Add and edit parent information",
        "View children relationships",
        "Contact information management",
        "Quick actions (call, WhatsApp, edit)",
      ],
    },
    {
      title: "Meetings",
      icon: Calendar,
      description: "Manage ministry meetings and events",
      href: "/meetings",
      roles: [Role.ADMIN, Role.EDITOR, Role.TEACHER, Role.LEADER],
      features: [
        "Create and manage meetings",
        "Filter by meeting type",
        "Track meeting dates and times",
        "View meeting distribution by type",
        "Edit and delete meetings",
        "Search functionality",
      ],
    },
    {
      title: "Attendees",
      icon: UserCheck,
      description: "Track meeting attendance",
      href: "/attendees",
      roles: [Role.ADMIN, Role.EDITOR, Role.TEACHER, Role.LEADER],
      features: [
        "Record attendance for meetings",
        "Link children to meetings",
        "View attendance history",
        "Filter by meeting",
        "Track attendance patterns",
      ],
    },
    {
      title: "Scores",
      icon: Trophy,
      description: "Record and track children's performance",
      href: "/scores",
      roles: [Role.ADMIN, Role.EDITOR, Role.TEACHER, Role.LEADER],
      features: [
        "Record scores for Bible Writing, Bible Study Test, Entrepreneurial Class",
        "View leaderboard with rankings",
        "Filter by score type and age group",
        "Track normalized scores (points/age)",
        "View individual child performance",
        "Score distribution analytics",
      ],
    },
    {
      title: "Users",
      icon: Users,
      description: "Manage system users and roles",
      href: "/users",
      roles: [Role.ADMIN],
      features: [
        "View all system users",
        "Assign and modify user roles",
        "Manage user access",
        "Admin-only access",
      ],
    },
    {
      title: "Profile",
      icon: User,
      description: "Manage your personal profile",
      href: "/profile",
      roles: [
        Role.ADMIN,
        Role.EDITOR,
        Role.TEACHER,
        Role.PARENT,
        Role.USER,
        Role.LEADER,
      ],
      features: [
        "Update personal information",
        "Change profile picture",
        "View account details",
        "Manage preferences",
      ],
    },
  ];

  const commonFeatures = [
    {
      title: "Search",
      icon: Search,
      description:
        "All list pages include search functionality with debouncing for fast, responsive searching.",
    },
    {
      title: "Filters",
      icon: Filter,
      description:
        "Advanced filtering options to narrow down results by various criteria (type, status, date, etc.).",
    },
    {
      title: "Infinite Scroll",
      icon: Download,
      description:
        "Automatically load more items as you scroll, with skeleton screens for smooth loading experience.",
    },
    {
      title: "Responsive Design",
      icon: LayoutDashboard,
      description:
        "Optimized for both desktop and mobile devices with adaptive layouts.",
    },
    {
      title: "Bulk Operations",
      icon: UserCog,
      description:
        "Select multiple items for bulk edit or delete operations (Admin/Editor only).",
    },
    {
      title: "Export Data",
      icon: Download,
      description: "Export data to various formats for reporting and analysis.",
    },
  ];

  const userRole =
    roleDescriptions[user?.role as Role] || roleDescriptions[Role.USER];
</script>

<div class="flex flex-col gap-4 max-w-7xl mx-auto">
  <!-- Header -->
  <div class="space-y-2">
    <h1 class="text-3xl font-bold tracking-tight">Documentation</h1>
    <p class="text-muted-foreground">
      Complete guide to using the RCN Lagos Children Department Management
      System
    </p>
  </div>

  <!-- Current User Role -->
  <Card class="border-2">
    <CardHeader>
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-primary/10">
          <svelte:component
            this={userRole.icon}
            class="h-6 w-6 {userRole.color}"
          />
        </div>
        <div>
          <CardTitle>Your Role: {userRole.title}</CardTitle>
          <CardDescription>{userRole.description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        <p class="font-medium text-sm">Your Permissions:</p>
        <ul class="grid gap-2 sm:grid-cols-2">
          {#each userRole.permissions as permission}
            <li class="flex items-start gap-2 text-sm">
              <div
                class="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0"
              ></div>
              <span>{permission}</span>
            </li>
          {/each}
        </ul>
      </div>
    </CardContent>
  </Card>

  <Separator />

  <!-- All Roles -->
  <div class="space-y-4">
    <div>
      <h2 class="text-2xl font-bold">User Roles</h2>
      <p class="text-muted-foreground">
        Understanding different access levels in the system
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      {#each Object.entries(roleDescriptions) as [roleKey, role]}
        <Card
          class={user?.role === roleKey
            ? "border-2 border-primary shadow-md"
            : ""}
        >
          <CardHeader>
            <div class="flex items-center gap-3">
              <div
                class="p-2 rounded-lg {user?.role === roleKey
                  ? 'bg-primary/10'
                  : 'bg-muted'}"
              >
                <svelte:component
                  this={role.icon}
                  class="h-5 w-5 {role.color}"
                />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <CardTitle class="text-lg">{role.title}</CardTitle>
                  {#if user?.role === roleKey}
                    <Badge variant="default" class="text-xs">You</Badge>
                  {/if}
                </div>
                <CardDescription class="text-xs"
                  >{role.description}</CardDescription
                >
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul class="space-y-1.5 text-sm">
              {#each role.permissions.slice(0, 4) as permission}
                <li class="flex items-start gap-2">
                  <div
                    class="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0"
                  ></div>
                  <span class="text-muted-foreground">{permission}</span>
                </li>
              {/each}
            </ul>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>

  <Separator />

  <!-- Modules -->
  <div class="space-y-4">
    <div>
      <h2 class="text-2xl font-bold">System Modules</h2>
      <p class="text-muted-foreground">
        Features and capabilities of each module
      </p>
    </div>

    <div class="grid gap-4">
      {#each modules as module}
        {@const hasAccess = module.roles.includes(user?.role as Role)}
        {#if hasAccess}
          <a href={module.href} class="block group">
            <Card
              class="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 cursor-pointer"
            >
              <CardHeader>
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-center gap-3 flex-1">
                    <div
                      class="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
                    >
                      <svelte:component
                        this={module.icon}
                        class="h-5 w-5 text-primary group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div class="flex-1">
                      <CardTitle
                        class="text-lg group-hover:text-primary transition-colors flex items-center gap-2"
                      >
                        {module.title}
                        <ArrowRight
                          class="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                        />
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    class="text-xs bg-primary/5 border-primary/20"
                  >
                    <Eye class="h-3 w-3 mr-1" />
                    Access
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div class="flex flex-wrap gap-1.5">
                    {#each module.roles as role}
                      <Badge variant="secondary" class="text-xs">
                        {roleDescriptions[role]?.title || role}
                      </Badge>
                    {/each}
                  </div>
                  <ul class="grid gap-1.5 sm:grid-cols-2 text-sm">
                    {#each module.features as feature}
                      <li class="flex items-start gap-2">
                        <div
                          class="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0"
                        ></div>
                        <span class="text-muted-foreground">{feature}</span>
                      </li>
                    {/each}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </a>
        {:else}
          <Card class="opacity-60">
            <CardHeader>
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-3 flex-1">
                  <div class="p-2 rounded-lg bg-muted">
                    <svelte:component
                      this={module.icon}
                      class="h-5 w-5 text-muted-foreground"
                    />
                  </div>
                  <div class="flex-1">
                    <CardTitle class="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" class="text-xs">No Access</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div class="flex flex-wrap gap-1.5">
                  {#each module.roles as role}
                    <Badge variant="secondary" class="text-xs">
                      {roleDescriptions[role]?.title || role}
                    </Badge>
                  {/each}
                </div>
                <ul class="grid gap-1.5 sm:grid-cols-2 text-sm">
                  {#each module.features as feature}
                    <li class="flex items-start gap-2">
                      <div
                        class="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0"
                      ></div>
                      <span class="text-muted-foreground">{feature}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            </CardContent>
          </Card>
        {/if}
      {/each}
    </div>
  </div>

  <Separator />

  <!-- Common Features -->
  <div class="space-y-4">
    <div>
      <h2 class="text-2xl font-bold">Common Features</h2>
      <p class="text-muted-foreground">
        Features available across multiple modules
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each commonFeatures as feature}
        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-muted">
                <svelte:component this={feature.icon} class="h-4 w-4" />
              </div>
              <CardTitle class="text-base">{feature.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">{feature.description}</p>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>

  <Separator />

  <!-- Getting Started -->
  <div class="space-y-4">
    <div>
      <h2 class="text-2xl font-bold">Getting Started</h2>
      <p class="text-muted-foreground">Quick guide to using the system</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Navigation</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <p>
            Use the sidebar to navigate between different modules. Only modules
            you have access to will be visible.
          </p>
          <p>
            The dashboard provides a quick overview and access to recent
            activities.
          </p>
          <p>
            Click on any item in a list to view details or edit (if you have
            permission).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <p>
            Use the search bar at the top of list pages to find specific records
            quickly.
          </p>
          <p>Click the filter button to narrow results by various criteria.</p>
          <p>Filters persist across sessions for convenience.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Adding Records</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <p>
            Look for the "Add" button (+ icon) on list pages to create new
            records.
          </p>
          <p>Fill out all required fields (marked with *).</p>
          <p>Click "Save" or "Add" to create the record.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Editing Records</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <p>Click on any record to view details.</p>
          <p>Click the "Edit" button to modify information.</p>
          <p>Make your changes and click "Update" to save.</p>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Support -->
  <Card class="bg-muted/50">
    <CardHeader>
      <CardTitle>Need Help?</CardTitle>
    </CardHeader>
    <CardContent class="space-y-2 text-sm">
      <p>If you need assistance or have questions about using the system:</p>
      <ul class="space-y-1 ml-4">
        <li>• Contact your system administrator</li>
        <li>• Email: arcnlagos@gmail.com</li>
        <li>• Check this documentation for guidance on specific features</li>
      </ul>
    </CardContent>
  </Card>
</div>
