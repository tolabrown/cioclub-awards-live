<script lang="ts">
	import {
		ArrowLeft,
		Activity,
		Heart,
		Beaker,
		Zap,
		Smile,
		Target,
		Calendar as CalendarIcon,
		Info,
		TrendingUp,
		ShieldCheck,
		Droplets,
		Apple,
		Brain,
		Pill,
		ChevronRight,
		Dna,
		Microscope,
		Scale,
		Timer,
		Trophy
	} from '@lucide/svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import SelectComponent from '$lib/components/ui/select/select-component.svelte';
	import { Slider } from '$lib/components/ui/slider';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let activeMonitorTab = $state('diabetes');
	let healthStage = $state('optimal');

	// --- Monitoring State ---

	// Diabetes
	let diabetesData = $state({
		bloodSugar: '',
		hba1c: '',
		fastingGlucose: '',
		postMealGlucose: '',
		weight: '',
		exerciseHours: '',
		dietCompliance: 'mostly',
		medicationTaken: false,
		stressLevel: [5],
		notes: ''
	});

	// Hypertension
	let hyperData = $state({
		systolic: '',
		diastolic: '',
		heartRate: '',
		weight: '',
		exerciseToday: '',
		sleepHours: '',
		sodiumIntake: 'moderate',
		smokingStatus: 'never',
		medicationTaken: false,
		stressLevel: [5],
		notes: ''
	});

	// Kidney Health
	let kidneyData = $state({
		creatinine: '',
		bun: '',
		egfr: '',
		proteinuria: 'trace',
		bloodPressure: '',
		weight: '',
		fluidIntake: '',
		urineOutput: '',
		swelling: false,
		medicationTaken: false,
		dietRestrictions: '',
		notes: ''
	});

	// Cancer Screening
	let cancerData = $state({
		psaLevel: '',
		weight: '',
		bowelMovements: '',
		urinarySymptoms: '',
		skinChanges: '',
		lumps: '',
		painLevel: [0],
		energyLevel: [5],
		appetiteLevel: [5],
		sleepQuality: [5],
		screenings: {
			prostate: false,
			colorectal: false,
			lung: false,
			skin: false
		},
		familyHistory: '',
		notes: ''
	});

	// Exercise
	let exerciseData = $state({
		workoutType: 'cardio',
		duration: '30',
		calories: '200',
		weeklyGoal: '3',
		intensity: [5],
		motivation: [7],
		exercises: {
			cardio: [],
			strength: [],
			mobility: [],
			sports: []
		},
		benchPress: '',
		squat: '',
		deadlift: '',
		runDistance: '',
		runTime: '',
		injuries: '',
		notes: ''
	});

	async function saveTracking(category: string, stateData: any) {
		try {
			// Extract metrics from stateData and map to schema fields
			const metrics: any = {};

			// Common fields
			if (stateData.weight) metrics.weight = stateData.weight;
			if (stateData.notes) metrics.notes = stateData.notes;
			if (stateData.medicationTaken !== undefined)
				metrics.medicationTaken = stateData.medicationTaken;
			if (stateData.stressLevel) metrics.stressLevel = stateData.stressLevel[0];

			// Category specific mapping
			if (category === 'diabetes') {
				metrics.bloodSugarRandom = stateData.bloodSugar;
				metrics.hba1c = stateData.hba1c;
				metrics.bloodSugarFasting = stateData.fastingGlucose;
				metrics.bloodSugarPostMeal = stateData.postMealGlucose;
				metrics.exerciseHours = stateData.exerciseHours;
				metrics.dietCompliance = stateData.dietCompliance;
			} else if (category === 'hypertension') {
				metrics.systolic = stateData.systolic;
				metrics.diastolic = stateData.diastolic;
				metrics.heartRate = stateData.heartRate;
				metrics.exerciseHours = stateData.exerciseToday; // mapping minutes to text for now or handle conversion
				metrics.sleepDuration = parseInt(stateData.sleepHours || '0') * 60;
				metrics.notes = `${stateData.notes || ''} | Sodium: ${stateData.sodiumIntake}, Smoking: ${stateData.smokingStatus}`;
			} else if (category === 'kidney') {
				metrics.creatinine = stateData.creatinine;
				metrics.bun = stateData.bun;
				metrics.egfr = stateData.egfr;
				metrics.proteinuria = stateData.proteinuria;
				metrics.notes = `${stateData.notes || ''} | BP: ${stateData.bloodPressure}, Fluid: ${stateData.fluidIntake}, Urine: ${stateData.urineOutput}, Swelling: ${stateData.swelling}, Diet: ${stateData.dietRestrictions}`;
			} else if (category === 'cancer') {
				metrics.psaLevel = stateData.psaLevel;
				metrics.bowelMovements = stateData.bowelMovements;
				metrics.urinarySymptoms = stateData.urinarySymptoms;
				metrics.skinChanges = stateData.skinChanges;
				metrics.lumps = stateData.lumps;
				metrics.painLevel = stateData.painLevel[0];
				metrics.energyLevel = stateData.energyLevel[0];
				metrics.appetiteLevel = stateData.appetiteLevel[0];
				metrics.sleepQuality = stateData.sleepQuality[0].toString();
				metrics.familyHistory = stateData.familyHistory;
				metrics.screenings = JSON.stringify(stateData.screenings);
			} else if (category === 'exercise') {
				metrics.workoutType = stateData.workoutType;
				metrics.duration = stateData.duration;
				metrics.workoutIntensity = stateData.intensity[0];
				metrics.workoutMotivation = stateData.motivation[0];
				metrics.benchPress = stateData.benchPress;
				metrics.squat = stateData.squat;
				metrics.deadlift = stateData.deadlift;
				metrics.runDistance = stateData.runDistance;
				metrics.runTime = stateData.runTime;
				metrics.injuries = stateData.injuries;
			}

			const res = await fetch('/api/health/track', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					category,
					...metrics
				})
			});
			const result = await res.json();
			if (result.success) {
				toast.success('Progress Saved', { description: `Your ${category} data has been logged.` });
			} else {
				toast.error('Save Failed', { description: result.message });
			}
		} catch (e) {
			toast.error('An error occurred while saving.');
		}
	}

	let selectedSupplements = $state<string[]>([]);
	let additionalSupps = $state('');

	function toggleSupplement(item: string) {
		if (selectedSupplements.includes(item)) {
			selectedSupplements = selectedSupplements.filter((s) => s !== item);
		} else {
			selectedSupplements = [...selectedSupplements, item];
		}
	}

	async function saveSupplements() {
		try {
			const res = await fetch('/api/health/supplements', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					supplements: selectedSupplements,
					additionalNotes: additionalSupps
				})
			});
			const result = await res.json();
			if (result.success) {
				toast.success('Supplements Logged', {
					description: 'Your daily intake has been recorded.'
				});
			} else {
				toast.error('Save Failed', { description: result.message });
			}
		} catch (e) {
			toast.error('An error occurred while saving.');
		}
	}

	const categories = [
		{
			id: 'diabetes',
			title: 'Diabetes',
			icon: Droplets,
			subtitle: 'Blood sugar & HbA1c monitoring',
			buttonText: 'Monitor Diabetes',
			color: 'text-orange-500',
			bg: 'bg-orange-500/10'
		},
		{
			id: 'hypertension',
			title: 'Hypertension',
			icon: Heart,
			subtitle: 'Blood pressure & cardiovascular health',
			buttonText: 'Monitor Blood Pressure',
			color: 'text-red-500',
			bg: 'bg-red-500/10'
		},
		{
			id: 'kidney',
			title: 'Kidney Health',
			icon: Microscope,
			subtitle: 'Creatinine, eGFR & kidney function',
			buttonText: 'Monitor Kidney Health',
			color: 'text-blue-500',
			bg: 'bg-blue-500/10'
		},
		{
			id: 'cancer',
			title: 'Cancer Screening',
			icon: ShieldCheck,
			subtitle: 'PSA, symptoms & screening tracking',
			buttonText: 'Cancer Screening',
			color: 'text-purple-500',
			bg: 'bg-purple-500/10'
		},
		{
			id: 'exercise',
			title: 'Exercise & Fitness',
			icon: Zap,
			subtitle: 'Workout tracking & fitness goals',
			buttonText: 'Track Exercise',
			color: 'text-green-500',
			bg: 'bg-green-500/10'
		},
		{
			id: 'supplements',
			title: 'Supplements',
			icon: Pill,
			subtitle: 'Daily supplements & nutrition support',
			buttonText: 'Track Supplements',
			color: 'text-indigo-500',
			bg: 'bg-indigo-500/10'
		}
	];
</script>

<div class="w-full min-h-screen pb-20">
	<div class="max-w-7xl mx-auto">
		<!-- Top Bar -->
		<div class="flex items-center justify-between mb-8">
			<a
				href="/dashboard"
				class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
			>
				<div class="p-2 border border-border group-hover:bg-muted rounded-md">
					<ArrowLeft class="w-4 h-4" />
				</div>
				<div class="flex flex-col text-sm">
					<span class="font-bold capitalize tracking-wider">Back to Dashboard</span>
					<span class="">Vital Monitoring</span>
				</div>
			</a>
		</div>

		<!-- Page Header -->
		<div class="mb-10">
			<h1 class="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
				Vital Health Monitoring
			</h1>
			<p class="text-muted-foreground font-medium">
				Comprehensive health tracking with AI-powered insights for Nigerian men
			</p>

			<!-- Recording Date -->
			<div class="flex flex-col sm:flex-row sm:items-center gap-2 mt-6">
				<span class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
					>Recording Date:</span
				>
				<div
					class="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg w-full sm:w-fit"
				>
					<CalendarIcon class="w-4 h-4 text-primary" />
					<span class="text-sm font-semibold">December 18th, 2025</span>
				</div>
			</div>
		</div>

		<!-- Patient Information Section -->
		<Card.Root
			class="mb-8 bg-card/50 backdrop-blur-md border border-primary/20 shadow-xl overflow-hidden"
		>
			<Card.Header class="pb-4">
				<Card.Title
					class="text-sm font-bold capitalize tracking-widest flex items-center gap-2 text-primary"
				>
					<Activity class="w-4 h-4" />
					Patient Information
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					<div class="space-y-2">
						<Label class="text-xs font-semibold text-muted-foreground capitalize">Age</Label>
						<Input
							type="number"
							placeholder="Enter age"
							class="bg-background/50 border-border/50"
						/>
					</div>
					<div class="space-y-2">
						<Label class="text-xs font-semibold text-muted-foreground capitalize">Weight (kg)</Label
						>
						<Input
							type="number"
							placeholder="Enter weight"
							class="bg-background/50 border-border/50"
						/>
					</div>
					<div class="space-y-2">
						<Label class="text-xs font-semibold text-muted-foreground capitalize">Height (cm)</Label
						>
						<Input
							type="number"
							placeholder="Enter height"
							class="bg-background/50 border-border/50"
						/>
					</div>
					<div class="space-y-2">
						<Label for="health-stage" class="text-xs font-semibold text-muted-foreground capitalize"
							>Health Stage</Label
						>
						<SelectComponent
							bind:value={healthStage}
							id="health-stage"
							options={[
								{ label: 'Pre-Stage', value: 'pre-stage' },
								{ label: 'Optimal', value: 'optimal' },
								{ label: 'Elevated', value: 'elevated' },
								{ label: 'Hypertensive', value: 'hypertensive' }
							]}
							placeholder="Select stage"
							name="health-stage"
						/>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Tabs Section -->
		<Tabs.Root bind:value={activeMonitorTab} class="space-y-10">
			<Tabs.List
				class="w-full justify-start bg-muted/30 p-1 border border-border/50 overflow-x-auto"
			>
				<Tabs.Trigger
					value="overview"
					class="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white"
				>
					Overview
				</Tabs.Trigger>
				<Tabs.Trigger value="diabetes" class="px-6 py-2.5">Diabetes</Tabs.Trigger>
				<Tabs.Trigger value="hypertension" class="px-6 py-2.5">Hypertension</Tabs.Trigger>
				<Tabs.Trigger value="kidney" class="px-6 py-2.5">Kidney Health</Tabs.Trigger>
				<Tabs.Trigger value="cancer" class="px-6 py-2.5">Cancer Screening</Tabs.Trigger>
				<Tabs.Trigger value="exercise" class="px-6 py-2.5 text-xs sm:text-sm">Exercise</Tabs.Trigger
				>
				<Tabs.Trigger value="supplements" class="px-6 py-2.5 text-xs sm:text-sm"
					>Supplements</Tabs.Trigger
				>
			</Tabs.List>

			<Tabs.Content value="overview">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each categories as category}
						{@const Icon = category.icon}
						<Card.Root
							class="group hover:shadow-2xl hover:shadow-primary/10 transition-all border-border/50 bg-card/60 backdrop-blur-sm"
						>
							<!-- slide click support could be added here -->
							<Card.Header class="pb-2">
								<div class="flex items-start justify-between">
									<div
										class="p-3 {category.bg} rounded-2xl group-hover:scale-110 transition-transform"
									>
										<Icon class="w-6 h-6 {category.color}" />
									</div>
								</div>
								<Card.Title class="text-xl font-bold mt-4">{category.title}</Card.Title>
								<Card.Description class="text-sm font-medium">{category.subtitle}</Card.Description>
							</Card.Header>
							<Card.Content class="pt-6">
								<Button
									onclick={() => (activeMonitorTab = category.id)}
									class="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-md shadow-slate-200"
								>
									{category.buttonText}
								</Button>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</Tabs.Content>

			<!-- Diabetes Monitoring -->
			<Tabs.Content value="diabetes">
				<div class="space-y-8">
					<div class="flex items-center gap-3 mb-2">
						<div class="p-2 bg-orange-500/10">
							<Droplets class="w-6 h-6 text-orange-500" />
						</div>
						<div>
							<h3 class="text-xl font-bold">Diabetes Monitoring</h3>
							<p class="text-sm text-muted-foreground font-medium">
								Blood sugar & metabolic tracking
							</p>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						{@render monitorInput(
							'Blood Sugar (mg/dL)',
							'Enter current blood sugar',
							diabetesData,
							'bloodSugar'
						)}
						{@render monitorInput('HbA1c (%)', 'Enter HbA1c level', diabetesData, 'hba1c')}
						{@render monitorInput(
							'Fasting Glucose (mg/dL)',
							'Enter fasting glucose',
							diabetesData,
							'fastingGlucose'
						)}
						{@render monitorInput(
							'Post-Meal Glucose (mg/dL)',
							'2 hours after meal',
							diabetesData,
							'postMealGlucose'
						)}
						{@render monitorInput('Weight (kg)', 'Enter weight', diabetesData, 'weight')}
						{@render monitorInput(
							'Exercise Hours Today',
							'Hours of exercise',
							diabetesData,
							'exerciseHours'
						)}
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="bg-card/50 border border-border/50 p-6 space-y-4">
							<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
								>Diet Compliance Today</Label
							>
							<SelectComponent
								bind:value={diabetesData.dietCompliance}
								options={[
									{ label: 'Strictly Followed', value: 'strictly' },
									{ label: 'Mostly Followed', value: 'mostly' },
									{ label: 'Partially Followed', value: 'partially' },
									{ label: 'Not Followed', value: 'none' }
								]}
								placeholder="Select compliance"
								name="diet-compliance"
								class="w-full bg-background/50"
							/>
						</div>
						<div class="bg-card/50 border border-border/50 p-6 flex items-center justify-between">
							<div class="space-y-1">
								<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
									>Medication Taken Today</Label
								>
								<p class="text-xs text-muted-foreground">
									Confirm if you've taken your diabetic meds
								</p>
							</div>
							<Switch bind:checked={diabetesData.medicationTaken} />
						</div>
					</div>

					<div class="bg-card/50 border border-border/50 p-8 space-y-6">
						<div class="flex items-center justify-between">
							<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
								>Stress Level (1-10): {diabetesData.stressLevel[0]}</Label
							>
						</div>
						<Slider
							type="multiple"
							bind:value={diabetesData.stressLevel}
							min={1}
							max={10}
							step={1}
							class="py-4"
						/>
					</div>

					<div class="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
						<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
							>Symptoms & Notes</Label
						>
						<Textarea
							bind:value={diabetesData.notes}
							placeholder="Any symptoms, concerns, or notes about today..."
							class="bg-background/50 h-24"
						/>
					</div>

					<div class="flex gap-4">
						<Button
							onclick={() => saveTracking('diabetes', diabetesData)}
							class="flex-1 bg-primary text-white shadow-xl shadow-primary/20">Save Data</Button
						>
						<Button variant="outline" class="flex-1 border-primary/20 text-primary"
							>AI Analysis</Button
						>
					</div>
				</div>
			</Tabs.Content>

			<!-- Hypertension Monitoring -->
			<Tabs.Content value="hypertension">
				<div class="space-y-8">
					<div class="flex items-center gap-3 mb-2">
						<div class="p-2 bg-red-500/10">
							<Heart class="w-6 h-6 text-red-500" />
						</div>
						<div>
							<h3 class="text-xl font-bold">Blood Pressure & Cardiovascular Monitoring</h3>
							<p class="text-sm text-muted-foreground font-medium">
								Track your heart health metrics
							</p>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						{@render monitorInput(
							'Systolic Pressure (mmHg)',
							'Top number (e.g., 120)',
							hyperData,
							'systolic'
						)}
						{@render monitorInput(
							'Diastolic Pressure (mmHg)',
							'Bottom number (e.g., 80)',
							hyperData,
							'diastolic'
						)}
						{@render monitorInput('Heart Rate (bpm)', 'Beats per minute', hyperData, 'heartRate')}
						{@render monitorInput('Weight (kg)', 'Current weight', hyperData, 'weight')}
						{@render monitorInput(
							'Exercise Today (minutes)',
							'Minutes of exercise',
							hyperData,
							'exerciseToday'
						)}
						{@render monitorInput(
							'Sleep Hours',
							'Hours of sleep last night',
							hyperData,
							'sleepHours'
						)}
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="bg-card/50 border border-border/50 p-6 space-y-4">
							<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
								>Sodium Intake Assessment</Label
							>
							<SelectComponent
								bind:value={hyperData.sodiumIntake}
								options={[
									{ label: 'Low Salt', value: 'low' },
									{ label: 'Moderate Salt', value: 'moderate' },
									{ label: 'High Salt', value: 'high' }
								]}
								placeholder="Select sodium intake"
								name="sodium-intake"
								class="w-full bg-background/50"
							/>
						</div>
						<div class="bg-card/50 border border-border/50 p-6 space-y-4">
							<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
								>Smoking Status</Label
							>
							<SelectComponent
								bind:value={hyperData.smokingStatus}
								options={[
									{ label: 'Never smoked', value: 'never' },
									{ label: 'Former smoker', value: 'former' },
									{ label: 'Current smoker', value: 'current' }
								]}
								placeholder="Select smoking status"
								name="smoking-status"
								class="w-full bg-background/50"
							/>
						</div>
					</div>

					<div class="bg-card/50 border border-border/50 p-6 flex items-center justify-between">
						<div class="space-y-1">
							<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
								>Medication Taken Today</Label
							>
							<p class="text-xs text-muted-foreground">Confirm if you've taken your BP meds</p>
						</div>
						<Switch bind:checked={hyperData.medicationTaken} />
					</div>

					<div class="bg-card/50 border border-border/50 p-8 space-y-6">
						<div class="flex items-center justify-between">
							<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
								>Stress Level (1-10): {hyperData.stressLevel[0]}</Label
							>
						</div>
						<Slider
							type="multiple"
							bind:value={hyperData.stressLevel}
							min={1}
							max={10}
							step={1}
							class="py-4"
						/>
					</div>

					<div class="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
						<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
							>Symptoms & Notes</Label
						>
						<Textarea
							bind:value={hyperData.notes}
							placeholder="Any symptoms like headaches, dizziness, chest pain..."
							class="bg-background/50 h-24"
						/>
					</div>

					<div class="flex gap-4">
						<Button
							onclick={() => saveTracking('hypertension', hyperData)}
							class="flex-1 bg-primary text-white shadow-xl shadow-primary/20">Save Data</Button
						>
						<Button variant="outline" class="flex-1 border-primary/20 text-primary"
							>AI Analysis</Button
						>
					</div>
				</div>
			</Tabs.Content>

			<!-- Kidney Health Monitoring -->
			<Tabs.Content value="kidney">
				<div class="space-y-8">
					<div class="flex items-center gap-3 mb-2">
						<div class="p-2 bg-blue-500/10">
							<Microscope class="w-6 h-6 text-blue-500" />
						</div>
						<div>
							<h3 class="text-xl font-bold">Kidney Function Monitoring</h3>
							<p class="text-sm text-muted-foreground font-medium">
								Track creatinine, eGFR & renal health
							</p>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						{@render monitorInput(
							'Creatinine (mg/dL)',
							'Normal: 0.7-1.3 mg/dL',
							kidneyData,
							'creatinine'
						)}
						{@render monitorInput('BUN (mg/dL)', 'Normal: 7-20 mg/dL', kidneyData, 'bun')}
						{@render monitorInput('eGFR (mL/min/1.73m²)', 'Normal: >90', kidneyData, 'egfr')}
						<div class="bg-card/50 border border-border/50 p-6 space-y-4">
							<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
								>Proteinuria</Label
							>
							<SelectComponent
								bind:value={kidneyData.proteinuria}
								options={[
									{ label: 'Negative', value: 'negative' },
									{ label: 'Trace', value: 'trace' },
									{ label: '1+', value: '1plus' },
									{ label: '2+', value: '2plus' },
									{ label: '3+', value: '3plus' },
									{ label: '4+', value: '4plus' }
								]}
								placeholder="Select proteinuria level"
								name="proteinuria"
								class="w-full bg-background/50"
							/>
						</div>
						{@render monitorInput('Blood Pressure', 'e.g., 120/80', kidneyData, 'bloodPressure')}
						{@render monitorInput('Weight (kg)', 'Current weight', kidneyData, 'weight')}
						{@render monitorInput(
							'Fluid Intake (L/day)',
							'Liters per day',
							kidneyData,
							'fluidIntake'
						)}
						{@render monitorInput(
							'Urine Output (L/day)',
							'Estimated liters',
							kidneyData,
							'urineOutput'
						)}
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="bg-card/50 border border-border/50 p-6 flex items-center justify-between">
							<div class="space-y-1">
								<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
									>Swelling/Edema Present</Label
								>
								<p class="text-xs text-muted-foreground">
									Check for swelling in legs, feet or eyes
								</p>
							</div>
							<Switch bind:checked={kidneyData.swelling} />
						</div>
						<div class="bg-card/50 border border-border/50 p-6 flex items-center justify-between">
							<div class="space-y-1">
								<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
									>Medication Taken Today</Label
								>
								<p class="text-xs text-muted-foreground">
									Confirm if you've taken renal-related meds
								</p>
							</div>
							<Switch bind:checked={kidneyData.medicationTaken} />
						</div>
					</div>

					<div class="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
						<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
							>Diet Restrictions</Label
						>
						<Input
							bind:value={kidneyData.dietRestrictions}
							placeholder="Low protein, low sodium, etc."
							class="bg-background/50"
						/>
					</div>

					<div class="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
						<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
							>Symptoms & Notes</Label
						>
						<Textarea
							bind:value={kidneyData.notes}
							placeholder="Swelling, changes in urination, fatigue, nausea..."
							class="bg-background/50 h-24"
						/>
					</div>

					<div class="flex gap-4">
						<Button
							onclick={() => saveTracking('kidney', kidneyData)}
							class="flex-1 bg-primary text-white shadow-xl shadow-primary/20">Save Data</Button
						>
						<Button variant="outline" class="flex-1 border-primary/20 text-primary"
							>AI Analysis</Button
						>
					</div>
				</div>
			</Tabs.Content>

			<!-- Cancer Screening Monitoring -->
			<Tabs.Content value="cancer">
				<div class="space-y-8">
					<div class="flex items-center gap-3 mb-2">
						<div class="p-2 bg-purple-500/10">
							<ShieldCheck class="w-6 h-6 text-purple-500" />
						</div>
						<div>
							<h3 class="text-xl font-bold">Cancer Screening & Prevention</h3>
							<p class="text-sm text-muted-foreground font-medium">
								Prostate, colorectal & health indicators
							</p>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						{@render monitorInput(
							'PSA Level (ng/mL)',
							'Normal: <4.0 ng/mL',
							cancerData,
							'psaLevel'
						)}
						{@render monitorInput('Weight (kg)', 'Current weight', cancerData, 'weight')}
						{@render monitorInput(
							'Bowel Movements',
							'Frequency & consistency',
							cancerData,
							'bowelMovements'
						)}
						{@render monitorInput(
							'Urinary Symptoms',
							'Frequency, urgency, pain',
							cancerData,
							'urinarySymptoms'
						)}
						{@render monitorInput(
							'Skin Changes',
							'New moles, spots, changes',
							cancerData,
							'skinChanges'
						)}
						{@render monitorInput(
							'Lumps or Swelling',
							'Location and description',
							cancerData,
							'lumps'
						)}
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div class="space-y-6">
							<div class="bg-card/50 border border-border/50 p-6 space-y-4">
								<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
									>Pain Level (0-10): {cancerData.painLevel[0]}</Label
								>
								<Slider
									type="multiple"
									bind:value={cancerData.painLevel}
									min={0}
									max={10}
									step={1}
									class="py-2"
								/>
							</div>
							<div class="bg-card/50 border border-border/50 p-6 space-y-4">
								<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
									>Energy Level (1-10): {cancerData.energyLevel[0]}</Label
								>
								<Slider
									type="multiple"
									bind:value={cancerData.energyLevel}
									min={1}
									max={10}
									step={1}
									class="py-2"
								/>
							</div>
						</div>
						<div class="space-y-6">
							<div class="bg-card/50 border border-border/50 p-6 space-y-4">
								<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
									>Appetite Level (1-10): {cancerData.appetiteLevel[0]}</Label
								>
								<Slider
									type="multiple"
									bind:value={cancerData.appetiteLevel}
									min={1}
									max={10}
									step={1}
									class="py-2"
								/>
							</div>
							<div class="bg-card/50 border border-border/50 p-6 space-y-4">
								<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
									>Sleep Quality (1-10): {cancerData.sleepQuality[0]}</Label
								>
								<Slider
									type="multiple"
									bind:value={cancerData.sleepQuality}
									min={1}
									max={10}
									step={1}
									class="py-2"
								/>
							</div>
						</div>
					</div>

					<div class="bg-card/50 border border-border/50 p-8 space-y-6">
						<Label
							class="text-xs font-bold capitalize tracking-widest text-muted-foreground block mb-4"
							>Recent Screening Tests</Label
						>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
							<div class="flex items-center gap-3">
								<Switch bind:checked={cancerData.screenings.prostate} />
								<Label class="text-sm font-semibold">Prostate Exam</Label>
							</div>
							<div class="flex items-center gap-3">
								<Switch bind:checked={cancerData.screenings.colorectal} />
								<Label class="text-sm font-semibold">Colorectal Screening</Label>
							</div>
							<div class="flex items-center gap-3">
								<Switch bind:checked={cancerData.screenings.lung} />
								<Label class="text-sm font-semibold">Lung Screening</Label>
							</div>
							<div class="flex items-center gap-3">
								<Switch bind:checked={cancerData.screenings.skin} />
								<Label class="text-sm font-semibold">Skin Exam</Label>
							</div>
						</div>
					</div>

					<div class="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
						<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
							>Family History</Label
						>
						<Textarea
							bind:value={cancerData.familyHistory}
							placeholder="Family history of cancer (type, relation, age at diagnosis)..."
							class="bg-background/50 h-24"
						/>
					</div>

					<div class="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
						<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
							>Symptoms & Concerns</Label
						>
						<Textarea
							bind:value={cancerData.notes}
							placeholder="Any lumps, persistent cough, changes in bowel habits, unexplained weight loss..."
							class="bg-background/50 h-24"
						/>
					</div>

					<div class="flex gap-4">
						<Button
							onclick={() => saveTracking('cancer', cancerData)}
							class="flex-1 bg-primary text-white shadow-xl shadow-primary/20">Save Data</Button
						>
						<Button variant="outline" class="flex-1 border-primary/20 text-primary"
							>AI Analysis</Button
						>
					</div>
				</div>
			</Tabs.Content>

			<!-- Exercise Tracking -->
			<Tabs.Content value="exercise">
				<div class="space-y-8">
					<div class="flex items-center gap-3 mb-2">
						<div class="p-2 bg-green-500/10">
							<Zap class="w-6 h-6 text-green-500" />
						</div>
						<div>
							<h3 class="text-xl font-bold">Men's Exercise & Fitness Tracking</h3>
							<p class="text-sm text-muted-foreground font-medium">
								Log your workouts and personal records
							</p>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
						<div class="bg-card/50 border border-border/50 p-6 space-y-4">
							<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
								>Primary Workout Type</Label
							>
							<SelectComponent
								bind:value={exerciseData.workoutType}
								options={[
									{ label: 'Cardio', value: 'cardio' },
									{ label: 'Strength', value: 'strength' },
									{ label: 'HIIT', value: 'hiit' },
									{ label: 'Mobility', value: 'mobility' },
									{ label: 'Sports', value: 'sports' }
								]}
								placeholder="Select workout type"
								name="workout-type"
								class="w-full bg-background/50"
							/>
						</div>
						{@render monitorInput('Duration (minutes)', '60', exerciseData, 'duration')}
						{@render monitorInput('Estimated Calories Burned', '300', exerciseData, 'calories')}
						<div class="bg-card/50 border border-border/50 p-6 space-y-4">
							<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
								>Weekly Goal (days)</Label
							>
							<SelectComponent
								bind:value={exerciseData.weeklyGoal}
								options={[
									{ label: '1 day/week', value: '1' },
									{ label: '2 days/week', value: '2' },
									{ label: '3 days/week', value: '3' },
									{ label: '4 days/week', value: '4' },
									{ label: '5 days/week', value: '5' },
									{ label: '6 days/week', value: '6' },
									{ label: '7 days/week', value: '7' }
								]}
								placeholder="Select weekly goal"
								name="weekly-goal"
								class="w-full bg-background/50"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div class="bg-card/50 border border-border/50 p-6 space-y-4">
							<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
								>Workout Intensity (1-10): {exerciseData.intensity[0]}</Label
							>
							<Slider
								type="multiple"
								bind:value={exerciseData.intensity}
								min={1}
								max={10}
								step={1}
								class="py-2"
							/>
						</div>
						<div class="bg-card/50 border border-border/50 p-6 space-y-4">
							<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
								>Motivation Level (1-10): {exerciseData.motivation[0]}</Label
							>
							<Slider
								type="multiple"
								bind:value={exerciseData.motivation}
								min={1}
								max={10}
								step={1}
								class="py-2"
							/>
						</div>
					</div>

					<div class="bg-card/50 border border-border/50 rounded-2xl space-y-4">
						<h4 class=" font-bold flex items-center gap-2">
							<Target class="w-5 h-5 text-primary" /> Today's Exercises
						</h4>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div class="space-y-4">
								<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
									>Cardiovascular</Label
								>
								<div class="grid grid-cols-2 gap-4">
									{#each ['Running/Jogging', 'Cycling', 'Swimming', 'Football/Soccer', 'Basketball', 'Tennis', 'Rowing', 'Stair Climbing'] as item}
										<div class="flex items-center gap-2">
											<input type="checkbox" class="w-4 h-4 rounded border-border" />
											<span class="text-sm font-medium text-muted-foreground">{item}</span>
										</div>
									{/each}
								</div>
							</div>
							<div class="space-y-4">
								<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
									>Strength Training</Label
								>
								<div class="grid grid-cols-2 gap-4">
									{#each ['Bench Press', 'Squat', 'Deadlifts', 'Pull-ups/Chin-ups', 'Push-ups', 'Shoulder Press', 'Bicep Curls', 'Tricep Dips'] as item}
										<div class="flex items-center gap-2">
											<input type="checkbox" class="w-4 h-4 rounded border-border" />
											<span class="text-sm font-medium text-muted-foreground">{item}</span>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>

					<div class="bg-card/50 border border-border/50 p-8 space-y-6">
						<h4 class=" font-bold flex items-center gap-2">
							<Trophy class="w-5 h-5 text-yellow-500" /> Personal Records (Optional)
						</h4>
						<div class="grid grid-cols-1 md:grid-cols-5 gap-4">
							{@render monitorInput('Bench Press (kg)', '80', exerciseData, 'benchPress')}
							{@render monitorInput('Squat (kg)', '100', exerciseData, 'squat')}
							{@render monitorInput('Deadlift (kg)', '120', exerciseData, 'deadlift')}
							{@render monitorInput('Run Distance (km)', '5.0', exerciseData, 'runDistance')}
							{@render monitorInput('Run Time (minutes)', '25', exerciseData, 'runTime')}
						</div>
					</div>

					<div class="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
						<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
							>Current Injuries or Limitations</Label
						>
						<Input
							bind:value={exerciseData.injuries}
							placeholder="Any injuries, pain, or physical limitations affecting your workout..."
							class="bg-background/50 h-9"
						/>
					</div>

					<div class="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
						<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
							>Workout Notes & Goals</Label
						>
						<Textarea
							bind:value={exerciseData.notes}
							placeholder="How did today's workout feel? Any goals for tomorrow? Pre/post-workout meals?"
							class="bg-background/50 h-24"
						/>
					</div>

					<div class="flex gap-4">
						<Button
							onclick={() => saveTracking('exercise', exerciseData)}
							class="flex-1 bg-primary text-white shadow-xl shadow-primary/20">Save Workout</Button
						>
						<Button variant="outline" class="flex-1 border-primary/20 text-primary"
							>AI Analysis</Button
						>
					</div>
				</div>
			</Tabs.Content>

			<!-- Supplements Tracking -->
			<Tabs.Content value="supplements">
				<div class="space-y-8">
					<div class="flex items-center gap-3 mb-2">
						<div class="p-2 bg-indigo-500/10">
							<Pill class="w-6 h-6 text-indigo-500" />
						</div>
						<div>
							<h3 class="text-xl font-bold">Daily Supplements & Nutrition</h3>
							<p class="text-sm text-muted-foreground font-medium">
								Track your vitamins and nutritional support
							</p>
						</div>
					</div>

					<div class="bg-card/50 border border-border/50 p-8 space-y-6">
						<h4 class=" font-bold">Standard Supplements</h4>
						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
							{#each ['Vitamin D3', 'Omega-3 / Fish Oil', 'Magnesium', 'Zinc', 'B-Complex', 'Creatine', 'Probiotics', 'Multivitamin'] as item}
								<div
									class="bg-background/50 border border-border/50 p-4 flex items-center justify-between"
								>
									<div class="flex items-center gap-3">
										<Pill class="w-4 h-4 text-indigo-500" />
										<span class="text-sm font-bold">{item}</span>
									</div>
									<Switch
										checked={selectedSupplements.includes(item)}
										onCheckedChange={() => toggleSupplement(item)}
									/>
								</div>
							{/each}
						</div>
					</div>

					<div class="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
						<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground"
							>Additional Supplements</Label
						>
						<Input
							bind:value={additionalSupps}
							placeholder="Enter any other supplements or medications you take..."
							class="bg-background/50 h-24"
						/>
					</div>

					<div class="flex gap-4">
						<Button
							onclick={saveSupplements}
							class="flex-1 bg-primary text-white shadow-xl shadow-primary/20"
							>Save Supplement Log</Button
						>
						<Button variant="outline" class="flex-1 border-primary/20 text-primary"
							>AI Analysis</Button
						>
					</div>
				</div>
			</Tabs.Content>
		</Tabs.Root>

		<!-- Quick Health Tips Section -->
		<div class="mt-16 space-y-8">
			<div class="flex items-center gap-3">
				<Badge
					variant="outline"
					class="px-4 py-1.5 rounded-full bg-primary/5 text-primary border-primary/20 text-xs font-bold"
				>
					Expert Advice
				</Badge>
				<h3 class="text-2xl font-bold text-foreground">Quick Health Tips</h3>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
				<!-- Exercise -->
				<div class="flex gap-4 group">
					<div
						class="p-3 bg-orange-500/10 rounded-2xl h-fit border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors"
					>
						<Zap class="w-6 h-6 text-orange-600" />
					</div>
					<div>
						<h4 class=" font-bold text-foreground mb-2 flex items-center gap-2">Exercise</h4>
						<p class="text-sm text-muted-foreground leading-relaxed font-medium">
							Aim for 150 minutes moderate exercise weekly. Include strength training, cardio, and
							flexibility work.
						</p>
					</div>
				</div>

				<!-- Nutrition -->
				<div class="flex gap-4 group">
					<div
						class="p-3 bg-red-500/10 rounded-2xl h-fit border border-red-500/20 group-hover:bg-red-500/20 transition-colors"
					>
						<Apple class="w-6 h-6 text-red-600" />
					</div>
					<div>
						<h4 class=" font-bold text-foreground mb-2 flex items-center gap-2">Nutrition</h4>
						<p class="text-sm text-muted-foreground leading-relaxed font-medium">
							Modify traditional meals - use brown rice instead of white, reduce palm oil, increase
							vegetables in soups.
						</p>
					</div>
				</div>

				<!-- Supplements -->
				<div class="flex gap-4 group">
					<div
						class="p-3 bg-blue-500/10 rounded-2xl h-fit border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors"
					>
						<Pill class="w-6 h-6 text-blue-600" />
					</div>
					<div>
						<h4 class=" font-bold text-foreground mb-2 flex items-center gap-2">Supplements</h4>
						<p class="text-sm text-muted-foreground leading-relaxed font-medium">
							Consider Vitamin D3, Omega-3, Magnesium, and Zinc for optimal men's health. Always
							consult your doctor first.
						</p>
					</div>
				</div>

				<!-- Stress Management -->
				<div class="flex gap-4 group">
					<div
						class="p-3 bg-purple-500/10 rounded-2xl h-fit border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors"
					>
						<Brain class="w-6 h-6 text-purple-600" />
					</div>
					<div>
						<h4 class=" font-bold text-foreground mb-2 flex items-center gap-2">
							Stress Management
						</h4>
						<p class="text-sm text-muted-foreground leading-relaxed font-medium">
							Practice deep breathing, meditation, or relaxation techniques to manage daily stress.
						</p>
					</div>
				</div>

				<!-- Medication -->
				<div class="flex gap-4 group col-span-1 md:col-span-2">
					<div
						class="p-3 bg-green-500/10 rounded-2xl h-fit border border-green-500/20 group-hover:bg-green-500/20 transition-colors"
					>
						<Microscope class="w-6 h-6 text-green-600" />
					</div>
					<div>
						<h4 class=" font-bold text-foreground mb-2 flex items-center gap-2">Medication</h4>
						<p class="text-sm text-muted-foreground leading-relaxed font-medium max-w-2xl">
							Take medications as prescribed, set reminders, and never skip doses without consulting
							your doctor.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Monitoring Input Snippet -->
{#snippet monitorInput(label: string, placeholder: string, stateObj: any, field: string)}
	<div class="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-3">
		<Label class="text-xs font-bold capitalize tracking-widest text-muted-foreground">{label}</Label
		>
		<Input
			type="text"
			{placeholder}
			bind:value={stateObj[field]}
			class="bg-background/50 border-border/50 h-10 font-medium"
		/>
	</div>
{/snippet}

<style>
	:global(.lucide) {
		stroke-width: 2.2px;
	}
</style>
