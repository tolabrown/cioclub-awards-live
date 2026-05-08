<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import { toast } from "svelte-sonner";
  import { enhance } from "$app/forms";
  import { 
    Building2, 
    Users, 
    Calendar, 
    ArrowRight, 
    Search,
    Mail,
    User,
    Trophy,
    ExternalLink,
    Trash2
  } from "@lucide/svelte";

  let { data } = $props();
  let searchQuery = $state("");

  const filteredOrganizations = $derived(
    data.organizations.filter(org => 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function formatDate(date: Date | string | null | undefined) {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  }

  function isExpired(date: Date | string | null | undefined) {
    if (!date) return true;
    return new Date(date).getTime() < new Date().getTime();
  }

  let isDeleting = $state<string | null>(null);
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
  <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div class="space-y-1">
      <h1 class="text-4xl font-bold tracking-tight text-foreground">Corporations</h1>
      <p class="text-muted-foreground">Manage organizational subscriptions and team access</p>
    </div>
    <div class="relative w-full md:w-80">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input 
        placeholder="Search organizations..." 
        bind:value={searchQuery}
        class="pl-10"
      />
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each filteredOrganizations as org}
      <Card.Root class="overflow-hidden border-border/50 hover:shadow-lg transition-all group">
        <Card.Header class="bg-muted/30 pb-4 border-b">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <Card.Title class="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors flex items-center gap-2">
                <Building2 class="size-5" />
                {org.name}
              </Card.Title>
              <Card.Description class="flex items-center gap-1.5 pt-1">
                <Badge variant={isExpired(org.subscriptionEndsAt) ? "destructive" : "secondary"} class="text-[10px] uppercase font-bold tracking-tighter">
                  {isExpired(org.subscriptionEndsAt) ? "Expired" : "Active"}
                </Badge>
                <span class="text-xs">Expires: {formatDate(org.subscriptionEndsAt)}</span>
              </Card.Description>
            </div>
            <Button variant="ghost" size="icon" href="/corporate/{org.id}" class="rounded-full hover:bg-primary/10 hover:text-primary">
              <ArrowRight class="size-5" />
            </Button>
          </div>
        </Card.Header>
        <Card.Content class="p-6 space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Admin</p>
              <div class="flex items-center gap-2">
                 <div class="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {org.adminName?.charAt(0) || "U"}
                 </div>
                 <div class="min-w-0">
                    <p class="text-sm font-bold truncate leading-tight">{org.adminName || "No Admin"}</p>
                    <p class="text-[10px] text-muted-foreground truncate leading-tight">{org.adminEmail || ""}</p>
                 </div>
              </div>
            </div>
            <div class="space-y-1">
              <p class="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Team Size</p>
              <div class="flex items-center gap-2">
                 <div class="size-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                    <Users class="size-4" />
                 </div>
                 <p class="text-lg font-bold">{org.memberCount}</p>
              </div>
            </div>
          </div>

            <div class="flex items-center gap-2">
               <div class="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar class="size-3.5" />
                  Created: {formatDate(org.createdAt)}
               </div>
               <div class="flex items-center gap-1.5 ml-auto">
                 <form 
                  method="POST" 
                  action="?/deleteOrganization"
                  use:enhance={() => {
                    isDeleting = org.id;
                    return async ({ update, result }) => {
                      isDeleting = null;
                      if (result.type === 'success') {
                        toast.success("Organization deleted successfully");
                      } else if (result.type === 'failure') {
                        // @ts-ignore
                        toast.error(result.data?.message || "Failed to delete organization");
                      }
                      await update();
                    };
                  }}
                 >
                   <input type="hidden" name="id" value={org.id} />
                   <Button 
                    type="submit"
                    variant="ghost" 
                    size="icon" 
                    class="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    disabled={isDeleting === org.id}
                    onclick={(e) => {
                      if (!confirm(`Are you sure you want to delete ${org.name}? This will remove all associated member data.`)) {
                        e.preventDefault();
                      }
                    }}
                   >
                     {#if isDeleting === org.id}
                        <Trash2 class="size-4 animate-pulse opacity-50" />
                     {:else}
                        <Trash2 class="size-4" />
                     {/if}
                   </Button>
                 </form>
                 <Button variant="outline" size="sm" href="/corporate/{org.id}" class="gap-2 h-9 border-border/50 hover:bg-primary hover:text-white transition-all group/btn px-3">
                    View
                    <ExternalLink class="size-3.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                 </Button>
               </div>
            </div>
        </Card.Content>
      </Card.Root>
    {:else}
      <div class="col-span-full flex flex-col items-center justify-center p-20 rounded-2xl border border-dashed border-border/50 bg-muted/5 text-center space-y-4">
        <div class="size-20 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          <Building2 class="size-10" />
        </div>
        <div class="space-y-1">
          <h3 class="text-xl font-bold">No Organizations Found</h3>
          <p class="text-muted-foreground max-w-sm">No corporations match your search criteria or none have been created yet.</p>
        </div>
        <Button variant="secondary" onclick={() => searchQuery = ""} class="rounded-xl">Clear Search</Button>
      </div>
    {/each}
  </div>
</div>
