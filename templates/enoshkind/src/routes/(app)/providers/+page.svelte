<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Stethoscope,
		FlaskConical,
		Pill,
		BarChart3,
		Users,
		Smartphone,
		ArrowRight,
		ShieldCheck,
		Zap
	} from '@lucide/svelte';
	import { fly } from 'svelte/transition';

	const benefits = [
		{
			title: 'Direct Patient Engagement',
			description:
				'Connect with a growing network of health-conscious Nigerians seeking specialized care and monitoring.',
			icon: Users,
			color: 'text-blue-500'
		},
		{
			title: 'Smart Practice Tools',
			description:
				'Manage appointments, prescriptions, and patient vitals using our intuitive practitioner dashboard.',
			icon: BarChart3,
			color: 'text-emerald-500'
		},
		{
			title: 'Verified Network',
			description:
				'Join a trusted community of certified healthcare professionals recognized for excellence.',
			icon: ShieldCheck,
			color: 'text-purple-500'
		}
	];

	const providerTypes = [
		{
			name: 'Doctors & Specialists',
			description:
				'Provide virtual consultations, monitor chronic conditions, and manage treatments via our platform.',
			icon: Stethoscope,
			link: '/telemedicine/onboarding'
		},

		{
			name: 'Pharmacies',
			description:
				'List your products in our marketplace and reach thousands of customers across the country.',
			icon: Pill,
			link: '/contact'
		}
	];
</script>

<svelte:head>
	<title>For Providers | EnoshKind - Healthcare Innovation</title>
	<meta
		name="description"
		content="Empower your practice with EnoshKind. We provide the tools and network for doctors and pharmacies to deliver world-class care."
	/>
</svelte:head>

<div class="flex flex-col min-h-screen">
	<!-- Hero Section -->
	<section class="bg-primary/5 py-24 lg:py-32 relative overflow-hidden">
		<div class="container mx-auto px-4 relative z-10">
			<div class="max-w-4xl" in:fly={{ x: -20, duration: 800 }}>
				<h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-8">
					The Operating System for <span class="text-primary italic">Modern Healthcare</span> in Nigeria
				</h1>
				<p class="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
					EnoshKind empowers healthcare providers with the infrastructure to deliver smarter,
					data-driven, and highly accessible care to millions.
				</p>
				<div class="flex flex-wrap gap-4">
					<Button href="/telemedicine/onboarding" class="shadow-lg">
						Join as a Doctor
						<ArrowRight class="ml-2 h-5 w-5" />
					</Button>
					<Button href="/contact" variant="outline">Partner with Us</Button>
				</div>
			</div>
		</div>

		<!-- Visual element -->
		<div
			class="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent hidden lg:block"
		></div>
	</section>

	<!-- Benefits Section -->
	<section class="py-24 bg-background">
		<div class="container mx-auto px-4">
			<div class="text-center mb-20">
				<h2 class="text-3xl md:text-5xl font-bold mb-4">Why Partner with EnoshKind?</h2>
				<p class="text-muted-foreground max-w-2xl mx-auto">
					We provide the technological backbone so you can focus on what matters most: patient care.
				</p>
			</div>

			<div class="grid md:grid-cols-3 gap-12">
				{#each benefits as benefit, i}
					<div
						class="flex flex-col items-center text-center p-8 rounded-3xl border bg-card hover:border-primary transition-all duration-300"
						in:fly={{ y: 20, delay: i * 150, duration: 800 }}
					>
						<div
							class="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-8 {benefit.color}"
						>
							<benefit.icon class="w-10 h-10" />
						</div>
						<h3 class="text-2xl font-semibold mb-4">{benefit.title}</h3>
						<p class="text-muted-foreground leading-relaxed">
							{benefit.description}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Provider Types -->
	<section class="py-24 bg-muted/30">
		<div class="container mx-auto px-4">
			<div class="grid lg:grid-cols-3 gap-8">
				{#each providerTypes as p, i}
					<div
						class="relative overflow-hidden group bg-card p-10 rounded-3xl border hover:shadow-xl transition-all duration-500"
						in:fly={{ y: 30, delay: i * 100, duration: 800 }}
					>
						<div
							class="absolute -right-4 -top-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700"
						>
							<p.icon class="w-48 h-48" />
						</div>

						<h3 class="text-3xl font-bold mb-6 flex items-center gap-3">
							<p.icon class="w-8 h-8 text-primary" />
							{p.name}
						</h3>
						<p class="text-muted-foreground mb-10 leading-relaxed">
							{p.description}
						</p>
						<Button
							href={p.link}
							variant="ghost"
							class="group/btn p-0 hover:bg-transparent font-semibold"
						>
							Learn more <ArrowRight
								class="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-2"
							/>
						</Button>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Stats / Trust -->
	<section class="py-24 bg-primary text-primary-foreground relative overflow-hidden">
		<div class="container mx-auto px-4 relative z-10">
			<div class="flex flex-col md:flex-row justify-between items-center gap-12">
				<div class="max-w-md">
					<h2 class="text-3xl md:text-5xl font-bold mb-6 italic">Ready to transform healthcare?</h2>
					<p class="text-primary-foreground/80">
						Join hundreds of providers who are already making a difference with EnoshKind.
					</p>
				</div>
				<div class="grid grid-cols-2 gap-8 w-full md:w-auto">
					<div class="text-center">
						<div class="text-4xl md:text-6xl font-bold mb-2">500+</div>
						<div class="text-primary-foreground/70 capitalize tracking-widest text-sm">
							Practitioners
						</div>
					</div>
					<div class="text-center">
						<div class="text-4xl md:text-6xl font-bold mb-2">10k+</div>
						<div class="text-primary-foreground/70 capitalize tracking-widest text-sm">
							Consultations
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Subtle background pattern -->
		<div class="absolute inset-0 opacity-10 pointer-events-none">
			<div
				class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white-200 via-transparent to-transparent opacity-20"
			></div>
		</div>
	</section>
</div>
