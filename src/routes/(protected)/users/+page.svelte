<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { 
    AlertCircleIcon, 
    Loader2, 
    Search,
    Database,
    ShieldCheck,
    RefreshCw
  } from "@lucide/svelte";
  import { Input } from "$lib/components/ui/input";
  import EditDialog from "./components/EditDialog.svelte";
  import DeleteDialog from "./components/DeleteDialog.svelte";
  import CreateDialog from "./components/CreateDialog.svelte";
  import { page } from "$app/state";
  import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import ListCard from "./components/ListCard.svelte";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import { Debounced } from "runed";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { Role, roles } from "$lib/constants";
  import { toast } from "svelte-sonner";
  import { UserPlus, Trash2 } from "@lucide/svelte";
  import type { User } from "$lib/auth";

  let editingUser = $state<User | null>(null);
  let deletingUser = $state<User | null>(null);
  let showCreateDialog = $state(false);

  // Bulk Selection & Filtering State
  let selectedIds = $state<string[]>([]);
  let selectedRole = $state<string>("all");
  let isBulkProcessing = $state(false);
  let bulkRole = $state<string>("");

  const onEdit = async (user: User) => (editingUser = user);
  const onDelete = async (user: User) => (deletingUser = user);

  let handleInput = $state("");
  const debouncedHandle = new Debounced(() => handleInput, 500);
  
  const usersQuery = infiniteScroll.listQuery<User>(
    () => ({ 
      search: debouncedHandle.current,
      role: (selectedRole === "all" ? undefined : selectedRole) as string
    }),
    page.url.origin,
    "users",
  );

  // Bulk Selection Logic
  const toggleSelectAll = () => {
    if (!$usersQuery.data?.results) return;
    const allIds = $usersQuery.data.results.map(u => u.id);
    if (selectedIds.length === allIds.length) {
      selectedIds = [];
    } else {
      selectedIds = allIds;
    }
  };

  const onSelectionToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter(i => i !== id);
    } else {
      selectedIds = [...selectedIds, id];
    }
  };

  // Bulk Action Invocation
  const handleBulkAction = async (action: 'delete' | 'updateRole') => {
    if (selectedIds.length === 0) return;
    
    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedIds.length} users? This cannot be undone.`)) {
      return;
    }

    if (action === 'updateRole' && !bulkRole) {
      toast.error("Please select a target role for bulk update");
      return;
    }

    isBulkProcessing = true;
    try {
      const response = await fetch('/api/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          ids: selectedIds, 
          role: action === 'updateRole' ? bulkRole : undefined 
        })
      });

      const result = await response.json();
      if (result.status === 'success' || result.status === 'partial_success') {
        toast.success(result.message);
        selectedIds = [];
        bulkRole = "";
        $usersQuery.refetch();
        if (result.status === 'partial_success') {
           console.error("Bulk partial failure:", result.errors);
        }
      } else {
        toast.error(result.message || "Bulk action failed");
      }
    } catch (error: any) {
      toast.error("Failed to perform bulk action");
      console.error(error);
    } finally {
      isBulkProcessing = false;
    }
  };

  const filterRoles = [
    { label: "All Members", value: "all" },
    { label: "Admins", value: Role.ADMIN },
    { label: "Members", value: Role.MEMBER_INDIVIDUAL },
    { label: "Corporate", value: Role.MEMBER_CORPORATE },
    { label: "Users", value: Role.USER },
  ];
</script>

<div class="flex flex-col gap-4 pb-12">
  <!-- Premium Header -->
  <div class="space-y-4">
    <div class="flex flex-col gap-4">
      <Badge
        variant="outline"
        class="w-fit px-4 py-1.5 rounded-full border-primary/30 text-primary font-bold uppercase tracking-widest backdrop-blur-sm"
      >
        Platform Governance
      </Badge>
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
        User Management Africa ({#if $usersQuery.isPending}<Loader2
            class="inline h-6 w-6 animate-spin text-primary"
          />{:else}{$usersQuery?.data?.total ?? 0}{/if})
      </h1>
      <p
        class="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed"
      >
        Oversee and manage the continental network of IT leaders. Assign roles,
        manage permissions, and ensure the integrity of the ecosystem.
      </p>
    </div>
  </div>

  <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
    <div class="relative w-full sm:max-w-md">
      <Search
        class="absolute top-1/2 left-3 size-4 -translate-y-1/2 transform text-muted-foreground"
      />
      <Input
        placeholder="Search by name or email..."
        bind:value={handleInput}
        class="pl-10 h-11 rounded-xl bg-muted/30 border-border/50 focus:ring-primary/20"
      />
    </div>
    <Button
      class="w-full sm:w-auto rounded-xl font-bold shadow-md transition-all active:scale-95"
      onclick={() => (showCreateDialog = true)}
    >
      <UserPlus class="mr-2 size-4" />
      New User
    </Button>
  </div>

  <!-- Role Filters -->
  <div class="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
    {#each filterRoles as role, i}
      <Button
        variant={selectedRole === role.value ? "default" : "outline"}
        size="sm"
        class="rounded-full px-5 font-bold transition-all whitespace-nowrap"
        onclick={() => (selectedRole = role.value)}
      >
        {role.label}
      </Button>
    {/each}
  </div>

  {#if $usersQuery.isPending}
    <div class="py-24">
      <div class="flex flex-col items-center justify-center gap-4">
        <div
          class="size-16 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg"
        ></div>
        <p
          class="text-muted-foreground font-bold uppercase tracking-widest text-xs"
        >
          Fetching records...
        </p>
      </div>
    </div>
  {/if}

  {#if $usersQuery.error}
    <Alert.Root
      variant="destructive"
      class="rounded-xl border-destructive/20 shadow-lg"
    >
      <AlertCircleIcon class="size-4" />
      <Alert.Title class="font-bold">Access or Connection Error</Alert.Title>
      <Alert.Description class="opacity-80"
        >{$usersQuery.error.message}</Alert.Description
      >
    </Alert.Root>
  {/if}

  {#if $usersQuery.isSuccess}
    <div class="space-y-4">
      <!-- desktop table -->
      <div
        class="hidden lg:block overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg"
      >
        <Table>
          <TableHeader class="bg-muted/50 border-b border-border">
            <TableRow class="hover:bg-transparent">
              <TableHead class="w-10 pl-6">
                <input
                  type="checkbox"
                  checked={$usersQuery.data?.results && selectedIds.length === $usersQuery.data.results.length}
                  indeterminate={$usersQuery.data?.results && selectedIds.length > 0 && selectedIds.length < $usersQuery.data.results.length}
                  onchange={toggleSelectAll}
                  class="w-4 h-4 rounded border-border text-primary focus:ring-primary transition-all cursor-pointer"
                />
              </TableHead>
              <TableHead class="w-12 font-bold text-foreground"
                >S/N</TableHead
              >
              <TableHead class="font-bold text-foreground"
                >Member Identity</TableHead
              >
              <TableHead class="font-bold text-foreground text-center"
                >Current Role</TableHead
              >
              <TableHead class="font-bold text-foreground text-center"
                >Subscription Ends</TableHead
              >
              <TableHead class="font-bold text-foreground"
                >Continental Entry</TableHead
              >
              <TableHead class="text-right font-bold text-foreground pr-8"
                >Actions</TableHead
              >
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each $usersQuery.data.results as user, i}
              <ListCard 
                {onDelete} 
                screen="desktop" 
                {i} 
                {user} 
                isSelected={selectedIds.includes(user.id)}
                onSelectionToggle={() => onSelectionToggle(user.id)}
              />
            {/each}
          </TableBody>
        </Table>

{#if isBulkProcessing}
  <div class="fixed inset-0 z-100 flex items-center justify-center bg-background/60 backdrop-blur-md animate-in fade-in duration-500">
    <div class="relative p-8 rounded-xl border border-primary/20 bg-card shadow-2xl flex flex-col items-center gap-6 max-w-sm text-center mx-4 overflow-hidden">
      <!-- Animated Background Glow -->
      <div class="absolute -top-24 -left-24 size-48 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-24 -right-24 size-48 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <!-- Icon Container -->
      <div class="relative">
        <div class="size-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Database class="size-10 text-primary animate-bounce-slow" />
        </div>
        <div class="absolute inset-0 rounded-full border-2 border-primary/30 border-t-transparent animate-spin-slow-ccw"></div>
        <div class="absolute -inset-2 rounded-full border border-primary/10 animate-ping opacity-20"></div>
      </div>

      <!-- Text Content -->
      <div class="space-y-3 relative z-10">
        <h3 class="text-xl font-bold tracking-tight text-foreground">Harmonizing Data</h3>
        <p class="text-xs font-medium text-muted-foreground leading-relaxed px-4">
          Updating the continental network records. This may take a moment to propagate across the ecosystem.
        </p>
      </div>

      <!-- Progress Indicator -->
      <div class="w-full space-y-2">
        <div class="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div class="h-full bg-primary w-1/3 rounded-full animate-infinite-scroll"></div>
        </div>
        <div class="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/60">
          <RefreshCw class="size-3 animate-spin" />
          Synchronizing
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes infinite-scroll {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(300%); }
  }
  
  @keyframes spin-slow-ccw {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }

  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .animate-infinite-scroll {
    animation: infinite-scroll 2s infinite linear;
  }

  .animate-spin-slow-ccw {
    animation: spin-slow-ccw 4s infinite linear;
  }

  .animate-bounce-slow {
    animation: bounce-slow 3s infinite ease-in-out;
  }
</style>
      </div>

      <!-- mobile cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
        {#each $usersQuery.data.results as user, i}
          <ListCard 
            {onDelete} 
            screen="mobile" 
            {i} 
            {user} 
            isSelected={selectedIds.includes(user.id)}
            onSelectionToggle={() => onSelectionToggle(user.id)}
          />
        {/each}
      </div>

      <!-- Bulk Actions Bar -->
      {#if selectedIds.length > 0}
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[min(90%,800px)]">
          <div class="bg-card/80 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div class="flex items-center gap-4">
              <div class="bg-primary text-primary-foreground text-xs font-black px-3 py-1.5 rounded-lg flex items-center justify-center min-w-8 shadow-sm">
                {selectedIds.length}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-bold text-foreground">Bulk Selection Active</span>
                <span class="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Applying to continental network</span>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <!-- Inline Role Selector -->
              <div class="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border/50 w-full sm:w-auto">
                <SelectComponent 
                  bind:value={bulkRole}
                  options={roles}
                  placeholder="Select Role..."
                  name="bulk-role"
                  class="h-8 text-xs font-bold min-w-[140px] bg-transparent border-none shadow-none focus-visible:ring-0"
                />
                <Button 
                  size="sm" 
                  class="rounded-lg font-black text-[10px] uppercase h-8"
                  disabled={isBulkProcessing || !bulkRole}
                  onclick={() => handleBulkAction('updateRole')}
                >
                  {isBulkProcessing ? '...' : 'Update Role'}
                </Button>
              </div>

              <div class="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  class="flex-1 sm:flex-none rounded-xl h-10 border-red-500/20 text-red-600 hover:bg-red-50 font-bold"
                  disabled={isBulkProcessing}
                  onclick={() => handleBulkAction('delete')}
                >
                  <Trash2 class="size-4 mr-2" />
                  Delete All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  class="flex-1 sm:flex-none rounded-xl h-10 font-bold text-muted-foreground hover:bg-muted"
                  onclick={() => (selectedIds = [])}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="pt-8">
      {#if $usersQuery.isFetching}
        <div class="flex items-center justify-center gap-4">
          <Loader2 class="size-5 animate-spin text-primary" />
          <span
            class="text-sm font-bold text-muted-foreground uppercase tracking-widest"
            >Bridging more data...</span
          >
        </div>
      {:else if $usersQuery.hasNextPage}
        <div class="flex justify-center">
          <Button
            variant="outline"
            class="min-w-[200px] font-bold rounded-xl border-primary/20 hover:bg-primary/5 transition-all shadow-md"
            onclick={() => $usersQuery.fetchNextPage()}
            disabled={!$usersQuery.hasNextPage ||
              $usersQuery.isFetchingNextPage}
          >
            Load Additional Members
          </Button>
        </div>
      {:else}
        <div class="text-center py-8">
          <p
            class="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]"
          >
            End of continental directory
          </p>
        </div>
      {/if}
    </div>
  {/if}

  {#if editingUser}
    <EditDialog
      user={editingUser}
      open={!!editingUser}
      onOpenChange={(open) => !open && (editingUser = null)}
    />
  {/if}

  {#if deletingUser}
    <DeleteDialog
      user={deletingUser}
      open={!!deletingUser}
      onOpenChange={(open) => !open && (deletingUser = null)}
    />
  {/if}

  <CreateDialog
    open={showCreateDialog}
    onOpenChange={(open) => (showCreateDialog = open)}
  />
</div>
