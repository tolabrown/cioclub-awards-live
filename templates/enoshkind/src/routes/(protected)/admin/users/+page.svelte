<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import * as Avatar from '$lib/components/ui/avatar';
	import {
		Search,
		UserCog,
		Shield,
		ShieldCheck,
		User,
		MoreVertical,
		Trash2,
		Mail,
		Calendar
	} from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { toast } from 'svelte-sonner';

	let users = $state<any[]>([]);
	let searchQuery = $state('');
	let loading = $state(true);

	const filteredUsers = $derived(
		users.filter(
			(u) =>
				u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.email.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	async function fetchUsers() {
		loading = true;
		try {
			const res = await fetch('/api/admin/users');
			if (res.ok) {
				const result = await res.json();
				users = result.data;
			}
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function updateRole(userId: string, currentRole: string) {
		const newRole = currentRole === 'admin' ? 'user' : 'admin';
		try {
			const res = await fetch('/api/admin/users', {
				method: 'PATCH',
				body: JSON.stringify({ id: userId, role: newRole })
			});
			if (res.ok) {
				toast.success('Role Updated', { description: `User is now a ${newRole}` });
				fetchUsers();
			}
		} catch (e) {
			toast.error('Update Failed');
		}
	}

	async function handleDelete(userId: string) {
		if (!confirm('Are you sure you want to delete this user?')) return;
		try {
			const res = await fetch('/api/admin/users', {
				method: 'DELETE',
				body: JSON.stringify({ id: userId })
			});
			if (res.ok) {
				toast.success('User Deleted');
				fetchUsers();
			}
		} catch (e) {
			toast.error('Delete Failed');
		}
	}

	onMount(fetchUsers);
</script>

<div class="space-y-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">User Management</h1>
			<p class="text-muted-foreground font-medium">
				Manage user accounts, roles, and platform permissions.
			</p>
		</div>
		<div class="relative w-full md:w-80">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				bind:value={searchQuery}
				placeholder="Search by name or email..."
				class="pl-10 bg-card/40 border-border/40 focus:ring-primary/20"
			/>
		</div>
	</div>

	<div
		class="bg-card/40 backdrop-blur-xl border border-border/40 rounded-xl overflow-hidden shadow-2xl"
	>
		<Table.Root>
			<Table.Header class="bg-muted/50">
				<Table.Row>
					<Table.Head class="font-bold text-sm capitalize tracking-widest text-primary px-6"
						>User</Table.Head
					>
					<Table.Head class="font-bold text-sm capitalize tracking-widest text-primary"
						>Role</Table.Head
					>
					<Table.Head class="font-bold text-sm capitalize tracking-widest text-primary"
						>Joined</Table.Head
					>
					<Table.Head
						class="font-bold text-sm capitalize tracking-widest text-primary text-right px-6"
						>Actions</Table.Head
					>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if loading}
					{#each Array(5) as _}
						<Table.Row class="animate-pulse">
							<Table.Cell class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div class="w-10 h-10 rounded-full bg-muted"></div>
									<div class="space-y-2">
										<div class="w-24 h-3 bg-muted rounded"></div>
										<div class="w-32 h-2 bg-muted rounded"></div>
									</div>
								</div>
							</Table.Cell>
							<Table.Cell colspan={3} class="py-4">
								<div class="w-full h-4 bg-muted rounded"></div>
							</Table.Cell>
						</Table.Row>
					{/each}
				{:else if filteredUsers.length === 0}
					<Table.Row>
						<Table.Cell colspan={4} class="h-48 text-center text-muted-foreground font-medium">
							No users found matching your search.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each filteredUsers as u}
						<Table.Row class="hover:bg-primary/5 transition-colors border-border/20">
							<Table.Cell class="px-6 py-4">
								<div class="flex items-center gap-4">
									<Avatar.Root class="h-10 w-10 border border-primary/20">
										<Avatar.Image src={u.image} alt={u.name} />
										<Avatar.Fallback class="bg-primary/10 text-primary font-bold">
											{u.name
												.split(' ')
												.map((n: string) => n[0])
												.join('')}
										</Avatar.Fallback>
									</Avatar.Root>
									<div class="flex flex-col">
										<span class="font-bold text-sm">{u.name}</span>
										<span class="text-xs text-muted-foreground flex items-center gap-1">
											<Mail class="w-3 h-3" />
											{u.email}
										</span>
									</div>
								</div>
							</Table.Cell>
							<Table.Cell>
								<Badge
									variant={u.role === 'admin' ? 'default' : 'secondary'}
									class="font-bold text-sm capitalize px-2 py-0.5 {u.role === 'admin'
										? 'bg-primary shadow-lg shadow-primary/20'
										: 'bg-muted/50'}"
								>
									{u.role === 'admin' ? 'Administrator' : 'Member'}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								<span class="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
									<Calendar class="w-3 h-3" />
									{new Date(u.createdAt).toLocaleDateString()}
								</span>
							</Table.Cell>
							<Table.Cell class="text-right px-6">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class="w-8 hover:bg-primary/10 text-muted-foreground hover:text-primary flex items-center justify-center transition-colors px-0 py-0"
									>
										<MoreVertical class="h-4 w-4" />
									</DropdownMenu.Trigger>
									<DropdownMenu.Content
										align="end"
										class="w-48 p-1 border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl"
									>
										<DropdownMenu.Label
											class="text-sm capitalize tracking-widest font-bold text-muted-foreground px-2 py-1.5"
											>Account Actions</DropdownMenu.Label
										>
										<DropdownMenu.Item
											class="font-bold gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary"
											onclick={() => updateRole(u.id, u.role)}
										>
											{#if u.role === 'admin'}
												<User class="w-4 h-4" /> Downgrade to Member
											{:else}
												<ShieldCheck class="w-4 h-4" /> Make Administrator
											{/if}
										</DropdownMenu.Item>
										<DropdownMenu.Separator class="bg-border/40" />
										<DropdownMenu.Item
											class="font-bold gap-2 text-destructive focus:bg-destructive/10 cursor-pointer"
											onclick={() => handleDelete(u.id)}
										>
											<Trash2 class="w-4 h-4" /> Delete Account
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
