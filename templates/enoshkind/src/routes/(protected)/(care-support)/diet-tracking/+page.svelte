<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import LogDialog from '../../(health-essentials)/dashboard/components/LogDialog.svelte';
	import AnalyzeMealDialog from '../../(health-essentials)/dashboard/components/AnalyzeMealDialog.svelte';
	import {
		Camera,
		BrainCircuit,
		Waves,
		CheckCircle2,
		AlertCircle,
		Info,
		ChevronRight,
		Clock,
		Plus,
		Utensils,
		Apple,
		Beef,
		Flame
	} from '@lucide/svelte';
	import { format } from 'date-fns';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	const mealLog = $derived(data.mealLogs || []);
	const dailyStats = $derived(
		data.dailyStats || {
			calories: { current: 0, target: 2000 },
			protein: { current: 0, target: 120 },
			carbs: { current: 0, target: 200 },
			fats: { current: 0, target: 70 },
			hydration: { current: 0, target: 8 }
		}
	);

	let logOpen = $state(false);
	let logType = $state('Meal');

	function handleLog(type: string) {
		logType = type;
		logOpen = true;
	}

	async function handleSuccess() {
		await invalidateAll();
	}

	let analyzeOpen = $state(false);
	let selectedMeal = $state<any>(null);

	function handleAnalyze(meal: any) {
		selectedMeal = meal;
		analyzeOpen = true;
	}
</script>

<div class="space-y-8 max-w-7xl mx-auto pb-12">
	<!-- Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Dietitian Support</h1>
			<p class="text-muted-foreground">
				Monitor your nutrition and receive expert medical feedback.
			</p>
		</div>
		<Button
			onclick={() => handleLog('Meal')}
			class="bg-primary hover:bg-primary/90 px-6 shadow-md shadow-primary/20"
		>
			<Plus class="mr-2 h-4 w-4" />
			Log New Meal
		</Button>
	</div>

	<!-- Stats Overview -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<Card.Root class="bg-card/60 backdrop-blur-md border-border/40 overflow-hidden relative group">
			<div
				class="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
			></div>
			<Card.Content class="p-6 flex items-center justify-between relative">
				<div class="space-y-2">
					<p class="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
						Daily Hydration
					</p>
					<div class="flex items-baseline gap-1">
						<h3 class="text-4xl font-bold">{dailyStats.hydration.current.toFixed(1)}</h3>
						<span class="text-sm font-bold text-muted-foreground italic"
							>/ {dailyStats.hydration.target}.0L</span
						>
					</div>
					<div class="w-48 h-2 bg-cyan-500/10 rounded-full overflow-hidden">
						<div
							class="h-full bg-cyan-500 transition-all duration-1000"
							style="width: {Math.min(
								(dailyStats.hydration.current / dailyStats.hydration.target) * 100,
								100
							)}%"
						></div>
					</div>
				</div>
				<Button
					size="icon"
					class="w-14 h-14 bg-cyan-500/10 rounded-xl cursor-pointer hover:bg-cyan-500/20 transition-all group/btn"
					onclick={() => handleLog('Water')}
				>
					<Waves class="w-7 h-7 text-cyan-500 group-hover/btn:scale-110 transition-transform" />
				</Button>
			</Card.Content>
		</Card.Root>

		<Card.Root class="bg-card/60 backdrop-blur-md border-border/40 overflow-hidden relative group">
			<Card.Content class="p-6 flex items-center justify-between">
				<div class="space-y-2">
					<p class="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
						Meal Consistency
					</p>
					<div class="flex items-baseline gap-1">
						<h3 class="text-4xl font-bold">{mealLog.length}</h3>
						<span class="text-sm font-bold text-muted-foreground italic">meals today</span>
					</div>
					<p class="text-xs text-muted-foreground font-medium">
						Tracking regularly helps your dietitian provide better care.
					</p>
				</div>
				<div class="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center">
					<CheckCircle2 class="w-7 h-7 text-emerald-500" />
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Main Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Meal Log -->
		<div class="lg:col-span-2 space-y-4">
			<h2 class="text-xl font-semibold flex items-center gap-2">
				<Clock class="w-5 h-5 text-primary" />
				Today's Meal Log
			</h2>

			<div class="space-y-3">
				{#each mealLog as meal}
					<Card.Root
						class="hover:bg-card/80 transition-colors border-border/40 overflow-hidden bg-card/40 backdrop-blur-sm"
					>
						<Card.Content class="p-4">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-5">
									<div
										class="w-20 h-20 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/40"
									>
										{#if meal.image}
											<img
												src={meal.image.url}
												alt={meal.name}
												class="w-full h-full object-cover"
											/>
										{:else}
											<div class="bg-primary/5 w-full h-full flex items-center justify-center">
												{#if meal.type === 'Breakfast'}
													<Apple class="w-8 h-8 text-primary/40" />
												{:else if meal.type === 'Lunch'}
													<Beef class="w-8 h-8 text-primary/40" />
												{:else}
													<Utensils class="w-8 h-8 text-primary/40" />
												{/if}
											</div>
										{/if}
									</div>
									<div>
										<div class="flex items-center gap-2 mb-1">
											<Badge
												variant="outline"
												class="text-[10px] font-bold uppercase tracking-widest py-0 px-2 h-5 border-primary/20 bg-primary/5 text-primary"
											>
												{meal.type}
											</Badge>
											<span
												class="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"
											>
												<Clock class="w-3 h-3" />
												{format(new Date(meal.createdAt), 'hh:mm a')}
											</span>
										</div>
										<h3 class="font-bold text-xl tracking-tight">{meal.name}</h3>
										{#if meal.contents && meal.contents.length > 0}
											<div class="flex flex-wrap gap-1 mt-2">
												{#each meal.contents as item}
													<Badge
														variant="outline"
														class="text-[10px] py-0 px-2 bg-muted/30 text-muted-foreground border-border/40 font-bold"
													>
														{item}
													</Badge>
												{/each}
											</div>
										{/if}
										{#if meal.accuracyConfirmed}
											<div
												class="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2"
											>
												<CheckCircle2 class="w-3 h-3" />
												Dietitian Approved
											</div>
										{:else}
											<p class="text-[11px] text-muted-foreground font-bold italic mt-2">
												Pending Dietitian Review
											</p>
										{/if}
									</div>
								</div>
								<div class="flex flex-col items-end gap-1.5">
									{#if meal.accuracyConfirmed}
										<Badge
											class="bg-emerald-500/10 text-emerald-500 border-none text-sm capitalize tracking-tighter"
										>
											Verified Entry
										</Badge>
										<div class="flex items-center gap-1.5 text-sm font-bold text-green-500">
											<CheckCircle2 class="w-3 h-3" />
											Optimal Choice
										</div>
									{:else}
										<Badge
											class="bg-primary/10 text-primary border-none text-sm capitalize tracking-tighter hover:bg-primary/20"
										>
											Manual Log
										</Badge>
									{/if}
									<Button
										variant="outline"
										size="sm"
										class="mt-1 h-8 rounded-xl font-bold italic border-primary/20 text-primary hover:bg-primary/5 gap-2"
										onclick={() => handleAnalyze(meal)}
									>
										<BrainCircuit class="w-3.5 h-3.5" />
										Analyze
									</Button>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				{:else}
					<div class="py-12 text-center border-2 border-dashed border-border/40 rounded-xl">
						<Utensils class="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
						<p class="text-muted-foreground font-bold italic">No meals logged for today yet.</p>
						<Button
							variant="link"
							class="text-primary font-bold mt-2"
							onclick={() => handleLog('Meal')}
						>
							Start Logging
						</Button>
					</div>
				{/each}
			</div>

			<Button
				variant="ghost"
				class="w-full text-muted-foreground hover:text-primary transition-colors text-xs font-bold capitalize tracking-widest gap-2"
				href="/tracking/history"
			>
				View Full Weekly History <ChevronRight class="w-4 h-4" />
			</Button>
		</div>

		<!-- Dietitian Advice -->
		<div class="space-y-6">
			<Card.Root
				class="bg-linear-to-br from-primary/10 via-background/0 to-primary/5 border-primary/20 overflow-hidden"
			>
				<Card.Header>
					<Card.Title class=" flex items-center gap-2">
						<Info class="w-5 h-5 text-primary" />
						Expert Tip of the Day
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div
						class="p-4 bg-background/50 rounded-xl border border-primary/10 italic text-sm leading-relaxed text-foreground/90"
					>
						"Replacing refined carbohydrates with quinoa or brown rice can help stabilize blood
						glucose levels throughout the day for patients with Type 2 Diabetes."
					</div>
					<div class="flex items-center gap-3 pt-2">
						<Avatar.Root class="w-10 h-10 border border-primary/20">
							<Avatar.Fallback class="bg-primary/5 text-primary font-bold">CD</Avatar.Fallback>
						</Avatar.Root>
						<div>
							<p class="text-xs font-bold">Our Clinical Dietitian</p>
							<p class="text-sm text-muted-foreground capitalize font-bold tracking-tighter">
								Clinical Dietitian
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="bg-card/40 border-border/40">
				<Card.Header>
					<Card.Title class="">Health Alert</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex gap-3 text-amber-500">
						<AlertCircle class="w-5 h-5 shrink-0" />
						<p class="text-sm font-medium leading-relaxed">
							Your sodium intake is nearing your daily limit. Try to avoid processed snacks for the
							remainder of the day.
						</p>
					</div>
					<Button
						variant="outline"
						class="w-full mt-4 border-amber-500/20 text-amber-600 hover:bg-amber-500/5 hover:text-amber-700 font-bold"
						onclick={() =>
							toast.info('Low-sodium dietary options feature coming soon in the next update!')}
					>
						View Low-Sodium Options
					</Button>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>

<LogDialog bind:open={logOpen} type={logType} onSuccess={handleSuccess} />

{#if selectedMeal}
	<AnalyzeMealDialog bind:open={analyzeOpen} meal={selectedMeal} onSuccess={handleSuccess} />
{/if}
