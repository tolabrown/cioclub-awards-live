<script lang="ts">
	import {
		MapPin,
		Clock,
		Heart,
		TrendingUp,
		Activity,
		Target,
		Footprints,
		Moon,
		Zap,
		UtensilsCrossed,
		Dumbbell,
		Weight,
		Smile,
		Plus,
		MessageCircle,
		Bot,
		ChevronRight,
		ArrowRight,
		Stethoscope,
		Trophy,
		ExternalLink,
		Wallet,
		Users,
		Calendar,

		Droplets

	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import LogDialog from './components/LogDialog.svelte';
	import { cn } from '$lib/utils';

	let { data } = $props();

	// Role-based data
	const role = $derived(data.role || 'patient');
	const user = $derived(page.data.user);
	const userName = $derived(user?.name || 'Uwa');
	const userInitial = $derived(userName.charAt(0).toUpperCase());

	// Patient Data
	const healthData = $derived(
		data.healthData || {
			location: 'Lagos, Nigeria',
			steps: 0,
			hydration: 0,
			sleepDuration: 0,
			systolic: '118',
			diastolic: '78',
			heartRate: '72',
			weight: '75',
			moodRating: 'Good'
		}
	);
	const logsToday = $derived(data.logsToday || {});
	const consistency = $derived(data.consistency || 0);

	// Quick Log Modal State
	let logOpen = $state(false);
	let logType = $state('Water');

	function openLog(type: string) {
		logType = type;
		logOpen = true;
	}

	// Dynamic Clock
	let currentTime = $state(new Date());
	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
		}, 1000);
		return () => clearInterval(interval);
	});

	const timeString = $derived(
		currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	);
	const dateString = $derived(
		currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })
	);

	const calculateScore = (v: any) => {
		if (!v || !v.systolic) return 85;
		let score = 90;
		const sys = parseInt(v.systolic);
		const dia = parseInt(v.diastolic);
		if (sys > 130 || sys < 110) score -= 5;
		if (dia > 85 || dia < 70) score -= 5;
		return score;
	};

	const healthScore = $derived(calculateScore(healthData));

	// Formatters
	const formatCurrency = (val: number) =>
		new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);
</script>

<div class="w-full min-h-screen pb-20 animate-in overflow-x-hidden">
	<!-- Hero Header Section -->
	<div class="relative overflow-hidden border-b border-border/10 pt-8 pb-4">
		<div class="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
			<div
				class="w-full flex flex-col md:flex-row items-center md:items-start gap-4 sm:w-auto text-center md:text-left"
			>
				<div class="relative group">
					<div
						class="absolute -inset-1 bg-linear-to-r from-primary to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000"
					></div>
					<div
						class="relative flex shrink-0 overflow-hidden rounded-full w-24 h-24 sm:w-28 sm:h-28 bg-transparent border-2 border-primary/20 shadow-sm items-center justify-center"
					>
						{#if user?.image}
							<img src={user.image} alt={userName} class="w-full h-full object-cover" />
						{:else}
							<span class="text-primary font-bold text-3xl sm:text-4xl">{userInitial}</span>
						{/if}
					</div>
					<div
						class="absolute bottom-1 right-2 w-6 h-6 bg-emerald-500 border-4 border-[#0A0A0A] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
					></div>
				</div>
				<div class="space-y-3">
					<h1 class="text-4xl sm:text-5xl md:text-6xl font-bold leading-none mb-2">
						{userName}’s <span class="text-primary px-3">Health Space</span>
					</h1>
					<div
						class="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-muted-foreground font-semibold capitalize tracking-widest text-sm md:text-xs"
					>
						<div class="flex items-center gap-2">
							<MapPin class="w-4 h-4 text-primary" />
							<span>{data.healthData?.location || 'Lagos, Nigeria'}</span>
						</div>
						<div class="hidden sm:block opacity-20">•</div>
						<span>Dashboard • {role}</span>
					</div>
				</div>
			</div>

			<div
				class="hidden lg:flex items-center gap-4 bg-transparent backdrop-blur-3xl px-8 py-4 border border-border/10 shadow-sm rounded-xl"
			>
				<div class="flex items-center gap-4">
					<div class="p-3 bg-primary/10 rounded-lg">
						<Clock class="w-6 h-6 text-primary" />
					</div>
					<div class="text-left">
						<div class="text-2xl font-bold leading-none">{timeString}</div>
						<div class="text-sm font-bold capitalize tracking-widest text-muted-foreground mt-2">
							{dateString}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="space-y-8">
		<!-- Patient View -->
		{#if role === 'patient'}
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
				<!-- Left Column -->
				<div class="lg:col-span-8 space-y-8">
					<!-- Health Performance Card -->
					<Card.Root class="bg-card border-none shadow-2xl overflow-hidden relative group">
						<div
							class="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"
						></div>
						<Card.Content>
							<div class="flex flex-col md:flex-row items-center gap-10 lg:gap-16">
								<!-- Circular Score Widget -->
								<div class="flex flex-col items-center shrink-0">
									<div class="relative w-48 h-48 sm:w-56 sm:h-56">
										<svg
											class="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]"
										>
											<circle
												cx="50%"
												cy="50%"
												r="45%"
												class="stroke-white/5 fill-none"
												stroke-width="14"
											/>
											<circle
												cx="50%"
												cy="50%"
												r="45%"
												class="stroke-primary fill-none transition-all duration-1000"
												stroke-width="14"
												stroke-linecap="round"
												stroke-dasharray="283"
												stroke-dashoffset={283 - (283 * healthScore) / 100}
											/>
										</svg>
										<div class="absolute inset-0 flex flex-col items-center justify-center">
											<span class="text-6xl sm:text-7xl font-bold tracking-tight"
												>{healthScore}</span
											>
											<span
												class="text-sm font-bold text-muted-foreground capitalize tracking-[0.3em] mt-2"
												>Score</span
											>
										</div>
									</div>
									<div
										class="mt-6 px-5 py-2 bg-primary/10 text-primary text-sm font-bold capitalize tracking-widest flex items-center gap-2 border border-primary/20 shadow-lg shadow-primary/5 rounded-lg"
									>
										<span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
										Excellent Condition
									</div>
								</div>

								<!-- Metrics -->
								<div class="flex-1 w-full space-y-10">
									<div class="flex items-center justify-between">
										<h3 class="text-2xl sm:text-3xl font-bold tracking-tight">
											Health Performance
										</h3>
										<Badge
											variant="outline"
											class="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 py-1.5 px-3 gap-2 font-bold"
										>
											<TrendingUp class="w-4 h-4" />
											+3.2%
										</Badge>
									</div>

									<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div
											class="p-6 bg-transparent border border-border/40 hover:bg-muted/30 transition-all group/stat flex flex-col items-center md:items-start text-center md:text-left rounded-xl"
										>
											<div class="flex items-center justify-between w-full mb-4">
												<div class="p-2 bg-primary/20 shrink-0 rounded-xl">
													<Activity class="w-6 h-6 text-primary" />
												</div>
												<span
													class="text-sm font-bold text-muted-foreground capitalize tracking-widest"
													>Consistency</span
												>
											</div>
											<div class="text-4xl font-bold tracking-tight">{consistency}/7</div>
											<div class="text-sm text-muted-foreground mt-2 font-semibold">
												Days active this week
											</div>
										</div>
										<div
											class="p-6 bg-transparent border border-border/40 hover:bg-muted/30 transition-all group/stat flex flex-col items-center md:items-start text-center md:text-left"
										>
											<div class="flex items-center justify-between w-full mb-4">
												<div class="p-2 bg-emerald-500/20 shrink-0 rounded-xl">
													<Target class="w-6 h-6 text-emerald-500" />
												</div>
												<span
													class="text-sm font-bold text-muted-foreground capitalize tracking-widest"
													>Goals</span
												>
											</div>
											<div class="text-4xl font-bold tracking-tight">4/5</div>
											<div class="text-sm text-muted-foreground mt-2 font-semibold">
												Completed milestones
											</div>
										</div>
									</div>

									<div class="space-y-4 pt-4">
										<div class="flex items-center justify-between mb-2">
											<span class="text-sm font-bold capitalize tracking-widest"
												>Overall Progress</span
											>
											<span class="text-sm font-bold text-primary">{healthScore}%</span>
										</div>
										<div
											class="h-4 w-full bg-muted/20 rounded-full overflow-hidden border border-border/40 p-1"
										>
											<div
												class="h-full bg-linear-to-r from-primary to-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
												style="width: {healthScore}%"
											></div>
										</div>
									</div>
								</div>
							</div>
						</Card.Content>
					</Card.Root>

					<!-- Action Grid -->
					<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{@render actionCard(
							'/telemedicine',
							'Telemedicine',
							'Video Consults',
							Stethoscope,
							'bg-blue-600 shadow-blue-500/20'
						)}
						{@render actionCard(
							'/diet-tracking',
							'Diet Monitoring',
							'Dietitian Support',
							UtensilsCrossed,
							'bg-emerald-600 shadow-emerald-500/20'
						)}

						{@render actionCard(
							'/ai-buddy',
							'AI Buddy',
							'Health Intelligence',
							Bot,
							'bg-purple-600 shadow-purple-500/20'
						)}
					</div>

					<!-- Quick Log Section -->
					<div class="bg-card border-none shadow-2xl p-4 rounded-xl">
						<div class="flex flex-col sm:flex-row items-center justify-between gap-8 md:gap-4 mb-8">
							<div class="flex items-center gap-4">
								<div class="p-3 bg-primary/10 shrink-0 rounded-xl">
									<Zap class="w-8 h-8 text-primary" />
								</div>
								<h3 class="text-xl sm:text-2xl font-bold tracking-tight">Quick Log Entry</h3>
							</div>
						</div>
						<div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
							{@render quickLogTrigger(Droplets, 'Water', 'text-blue-500', 'bg-blue-500/20')}
							{@render quickLogTrigger(
								UtensilsCrossed,
								'Meal',
								'text-green-500',
								'bg-green-500/20'
							)}
							{@render quickLogTrigger(Dumbbell, 'Workout', 'text-orange-500', 'bg-orange-500/20')}
							{@render quickLogTrigger(Heart, 'Vitals', 'text-red-500', 'bg-red-500/20')}
							{@render quickLogTrigger(Weight, 'Weight', 'text-purple-500', 'bg-purple-500/20')}
							{@render quickLogTrigger(Smile, 'Mood', 'text-yellow-500', 'bg-yellow-500/20')}
						</div>
					</div>
				</div>

				<!-- Right Column -->
				<div class="lg:col-span-4 space-y-8">
					<!-- Vital Monitoring -->
					<Card.Root class="bg-card border-none shadow-2xl overflow-hidden">
						<Card.Content class="p-4">
							<h3 class="text-xl font-bold mb-8 flex items-center gap-3">
								<Activity class="text-primary w-6 h-6" />
								Vital Monitoring
							</h3>
							<div class="space-y-8">
								{@render vitalEntry(
									Heart,
									'Blood Pressure',
									`${healthData.systolic}/${healthData.diastolic}`,
									'Normal',
									'text-red-500'
								)}
								{@render progressEntry(
									Footprints,
									'Daily Steps',
									(healthData.steps || 0).toLocaleString(),
									'10,000',
									((healthData.steps || 0) / 10000) * 100,
									'text-primary'
								)}
								{@render progressEntry(
									Droplets,
									'Hydration',
									(healthData.hydration || 0).toString(),
									'8 glasses',
									((healthData.hydration || 0) / 8) * 100,
									'text-blue-500'
								)}
								{@render vitalEntry(
									Moon,
									'Sleep Duration',
									`${(healthData.sleepDuration || 450) / 60}h`,
									'Good',
									'text-indigo-500'
								)}
							</div>
						</Card.Content>
					</Card.Root>

					<!-- AI Buddy greeting -->
					<div
						class="bg-linear-to-br from-primary to-emerald-700 p-4 shadow-2xl relative overflow-hidden group text-white rounded-xl"
					>
						<div
							class="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-150"
						></div>
						<div class="flex items-center gap-5 mb-6">
							<div
								class="w-14 h-14 bg-black/20 backdrop-blur-xl flex items-center justify-center border border-white/20 rounded-xl"
							>
								<Bot class="w-8 h-8 text-white" />
							</div>
							<div>
								<div class="text-sm font-bold capitalize tracking-widest opacity-80">
									AI Health Buddy
								</div>
								<div class="text-xl font-bold">Dr. Enosh</div>
							</div>
						</div>
						<div
							class="bg-black/20 backdrop-blur-md p-5 border border-white/10 italic text-sm md:text-base leading-relaxed mb-8 rounded-xl"
						>
							"{data.aiGreeting ||
								'Good morning! Your consistency with steps is amazing. Try to get those last 2 glasses of water before 8 PM.'}"
						</div>

						<!-- Quick Links from Dr. Enosh -->
						<div class="grid grid-cols-2 gap-2 mb-8">
							<a
								href="/telemedicine"
								class="flex items-center gap-2 p-3 bg-white/10 hover:bg-white/20 transition-all text-xs font-bold rounded-xl border border-white/10"
							>
								<ExternalLink class="w-3.5 h-3.5" /> Book Doctor
							</a>
							<a
								href="/community"
								class="flex items-center gap-2 p-3 bg-white/10 hover:bg-white/20 transition-all text-xs font-bold rounded-xl border border-white/10"
							>
								<ExternalLink class="w-3.5 h-3.5" /> Community
							</a>

							<a
								href="/diet-tracking"
								class="flex items-center gap-2 p-3 bg-white/10 hover:bg-white/20 transition-all text-xs font-bold rounded-xl border border-white/10"
							>
								<ExternalLink class="w-3.5 h-3.5" /> Diet Plans
							</a>
						</div>
						<Button
							href="/ai-buddy"
							class="w-full bg-white text-primary hover:bg-white/90 font-bold shadow-xl shadow-black/20 gap-3"
						>
							<MessageCircle class="w-5 h-5" />
							Chat Now
						</Button>
					</div>

					<!-- Success Stories snippet -->
					<Card.Root class="bg-card border-none shadow-2xl">
						<Card.Content class="p-4 space-y-6">
							<h3 class="text-xl font-bold flex items-center gap-3">
								<Trophy class="text-orange-500 w-6 h-6" />
								Community News
							</h3>
							<div class="space-y-4">
								<div
									class="p-4 bg-transparent border border-border/40 flex items-center gap-4 hover:bg-muted/30 cursor-pointer transition-all rounded-xl"
								>
									<div
										class="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0"
									>
										<Trophy class="w-5 h-5 text-orange-500" />
									</div>
									<div class="flex-1 min-w-0">
										<p class="font-semibold text-sm truncate">Hypertension Goal Reached!</p>
										<p class="text-sm text-muted-foreground capitalize tracking-widest font-bold">
											Success Story
										</p>
									</div>
									<ChevronRight class="w-4 h-4 text-muted-foreground" />
								</div>
								<div
									class="p-4 bg-transparent border border-border/40 flex items-center gap-4 hover:bg-muted/30 cursor-pointer transition-all"
								>
									<div
										class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"
									>
										<MessageCircle class="w-5 h-5 text-blue-500" />
									</div>
									<div class="flex-1 min-w-0">
										<p class="font-semibold text-sm truncate">New Diabetes Meal Plan</p>
										<p class="text-sm text-muted-foreground capitalize tracking-widest font-bold">
											Community Note
										</p>
									</div>
									<ChevronRight class="w-4 h-4 text-muted-foreground" />
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			</div>
		{/if}

		<!-- Doctor View -->
		{#if role === 'doctor'}
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				{@render doctorStatCard(
					'Total Earnings',
					formatCurrency(data.stats?.earnings || 0),
					Wallet,
					'text-primary bg-primary/10'
				)}
				{@render doctorStatCard(
					'Patient Pool',
					(data.stats?.totalPatients || 0).toString(),
					Users,
					'text-emerald-500 bg-emerald-500/10'
				)}
				{@render doctorStatCard(
					'Confirmed Slots',
					(data.stats?.upcomingCount || 0).toString(),
					Calendar,
					'text-blue-500 bg-blue-500/10'
				)}
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
				<div class="lg:col-span-8">
					<Card.Root class="bg-transparent border-border/40 shadow-sm overflow-hidden">
						<Card.Header class="p-10 border-b border-white/5">
							<Card.Title class="text-3xl font-bold">Upcoming Consultations</Card.Title>
							<Card.Description class="font-semibold"
								>Next sessions scheduled with confirmed patients.</Card.Description
							>
						</Card.Header>
						<Card.Content class="p-0">
							{#each data.upcoming || [] as session}
								<a
									href="/telemedicine/doctor/consultation/{session.id}"
									class="flex items-center justify-between p-4 border-b border-border/40 shadow-sm hover:bg-muted/30 transition-all"
								>
									<div class="flex items-center gap-5">
										<div
											class="w-14 h-14 bg-primary/10 flex items-center justify-center text-primary font-bold text-xl rounded-xl"
										>
											{session.user.name[0]}
										</div>
										<div>
											<p class="font-bold">{session.user.name}</p>
											<p
												class="text-xs font-semibold text-muted-foreground capitalize tracking-widest"
											>
												{session.type} • {session.appointmentTime}
											</p>
										</div>
									</div>
									<Badge class="bg-emerald-500 text-white font-bold py-2 px-4">Confirmed</Badge>
								</a>
							{:else}
								<div class="p-20 text-center opacity-40">
									<Calendar class="w-20 h-20 mx-auto mb-4" />
									<p class="font-bold text-xl">No confirmed appointments today.</p>
								</div>
							{/each}
						</Card.Content>
					</Card.Root>
				</div>
				<div class="lg:col-span-4">
					<div
						class="bg-linear-to-br from-indigo-600 to-blue-700 p-10 text-white shadow-2xl rounded-xl"
					>
						<h3 class="text-2xl font-bold mb-6">Doctor Quick Actions</h3>
						<div class="space-y-4">
							<Button
								href="/telemedicine/doctor/availability"
								class="w-full bg-white/10 hover:bg-white/20 border border-white/10 font-semibold block text-left"
							>
								Update Availability
							</Button>
							<Button
								href="/telemedicine/doctor"
								class="w-full bg-white/10 hover:bg-white/20 border border-white/10 font-semibold block text-left"
							>
								Patient Records
							</Button>
							<Button
								href="/onboarding"
								class="w-full bg-white/10 hover:bg-white/20 border border-white/10 font-semibold block text-left"
							>
								Profile Settings
							</Button>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Admin View -->
		{#if role === 'admin'}
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				{@render doctorStatCard(
					'System Users',
					(data.stats?.totalUsers || 0).toString(),
					Users,
					'text-primary bg-primary/10'
				)}
				{@render doctorStatCard(
					'Total Volume',
					(data.stats?.totalConsultations || 0).toString(),
					Stethoscope,
					'text-emerald-500 bg-emerald-500/10'
				)}
				{@render doctorStatCard(
					'Platform Revenue',
					formatCurrency(data.stats?.totalRevenue || 0),
					Wallet,
					'text-blue-500 bg-blue-500/10'
				)}
			</div>
		{/if}
	</div>
</div>

<LogDialog bind:open={logOpen} type={logType} onSuccess={() => invalidateAll()} />

<!-- Snippets -->
{#snippet actionCard(href: string, title: string, subtitle: string, icon: any, colorClass: string)}
	{@const Icon = icon}
	<a
		{href}
		class="group p-4 {colorClass} text-white shadow-2xl transition-all hover:-translate-y-2 relative overflow-hidden flex flex-col items-start rounded-xl"
	>
		<div
			class="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full transition-transform group-hover:scale-[2]"
		></div>
		<Icon class="w-8 h-8 mb-6 drop-shadow-lg" />
		<div class="text-xl font-bold tracking-tight">{title}</div>
		<div class="text-sm capitalize font-bold tracking-widest opacity-80 mt-1">{subtitle}</div>
	</a>
{/snippet}

{#snippet quickLogTrigger(icon: any, label: string, color: string, bg: string)}
	{@const Icon = icon}
	<button
		onclick={() => openLog(label)}
		class={cn(
			buttonVariants({ variant: 'outline' }),
			'flex flex-col items-center justify-center p-6 bg-transparent border border-border/40 hover:bg-muted/50 hover:scale-[1.02] active:scale-95 transition-all group aspect-square md:aspect-auto size-full'
		)}
	>
		<div class="p-4 {bg} mb-4 shadow-xl group-hover:rotate-12 transition-transform rounded-lg">
			<Icon class="w-8 h-8 {color}" />
		</div>
		<span class="text-sm font-bold capitalize tracking-widest text-muted-foreground">{label}</span>
	</button>
{/snippet}

{#snippet vitalEntry(icon: any, label: string, value: string, badge: string, color: string)}
	{@const Icon = icon}
	<div class="flex items-center justify-between group">
		<div class="flex items-center gap-5">
			<div class="p-3 bg-white/5 border border-white/5 rounded-lg">
				<Icon class="w-5 h-5 {color}" />
			</div>
			<div>
				<div class="text-sm font-bold capitalize tracking-widest text-muted-foreground mb-1">
					{label}
				</div>
				<div class="text-2xl font-bold tracking-tight">{value}</div>
			</div>
		</div>
		<Badge
			variant="outline"
			class="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 capitalize text-sm font-bold"
			>{badge}</Badge
		>
	</div>
{/snippet}

{#snippet progressEntry(
	icon: any,
	label: string,
	current: string,
	target: string,
	percent: number,
	color: string
)}
	{@const Icon = icon}
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-5">
				<div class="p-3 bg-white/5 border border-white/5 rounded-lg">
					<Icon class="w-5 h-5 {color}" />
				</div>
				<div class="text-sm font-bold capitalize tracking-widest text-muted-foreground">
					{label}
				</div>
			</div>
			<div class="text-xs font-bold">
				{current} <span class="opacity-40">/ {target}</span>
			</div>
		</div>
		<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
			<div
				class="h-full bg-linear-to-r from-primary to-emerald-500 rounded-full transition-all duration-1000"
				style="width: {Math.max(5, Math.min(100, percent))}%"
			></div>
		</div>
	</div>
{/snippet}

{#snippet doctorStatCard(label: string, value: string, icon: any, colorClass: string)}
	{@const Icon = icon}
	<Card.Root class="bg-transparent border-border/40 p-4 shadow-sm relative overflow-hidden group">
		<div class="flex items-center justify-between mb-4">
			<div class="p-4 {colorClass.split(' ')[1]} rounded-xl">
				<Icon class="w-8 h-8 {colorClass.split(' ')[0]}" />
			</div>
		</div>
		<div>
			<div class="text-sm font-bold capitalize tracking-widest text-muted-foreground mb-1">
				{label}
			</div>
			<div class="text-4xl font-bold tracking-tight">{value}</div>
		</div>
	</Card.Root>
{/snippet}

<style>
	:global(.animate-in) {
		animation: fadeInTranslate 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes fadeInTranslate {
		from {
			opacity: 0;
			transform: scale(0.98) translateY(20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	:global(.lucide) {
		stroke-width: 2.5px !important;
	}
</style>
