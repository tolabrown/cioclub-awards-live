<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Heart, Shield, Users, Target, Rocket, Award } from '@lucide/svelte';
	import { fly } from 'svelte/transition';

	const values = [
		{
			title: 'Accessibility',
			description:
				'Healthcare should be available to everyone, regardless of where they live or their status.',
			icon: Shield,
			color: 'bg-blue-100 text-blue-600'
		},
		{
			title: 'Patient-Centric',
			description:
				'We build with the patient at the heart of every decision and feature we develop.',
			icon: Heart,
			color: 'bg-red-100 text-red-600'
		},
		{
			title: 'Innovation',
			description:
				'Leveraging AI and data to solve complex healthcare challenges in the Nigerian context.',
			icon: Rocket,
			color: 'bg-purple-100 text-purple-600'
		}
	];
</script>

<svelte:head>
	<title>About Us | EnoshKind - Our Mission & Vision</title>
	<meta
		name="description"
		content="Learn about EnoshKind's journey to transform healthcare in Nigeria through AI-powered health intelligence and community support."
	/>
</svelte:head>

<div class="flex flex-col">
	<!-- Story Hero -->
	<section class="py-20 lg:py-32 bg-background relative overflow-hidden">
		<div class="container mx-auto px-4">
			<div class="max-w-3xl mx-auto text-center" in:fly={{ y: 20, duration: 800 }}>
				<span
					class="px-4 py-2 rounded-full bg-primary/10 text-primary font-bold capitalize tracking-widest mb-4 inline-block"
				>
					Our Story
				</span>
				<h1 class="font-bold mb-4 leading-tight">
					Reimagining Healthcare for <span class="text-primary italic">Every Nigerian.</span>
				</h1>
				<p class="text-muted-foreground leading-relaxed">
					EnoshKind was born from a simple yet powerful observation: managing chronic health
					conditions in Nigeria is unnecessarily difficult. We set out to change that.
				</p>
			</div>
		</div>
	</section>

	<!-- Mission & Vision -->
	<section class="py-24 bg-muted/30">
		<div class="container mx-auto px-4">
			<div class="grid md:grid-cols-2 gap-4 items-center">
				<div in:fly={{ x: -20, duration: 800 }}>
					<h2 class="font-bold mb-4 italic text-primary">Our Mission</h2>

					<p class=" text-muted-foreground mb-12 leading-relaxed italic">
						"To democratize world-class healthcare intelligence, making it accessible, affordable,
						and actionable for every individual, starting with the management of chronic
						conditions."
					</p>

					<h2 class="font-bold mb-4 italic text-primary">Our Vision</h2>

					<p class=" text-muted-foreground leading-relaxed italic">
						"To be the primary health companion for every home in Africa, where AI meets human
						empathy to extend lives and improve health outcomes."
					</p>
				</div>
				<div
					class="relative aspect-square rounded-3xl overflow-hidden shadow-2xl"
					in:fly={{ x: 20, duration: 800 }}
				>
					<!-- Mock image placeholder with styling -->
					<div class="absolute inset-0 bg-gradient-to-tr from-primary/20 to-emerald-500/20"></div>
					<div class="absolute inset-0 flex items-center justify-center p-4 text-center">
						<div class="bg-card w-full p-8 rounded-2xl shadow-lg border h-full md:h-auto">
							<Target class="w-16 h-16 text-primary mx-auto mb-6" />
							<h3 class="font-bold mb-2 capitalize">50,000+</h3>
							<p class="text-muted-foreground">Lives impacted and growing daily.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Values Grid -->
	<section class="py-24 bg-background">
		<div class="container mx-auto px-4 text-center">
			<h2 class="font-bold mb-4 capitalize">What Drives Us</h2>
			<div class="grid md:grid-cols-3 gap-4">
				{#each values as value, i}
					<div
						class="group p-10 rounded-3xl border bg-card hover:shadow-xl transition-all duration-300"
						in:fly={{ y: 20, delay: i * 150, duration: 800 }}
					>
						<div
							class="w-16 h-16 {value.color} rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300"
						>
							<value.icon class="w-8 h-8" />
						</div>
						<h3 class="font-bold mb-4 capitalize tracking-tight">{value.title}</h3>

						<p class="text-muted-foreground leading-relaxed">
							{value.description}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Team/CTA -->
	<section class="py-24 bg-primary text-primary-foreground text-center">
		<div class="container mx-auto px-4">
			<h2 class="font-bold mb-4 italic">Be part of the health revolution.</h2>
			<p class="text-primary-foreground/80 mb-4 max-w-2xl mx-auto">
				Whether you're a patient looking for better care or a provider wanting to make a difference,
				there's a place for you here.
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				<Button href="/dashboard" variant="secondary">Get Started</Button>
				<Button
					href="/contact"
					variant="outline"
					class="border-white/20 text-white hover:bg-white/10"
				>
					Contact Us
				</Button>
			</div>
		</div>
	</section>
</div>
