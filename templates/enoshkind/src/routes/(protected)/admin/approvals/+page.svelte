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
		ShieldCheck,
		ExternalLink,
		Check,
		X,
		User,
		Stethoscope,
		FileText,
		Loader2,
		Search,
		ChevronRight,
		Clock,
		ArrowRight
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { Debounced } from 'runed';
	import { infiniteScroll } from '$lib/hooks/use-infinite-scroll.svelte';
	import ApprovalDetails from './ApprovalDetails.svelte';
	import { cn } from '$lib/utils';

	let loading = $state(false);
	let processingId = $state('');
	let searchQuery = $state('');
	const debouncedSearch = new Debounced(() => searchQuery, 500);

	let selectedDoctor = $state<any>(null);
	let isDetailsOpen = $state(false);

	const getApprovalParams = () => ({
		host: page.url.origin,
		field: 'admin/doctors/pending',
		search: debouncedSearch.current,
		limit: 28
	});

	const approvalsQuery = $derived(infiniteScroll.listQueryAlternate<any>(getApprovalParams()));

	async function handleApprove(doctorId: string) {
		loading = true;
		processingId = doctorId;
		try {
			const res = await fetch(`/api/admin/doctors/approve`, {
				method: 'POST',
				body: JSON.stringify({ doctorId, approved: true })
			});
			const result = await res.json();
			if (result.success) {
				toast.success('Doctor approved successfully');
				infiniteScroll.queryClient.invalidateQueries({ queryKey: ['admin/doctors/pending'] });
				isDetailsOpen = false;
			} else {
				toast.error('Failed to approve doctor: ' + result.message);
			}
		} catch (e) {
			toast.error('An error occurred');
		} finally {
			loading = false;
			processingId = '';
		}
	}

	async function handleReject(doctorId: string) {
		if (
			!confirm(
				'Are you sure you want to reject this application? This will not delete the record but keep it unapproved.'
			)
		)
			return;

		loading = true;
		processingId = doctorId;
		try {
			const res = await fetch(`/api/admin/doctors/approve`, {
				method: 'POST',
				body: JSON.stringify({ doctorId, approved: false })
			});
			const result = await res.json();
			if (result.success) {
				toast.success('Application marked as rejected/pending');
				infiniteScroll.queryClient.invalidateQueries({ queryKey: ['admin/doctors/pending'] });
				isDetailsOpen = false;
			} else {
				toast.error('Failed to update status: ' + result.message);
			}
		} catch (e) {
			toast.error('An error occurred');
		} finally {
			loading = false;
			processingId = '';
		}
	}

	function openDetails(doctor: any) {
		selectedDoctor = doctor;
		isDetailsOpen = true;
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
					<ShieldCheck class="w-8 h-8 text-primary" />
				</div>
				<h1
					class="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
				>
					Practitioner Approvals
				</h1>
			</div>
			<p class="text-muted-foreground font-medium">
				Maintain healthcare standards by verifying medical credentials.
			</p>
		</div>
		<div class="flex items-center gap-4 relative z-10">
			<div
				class="px-6 py-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 shadow-sm hover:bg-primary/10 transition-colors"
			>
				<div
					class="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-md shadow-orange-500/40"
				></div>
				<span class="font-bold text-primary tracking-tight">
					{#if $approvalsQuery.isSuccess}
						{$approvalsQuery.data.total} Total Registered Practitioners
					{:else}
						Calculating...
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
			placeholder="Search by practitioner name or email address..."
			class="pl-14 pr-6 rounded-xl bg-card/40 border-border/40 backdrop-blur-md shadow-lg focus:ring-primary/20 focus:border-primary/50 transition-all"
		/>
	</div>

	<Card class="border-border/40 shadow-lg bg-card/40 backdrop-blur-md rounded-xl overflow-hidden">
		<CardContent class="p-0">
			{#if $approvalsQuery.isPending}
				<div class="flex flex-col items-center justify-center py-32 space-y-4">
					<div class="relative">
						<Loader2 class="w-16 h-16 animate-spin text-primary opacity-20" />
						<Stethoscope
							class="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
						/>
					</div>
					<p class="font-bold text-muted-foreground animate-pulse">Scanning medical registry...</p>
				</div>
			{:else if $approvalsQuery.isSuccess && $approvalsQuery.data.results.length === 0}
				<div class="flex flex-col items-center justify-center py-32 text-center px-6">
					<div class="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
						<Check class="size-10 text-primary opacity-40" />
					</div>
					<h3 class="text-2xl font-bold mb-2">All Clear!</h3>
					<p class="text-muted-foreground max-w-sm">
						No pending doctor applications found. Our healthcare network is currently up to date.
					</p>
				</div>
			{:else if $approvalsQuery.isSuccess}
				<!-- DESKTOP TABLE -->
				<div class="hidden md:block overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow class="bg-muted/50 hover:bg-muted/50 border-b border-border/40">
								<TableHead
									class="w-[300px] font-bold text-primary capitalize text-sm tracking-widest pl-8"
									>Practitioner Details</TableHead
								>
								<TableHead class="font-bold text-primary capitalize text-sm tracking-widest"
									>Specialty</TableHead
								>
								<TableHead
									class="font-bold text-primary capitalize text-sm tracking-widest text-center"
									>Verification</TableHead
								>
								<TableHead class="font-bold text-primary capitalize text-sm tracking-widest"
									>Applied Date</TableHead
								>
								<TableHead
									class="text-right font-bold text-primary capitalize text-sm tracking-widest pr-8"
									>Status</TableHead
								>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each $approvalsQuery.data.results as item}
								{@const { doctor: d, user: u } = item}
								<TableRow
									class="hover:bg-primary/5 transition-all cursor-pointer group border-b border-border/40"
									onclick={() => openDetails(item)}
								>
									<TableCell class="pl-8 py-5">
										<div class="grid grid-cols-[40px_1fr] items-center gap-4">
											<div class="relative">
												{#if d.image || u?.image}
													<img
														src={d.image || u?.image}
														alt={d.name}
														class="size-10 rounded-xl object-cover border-2 border-background shadow-md group-hover:scale-105 transition-transform"
													/>
												{:else}
													<div
														class="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm"
													>
														<User class="w-6 h-6" />
													</div>
												{/if}
												<div
													class={cn(
														'absolute -bottom-1 -right-1 w-4 h-4 border-2 border-background rounded-full',
														d.approved
															? 'bg-emerald-500 shadow-md shadow-emerald-500/40'
															: 'bg-orange-500 shadow-md shadow-orange-500/40'
													)}
												></div>
											</div>
											<div class="space-y-0.5">
												<p
													class="font-bold text-base leading-tight group-hover:text-primary transition-colors"
												>
													{d.name}
												</p>
												<p class="text-[11px] text-muted-foreground font-medium">
													{u?.email || 'N/A'}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div class="flex items-center gap-2 font-bold text-sm text-foreground/80">
											<div class="p-1.5 bg-primary/5 rounded-lg">
												<Stethoscope class="w-4 h-4 text-primary" />
											</div>
											{d.specialty}
										</div>
									</TableCell>
									<TableCell class="text-center">
										{#if d.licenseUrl}
											<div
												class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-sm font-bold capitalize tracking-widest"
											>
												<FileText class="w-3 h-3" />
												Ready for Review
											</div>
										{:else}
											<div
												class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 text-sm font-bold capitalize tracking-widest"
											>
												<X class="w-3 h-3" />
												Missing License
											</div>
										{/if}
									</TableCell>
									<TableCell>
										<div class="flex items-center gap-2 text-muted-foreground font-medium text-sm">
											<Clock class="w-4 h-4 opacity-50" />
											{new Date(d.createdAt).toLocaleDateString(undefined, {
												month: 'short',
												day: 'numeric',
												year: 'numeric'
											})}
										</div>
									</TableCell>
									<TableCell class="pr-8 text-right">
										<div
											class="inline-flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform"
										>
											Manage Practitioner
											<ChevronRight class="w-4 h-4" />
										</div>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</div>

				<!-- MOBILE CARD LIST -->
				<div class="md:hidden space-y-4">
					{#each $approvalsQuery.data.results as item}
						{@const { doctor: d, user: u } = item}
						<button
							class="w-full text-left p-4 border border-border/40 bg-background/50 backdrop-blur-md shadow-lg active:scale-[0.98] transition-all space-y-4 rounded-xl"
							onclick={() => openDetails(item)}
						>
							<div class="flex items-start justify-between">
								<div class="grid grid-cols-[48px_1fr] items-center gap-4">
									<div class="relative">
										{#if d.image || u?.image}
											<img
												src={d.image || u?.image}
												alt={d.name}
												class="size-12 rounded-xl object-cover border-2 border-background shadow-lg"
											/>
										{:else}
											<div
												class="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
											>
												<User class="w-7 h-7" />
											</div>
										{/if}
										<div
											class={cn(
												'absolute -bottom-1 -right-1 w-4 h-4 border-2 border-background rounded-full',
												d.approved ? 'bg-emerald-500' : 'bg-orange-500'
											)}
										></div>
									</div>
									<div class="space-y-0.5">
										<h4 class="font-bold leading-tight">{d.name}</h4>
										<p class="text-xs text-muted-foreground font-medium capitalize tracking-tight">
											{d.specialty}
										</p>
									</div>
								</div>
								<div class="p-2 bg-primary/5 rounded-xl border border-primary/10">
									<ChevronRight class="w-5 h-5 text-primary" />
								</div>
							</div>

							<div class="grid grid-cols-2 gap-3 pt-2">
								<div
									class="flex items-center gap-2 text-sm font-bold text-muted-foreground capitalize bg-muted/20 px-3 py-2 rounded-xl border border-border/20"
								>
									<Clock class="w-3 h-3" />
									{new Date(d.createdAt).toLocaleDateString(undefined, {
										month: 'short',
										day: 'numeric'
									})}
								</div>
								{#if d.licenseUrl}
									<div
										class="flex items-center gap-2 text-sm font-bold text-emerald-600 capitalize bg-emerald-500/5 px-3 py-2 rounded-xl border border-emerald-500/20"
									>
										<Check class="w-3 h-3" />
										License Attached
									</div>
								{:else}
									<div
										class="flex items-center gap-2 text-sm font-bold text-red-600 capitalize bg-red-500/5 px-3 py-2 rounded-xl border border-red-500/20"
									>
										<X class="w-3 h-3" />
										No Document
									</div>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}

			<!-- Infinite Scroll Trigger / More Button -->
			{#if $approvalsQuery.isSuccess && ($approvalsQuery.hasNextPage || $approvalsQuery.isFetchingNextPage)}
				<div class="p-8 flex justify-center border-t border-border/40">
					<Button
						variant="outline"
						class="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold shadow-lg shadow-primary/5 group"
						onclick={() => $approvalsQuery.fetchNextPage()}
					>
						{#if $approvalsQuery.isFetchingNextPage}
							<Loader2 class="mr-3 h-5 w-5 animate-spin" />
							Syncing with registry...
						{:else}
							Load More Applications
							<ArrowRight class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
						{/if}
					</Button>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Empty Space for Bottom -->
	<div class="h-12"></div>
</div>

<ApprovalDetails
	bind:open={isDetailsOpen}
	data={selectedDoctor}
	{loading}
	{processingId}
	onApprove={handleApprove}
	onReject={handleReject}
/>
