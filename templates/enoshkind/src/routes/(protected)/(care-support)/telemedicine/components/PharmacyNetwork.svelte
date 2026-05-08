<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		MapPin,
		Search,
		Navigation,
		Phone,
		Clock,
		ShieldCheck,
		Truck,
		ChevronRight,
		ExternalLink,
		Star,
		Store
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let searchQuery = $state('');

	const pharmacies = [
		{
			name: 'HealthPlus Pharmacy',
			location: 'Victoria Island, Lagos',
			distance: '0.8 km',
			rating: 4.8,
			reviews: 1240,
			status: 'Open 24/7',
			services: ['Insurance Accepted', 'Delivery', 'Vaccinations']
		},
		{
			name: 'Medplus Pharmacy',
			location: 'Lekki Phase 1, Lagos',
			distance: '1.2 km',
			rating: 4.7,
			reviews: 850,
			status: 'Open until 10 PM',
			services: ['Home Delivery', 'Wellness Clinic']
		},
		{
			name: 'Nett Pharmacy',
			location: 'Ikeja GRA, Lagos',
			distance: '2.5 km',
			rating: 4.9,
			reviews: 520,
			status: 'Open until 9 PM',
			services: ['Compounding', 'Fast Pickup']
		},
		{
			name: 'Alpha Pharmacy',
			location: 'Abuja Central, FCT',
			distance: 'Remote',
			rating: 4.6,
			reviews: 310,
			status: 'Open 24/7',
			services: ['Specialty Meds', 'Delivery']
		}
	];

	let filteredPharmacies = $derived(
		pharmacies.filter(
			(p) =>
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.location.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function openMap(p: any) {
		toast.success(`Opening directions to ${p.name}`, {
			description: `Navigating to ${p.location}...`
		});
	}
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
	<!-- Hero Section with Map Overlay -->
	<div
		class="relative min-h-[400px] md:h-[400px] rounded-xl overflow-hidden shadow-lg border border-border/50"
	>
		<!-- Pseudo-Map Background (World Class Visual) -->
		<div class="absolute inset-0 bg-[#0f172a]">
			<div
				class="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 to-transparent"
			></div>
			<!-- SVG Map Pattern -->
			<svg width="100%" height="100%" class="absolute inset-0 opacity-20">
				<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
					<path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5" />
				</pattern>
				<rect width="100%" height="100%" fill="url(#grid)" />
			</svg>

			<!-- Animated Pins -->
			{#each [{ t: 30, l: 40, c: 'primary' }, { t: 60, l: 70, c: 'emerald' }, { t: 20, l: 80, c: 'blue' }, { t: 70, l: 20, c: 'violet' }] as pin}
				<div
					class="absolute w-4 h-4 rounded-full bg-{pin.c}-500 shadow-[0_0_20px_rgba(var(--{pin.c}),0.8)] animate-pulse"
					style="top: {pin.t}%; left: {pin.l}%"
				>
					<div
						class="absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-{pin.c}-500/50 scale-150 animate-ping"
					></div>
				</div>
			{/each}
		</div>

		<!-- UI Overlay -->
		<div
			class="absolute inset-0 bg-gradient-to-t from-background to-transparent flex flex-col justify-end p-8 md:p-12"
		>
			<div class="max-w-2xl space-y-4 relative z-10">
				<Badge
					class="bg-primary/20 text-primary border-primary/20 backdrop-blur-md px-4 py-1.5 font-bold"
				>
					PHARMACY LOCATOR v2.0
				</Badge>
				<h2 class="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
					Find Certified Pharmacies <br />
					<span class="text-primary italic">In Real-Time</span>
				</h2>
				<p class="text-white/70 font-medium max-w-lg">
					Access a nationwide network of 200+ partner pharmacies with verified stock and instant
					home delivery options.
				</p>

				<div class="flex flex-col md:flex-row gap-4 pt-4">
					<div class="relative flex-1">
						<Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
						<input
							bind:value={searchQuery}
							placeholder="Search pharmacies..."
							class="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-lg text-sm md:text-base"
						/>
					</div>
					<Button class="px-8 bg-primary font-bold shadow-lg shadow-primary/20">
						<Navigation class="w-5 h-5 mr-2" />
						Find Near Me
					</Button>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Directory Content -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
		<!-- Stats Column -->
		<div class="lg:col-span-1 space-y-6">
			<Card.Root
				class="bg-card/40 backdrop-blur-xl border-border/50 rounded-xl overflow-hidden shadow-lg border-2"
			>
				<Card.Header>
					<Card.Title class="text-xl font-bold flex items-center gap-3">
						<ShieldCheck class="w-6 h-6 text-emerald-500" />
						Verified Network
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="grid grid-cols-2 gap-4">
						<div class="p-4 bg-primary/5 border border-primary/10 text-center">
							<p class="text-3xl font-bold text-primary">214</p>
							<p class="text-sm font-bold text-muted-foreground capitalize">Partners</p>
						</div>
						<div class="p-4 bg-emerald-500/5 border border-emerald-500/10 text-center">
							<p class="text-3xl font-bold text-emerald-500">100%</p>
							<p class="text-sm font-bold text-muted-foreground capitalize">Certified</p>
						</div>
					</div>

					<div class="space-y-4">
						{#each [{ icon: Truck, title: 'Rapid Delivery', desc: 'Avg. 45 min delivery time' }, { icon: Clock, title: '24/7 Access', desc: 'Critical care anytime' }, { icon: Store, title: 'Click & Collect', desc: 'Skip the pharmaceutical queue' }] as feature}
							<div class="flex items-center gap-4 group">
								<div class="w-10 h-10 bg-muted flex items-center justify-center shrink-0">
									<feature.icon class="w-5 h-5 text-muted-foreground" />
								</div>
								<div>
									<p class="text-sm font-bold leading-tight">{feature.title}</p>
									<p class="text-xs text-muted-foreground font-medium">{feature.desc}</p>
								</div>
							</div>
						{/each}
					</div>

					<Button variant="outline" class="w-full border-dashed border-2">
						Join Partner Network
					</Button>
				</Card.Content>
			</Card.Root>

			<!-- Advertisement/Tip Card -->
			<div
				class="bg-gradient-to-br from-indigo-600 to-indigo-700/60 rounded-xl p-8 text-white relative overflow-hidden shadow-lg"
			>
				<div
					class="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl transform transition-transform"
				></div>
				<h3 class="text-2xl font-bold relative z-10">Smart Refills</h3>
				<p class="text-white/70 font-medium mt-2 relative z-10">
					Never miss a dose. Enable AI-powered refills and get your meds before they run out.
				</p>
				<Button class="mt-6 bg-white text-indigo-700 px-6 border-none">
					Enable Now
					<ChevronRight class="w-4 h-4 ml-2" />
				</Button>
			</div>
		</div>

		<!-- List Column -->
		<div class="lg:col-span-2 space-y-6">
			<div class="flex items-center justify-between px-2">
				<h3 class="text-2xl font-bold flex items-center gap-3">
					<MapPin class="w-7 h-7 text-primary" />
					Local Pharmacies
				</h3>
				<div class="flex gap-2">
					<Button variant="ghost" size="icon" class="bg-muted/50"><Search class="w-4 h-4" /></Button
					>
					<Button variant="ghost" size="icon" class="bg-muted/50"
						><Navigation class="w-4 h-4" /></Button
					>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each filteredPharmacies as pharmacy}
					<Card.Root
						class="transition-all duration-500 border-border/40 overflow-hidden bg-card/40 backdrop-blur-xl rounded-xl"
					>
						<Card.Content class="p-6 space-y-4">
							<div class="flex justify-between items-start">
								<div>
									<h4 class="font-bold">
										{pharmacy.name}
									</h4>
									<p class="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-1">
										<MapPin class="w-3 h-3" />
										{pharmacy.location}
									</p>
								</div>
								<div class="flex flex-col items-end">
									<div class="flex items-center gap-1 font-bold text-amber-500">
										<Star class="w-3.5 h-3.5 fill-current" />
										{pharmacy.rating}
									</div>
									<span
										class="text-[9px] text-muted-foreground font-bold capitalize tracking-tighter"
										>{pharmacy.reviews} Reviews</span
									>
								</div>
							</div>

							<div class="flex flex-wrap gap-2">
								{#each pharmacy.services as service}
									<Badge
										variant="secondary"
										class="bg-primary/5 text-primary border-none font-bold text-[9px] capitalize px-2 py-0.5"
									>
										{service}
									</Badge>
								{/each}
							</div>

							<div class="pt-4 border-t border-border/40 flex items-center justify-between">
								<div class="flex flex-col">
									<p class="text-sm font-bold text-emerald-500 capitalize tracking-widest">
										{pharmacy.status}
									</p>
									<p class="text-xs font-bold text-muted-foreground">{pharmacy.distance}</p>
								</div>
								<div class="flex gap-2">
									<Button variant="ghost" size="icon">
										<Phone class="w-4 h-4" />
									</Button>
									<Button
										class="font-bold bg-primary px-4 shadow-lg shadow-primary/10"
										onclick={() => openMap(pharmacy)}
									>
										Directions
									</Button>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				{:else}
					<div class="col-span-full py-20 text-center space-y-4">
						<div
							class="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto opacity-20"
						>
							<Search class="w-10 h-10" />
						</div>
						<p class="text-muted-foreground font-bold text-xl">
							No pharmacies found matching your search.
						</p>
						<Button variant="link" class="text-primary" onclick={() => (searchQuery = '')}
							>Clear all filters</Button
						>
					</div>
				{/each}
			</div>

			<!-- Bottom CTA -->
			<div
				class="p-8 rounded-xl bg-card/40 border border-border/50 text-center space-y-4 relative overflow-hidden"
			>
				<div class="absolute inset-0 bg-primary/5 opacity-0 transition-opacity"></div>
				<h4 class="text-xl font-bold relative z-10">Don't see your local pharmacy?</h4>
				<p class="text-muted-foreground font-medium relative z-10">
					We're expanding rapidly. Suggest a pharmacy to join our network.
				</p>
				<Button class="relative z-10">Suggest a Pharmacy</Button>
			</div>
		</div>
	</div>
</div>
