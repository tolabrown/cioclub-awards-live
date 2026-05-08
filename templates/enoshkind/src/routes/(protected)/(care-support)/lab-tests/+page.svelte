<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { enhance } from '$app/forms';
	import {
		Droplets,
		Dna,
		Upload,
		FileText,
		Plus,
		ArrowRight,
		Microscope,
		MapPin,
		Edit,
		Trash2,
		Settings2,
		ExternalLink,
		Loader2,
		Brain,
		Sparkles
	} from '@lucide/svelte';
	import UploadResultDialog from './components/UploadResultDialog.svelte';
	import AddCustomTestDialog from './components/AddCustomTestDialog.svelte';
	import BookLabDialog from './components/BookLabDialog.svelte';
	import FindLabDialog from './components/FindLabDialog.svelte';
	import EditLabTestDialog from './components/EditLabTestDialog.svelte';
	import { format } from 'date-fns';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data } = $props();

	const recentResults = $derived((data.results || []).slice(0, 10));
	const isAdmin = $derived(page.data.user?.role === 'admin');

	// Group tests by category
	const categorizedTests = $derived(() => {
		const groups: Record<string, any[]> = {};
		(data.availableTests || []).forEach((test: any) => {
			if (!groups[test.category]) groups[test.category] = [];
			groups[test.category].push(test);
		});
		return Object.entries(groups).map(([category, tests]) => ({ category, tests }));
	});

	let uploadOpen = $state(false);
	let customOpen = $state(false);
	let findLabOpen = $state(false);
	let bookingOpen = $state(false);
	let editOpen = $state(false);
	let selectedTest = $state<any | null>(null);
	let editingTest = $state<any | null>(null);
	let deletingId = $state<string | null>(null);
	let analyzingId = $state<string | null>(null);

	function triggerBooking(test: any) {
		selectedTest = {
			id: test.id,
			name: test.name,
			price: `₦${(test.price / 100).toLocaleString()}`
		};
		bookingOpen = true;
	}

	function triggerEdit(test: any) {
		editingTest = test;
		editOpen = true;
	}

	function triggerAdd() {
		editingTest = null;
		editOpen = true;
	}
</script>

<div class="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-12 overflow-x-hidden">
	<!-- Header -->
	<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4">
		<div class="space-y-1">
			<h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
				Laboratory
			</h1>
			<p class="text-muted-foreground text-sm md:text-base font-medium">
				Comprehensive diagnostics and advanced genetic analysis.
			</p>
		</div>
		<div
			class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto"
		>
			{#if isAdmin}
				<Button
					variant="outline"
					class="px-6 border-primary/20 hover:bg-primary/5 transition-all font-bold text-primary rounded-xl"
					onclick={triggerAdd}
				>
					<Plus class="mr-2 h-4 w-4" />
					New Package
				</Button>
			{/if}
			<Button
				variant="outline"
				class="px-6 border-slate-200 hover:bg-slate-50 transition-all font-bold rounded-xl"
				onclick={() => (uploadOpen = true)}
			>
				<Upload class="mr-2 h-4 w-4" />
				Upload Results
			</Button>
			<Button
				class="bg-primary hover:bg-primary/90 px-8 shadow-lg shadow-primary/20 font-bold rounded-xl transition-all active:scale-[0.98]"
				onclick={() => (findLabOpen = true)}
			>
				<MapPin class="mr-2 h-4 w-4" />
				Find a Lab
			</Button>
		</div>
	</div>

	<!-- DNA Banner -->
	<div
		class="relative overflow-hidden rounded-xl bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6 md:p-10 text-white shadow-2xl border border-emerald-500/10"
	>
		<div class="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
		<div
			class="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl"
		></div>

		<div
			class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12"
		>
			<div class="space-y-4 md:space-y-6 max-w-2xl text-center md:text-left">
				<Badge
					class="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 font-bold tracking-widest capitalize px-3 py-1"
					>Premium Service</Badge
				>
				<h2 class="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
					Unlock Your <span class="text-emerald-400">Genetic Blueprint</span>
				</h2>
				<p class="text-emerald-100/80 leading-relaxed text-sm md:text-lg font-medium">
					Discover how your genes affect your risk for chronic diseases and receive personalized
					dietary recommendations based on your unique DNA profile.
				</p>
				<div class="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
					<Button
						class="w-full sm:w-auto bg-white text-emerald-900 hover:bg-emerald-50 transition-all px-8 font-bold rounded-2xl text-base shadow-xl"
						href="/education?query=DNA"
					>
						Learn About DNA Testing
						<ArrowRight class="ml-2 w-5 h-5" />
					</Button>
				</div>
			</div>
			<div
				class="shrink-0 p-8 md:p-10 bg-emerald-500/10 rounded-xl border border-emerald-500/20 backdrop-blur-xl shadow-inner group w-full md:w-auto flex justify-center"
			>
				<Dna
					class="w-20 md:w-32 h-20 md:h-32 text-emerald-400 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110"
				/>
			</div>
		</div>
	</div>

	<!-- Main Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
		<!-- Test Booking -->
		<div class="lg:col-span-2 space-y-8">
			<div class="flex items-center justify-between px-1">
				<h2 class="text-2xl font-bold flex items-center gap-3">
					<Microscope class="w-6 h-6 text-primary" />
					Popular Lab Tests
				</h2>
			</div>

			<div class="space-y-10">
				{#each categorizedTests() as category}
					<div class="space-y-5">
						<h3
							class="text-xs font-bold text-muted-foreground capitalize tracking-[0.2em] px-1 flex items-center gap-3"
						>
							<span class="w-8 h-px bg-primary/20"></span>
							{category.category}
						</h3>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
							{#each category.tests as test}
								<Card.Root
									class="group hover:bg-variant-50 transition-all border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300 relative"
								>
									<Card.Content class="p-6 flex flex-col justify-between h-full gap-5">
										<div class="flex items-start justify-between">
											<div class="space-y-2 min-w-0">
												<div class="flex items-center gap-2 flex-wrap min-w-0">
													<h4
														class="font-bold text-lg md:text-xl text-slate-800 dark:text-white leading-tight group-hover:text-primary transition-colors truncate"
													>
														{test.name}
													</h4>
													{#if isAdmin}
														<button
															class="p-2 hover:bg-primary/10 rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90"
															onclick={() => triggerEdit(test)}
															aria-label="Edit test"
														>
															<Settings2 class="w-4 h-4" />
														</button>
													{/if}
												</div>
												{#if test.popular}
													<Badge
														variant="outline"
														class="text-sm p-6 border-amber-500/30 text-amber-600 bg-amber-500/5 capitalize font-bold tracking-tighter px-2.5"
														>Most Popular</Badge
													>
												{/if}
											</div>
											<div
												class="p-3 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors shrink-0"
											>
												<Droplets
													class="w-6 h-6 text-primary/40 group-hover:text-primary transition-colors"
												/>
											</div>
										</div>

										{#if test.description}
											<p class="text-sm text-muted-foreground font-medium line-clamp-2">
												{test.description}
											</p>
										{/if}

										<div class="flex items-center justify-between pt-2">
											<div class="flex flex-col">
												<span
													class="text-xs font-bold text-muted-foreground capitalize tracking-widest"
													>Price</span
												>
												<span class="text-xl font-bold tracking-tight"
													>₦{(test.price / 100).toLocaleString()}</span
												>
											</div>
											<Button
												variant="outline"
												onclick={() => triggerBooking(test)}
												class="border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-all font-bold rounded-2xl shadow-sm"
											>
												Book Now
											</Button>
										</div>
									</Card.Content>
								</Card.Root>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Lab Support Sidebar -->
		<div class="space-y-8">
			<!-- Recent Results -->
			<Card.Root
				class="bg-card/40 border-border/40 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm"
			>
				<Card.Header class="pb-4 border-b border-border/20 px-6 sm:px-8">
					<Card.Title class="text-xl font-bold flex items-center justify-between">
						My Test History
						<Button
							variant="ghost"
							size="icon"
							class="hover:bg-primary/10 hover:text-primary rounded-2xl transition-all"
							onclick={() => (customOpen = true)}
						>
							<Plus class="w-5 h-5" />
						</Button>
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4 pt-6 px-4 sm:px-6">
					{#each recentResults as result}
						<Card.Root
							class="overflow-hidden border-border/20 bg-background/40 hover:bg-background/60 hover:border-primary/30 transition-all rounded-[1.5rem]"
						>
							<Card.Content class="flex flex-col gap-4">
								<div class="flex items-center justify-between w-full">
									<div class="flex items-center gap-4 min-w-0">
										<div
											class="p-3 bg-primary/5 rounded-2xl group-hover:bg-primary/10 transition-colors shrink-0"
										>
											<FileText class="w-5 h-5 text-primary" />
										</div>
										<div class="min-w-0">
											<p class="text-sm sm:text-base font-bold truncate">{result.testType}</p>
											<p class="text-sm text-muted-foreground font-bold capitalize tracking-widest">
												{format(new Date(result.createdAt), 'MMM dd, yyyy')}
											</p>
										</div>
									</div>
									<Badge
										class="shrink-0 bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-bold capitalize tracking-tighter px-2"
										>{result.status.replace('_', ' ')}</Badge
									>
								</div>

								<div class="grid grid-cols-[1fr_1fr_auto] items-center gap-1 pt-1">
									{#if result.pdfUrl}
										<Button
											variant="outline"
											size="xs"
											class="flex-1 text-xs font-bold rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
											onclick={() => window.open(result.pdfUrl as string, '_blank')}
										>
											<ExternalLink class="w-3.5 h-3.5 mr-2" />
											View Report
										</Button>
									{/if}
									{#if result.pdfUrl}
										{#if result.result}
											<Button
												variant="outline"
												size="xs"
												class="flex-1 text-xs font-bold rounded-xl border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all gap-2"
												href="/lab-tests/results/{result.result.id}"
											>
												<Sparkles class="w-3.5 h-3.5" />
												View Analysis
											</Button>
										{:else}
											<form
												method="POST"
												action="?/analyzeReport"
												use:enhance={() => {
													analyzingId = result.id;
													return async ({ result: actionResult }) => {
														analyzingId = null;
														if (actionResult.type === 'success' && actionResult.data?.resultId) {
															toast.success('Analysis complete!');
															goto(`/lab-tests/results/${actionResult.data.resultId}`);
														} else {
															toast.error('AI analysis failed. Please try again later.');
														}
													};
												}}
												class="flex-1"
											>
												<input type="hidden" name="orderId" value={result.id} />
												<Button
													type="submit"
													size="xs"
													disabled={analyzingId === result.id}
													class="w-full text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all gap-2"
												>
													{#if analyzingId === result.id}
														<Loader2 class="w-3.5 h-3.5 animate-spin" />
														Analyzing...
													{:else}
														<Brain class="w-3.5 h-3.5" />
														Analyze Report
													{/if}
												</Button>
											</form>
										{/if}
									{/if}
									<div class="flex items-center gap-1">
										<!-- <Button
                                            variant="ghost"
                                            size="icon"
                                            class="h-10 w-10 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                                            onclick={() => (uploadOpen = true)}
                                            aria-label="Update result"
                                        >
                                            <Edit class="w-4 h-4" />
                                        </Button> -->
										<form
											method="POST"
											action="?/deleteHistoryItem"
											use:enhance={() => {
												deletingId = result.id;
												return async ({ result: actionResult }) => {
													deletingId = null;
													if (actionResult.type === 'success') {
														window.location.reload();
														toast.success('Removed from history');
													} else {
														toast.error('Failed to delete result');
													}
												};
											}}
											class="contents"
										>
											<input type="hidden" name="id" value={result.id} />
											<Button
												type="submit"
												variant="ghost"
												size="xs"
												disabled={deletingId === result.id}
												class="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
											>
												{#if deletingId === result.id}
													<Loader2 class="w-4 h-4 animate-spin" />
												{:else}
													<Trash2 class="w-4 h-4" />
												{/if}
											</Button>
										</form>
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					{:else}
						<div class="py-16 text-center text-muted-foreground space-y-4">
							<div
								class="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto opacity-30 shadow-inner"
							>
								<FileText class="w-8 h-8" />
							</div>
							<p class="font-bold opacity-40 capitalize tracking-widest text-xs">
								No records found
							</p>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>

			<!-- Lab Info Process -->
			<Card.Root
				class="bg-primary/5 border-primary/10 overflow-hidden rounded-xl shadow-sm border-2"
			>
				<Card.Content class="space-y-4">
					<h4
						class="font-bold text-xs capitalize tracking-[0.25em] flex items-center gap-3 text-primary"
					>
						<MapPin class="w-5 h-5" />
						The Lab Process
					</h4>
					<div class="space-y-8 relative">
						<div
							class="absolute left-[1.125rem] top-4 bottom-4 w-1 bg-primary/10 rounded-full"
						></div>

						<div class="relative pl-12 group">
							<div
								class="absolute left-3 top-1 w-4 h-4 rounded-full bg-primary border-4 border-background ring-4 ring-primary/5 group-hover:scale-125 transition-transform"
							></div>
							<p class="text-base font-bold leading-none">1. Book Online</p>
							<p class="text-sm text-muted-foreground font-medium mt-2">
								Select your tests and pay securely via Paystack. Instant confirmation.
							</p>
						</div>

						<div class="relative pl-12 group">
							<div
								class="absolute left-3 top-1 w-4 h-4 rounded-full bg-primary/30 border-4 border-background group-hover:scale-125 transition-transform"
							></div>
							<p class="text-base font-bold leading-none">2. Local Visit</p>
							<p class="text-sm text-muted-foreground font-medium mt-2">
								Visit any partner lab or request certified home collection.
							</p>
						</div>

						<div class="relative pl-12 group">
							<div
								class="absolute left-3 top-1 w-4 h-4 rounded-full bg-primary/30 border-4 border-background group-hover:scale-125 transition-transform"
							></div>
							<p class="text-base font-bold leading-none">3. Digital Result</p>
							<p class="text-sm text-muted-foreground font-medium mt-2">
								Results and AI-powered insights uploaded directly to your safe vault.
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>

<UploadResultDialog bind:open={uploadOpen} />
<AddCustomTestDialog bind:open={customOpen} />
<BookLabDialog bind:open={bookingOpen} bind:selectedTest />
<FindLabDialog bind:open={findLabOpen} />
<EditLabTestDialog bind:open={editOpen} bind:test={editingTest} />

<style>
	:global(body) {
		overflow-x: hidden;
		width: 100vw;
	}
</style>
