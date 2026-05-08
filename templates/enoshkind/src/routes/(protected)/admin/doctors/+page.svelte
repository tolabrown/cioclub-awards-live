<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import {
		Stethoscope,
		Search,
		ChevronRight,
		Clock,
		ArrowRight,
		User,
		Loader2,
		Wallet,
		CheckCircle2
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { Debounced } from 'runed';
	import { infiniteScroll } from '$lib/hooks/use-infinite-scroll.svelte';
	import { cn } from '$lib/utils';
	import * as Dialog from '$lib/components/ui/dialog';

	let loading = $state(false);
	let processingId = $state('');
	let searchQuery = $state('');
	const debouncedSearch = new Debounced(() => searchQuery, 500);

	let selectedDoctor = $state<any>(null);
	let isPriceDialogOpen = $state(false);
	let newPrice = $state(0);

	const getDoctorsParams = () => ({
		host: page.url.origin,
		field: 'admin/doctors',
		search: debouncedSearch.current,
		limit: 28
	});

	const doctorsQuery = $derived(infiniteScroll.listQueryAlternate<any>(getDoctorsParams()));

	function openPriceDialog(doctor: any) {
		selectedDoctor = doctor;
		newPrice = doctor.doctor.price / 100; // Convert to Naira for display
		isPriceDialogOpen = true;
	}

	async function handleUpdatePrice() {
		if (!selectedDoctor) return;
		loading = true;
		try {
			const res = await fetch(`/api/admin/doctors`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: selectedDoctor.doctor.id,
					price: Math.round(newPrice * 100) // Convert back to kobo
				})
			});
			const result = await res.json();
			if (result.success) {
				toast.success('Consultation price updated successfully');
				infiniteScroll.queryClient.invalidateQueries({ queryKey: ['admin/doctors'] });
				isPriceDialogOpen = false;
			} else {
				toast.error('Failed to update price: ' + result.message);
			}
		} catch (e) {
			toast.error('An error occurred');
		} finally {
			loading = false;
		}
	}
</script>

<div class="py-6 md:space-y-4 w-full overflow-x-hidden">
	<!-- Glassy Header -->
	<div
		class="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-xl bg-card/40 backdrop-blur-xl border border-border/40 shadow-lg relative overflow-hidden"
	>
		<div class="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
		<div class="relative z-10">
			<div class="flex items-center gap-3 mb-2">
				<div class="p-2 bg-primary/10 rounded-xl">
					<Stethoscope class="w-8 h-8 text-primary" />
				</div>
				<h1
					class="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
				>
					Doctor Management
				</h1>
			</div>
			<p class="text-muted-foreground font-medium">
				Manage practitioners and consultation pricing across the platform.
			</p>
		</div>
		<div class="flex items-center gap-4 relative z-10">
			<div
				class="px-6 py-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 shadow-sm"
			>
				<CheckCircle2 class="w-5 h-5 text-primary" />
				<span class="font-bold text-primary tracking-tight">
					{#if $doctorsQuery.isSuccess}
						{$doctorsQuery.data.total} Registered Doctors
					{:else}
						Loading...
					{/if}
				</span>
			</div>
		</div>
	</div>

	<!-- Search Bar -->
	<div class="relative max-w-2xl group">
		<Search
			class="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors"
		/>
		<Input
			bind:value={searchQuery}
			placeholder="Search by practitioner name or specialty..."
			class="pl-14 pr-6 rounded-xl bg-card/40 border-border/40 backdrop-blur-md shadow-md focus:ring-primary/20 focus:border-primary/50 transition-all"
		/>
	</div>

	<Card class="border-border/40 shadow-lg bg-card/40 backdrop-blur-md rounded-xl overflow-hidden">
		<CardContent class="p-0">
			{#if $doctorsQuery.isPending}
				<div class="flex flex-col items-center justify-center py-32 space-y-4">
					<Loader2 class="w-12 h-12 animate-spin text-primary opacity-20" />
					<p class="font-bold text-muted-foreground animate-pulse">Loading medical network...</p>
				</div>
			{:else if $doctorsQuery.isSuccess && $doctorsQuery.data.results.length === 0}
				<div class="flex flex-col items-center justify-center py-32 text-center px-6">
					<h3 class="text-2xl font-bold mb-2">No doctors found</h3>
					<p class="text-muted-foreground">Adjust your search or wait for new registrations.</p>
				</div>
			{:else if $doctorsQuery.isSuccess}
				<!-- DESKTOP TABLE -->
				<div class="hidden md:block overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow class="bg-muted/50 hover:bg-muted/50 border-b border-border/40">
								<TableHead
									class="w-[300px] font-bold text-primary uppercase text-[10px] tracking-widest pl-8"
									>Practitioner</TableHead
								>
								<TableHead class="font-bold text-primary uppercase text-[10px] tracking-widest"
									>Status</TableHead
								>
								<TableHead class="font-bold text-primary uppercase text-[10px] tracking-widest"
									>Price (₦)</TableHead
								>
								<TableHead class="font-bold text-primary uppercase text-[10px] tracking-widest"
									>Joined</TableHead
								>
								<TableHead
									class="text-right font-bold text-primary uppercase text-[10px] tracking-widest pr-8"
									>Action</TableHead
								>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each $doctorsQuery.data.results as item}
								{@const { doctor: d, user: u } = item}
								<TableRow class="hover:bg-primary/5 transition-all border-b border-border/40">
									<TableCell class="pl-8 py-4">
										<div class="flex items-center gap-4">
											{#if d.image || u?.image}
												<img
													src={d.image || u?.image}
													alt={d.name}
													class="size-10 rounded-xl object-cover border border-border/40 shadow-sm"
												/>
											{:else}
												<div
													class="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm"
												>
													<User class="w-6 h-6" />
												</div>
											{/if}
											<div class="space-y-0.5">
												<p class="font-bold text-sm tracking-tight">{d.name}</p>
												<p class="text-[10px] text-muted-foreground font-medium">{d.specialty}</p>
											</div>
										</div>
									</TableCell>
									<TableCell>
										{#if d.approved}
											<Badge
												variant="secondary"
												class="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold"
												>Approved</Badge
											>
										{:else}
											<Badge
												variant="secondary"
												class="bg-orange-500/10 text-orange-600 border-orange-500/20 font-bold"
												>Pending</Badge
											>
										{/if}
									</TableCell>
									<TableCell>
										<span class="font-bold text-sm">₦{(d.price / 100).toLocaleString()}</span>
									</TableCell>
									<TableCell>
										<span class="text-xs text-muted-foreground font-medium">
											{new Date(d.createdAt).toLocaleDateString()}
										</span>
									</TableCell>
									<TableCell class="pr-8 text-right">
										<Button
											variant="ghost"
											size="sm"
											class="font-bold text-primary"
											onclick={() => openPriceDialog(item)}
										>
											Edit Price
										</Button>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</div>

				<!-- MOBILE VIEW -->
				<div class="md:hidden space-y-4 px-4 py-4">
					{#each $doctorsQuery.data.results as item}
						{@const { doctor: d, user: u } = item}
						<div
							class="p-4 rounded-xl border border-border/40 bg-card/60 backdrop-blur-md shadow-md space-y-4"
						>
							<div class="flex items-start justify-between">
								<div class="flex items-center gap-3">
									<div class="relative">
										{#if d.image || u?.image}
											<img
												src={d.image || u?.image}
												alt={d.name}
												class="size-12 rounded-xl object-cover border border-border/40 shadow-sm"
											/>
										{:else}
											<div
												class="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
											>
												<User class="w-7 h-7" />
											</div>
										{/if}
									</div>
									<div>
										<h4 class="font-bold leading-tight">{d.name}</h4>
										<p
											class="text-[10px] text-muted-foreground font-bold uppercase tracking-widest"
										>
											{d.specialty}
										</p>
									</div>
								</div>
								<Badge
									variant="outline"
									class={cn(
										'font-bold text-[10px]',
										d.approved
											? 'text-emerald-600 bg-emerald-500/5'
											: 'text-orange-600 bg-orange-500/5'
									)}
								>
									{d.approved ? 'Approved' : 'Pending'}
								</Badge>
							</div>
							<div class="flex items-end justify-between pt-2 border-t border-border/20">
								<div>
									<p
										class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1"
									>
										Consultation Price
									</p>
									<p class="text-lg font-bold">₦{(d.price / 100).toLocaleString()}</p>
								</div>
								<Button size="sm" class="font-bold" onclick={() => openPriceDialog(item)}
									>Update</Button
								>
							</div>
						</div>
					{/each}
				</div>

				{#if $doctorsQuery.hasNextPage}
					<div class="p-8 flex justify-center border-t border-border/40">
						<Button
							variant="outline"
							class="font-bold"
							onclick={() => $doctorsQuery.fetchNextPage()}
						>
							Load More Practitioners
						</Button>
					</div>
				{/if}
			{/if}
		</CardContent>
	</Card>

	<div class="h-10"></div>
</div>

<Dialog.Root bind:open={isPriceDialogOpen}>
	<Dialog.Content
		class="sm:max-w-[425px] rounded-xl border-border/40 bg-card/95 backdrop-blur-2xl shadow-lg"
	>
		<Dialog.Header>
			<Dialog.Title class="text-xl font-bold">Update Consultation Price</Dialog.Title>
			<Dialog.Description class="font-medium">
				Set the base price for consultations with <span class="text-primary font-bold"
					>{selectedDoctor?.doctor.name}</span
				>.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-6 py-4">
			<div class="grid gap-2">
				<div class="flex items-center justify-between">
					<label
						for="price"
						class="text-sm font-bold text-muted-foreground uppercase tracking-widest"
						>Base Price (₦)</label
					>
					<div class="p-1 px-2 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
						Current: ₦{(selectedDoctor?.doctor.price / 100).toLocaleString()}
					</div>
				</div>
				<div class="relative">
					<Wallet class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
					<Input
						id="price"
						type="number"
						bind:value={newPrice}
						class="pl-12 rounded-xl bg-muted/30 border-border/40 font-bold text-lg"
					/>
				</div>
			</div>
			<div class="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2">
				<p class="text-[11px] text-muted-foreground font-medium">
					This is the amount standard platform consultations will cost. A 15% service charge will be
					automatically added to this base price.
				</p>
				<p class="text-xs font-bold text-primary">
					Total User Cost: ₦{(newPrice * 1.15).toLocaleString()}
				</p>
			</div>
		</div>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => (isPriceDialogOpen = false)}
				class="font-bold rounded-xl">Cancel</Button
			>
			<Button
				onclick={handleUpdatePrice}
				disabled={loading}
				class="font-bold rounded-xl shadow-lg shadow-primary/20 min-w-[120px]"
			>
				{#if loading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Saving...
				{:else}
					Update Price
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
