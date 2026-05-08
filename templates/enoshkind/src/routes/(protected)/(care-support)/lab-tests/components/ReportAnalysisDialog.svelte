<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Brain,
		CheckCircle2,
		AlertTriangle,
		Info,
		Sparkles,
		ChevronRight,
		ArrowUpRight,
		Activity,
		ShieldCheck
	} from '@lucide/svelte';
	import { fade, fly, scale } from 'svelte/transition';

	let { open = $bindable(false), result } = $props<{
		open: boolean;
		result: any;
	}>();

	const metrics = $derived(result?.metrics ? JSON.parse(result.metrics) : []);
	const recommendations = $derived(
		result?.recommendations ? JSON.parse(result.recommendations) : []
	);
	const score = $derived(result?.overallScore || 0);

	function getScoreColor(s: number) {
		if (s >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
		if (s >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
		return 'text-red-500 bg-red-500/10 border-red-500/20';
	}

	function getProgressColor(s: number) {
		if (s >= 80) return 'bg-emerald-500';
		if (s >= 60) return 'bg-amber-500';
		return 'bg-red-500';
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="max-w-3xl h-[90vh] sm:h-auto overflow-y-auto border-none bg-slate-50 dark:bg-slate-950 p-0 rounded-xl shadow-2xl"
	>
		{#if result}
			<div class="relative overflow-hidden">
				<!-- Animated Background Accents -->
				<div
					class="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"
				></div>
				<div
					class="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"
				></div>

				<!-- Header Section -->
				<div
					class="bg-white dark:bg-slate-900 px-6 sm:px-10 py-10 border-b border-slate-200 dark:border-slate-800 rounded-t-[2.5rem] relative z-10"
				>
					<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
						<div class="space-y-3">
							<Badge
								class="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-bold tracking-widest px-3 py-1"
								>AI ANALYSIS ENGINE</Badge
							>
							<h2
								class="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white"
							>
								Health Report Analysis
							</h2>
							<p class="text-muted-foreground font-medium">
								Deep-dive assessment based on your clinical data.
							</p>
						</div>
						<div
							class="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner"
						>
							<div class="text-right">
								<p class="text-sm font-bold text-muted-foreground capitalize tracking-[0.2em] mb-1">
									Health Score
								</p>
								<div class="flex items-baseline gap-1">
									<span class="text-4xl font-bold {getScoreColor(score).split(' ')[0]}"
										>{score}</span
									>
									<span class="text-lg font-bold text-muted-foreground">/100</span>
								</div>
							</div>
							<div
								class="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2 shadow-sm"
							>
								<svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
									<path
										d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
										fill="none"
										class="stroke-slate-100 dark:stroke-slate-800"
										stroke-width="4"
									/>
									<path
										d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
										fill="none"
										class="{getScoreColor(score).split(' ')[0]} stroke-current"
										stroke-dasharray="{score}, 100"
										stroke-width="4"
										stroke-linecap="round"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				<div class="p-6 sm:p-10 space-y-10 relative z-10">
					<!-- Insights Grid -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<!-- Key Metrics -->
						<div class="space-y-6">
							<h3
								class="text-xs font-bold text-muted-foreground capitalize tracking-[0.25em] flex items-center gap-3"
							>
								<Activity class="w-5 h-5 text-primary" />
								Clinical Metrics
							</h3>
							<div class="space-y-4">
								{#each metrics as metric}
									<div
										class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group"
									>
										<div class="flex items-center justify-between mb-3">
											<p
												class="font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors"
											>
												{metric.label}
											</p>
											<Badge
												class="{getScoreColor(
													metric.score
												)} border-none text-[9px] font-bold capitalize tracking-widest"
												>{metric.status}</Badge
											>
										</div>
										<div class="flex items-end justify-between mb-2">
											<span class="text-2xl font-bold"
												>{metric.value}
												<span class="text-xs font-medium text-muted-foreground">{metric.unit}</span
												></span
											>
											<span class="text-sm font-bold text-muted-foreground"
												>Range: {metric.range}</span
											>
										</div>
										<Progress value={metric.score} class="h-1.5 {getProgressColor(metric.score)}" />
									</div>
								{/each}
							</div>
						</div>

						<!-- AI Recommendations -->
						<div class="space-y-6">
							<h3
								class="text-xs font-bold text-muted-foreground capitalize tracking-[0.25em] flex items-center gap-3"
							>
								<Brain class="w-5 h-5 text-primary" />
								AI Insights
							</h3>
							<div class="space-y-4">
								{#each recommendations as rec, i}
									<div
										class="bg-linear-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
									>
										<div
											class="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"
										></div>
										<div class="flex gap-4">
											<div
												class="shrink-0 w-10 h-10 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary"
											>
												{#if rec.type === 'action'}
													<Sparkles class="w-5 h-5" />
												{:else if rec.type === 'warning'}
													<AlertTriangle class="w-5 h-5" />
												{:else}
													<ShieldCheck class="w-5 h-5" />
												{/if}
											</div>
											<div class="space-y-2">
												<p class="font-bold text-slate-800 dark:text-slate-100 leading-tight">
													{rec.title}
												</p>
												<p class="text-sm text-muted-foreground font-medium leading-relaxed">
													{rec.description}
												</p>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>

					<!-- Conclusion Message -->
					<div
						class="bg-primary/5 rounded-xl p-8 border border-primary/20 flex flex-col md:flex-row items-center gap-6"
					>
						<div
							class="shrink-0 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-primary/10"
						>
							<Info class="w-8 h-8 text-primary" />
						</div>
						<div class="text-center md:text-left space-y-1">
							<p class="text-lg font-bold text-slate-900 dark:text-white">
								Standard Clinical Disclaimer
							</p>
							<p class="text-sm text-muted-foreground leading-relaxed">
								This AI-powered summary is for educational purposes only and should not replace
								clinical judgment. Please discuss these insights with your physician before making
								medical decisions.
							</p>
						</div>
						<Button
							class="w-full md:w-auto ml-auto bg-primary hover:bg-primary/90 rounded-2xl px-8 font-bold shadow-lg shadow-primary/20 group"
						>
							Book Specialist Consultation
							<ArrowUpRight
								class="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
							/>
						</Button>
					</div>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<style>
	:global(.bg-emerald-500) {
		background-color: #10b981 !important;
	}
	:global(.bg-amber-500) {
		background-color: #f59e0b !important;
	}
	:global(.bg-red-500) {
		background-color: #ef4444 !important;
	}
</style>
