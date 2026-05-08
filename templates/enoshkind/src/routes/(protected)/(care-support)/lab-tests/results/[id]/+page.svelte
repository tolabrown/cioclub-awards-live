<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Brain,
		CheckCircle2,
		AlertTriangle,
		Info,
		Sparkles,
		ChevronLeft,
		ArrowUpRight,
		Activity,
		ShieldCheck,
		FileText,
		Download,
		Share2,
		ChevronRight
	} from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
	import { toast } from 'svelte-sonner';
	import SvelteMarkdown from 'svelte-markdown';

	let { data } = $props();
	const result = $derived(data.result);
	const order = $derived(result.order);

	const metrics = $derived(() => {
		try {
			if (!result?.metrics) return [];
			return typeof result.metrics === 'string' ? JSON.parse(result.metrics) : result.metrics;
		} catch (e) {
			console.error('Error parsing metrics:', e);
			return [];
		}
	});

	const recommendations = $derived(() => {
		try {
			if (!result?.recommendations) return [];
			return typeof result.recommendations === 'string'
				? JSON.parse(result.recommendations)
				: result.recommendations;
		} catch (e) {
			console.error('Error parsing recommendations:', e);
			return [];
		}
	});

	const score = $derived(result?.overallScore ?? 0);

	function handleShare() {
		const url = window.location.href;
		navigator.clipboard.writeText(url);
		toast.success('Report link copied to clipboard!');
	}

	function handlePrint() {
		window.print();
	}

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

<div class="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
	<!-- Hero Header Wrapper -->
	<div
		class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden rounded-lg"
	>
		<!-- Animated Background Accents -->
		<div
			class="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
		></div>
		<div
			class="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"
		></div>

		<div class="max-w-7xl mx-auto p-4 relative z-10">
			<!-- Breadcrumbs -->
			<div
				class="mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground capitalize tracking-widest"
			>
				<a
					href="/lab-tests"
					class="hover:text-primary transition-colors flex items-center gap-1.5 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					<ChevronLeft class="w-4 h-4" />
					Laboratory
				</a>
				<span>/</span>
				<span class="text-slate-400">Analysis No. {result.id.slice(0, 8)}</span>
			</div>

			<div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
				<div class="space-y-4 max-w-3xl">
					<div class="flex items-center gap-3">
						<Badge
							class="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20  tracking-widest px-3 py-1"
							>AI-POWERED INSIGHTS</Badge
						>
						<Badge
							variant="outline"
							class="font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
							>Report ID: {order.id.slice(0, 8)}</Badge
						>
					</div>
					<h1
						class="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
					>
						Detailed Health <span
							class="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent"
							>Analysis Report</span
						>
					</h1>
					<p class="text-lg sm:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
						Our medical AI has processed your <strong>{order.testType}</strong> results. Here is your
						comprehensive clinical decoding.
					</p>

					<div class="flex flex-wrap items-center gap-4 pt-4">
						<Button
							class="bg-primary hover:bg-primary/90 rounded-2xl px-8  shadow-lg shadow-primary/20 group"
							onclick={() => window.open(order.pdfUrl as string, '_blank')}
						>
							<FileText class="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
							View Original Report
						</Button>
						<Button
							variant="outline"
							class="rounded-2xl px-6  border-slate-200 dark:border-slate-700"
							onclick={handleShare}
						>
							<Share2 class="mr-2 w-4 h-4" />
							Share with Doctor
						</Button>
					</div>
				</div>

				<!-- Circular Progress Score -->
				<div
					class="shrink-0 flex items-center gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none"
				>
					<div class="text-right">
						<p class="text-xs text-muted-foreground capitalize tracking-[0.25em] mb-2 opacity-60">
							Health Vitality
						</p>
						<div class="flex items-baseline gap-1">
							<span class="text-6xl sm:text-7xl {getScoreColor(score).split(' ')[0]}">{score}</span>
							<span class="text-xl font-bold text-muted-foreground">/100</span>
						</div>
					</div>
					<div
						class="w-24 sm:w-32 h-24 sm:h-32 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-3 shadow-sm relative group overflow-hidden"
					>
						<div
							class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"
						></div>
						<svg class="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 36 36">
							<path
								d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none"
								class="stroke-slate-100 dark:stroke-slate-800"
								stroke-width="3"
							/>
							<path
								d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none"
								class="{getScoreColor(score).split(' ')[0]} stroke-current"
								stroke-dasharray="{score}, 100"
								stroke-width="3"
								stroke-linecap="round"
							/>
						</svg>
						<Activity class="absolute w-8 h-8 {getScoreColor(score).split(' ')[0]} opacity-10" />
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-7xl mx-auto mt-16 sm:mt-24 space-y-16 sm:space-y-24">
		<!-- Insights Grid -->
		<div class="">
			<!-- Key Metrics Section -->
			<div class="space-y-10">
				<div class="space-y-2">
					<h2
						class="text-xs text-muted-foreground capitalize tracking-[0.3em] flex items-center gap-4"
					>
						<span class="w-12 h-px bg-primary/30"></span>
						Clinical Benchmarks
					</h2>
					<p class="text-2xl font-bold text-slate-900 dark:text-white">
						Quantitative Metric Breakdown
					</p>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-6">
					{#if metrics().length > 0}
						{#each metrics() as metric}
							<div
								class="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-2xl hover:border-primary/20 hover:-translate-y-1 duration-300 group"
							>
								<div class="flex items-center justify-between mb-6">
									<div class="space-y-1">
										<p
											class=" text-slate-800 dark:text-slate-200 text-lg group-hover:text-primary transition-colors"
										>
											{metric.label}
										</p>
										<p class="text-sm text-muted-foreground capitalize tracking-widest opacity-60">
											Status Indicator
										</p>
									</div>
									<Badge
										class="{getScoreColor(
											metric.score
										)} border-none text-sm capitalize tracking-widest px-4 py-1.5 rounded-xl"
										>{metric.status}</Badge
									>
								</div>

								<div
									class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-6"
								>
									<div class="flex items-baseline gap-2">
										<span class="text-4xl sm:text-5xl text-slate-900 dark:text-white"
											>{metric.value}</span
										>
										<span
											class="text-sm font-bold text-muted-foreground capitalize tracking-tighter"
											>{metric.unit}</span
										>
									</div>
									<div
										class="text-right bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700"
									>
										<p class="text-[9px] text-muted-foreground capitalize tracking-widest mb-0.5">
											Reference Range
										</p>
										<p class="font-bold text-slate-700 dark:text-slate-300">{metric.range}</p>
									</div>
								</div>

								<div class="space-y-3">
									<div
										class="flex items-center justify-between text-sm text-muted-foreground capitalize"
									>
										<span>Relative Standing</span>
										<span>{metric.score}%</span>
									</div>
									<Progress
										value={metric.score}
										class="h-2.5 {getProgressColor(metric.score)} rounded-full shadow-inner"
									/>
								</div>
							</div>
						{/each}
					{:else if result.rawAnalysis}
						<div
							class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm prose dark:prose-invert max-w-none col-span-full"
						>
							<div class="flex items-center gap-3 mb-8">
								<div class="p-2 bg-primary/10 rounded-lg">
									<Info class="w-5 h-5 text-primary" />
								</div>
								<span class="text-sm font-bold text-muted-foreground capitalize tracking-widest"
									>Medical Transcription</span
								>
							</div>
							<SvelteMarkdown source={result.rawAnalysis} />
						</div>
					{:else}
						<div
							class="bg-white dark:bg-slate-900 p-12 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4 col-span-full"
						>
							<div
								class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center"
							>
								<Activity class="w-8 h-8 text-slate-300" />
							</div>
							<p class="text-muted-foreground font-medium">Digital processing in progress...</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- AI Recommendations Section -->
			{#if recommendations().length > 0}
				<div class="space-y-10">
					<div class="space-y-2">
						<h2
							class="text-xs text-muted-foreground capitalize tracking-[0.3em] flex items-center gap-4"
						>
							<span class="w-12 h-px bg-emerald-500/30"></span>
							Intelligent Insights
						</h2>
						<p class="text-2xl font-bold text-slate-900 dark:text-white">
							Qualitative Action Roadmap
						</p>
					</div>

					<div class="space-y-8">
						{#each recommendations() as rec, i}
							<div
								class="bg-linear-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-8 sm:p-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
							>
								<div
									class="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"
								></div>

								<div class="flex flex-col sm:flex-row gap-8 relative z-10">
									<div
										class="shrink-0 w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
									>
										{#if rec.type === 'action'}
											<Sparkles class="w-8 h-8" />
										{:else if rec.type === 'warning'}
											<AlertTriangle class="w-8 h-8 text-amber-500" />
										{:else}
											<ShieldCheck class="w-8 h-8 text-emerald-500" />
										{/if}
									</div>
									<div class="space-y-4 pt-1">
										<div class="space-y-1">
											<Badge
												variant="secondary"
												class="text-sm p-0  capitalize tracking-[0.2em] text-primary opacity-60"
												>{rec.type}</Badge
											>
											<h3 class="text-2xl text-slate-900 dark:text-white leading-tight">
												{rec.title}
											</h3>
										</div>
										<p
											class="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed"
										>
											{rec.description}
										</p>
										<Button
											variant="link"
											class="p-0 h-auto text-primary  hover:translate-x-1 transition-transform"
											onclick={() =>
												toast.info('Deep dive feature coming soon for enhanced medical insights.')}
										>
											Deep Dive Insight <ChevronRight class="ml-1 w-4 h-4" />
										</Button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Conclusion Card -->
		<div
			class="bg-primary shadow-2xl shadow-primary/30 rounded-[3rem] p-4 text-white relative overflow-hidden"
		>
			<!-- Abstract Background Patterns -->
			<div class="absolute inset-0 opacity-10 pointer-events-none">
				<div
					class="absolute top-0 left-0 w-64 h-64 border-8 border-white rounded-full -translate-x-1/2 -translate-y-1/2"
				></div>
				<div
					class="absolute bottom-0 right-0 w-96 h-96 border-[12px] border-white rounded-full translate-x-1/3 translate-y-1/3"
				></div>
			</div>

			<div class="relative z-10 flex flex-col xl:flex-row items-center gap-12 sm:gap-16">
				<div
					class="shrink-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/20 backdrop-blur-3xl rounded-xl border border-white/30 flex items-center justify-center shadow-inner"
				>
					<Brain class="w-12 sm:w-16 h-12 sm:h-16 text-white" />
				</div>
				<div class="text-center xl:text-left space-y-6 flex-1">
					<div class="space-y-4">
						<h3 class="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
							Ready to act on <span class="text-emerald-300">these insights?</span>
						</h3>
						<p
							class="text-lg sm:text-xl text-primary-foreground/90 font-semibold max-w-4xl leading-relaxed italic opacity-80 decoration-emerald-400 group-hover:not-italic transition-all"
						>
							"Medicine has traditionally been reactive. With this AI analysis, you are moving into
							proactive health sovereignty. Every choice you make from today data-driven."
						</p>
					</div>

					<div
						class="bg-black/10 backdrop-blur-md rounded-2xl p-6 border border-white/5 flex items-start gap-4 max-w-3xl mx-auto xl:mx-0"
					>
						<Info class="w-6 h-6 text-emerald-300 shrink-0 mt-0.5" />
						<p class="text-xs sm:text-sm font-bold leading-relaxed text-white/70">
							<strong>CLINICAL NOTE:</strong> This summary decodes standard lab parameters using global
							health references. It is not a final diagnosis. Always consult with a registered medical
							practitioner to integrate these results with your full clinical history.
						</p>
					</div>
				</div>
				<div class="flex flex-col gap-4 w-full xl:w-auto">
					<Button
						class="bg-white text-primary hover:bg-slate-100 transition-all shadow-2xl group active:scale-95"
						href="/telemedicine"
					>
						Consult Specialist
						<ArrowUpRight
							class="ml-2 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
						/>
					</Button>
					<Button
						variant="outline"
						class="border-white/20 hover:bg-white/10 text-white transition-all  active:scale-95"
						onclick={handlePrint}
					>
						<Download class="mr-2 w-5 h-5" />
						Export PDF Summary
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>

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

	/* Smooth scrolling and premium feel */
	:global(html) {
		scroll-behavior: smooth;
	}
</style>
