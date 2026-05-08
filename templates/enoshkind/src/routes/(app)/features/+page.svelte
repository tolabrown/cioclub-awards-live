<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Bot,
		Activity,
		Stethoscope,
		Users,
		Pill,
		FileText,
		ArrowRight,
		CheckCircle2
	} from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';

	const features = [
		{
			title: 'AI Health Buddy',
			description:
				'Your 24/7 personal health assistant. Get answers to health queries, medication reminders, and lifestyle advice tailored to your needs.',
			icon: Bot,
			color: 'text-blue-500',
			bg: 'bg-blue-500/10'
		},
		{
			title: 'Vital Monitoring',
			description:
				'Track your blood pressure, heart rate, and weight over time. Visualize trends and share reports directly with your doctor.',
			icon: Activity,
			color: 'text-red-500',
			bg: 'bg-red-500/10'
		},
		{
			title: 'Telemedicine Hub',
			description:
				'Book instant virtual consultations with certified doctors. Get prescriptions and medical advice from the comfort of your home.',
			icon: Stethoscope,
			color: 'text-emerald-500',
			bg: 'bg-emerald-500/10'
		},
		{
			title: 'Community Cycles',
			description:
				'Join supportive health circles focused on chronic condition management. Share experiences and learn from others in a safe space.',
			icon: Users,
			color: 'text-purple-500',
			bg: 'bg-purple-500/10'
		},
		{
			title: 'Digital Pharmacy',
			description:
				'Order medications and health devices directly through our marketplace. Fast delivery and verified quality across Nigeria.',
			icon: Pill,
			color: 'text-amber-500',
			bg: 'bg-amber-500/10'
		},
		{
			title: 'Smart Health Records',
			description:
				'Keep all your medical history, test results, and prescriptions in one secure, encrypted place. Never lose a report again.',
			icon: FileText,
			color: 'text-indigo-500',
			bg: 'bg-indigo-500/10'
		}
	];

	const featureHighlights = [
		'Built specifically for the Nigerian healthcare context',
		'Data-driven insights tailored to your specific vitals',
		'Seamless communication between patients and practitioners',
		'Secure and private by design (HIPAA compliant)'
	];
</script>

<svelte:head>
	<title>Features | EnoshKind - AI Health Intelligence</title>
	<meta
		name="description"
		content="Discover the powerful features of EnoshKind designed to transform your healthcare journey with AI, remote monitoring, and community support."
	/>
</svelte:head>

<div class="flex flex-col overflow-x-hidden">
	<!-- Hero Section -->
	<section class="relative py-20 lg:py-32 overflow-hidden bg-muted/30">
		<div class="container relative z-10 mx-auto px-4">
			<div class="max-w-3xl mx-auto text-center" in:fly={{ y: 20, duration: 800 }}>
				<h1 class="font-bold tracking-tight mb-4">
					Intelligent Features for <span
						class="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent"
						>Total Well-being</span
					>
				</h1>
				<p class="text-muted-foreground mb-4">
					EnoshKind combines cutting-edge AI technology with human expertise to provide a
					comprehensive health management ecosystem.
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<Button href="/dashboard" class="shadow-lg shadow-primary/20">
						Get Started Now
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button>
					<Button href="#features-grid" variant="outline">Explore Features</Button>
				</div>
			</div>
		</div>

		<!-- Abstract background elements -->
		<div
			class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-1 opacity-20 pointer-events-none"
		>
			<div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
			<div
				class="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
			></div>
		</div>
	</section>

	<!-- Features Grid -->
	<section id="features-grid" class="py-24 bg-background">
		<div class="container mx-auto px-4">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each features as feature, i}
					<div
						class="group p-8 rounded-3xl border bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
						in:fly={{ y: 20, delay: i * 100, duration: 800 }}
					>
						<div
							class="w-14 h-14 {feature.bg} {feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
						>
							<feature.icon class="w-7 h-7" />
						</div>
						<h3 class="font-semibold mb-4">{feature.title}</h3>

						<p class="text-muted-foreground leading-relaxed">
							{feature.description}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Detailed Feature Highlight -->
	<section class="py-24 bg-muted/30">
		<div class="container mx-auto px-4">
			<div class="grid lg:grid-cols-2 gap-4 items-center">
				<div in:fly={{ x: -20, duration: 800 }}>
					<h2 class="font-bold mb-4">Why EnoshKind is Different</h2>
					<div class="space-y-4">
						{#each featureHighlights as item, i}
							<div class="flex items-start gap-4">
								<div class="mt-1 flex-shrink-0">
									<CheckCircle2 class="text-primary w-6 h-6" />
								</div>
								<p class=" text-muted-foreground">{item}</p>
							</div>
						{/each}
					</div>
					<div class="mt-12">
						<Button href="/dashboard" variant="secondary">View Your Dashboard</Button>
					</div>
				</div>
				<div class="relative overflow-hidden lg:overflow-visible" in:fly={{ x: 20, duration: 800 }}>
					<div
						class="aspect-square bg-gradient-to-tr from-primary/10 to-emerald-500/5 rounded-full absolute -top-10 -right-10 w-full h-full -z-1"
					></div>
					<div class="rounded-3xl border bg-card/80 backdrop-blur-xl p-6 shadow-2xl relative">
						<!-- Mockup UI Element -->
						<div class="space-y-4">
							<div class="h-8 w-1/3 bg-muted rounded-md mb-8"></div>
							{#each [1, 2, 3] as _}
								<div class="flex items-center gap-4 border-b pb-4">
									<div class="w-12 h-12 rounded-full bg-muted"></div>
									<div class="flex-1 space-y-2">
										<div class="h-4 w-1/2 bg-muted rounded-md"></div>
										<div class="h-3 w-3/4 bg-muted/50 rounded-md"></div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
