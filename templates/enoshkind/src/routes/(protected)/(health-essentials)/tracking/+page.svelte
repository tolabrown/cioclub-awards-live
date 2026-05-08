<script lang="ts">
	import {
		ArrowLeft,
		Heart,
		Activity,
		Weight,
		Droplets,
		Zap,
		Smile,
		Save,
		Calendar,
		LineChart,
		Beaker,
		Sparkles,
		ChevronRight,
		Info,
		CheckCircle2,
		AlertCircle,
		Loader2
	} from '@lucide/svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Slider } from '$lib/components/ui/slider';
	import { Button } from '$lib/components/ui/button';
	import * as ScrollArea from '$lib/components/ui/scroll-area';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	// Tab Management
	type Tab = 'vitals' | 'labs' | 'wellness';
	let activeTab = $state<Tab>('vitals');

	// Form State
	let loading = $state(false);
	let success = $state(false);
	let error = $state<string | null>(null);

	// Date format for datetime-local (YYYY-MM-DDThh:mm)
	const now = new Date();
	const offset = now.getTimezoneOffset() * 60000;
	const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);

	let trackingData = $state({
		trackingDate: localISOTime,
		// Vitals
		systolic: '',
		diastolic: '',
		heartRate: '',
		weight: '',
		// Labs
		bloodSugarFasting: '',
		bloodSugarRandom: '',
		hba1c: '',
		cholesterol: '',
		creatinine: '',
		egfr: '',
		// Wellness
		moodRating: '7',
		energyLevel: '7',
		notes: ''
	});

	async function handleSubmit() {
		loading = true;
		success = false;
		error = null;

		try {
			const res = await fetch('/api/health-tracking', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(trackingData)
			});

			const result = await res.json();
			if (result.status === 'success') {
				success = true;
				// Reset some fields if needed, or keep for user to review
			} else {
				error = result.message || 'Failed to save health data';
			}
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	const tabs: { id: Tab; label: string; icon: any }[] = [
		{ id: 'vitals', label: 'Vital Signs', icon: Heart },
		{ id: 'labs', label: 'Lab Results', icon: Beaker },
		{ id: 'wellness', label: 'Wellness', icon: Smile }
	];

	// Converters for Slider (string to number[])
	let moodValue = $state([parseInt(trackingData.moodRating)]);
	let energyValue = $state([parseInt(trackingData.energyLevel)]);

	$effect(() => {
		trackingData.moodRating = moodValue[0].toString();
	});
	$effect(() => {
		trackingData.energyLevel = energyValue[0].toString();
	});
</script>

<div class="w-full min-h-screen pb-20 animate-in overflow-x-hidden">
	<!-- Top Navigation -->
	<div class="max-w-7xl mx-auto">
		<div class="flex items-center justify-between mb-8">
			<a
				href="/dashboard"
				class="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
			>
				<div class="p-2 rounded-full border border-border group-hover:bg-muted transition-colors">
					<ArrowLeft class="w-4 h-4" />
				</div>
				<span class="text-sm font-bold">Back to Dashboard</span>
			</a>
		</div>

		<!-- Page Header -->
		<div class="mb-10">
			<h1 class="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
				Daily Health Tracking
			</h1>
			<p class="text-muted-foreground font-medium">
				Monitor your vitals and health metrics to stay on top of your journey.
			</p>
		</div>

		<!-- Date & Notification Card -->
		<div
			class="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 p-6 sm:p-8 text-primary-foreground mb-8 shadow-lg shadow-primary/20 group rounded-xl"
		>
			<div
				class="absolute top-0 right-0 -m-8 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-110"
			></div>
			<div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div class="flex items-start gap-4">
					<div class="p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg">
						<Calendar class="w-8 h-8 text-white" />
					</div>
					<div>
						<h2 class="text-xl sm:text-2xl font-bold mb-1">Session Data</h2>
						<p class="text-primary-foreground/80 text-sm font-medium max-w-md">
							Make sure to record your vitals at similar times each day for consistent insights.
						</p>
					</div>
				</div>

				<div class="shrink-0">
					<Label
						for="trackingDate"
						class="block text-xs font-bold tracking-widest text-white/70 mb-2 capitalize"
						>Recording Timestamp</Label
					>
					<div class="relative">
						<Input
							type="datetime-local"
							id="trackingDate"
							bind:value={trackingData.trackingDate}
							class="w-full sm:w-64 bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/30 text-primary-foreground font-bold focus:ring-primary-foreground/50 transition-all cursor-pointer"
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Tab Navigation using Shadcn Tabs -->
		<Tabs.Root bind:value={activeTab} class="w-full">
			<div class="sticky top-20 z-40 mb-8 w-full max-w-2xl mx-auto">
				<ScrollArea.Root class="w-full overflow-hidden shadow-sm">
					<Tabs.List
						class="inline-flex w-max min-w-full p-1 bg-muted/30 backdrop-blur-md border border-border/50 shadow-sm"
					>
						{#each tabs as tab}
							<Tabs.Trigger value={tab.id} class="whitespace-nowrap">
								<tab.icon class="w-4 h-4 mr-2" />
								{tab.label}
							</Tabs.Trigger>
						{/each}
					</Tabs.List>
					<ScrollArea.Scrollbar orientation="horizontal" class="h-1 mt-1" />
				</ScrollArea.Root>
			</div>

			<!-- Form Content -->
			<div class="max-w-4xl mx-auto space-y-8 pb-24">
				<Tabs.Content value="vitals">
					<div in:fly={{ y: 20, duration: 400 }} class="space-y-6">
						<div class="flex items-center gap-3 mb-2">
							<div class="p-2 bg-red-500/10 rounded-xl">
								<Heart class="w-6 h-6 text-red-500" />
							</div>
							<div>
								<h3 class="text-xl font-bold">Core Vital Signs</h3>
								<p class="text-sm text-muted-foreground font-medium">
									Essential daily measurements for cardiovascular health.
								</p>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<!-- Blood Pressure -->
							<div
								class="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow group"
							>
								<div class="flex items-center justify-between mb-4">
									<h4 class="text-sm font-bold capitalize tracking-widest text-muted-foreground">
										Blood Pressure (mmHg)
									</h4>
									{#if trackingData.systolic && trackingData.diastolic}
										<span
											class="text-sm font-bold bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20"
											>Normal</span
										>
									{/if}
								</div>
								<div class="flex items-center gap-4">
									<div class="flex-1 space-y-2">
										<Input
											type="number"
											placeholder="Sys (120)"
											bind:value={trackingData.systolic}
											class="w-full bg-muted/50 border-border/50 text-xl font-bold text-foreground focus:ring-primary/50 transition-all"
										/>
										<Label
											for="systolic"
											class="text-sm block text-center font-semibold text-muted-foreground capitalize"
											>SYSTOLIC</Label
										>
									</div>
									<div class="text-2xl font-bold text-muted-foreground">/</div>
									<div class="flex-1 space-y-2">
										<Input
											type="number"
											placeholder="Dia (80)"
											bind:value={trackingData.diastolic}
											class="w-full bg-muted/50 border-border/50 text-xl font-bold text-foreground focus:ring-primary/50 transition-all"
										/>
										<Label
											for="diastolic"
											class="text-sm block text-center font-semibold text-muted-foreground capitalize"
											>DIASTOLIC</Label
										>
									</div>
								</div>
							</div>

							<!-- Weight -->
							<div
								class="bg-card border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow rounded-xl"
							>
								<div class="flex items-center justify-between mb-4">
									<h4 class="text-sm font-bold capitalize tracking-widest text-muted-foreground">
										Weight (kg)
									</h4>
									<div
										class="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform"
									>
										<Weight class="w-4 h-4 text-primary" />
									</div>
								</div>
								<Input
									type="number"
									step="0.1"
									placeholder="75.0"
									bind:value={trackingData.weight}
									class="w-full bg-muted/50 border-border/50 rounded-xl text-2xl font-bold text-foreground focus:ring-primary/50 transition-all"
								/>
							</div>

							<!-- Heart Rate -->
							<div
								class="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow md:col-span-2"
							>
								<div class="flex items-center justify-between mb-4">
									<h4 class="text-sm font-bold capitalize tracking-widest text-muted-foreground">
										Heart Rate (bpm)
									</h4>
									<div class="p-2 bg-red-500/10 rounded-xl">
										<Activity class="w-4 h-4 text-red-500" />
									</div>
								</div>
								<div class="flex items-center gap-6">
									<Input
										type="number"
										placeholder="72"
										bind:value={trackingData.heartRate}
										class="w-full bg-muted/50 border-border/50 rounded-xl text-2xl font-bold text-foreground focus:ring-primary/50 transition-all"
									/>
									<div class="flex-1 text-sm font-medium text-muted-foreground italic">
										Resting heart rate is best measured in the morning before any caffeine.
									</div>
								</div>
							</div>
						</div>
					</div>
				</Tabs.Content>

				<Tabs.Content value="labs">
					<div in:fly={{ y: 20, duration: 400 }} class="space-y-6">
						<div class="flex items-center gap-3 mb-2">
							<div class="p-2 bg-blue-500/10 rounded-xl">
								<Beaker class="w-6 h-6 text-blue-500" />
							</div>
							<div>
								<h3 class="text-xl font-bold">Laboratory Results</h3>
								<p class="text-sm text-muted-foreground font-medium">
									Record metrics from your latest blood tests or medical reports.
								</p>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							{@render labInput(
								'Blood Sugar (Fasting)',
								'bloodSugarFasting',
								'mg/dL',
								'85',
								'text-orange-500'
							)}
							{@render labInput(
								'Blood Sugar (Random)',
								'bloodSugarRandom',
								'mg/dL',
								'120',
								'text-orange-600'
							)}
							{@render labInput('HbA1c', 'hba1c', '%', '5.5', 'text-red-500')}
							{@render labInput('Cholesterol', 'cholesterol', 'mg/dL', '180', 'text-yellow-600')}
							{@render labInput('Creatinine', 'creatinine', 'mg/dL', '1.0', 'text-indigo-500')}
							{@render labInput('eGFR', 'egfr', 'mL/min', '90', 'text-green-600')}
						</div>
					</div>
				</Tabs.Content>

				<Tabs.Content value="wellness">
					<div in:fly={{ y: 20, duration: 400 }} class="space-y-8">
						<div class="flex items-center gap-3 mb-2">
							<div class="p-2 bg-purple-500/10 rounded-xl">
								<Sparkles class="w-6 h-6 text-purple-500" />
							</div>
							<div>
								<h3 class="text-xl font-bold">Wellness Indicators</h3>
								<p class="text-sm text-muted-foreground font-medium">
									Capture how you're feeling emotionally and physically.
								</p>
							</div>
						</div>

						<div class="space-y-10">
							<!-- Mood Slider -->
							<div class="bg-card rounded-xl border border-border/50 p-8 shadow-sm">
								<div class="flex items-center justify-between mb-8">
									<Label class="text-sm font-bold capitalize tracking-widest text-muted-foreground">
										Mood Rating (/10)
									</Label>
									<span class="text-3xl font-bold text-primary">{moodValue[0]}</span>
								</div>
								<div class="space-y-6">
									<Slider
										type="multiple"
										min={1}
										max={10}
										step={1}
										bind:value={moodValue}
										class="py-4"
									/>
									<div
										class="flex justify-between text-sm font-bold tracking-widest text-muted-foreground"
									>
										<span>LOUSY</span>
										<span>STABLE</span>
										<span>FANTASTIC</span>
									</div>
								</div>
							</div>

							<!-- Energy Slider -->
							<div class="bg-card rounded-xl border border-border/50 p-8 shadow-sm">
								<div class="flex items-center justify-between mb-8">
									<Label class="text-sm font-bold capitalize tracking-widest text-muted-foreground">
										Energy Level (/10)
									</Label>
									<span class="text-3xl font-bold text-primary">{energyValue[0]}</span>
								</div>
								<div class="space-y-6">
									<Slider
										type="multiple"
										min={1}
										max={10}
										step={1}
										bind:value={energyValue}
										class="py-4"
									/>
									<div
										class="flex justify-between text-sm font-bold tracking-widest text-muted-foreground"
									>
										<span>EXHAUSTED</span>
										<span>NORMAL</span>
										<span>PEAK PERFORMANCE</span>
									</div>
								</div>
							</div>

							<!-- Notes -->
							<div class="bg-card rounded-xl border border-border/50 p-8 shadow-sm">
								<Label
									class="text-sm font-bold capitalize tracking-widest text-muted-foreground mb-4 block"
								>
									Daily Health Notes
								</Label>
								<Textarea
									placeholder="How are you feeling today? Any symptoms, observations, or thoughts..."
									bind:value={trackingData.notes}
									rows={4}
									class="w-full bg-muted/50 border-border/50 rounded-xl font-medium text-foreground focus:ring-primary/50 transition-all resize-none"
								></Textarea>
							</div>
						</div>
					</div>
				</Tabs.Content>

				<!-- Feedback Messages -->
				{#if success}
					<div
						in:fade
						out:fade
						class="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3 text-primary"
					>
						<CheckCircle2 class="w-5 h-5 shrink-0" />
						<p class="text-sm font-bold">
							Health data saved successfully. Your assessment score will be updated shortly.
						</p>
					</div>
				{/if}

				{#if error}
					<div
						in:fade
						out:fade
						class="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3 text-destructive"
					>
						<AlertCircle class="w-5 h-5 shrink-0" />
						<p class="text-sm font-bold">{error}</p>
					</div>
				{/if}

				<!-- Submit Button -->
				<div class="pt-6">
					<Button
						onclick={handleSubmit}
						disabled={loading}
						class="w-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
					>
						{#if loading}
							<Loader2 class="w-6 h-6 animate-spin" />
							<span>Syncing Knowledge...</span>
						{:else}
							<Save class="w-6 h-6 group-hover:scale-110 transition-transform" />
							<span>Save Health Records</span>
						{/if}
					</Button>
				</div>
			</div>
		</Tabs.Root>

		<!-- Assessment Impact Card -->
		<div
			class="max-w-4xl mx-auto bg-card/40 backdrop-blur-md rounded-xl border border-primary/20 p-6 flex items-start gap-4"
		>
			<div class="p-2 bg-primary/10 rounded-xl shrink-0">
				<LineChart class="w-5 h-5 text-primary" />
			</div>
			<div>
				<h4 class="text-sm font-bold text-foreground mb-1">Health Assessment Impact</h4>
				<p class="text-[11px] sm:text-xs text-muted-foreground font-medium leading-relaxed">
					Your daily health tracking data contributes to your overall health assessment score.
					Complete entries help our AI provide better insights and personalized recommendations. <span
						class="text-primary font-bold"
						>Current week's data will be included in your weekly report.</span
					>
				</p>
			</div>
		</div>
	</div>
</div>

<!-- Snippet for Lab Inputs -->
{#snippet labInput(
	label: string,
	field: keyof typeof trackingData,
	unit: string,
	placeholder: string,
	textColor: string
)}
	<div class="bg-card rounded-xl border border-border/50 p-6 shadow-sm group">
		<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground mb-3 block">
			{label} ({unit})
		</Label>
		<div class="relative">
			<Input
				type="text"
				{placeholder}
				bind:value={trackingData[field]}
				class="w-full bg-muted/50 border-border/50 rounded-xl text-xl font-bold text-foreground focus:ring-primary/50 transition-all"
			/>
		</div>
	</div>
{/snippet}

<style>
	/* Micro-interactions */
	:global(.lucide) {
		stroke-width: 2.5px;
	}

	.animate-in {
		animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.98) translateY(10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
