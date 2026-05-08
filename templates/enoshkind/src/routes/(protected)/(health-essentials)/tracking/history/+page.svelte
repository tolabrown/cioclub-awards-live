<script lang="ts">
	import {
		ArrowLeft,
		Activity,
		Heart,
		Weight,
		Droplets,
		Zap,
		LineChart,
		ChevronRight,
		Utensils
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { format, subDays, startOfDay, isSameDay } from 'date-fns';

	let { data } = $props();

	const history = $derived(data.trackingHistory || []);
	const mealLogs = $derived(data.mealLogs || []);
	const waterLogs = $derived(data.waterLogs || []);

	// Generate last 7 days list
	const days = Array.from({ length: 7 }, (_, i) => {
		const date = startOfDay(subDays(new Date(), i));
		const tracking = history.find((h: any) => isSameDay(new Date(h.trackingDate), date));
		const meals = mealLogs.filter((m: any) => isSameDay(new Date(m.createdAt), date));
		const water = waterLogs.filter((w: any) => isSameDay(new Date(w.createdAt), date));

		const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
		const totalWater = water.reduce((sum, w) => sum + (w.amount || 0), 0);

		return {
			date,
			tracking,
			meals,
			totalCalories,
			totalWater
		};
	});
</script>

<div class="space-y-10 max-w-7xl mx-auto pb-20">
	<!-- Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
		<div class="space-y-4">
			<a
				href="/dashboard"
				class="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
			>
				<div class="p-2 rounded-full border border-border group-hover:bg-muted transition-colors">
					<ArrowLeft class="w-4 h-4" />
				</div>
				<span class="text-sm font-bold">Back to Dashboard</span>
			</a>
			<h1 class="text-4xl font-bold tracking-tight">Health History</h1>
			<p class="text-muted-foreground font-medium">
				Complete overview of your wellness journey over the last 7 days.
			</p>
		</div>
		<div
			class="flex items-center gap-4 bg-card/40 backdrop-blur-md p-4 border border-border/40 rounded-2xl"
		>
			<div class="p-3 bg-primary/10 rounded-xl">
				<LineChart class="w-8 h-8 text-primary" />
			</div>
			<div>
				<p class="text-xs font-bold text-muted-foreground capitalize tracking-widest">
					Profile Sync
				</p>
				<p class="text-xl font-bold">100% Active</p>
			</div>
		</div>
	</div>

	<!-- Weekly Grid -->
	<div class="space-y-6">
		{#each days as day}
			<Card.Root
				class="bg-card/40 backdrop-blur-sm border-border/40 overflow-hidden hover:bg-card/60 transition-colors group"
			>
				<Card.Content class="p-0">
					<div class="flex flex-col lg:flex-row">
						<!-- Day Column -->
						<div
							class="lg:w-48 p-6 bg-muted/30 border-b lg:border-b-0 lg:border-r border-border/40 flex flex-col justify-center items-center text-center"
						>
							<p class="text-xs font-bold text-muted-foreground capitalize tracking-[0.2em] mb-1">
								{format(day.date, 'EEEE')}
							</p>
							<p class="text-3xl font-bold">{format(day.date, 'dd')}</p>
							<p class="text-sm font-bold text-primary capitalize mt-1">
								{format(day.date, 'MMM yyyy')}
							</p>
						</div>

						<!-- Metrics View -->
						<div class="flex-1 p-6 grid grid-cols-2 md:grid-cols-4 gap-8">
							<div class="space-y-2">
								<div class="flex items-center gap-2 text-muted-foreground">
									<Heart class="w-4 h-4 text-red-500" />
									<span class="text-sm font-bold capitalize tracking-wider">BP</span>
								</div>
								<p class="text-xl font-bold">
									{day.tracking?.systolic || '--'}/{day.tracking?.diastolic || '--'}
								</p>
								<p class="text-sm text-muted-foreground font-bold">mmHg</p>
							</div>

							<div class="space-y-2">
								<div class="flex items-center gap-2 text-muted-foreground">
									<Weight class="w-4 h-4 text-blue-500" />
									<span class="text-sm font-bold capitalize tracking-wider">Weight</span>
								</div>
								<p class="text-xl font-bold">{day.tracking?.weight || '--'}</p>
								<p class="text-sm text-muted-foreground font-bold">kg</p>
							</div>

							<div class="space-y-2">
								<div class="flex items-center gap-2 text-muted-foreground">
									<Utensils class="w-4 h-4 text-green-500" />
									<span class="text-sm font-bold capitalize tracking-wider">Nutrition</span>
								</div>
								<p class="text-xl font-bold">{day.totalCalories || '0'}</p>
								<p class="text-sm text-muted-foreground font-bold">kcal total</p>
							</div>

							<div class="space-y-2">
								<div class="flex items-center gap-2 text-muted-foreground">
									<Droplets class="w-4 h-4 text-cyan-500" />
									<span class="text-sm font-bold capitalize tracking-wider">Hydration</span>
								</div>
								<p class="text-xl font-bold">{day.totalWater / 1000 || '0'}L</p>
								<p class="text-sm text-muted-foreground font-bold">
									{day.totalWater / 250 || '0'} / 8 Glasses
								</p>
							</div>
						</div>

						<!-- Action Column -->
						<div
							class="p-6 border-t lg:border-t-0 lg:border-l border-border/40 flex items-center justify-center"
						>
							<Button
								variant="outline"
								size="sm"
								class="group-hover:bg-primary group-hover:text-white transition-all font-bold"
								href="/telemedicine"
							>
								<ChevronRight class="ml-2 w-4 h-4" />
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex items-center gap-8">
		<div class="p-4 bg-primary/20 rounded-2xl">
			<Activity class="w-12 h-12 text-primary" />
		</div>
		<div class="space-y-2">
			<h3 class="text-xl font-bold">Insight Summary</h3>
			<p class="text-sm text-muted-foreground leading-relaxed italic">
				"Your blood pressure has shown a stable trend over the last 3 days. Your consistency in
				logging meals is improving your health assessment accuracy. Keep maintaining the current
				activity levels!"
			</p>
		</div>
	</div>
</div>
