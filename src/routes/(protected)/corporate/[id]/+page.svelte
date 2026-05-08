<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { 
    Building2, 
    Users, 
    Calendar,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    Clock,
    UserPlus,
    Trash2
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { enhance } from "$app/forms";

  let { data } = $props();

  function formatDate(date: Date | string | null | undefined) {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  }

  function isExpired(date: Date | string | null | undefined) {
    if (!date) return true;
    return new Date(date).getTime() < new Date().getTime();
  }

  const activeMembers = $derived(data.members.filter(m => m.status === 'active').length);
  const pendingMembers = $derived(data.members.filter(m => m.status === 'pending').length);
</script>

<div class="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
  <!-- Hero Section -->
  <div class="relative overflow-hidden rounded-xl border border-border/50 bg-linear-to-br from-primary/10 via-background to-secondary/5 shadow-lg">
    <div class="absolute inset-0 bg-grid-white/[0.02] bg-size-[20px_20px]"></div>
    <div class="relative p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
      <div class="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div class="size-20 rounded-xl bg-background/50 backdrop-blur-md border border-border/50 flex items-center justify-center text-primary shadow-md">
          <Building2 class="size-10" />
        </div>
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2 justify-center md:justify-start">
             <Badge variant="outline" class="bg-background/50 text-[10px] uppercase font-bold tracking-widest border-primary/20 text-primary">Corporate Hub</Badge>
             {#if isExpired(data.organization.subscriptionEndsAt)}
               <Badge variant="destructive" class="text-[10px] uppercase font-bold tracking-widest">Subscription Expired</Badge>
             {:else}
               <Badge variant="secondary" class="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-500 border-none">Active Subscription</Badge>
             {/if}
          </div>
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{data.organization.name}</h1>
          <p class="text-muted-foreground flex items-center gap-2 justify-center md:justify-start font-medium">
            <Calendar class="size-4" />
            Subscription ends: <span class="text-foreground">{formatDate(data.organization.subscriptionEndsAt)}</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
         <Button href="/dashboard" variant="outline">
           Back to Dashboard
         </Button>
      </div>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card.Root class="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <Card.Content class="pt-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 rounded-lg bg-primary/10 text-primary">
            <Users class="size-5" />
          </div>
          <Badge variant="outline" class="font-bold border-emerald-500/20 text-emerald-500">Active</Badge>
        </div>
        <p class="text-sm font-medium text-muted-foreground">Active Members</p>
        <p class="text-3xl font-bold mt-1 tracking-tight">{activeMembers}</p>
      </Card.Content>
    </Card.Root>
    
    <Card.Root class="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <Card.Content class="pt-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 rounded-lg bg-secondary/10 text-secondary-foreground">
            <Clock class="size-5" />
          </div>
          <Badge variant="outline" class="font-bold border-amber-500/20 text-amber-500">Pending</Badge>
        </div>
        <p class="text-sm font-medium text-muted-foreground">Pending Invites</p>
        <p class="text-3xl font-bold mt-1 tracking-tight">{pendingMembers}</p>
      </Card.Content>
    </Card.Root>

    <Card.Root class="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <Card.Content class="pt-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 class="size-5" />
          </div>
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <p class="text-sm font-medium text-muted-foreground">System Status</p>
        <p class="text-3xl font-bold mt-1 tracking-tight text-emerald-500">Healthy</p>
      </Card.Content>
    </Card.Root>

    <Card.Root class="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <Card.Content class="pt-6">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 rounded-lg bg-accent/10 text-accent-foreground">
            <ShieldCheck class="size-5" />
          </div>
        </div>
        <p class="text-sm font-medium text-muted-foreground">Active Plan</p>
        <p class="text-3xl font-bold mt-1 tracking-tight">Corp Plus</p>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Main Content Areas -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
      <!-- Team Card -->
      <Card.Root class="group relative overflow-hidden border-border/50 bg-card/30 transition-all hover:bg-card/50">
        <div class="absolute right-0 top-0 -mr-16 -mt-16 size-64 rounded-full bg-primary/5 blur-3xl transition-all group-hover:scale-110"></div>
        <Card.Content class="p-8 relative">
          <div class="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div class="space-y-4 flex-1">
              <div class="space-y-2">
                <h2 class="text-3xl font-bold tracking-tight">Manage Your Team</h2>
                <p class="text-muted-foreground text-lg leading-relaxed">
                  Connect your executive team to the network. Invite new members, manage roles, and track their participation progress from a single dashboard.
                </p>
              </div>
              <div class="flex flex-wrap gap-4 pt-2">
                <Button href={`/corporate/${data.organization.id}/members`} class="gap-2 shadow-sm">
                  <Users class="size-4" />
                  View Team Members
                  <ArrowRight class="size-4" />
                </Button>
                <Button href={`/corporate/${data.organization.id}/members?invite=true`} variant="outline" class="gap-2">
                  <UserPlus class="size-4" />
                  Quick Invite
                </Button>
              </div>
            </div>
            <div class="hidden md:block">
              <div class="relative size-40 rounded-xl bg-linear-to-br from-primary/20 to-secondary/10 border border-primary/20 flex items-center justify-center p-8">
                <Users class="size-full text-primary/40" />
                <div class="absolute -top-2 -right-2 p-2 rounded-lg bg-background border border-border shadow-sm text-primary">
                  <UserPlus class="size-5" />
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card.Root class="bg-card/50 border-border/50 shadow-sm">
          <Card.Header>
            <Card.Title class="text-xl font-bold flex items-center gap-2">
              <ShieldCheck class="size-5 text-primary" />
              Shared Benefits
            </Card.Title>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="mt-1 p-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 class="size-3" />
              </div>
              <div class="space-y-1">
                <p class="text-sm font-semibold">Priority Support</p>
                <p class="text-xs text-muted-foreground">Dedicated line for your executive team.</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="mt-1 p-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 class="size-3" />
              </div>
              <div class="space-y-1">
                <p class="text-sm font-semibold">Executive Events</p>
                <p class="text-xs text-muted-foreground">Exclusive access to roundtables and seminars.</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="mt-1 p-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 class="size-3" />
              </div>
              <div class="space-y-1">
                <p class="text-sm font-semibold">Bulk Content Access</p>
                <p class="text-xs text-muted-foreground">Unlock training resources for all members.</p>
              </div>
            </div>
          </Card.Content>
        </Card.Root>

        <Card.Root class="bg-card/50 border-border/50 shadow-sm">
          <Card.Header>
            <Card.Title class="text-xl font-bold flex items-center gap-2">
              <Building2 class="size-5 text-primary" />
              Organization Info
            </Card.Title>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Chief Administrator</p>
                <p class="text-sm font-medium">{data.user.name}</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Established On</p>
                <p class="text-sm font-medium">{formatDate(data.organization.createdAt)}</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Member Limit</p>
                <p class="text-sm font-medium">10 Seats</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs text-muted-foreground uppercase font-bold tracking-tighter">ID Tag</p>
                <p class="text-[10px] font-mono bg-muted p-1 rounded">#{data.organization.id.slice(0, 8)}</p>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>

    <!-- Quick Actions Sidebar -->
    <div class="space-y-6">
      <Card.Root class="border-border/50 bg-card/30 backdrop-blur-sm sticky top-24">
        <Card.Header>
          <Card.Title class="font-bold">Operational Actions</Card.Title>
          <p class="text-xs text-muted-foreground">Quick management for your corporate profile.</p>
        </Card.Header>
        <Card.Content class="grid gap-3">
          <Button variant="outline" class="w-full justify-start gap-3 group" href={`/corporate/${data.organization.id}/members`}>
            <div class="p-1 rounded bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <UserPlus class="size-4" />
            </div>
            <span>Manage Invitations</span>
          </Button>

          <form 
            method="POST" 
            action="?/updatePrivacy"
            use:enhance={() => {
              return async ({ result }) => {
                if (result.type === 'success') {
                  // @ts-ignore
                  toast.success(result.data?.message);
                }
              };
            }}
          >
            <Button type="submit" variant="outline" class="w-full justify-start gap-3 group">
              <div class="p-1 rounded bg-secondary/10 text-secondary-foreground group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                <ShieldCheck class="size-4" />
              </div>
              <span>Privacy & Security</span>
            </Button>
          </form>

          <form 
            method="POST" 
            action="?/updateBilling"
            use:enhance={() => {
              return async ({ result }) => {
                if (result.type === 'success') {
                  // @ts-ignore
                  toast.success(result.data?.message);
                }
              };
            }}
          >
            <Button type="submit" variant="outline" class="w-full justify-start gap-3 group">
              <div class="p-1 rounded bg-accent/10 text-accent-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <Calendar class="size-4" />
              </div>
              <span>Billing Cycle</span>
            </Button>
          </form>
          
          <div class="relative py-4">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t border-border"></span>
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground font-medium tracking-tighter">Admin Danger Zone</span>
            </div>
          </div>
          
          <form 
            method="POST" 
            action="?/deleteOrganization"
            use:enhance={() => {
              return async ({ result }) => {
                if (result.type === 'failure') {
                  // @ts-ignore
                  toast.error(result.data?.message || "Failed to deactivate organization");
                }
              };
            }}
          >
            <Button 
              type="submit"
              variant="ghost" 
              class="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onclick={(e) => {
                if (!confirm(`Are you sure you want to PERMANENTLY DEACTIVATE ${data.organization.name}? This action cannot be undone.`)) {
                  e.preventDefault();
                }
              }}
            >
              <div class="p-1 rounded bg-destructive/10 text-destructive">
                <Trash2 class="size-4" />
              </div>
              <span>Deactivate Organization</span>
            </Button>
          </form>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</div>
