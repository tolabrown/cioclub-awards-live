<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Brain,
		FileText,
		Calendar,
		ArrowRight,
		Sparkles,
		ChevronLeft,
		Search,
		TrendingUp
	} from '@lucide/svelte';
	import { format } from 'date-fns';
	import { fade, fly, slide } from 'svelte/transition';

	let { data } = $props();
	const results = $derived(data.results);

	let searchQuery = $state('');

	const filteredResults = $derived(() => {
		if (!searchQuery) return results;
		return results.filter((r) =>
			r.order.testType.toLowerCase().includes(searchQuery.toLowerCase())
		);
	});

	function getScoreColor(s: number | null | undefined) {
		if (s === null || s === undefined) return 'text-slate-400 bg-slate-400/10';
		if (s >= 80) return 'text-emerald-500 bg-emerald-500/10';
		if (s >= 60) return 'text-amber-500 bg-amber-500/10';
		return 'text-red-500 bg-red-500/10';
	}
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
	<div
		class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-20"
	>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div class="space-y-1">
					<a
						href="/lab-tests"
						class="text-xs font-bold text-muted-foreground capitalize tracking-widest hover:text-primary transition-colors flex items-center gap-2 mb-2"
					>
						<ChevronLeft class="w-4 h-4" />
						Back to Laboratory
					</a>
					<h1
						class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3"
					>
						<Brain class="w-8 h-8 text-primary" />
						Health Analysis Archive
					</h1>
				</div>

				<div class="relative max-w-md w-full">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search your reports..."
						class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
					/>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
		{#if results.length === 0}
			<div
				class="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm"
				in:fade
			>
				<div class="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center">
					<Sparkles class="w-12 h-12 text-primary/40" />
				</div>
				<div class="space-y-2">
					<h3 class="text-2xl font-bold">No analyses found</h3>
					<p class="text-muted-foreground max-w-sm">
						Once you analyze your lab reports, they will appear here in your personal health
						archive.
					</p>
				</div>
				<Button href="/lab-tests" class="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
					Start First Analysis
				</Button>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each filteredResults() as result, i}
					<div in:fly={{ y: 20, delay: i * 50 }}>
						<Card
							class="group hover:border-primary/20 transition-all duration-300 rounded-xl overflow-hidden border-slate-200 dark:border-slate-800 h-full flex flex-col hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 bg-white dark:bg-slate-900 shadow-sm"
						>
							<div class="p-6 sm:p-8 flex-1 flex flex-col space-y-6">
								<div class="flex items-start justify-between">
									<div
										class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
									>
										<FileText class="w-6 h-6 text-primary" />
									</div>
									<div class="text-right">
										<div class="flex items-center gap-1.5 justify-end">
											<span
												class="text-2xl font-bold {getScoreColor(result.overallScore).split(
													' '
												)[0]}"
											>
												{result.overallScore ?? '--'}
											</span>
											<span
												class="text-sm font-bold text-muted-foreground capitalize tracking-widest"
												>/100</span
											>
										</div>
										<p
											class="text-[9px] font-bold text-muted-foreground capitalize tracking-widest"
										>
											Health Vitality
										</p>
									</div>
								</div>

								<div class="space-y-2">
									<h3
										class="text-xl font-bold group-hover:text-primary transition-colors leading-tight"
									>
										{result.order.testType}
									</h3>
									<div class="flex items-center gap-2 text-xs font-bold text-muted-foreground">
										<Calendar class="w-3.5 h-3.5" />
										{format(new Date(result.createdAt), 'MMMM dd, yyyy')}
									</div>
								</div>

								<div class="pt-4 mt-auto">
									<Button
										href="/lab-tests/results/{result.id}"
										class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-primary hover:text-white rounded-xl font-bold transition-all group/btn flex items-center justify-between px-6"
									>
										View Analysis
										<ArrowRight
											class="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
										/>
									</Button>
								</div>
							</div>
						</Card>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
