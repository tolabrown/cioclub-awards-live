<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { toast } from "svelte-sonner";
  import { enhance } from "$app/forms";
  import { 
    Users, 
    Plus, 
    Mail, 
    Clock, 
    Crown,
    CheckCircle2,
    Trash2,
    ArrowLeft,

    UserPlus

  } from "@lucide/svelte";

  let { data, form } = $props();
  let inviteEmail = $state("");
  let isInviting = $state(false);

  // Status handling
  $effect(() => {
    if (form?.success) {
      toast.success("Invitation sent successfully");
      inviteEmail = "";
    } else if (form?.message) {
      toast.error(form.message);
    }
  });

  function formatDate(date: Date | string | null | undefined) {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  }
</script>

<div class="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
  <!-- Header with Breadcrumb-like feel -->
  <div class="flex items-center justify-between gap-6 overflow-hidden">
    <div class="flex items-center gap-4">
      <Button variant="outline" href={`/corporate/${data.organization.id}`} size="icon" class="hidden sm:flex shrink-0">
        <ArrowLeft class="size-4" />
      </Button>
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <Badge variant="outline" class="text-[10px] uppercase font-bold tracking-widest border-primary/20 text-primary">Team Management</Badge>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Manage Team</h1>
        <p class="text-muted-foreground font-medium">{data.organization.name}</p>
      </div>
    </div>
    <div class="block sm:hidden">
      <Button variant="outline" href={`/corporate/${data.organization.id}`} size="icon">
        <ArrowLeft class="size-4" />
      </Button>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Invitation Section -->
    <div class="lg:col-span-1 space-y-6">
      {#if data.isOrgAdmin}
        <Card.Root class="border-border/50 shadow-md">
          <Card.Header>
            <Card.Title class="text-xl font-bold flex items-center gap-2">
              <UserPlus class="size-5 text-primary" />
              Invite Colleague
            </Card.Title>
            <Card.Description>Share access with your executive team members.</Card.Description>
          </Card.Header>
          <Card.Content>
            <form 
              method="POST" 
              action="?/inviteMember" 
              use:enhance={() => {
                isInviting = true;
                return async ({ update }) => {
                  isInviting = false;
                  await update();
                }
              }}
              class="space-y-4"
            >
              <div class="space-y-2">
                <Label for="email">Work Email Address</Label>
                <div class="relative">
                  <Mail class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    id="email"
                    name="email"
                    type="email" 
                    placeholder="colleague@company.com" 
                    bind:value={inviteEmail}
                    class="pl-10"
                    required
                    disabled={isInviting}
                  />
                </div>
                <p class="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border/50">
                   Invitation will be sent via email. They must register with this exact address.
                </p>
              </div>
              <Button type="submit" class="w-full gap-2 shadow-sm" disabled={isInviting}>
                {#if isInviting}
                  <Clock class="size-4 animate-spin" />
                  Inviting...
                {:else}
                  <Plus class="size-4" />
                  Send Invitation
                {/if}
              </Button>
            </form>
          </Card.Content>
        </Card.Root>
      {/if}

      <Card.Root class="border-border/50 bg-accent/5 border-accent/20">
        <Card.Content class="p-4 flex gap-3">
          <Clock class="size-5 text-accent-foreground shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="text-sm font-semibold text-accent-foreground">Pending Approval</p>
            <p class="text-xs text-muted-foreground leading-relaxed">
              New members will appear as "Pending" until they complete their account setup.
            </p>
          </div>
        </Card.Content>
      </Card.Root>
    </div>

    <!-- Team Member List -->
    <div class="lg:col-span-2 space-y-6">
      <div class="flex items-center justify-between pb-2 border-b border-border/50">
        <div class="flex items-center gap-2">
          <Users class="size-5 text-muted-foreground" />
          <h2 class="text-xl font-bold tracking-tight">Organization Members</h2>
        </div>
        <Badge variant="outline" class="font-bold bg-muted/50">{data.members.length} / 10</Badge>
      </div>

      <div class="space-y-3">
        {#each data.members as member}
          <div class="group relative bg-card/50 border border-border/50 rounded-xl p-4 transition-all hover:bg-card hover:border-primary/20 hover:shadow-md flex items-center justify-between gap-4">
            <div class="flex items-center gap-4 min-w-0">
               <div class="size-12 rounded-lg bg-muted border border-border/50 flex items-center justify-center relative overflow-visible">
                  {#if member.userImage}
                    <img src={member.userImage} alt={member.userName} class="size-full object-cover rounded-lg" />
                  {:else if member.userName}
                    <span class="text-lg font-bold text-muted-foreground">{member.userName.charAt(0)}</span>
                  {:else}
                    <Mail class="size-5 text-muted-foreground/40" />
                  {/if}
                  
                  <div class="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-card flex items-center justify-center text-white
                    {member.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-sm">
                     {#if member.status === 'active'}
                       <CheckCircle2 class="size-2.5" />
                     {:else}
                       <Clock class="size-2.5" />
                     {/if}
                  </div>
               </div>

               <div class="min-w-0 flex-1">
                 <div class="flex flex-wrap items-center gap-2 mb-0.5">
                   <h3 class="font-bold text-foreground truncate">{member.userName || member.email}</h3>
                   {#if member.role === 'admin'}
                     <Badge variant="secondary" class="text-[8px] h-4 uppercase font-bold tracking-widest bg-primary/10 text-primary hover:bg-primary/20 border-none transition-colors">
                        Admin
                     </Badge>
                   {/if}
                   {#if member.status === 'pending'}
                     <Badge variant="outline" class="text-[8px] h-4 uppercase font-bold tracking-widest border-amber-500/30 text-amber-500">
                        Invited
                     </Badge>
                   {/if}
                 </div>
                 <p class="text-xs text-muted-foreground truncate font-medium">{member.email}</p>
               </div>
            </div>

            <div class="flex items-center gap-2">
               {#if data.isOrgAdmin && member.userId !== data.user?.id}
                 <form 
                   method="POST" 
                   action="?/removeMember" 
                   use:enhance={() => {
                     return async ({ update, result }) => {
                       if (result.type === 'success') {
                         toast.success("Member removed from organization");
                       }
                       await update();
                     }
                   }}
                 >
                    <input type="hidden" name="memberId" value={member.id} />
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="icon" 
                      class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onclick={(e) => {
                        if (!confirm(`Are you sure you want to remove ${member.userName || member.email}?`)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Trash2 class="size-4" />
                    </Button>
                 </form>
               {/if}
            </div>
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-border/50 bg-muted/5 text-center space-y-4">
             <div class="size-16 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground/50 shadow-inner">
               <Users class="size-8" />
             </div>
             <div class="space-y-1">
               <h3 class="text-xl font-bold tracking-tight">Expand Your Network</h3>
               <p class="text-muted-foreground max-w-sm text-sm">You haven't added any team members yet. Corporate subscriptions thrive on collaboration.</p>
             </div>
             <Button variant="outline" size="sm" class="gap-2" onclick={() => document.getElementById('email')?.focus()}>
               <UserPlus class="size-4" />
               Send First Invite
             </Button>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
