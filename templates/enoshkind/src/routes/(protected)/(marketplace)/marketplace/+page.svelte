<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import {
		ShoppingBag,
		Pill,
		Activity,
		Heart,
		Bell,
		Lock,
		Star,
		Sparkles,
		ArrowRight,
		Clock,
		ShieldCheck,
		Plus
	} from '@lucide/svelte';
	import AddProductDialog from './components/AddProductDialog.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';

	let products = $state<any[]>([]);
	let loading = $state(true);
	let isAddOpen = $state(false);
	let waitlistEmail = $state('');
	let joiningWaitlist = $state(false);
	let selectedProduct = $state<any>(null);
	let isDetailsOpen = $state(false);

	const isAdmin = $derived(page.data.user?.role === 'admin');

	async function fetchProducts() {
		try {
			const res = await fetch('/api/marketplace');
			if (res.ok) {
				const result = await res.json();
				products = result.data;
			}
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function joinWaitlist() {
		if (!waitlistEmail || !waitlistEmail.includes('@')) {
			return toast.error('Please enter a valid email address');
		}

		joiningWaitlist = true;
		try {
			const res = await fetch('/api/marketplace/waitlist', {
				method: 'POST',
				body: JSON.stringify({ email: waitlistEmail })
			});
			const result = await res.json();
			if (res.ok) {
				toast.success('Waitlist Joined', {
					description: result.message || 'We will notify you on launch!'
				});
				waitlistEmail = '';
			} else {
				toast.error(result.message || 'Failed to join waitlist');
			}
		} catch (e) {
			toast.error('Connection error');
		} finally {
			joiningWaitlist = false;
		}
	}

	function showDetails(product: any) {
		selectedProduct = product;
		isDetailsOpen = true;
	}

	function scrollToCatalogue() {
		const el = document.getElementById('preview-grid');
		if (el) el.scrollIntoView({ behavior: 'smooth' });
	}

	function formatPrice(priceInKobo: number | string) {
		const price = typeof priceInKobo === 'string' ? parseFloat(priceInKobo) : priceInKobo;
		return '₦' + (price / 100).toLocaleString();
	}

	onMount(fetchProducts);
</script>

<div class="space-y-12 max-w-7xl mx-auto overflow-hidden relative">
	<!-- Decorative Background -->
	<div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
	<div class="absolute top-1/2 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>

	<!-- Hero Header -->
	<div class="text-center space-y-4 max-w-3xl mx-auto py-8">
		<Badge
			variant="outline"
			class="border-primary/30 bg-primary/5 text-primary text-xs font-bold capitalize tracking-widest px-4 py-1"
		>
			Marketplace
		</Badge>
		<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
			The Future of <span class="text-primary">Health Shopping</span>
		</h1>
		<p class="text-muted-foreground md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
			We're building a curated marketplace for authentic medical devices, testing kits, and chronic
			care medications.
		</p>
		{#if isAdmin}
			<div class="pt-4">
				<Button class="bg-primary shadow-lg shadow-primary/20" onclick={() => (isAddOpen = true)}>
					<Plus class="w-5 h-5 mr-2" /> Add New Product
				</Button>
			</div>
		{/if}
	</div>

	<!-- Waitlist Box -->
	<Card.Root
		class="max-w-2xl mx-auto bg-card/60 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/5 overflow-hidden"
	>
		<Card.Content class="p-8 md:p-10 text-center space-y-6">
			<div class="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-2 rounded-xl">
				<Bell class="w-8 h-8 text-primary animate-bounce" />
			</div>
			<div class="space-y-2">
				<h2 class="text-2xl font-bold">Get Early Access</h2>
				<p class="text-sm text-muted-foreground">
					Be the first to know when we launch and receive an exclusive 20% discount on your first
					device.
				</p>
			</div>
			<div class="flex flex-col sm:flex-row gap-3">
				<Input
					placeholder="Enter your email address"
					class="text-base px-6 bg-background/50"
					bind:value={waitlistEmail}
				/>
				<Button
					class="px-8 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
					onclick={joinWaitlist}
					disabled={joiningWaitlist}
				>
					{joiningWaitlist ? 'Joining...' : 'Notify Me'}
				</Button>
			</div>
			<p
				class="text-sm text-muted-foreground capitalize font-bold flex items-center justify-center gap-2"
			>
				<Lock class="w-3 h-3" />
				Private & Secure Launch • 2026 Q1
			</p>
		</Card.Content>
	</Card.Root>

	<!-- Preview Grid -->
	<div class="space-y-8" id="preview-grid">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold flex items-center gap-3">
				<Sparkles class="w-6 h-6 text-primary" />
				Coming Soon Preview
			</h2>
			<button
				class="hidden sm:flex items-center gap-2 text-primary font-bold text-sm hover:underline"
				onclick={scrollToCatalogue}
			>
				View Catalogue <ArrowRight class="w-4 h-4" />
			</button>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each products as product}
				<Card.Root
					class="group relative bg-card/40 border-border/40 overflow-hidden hover:border-primary/30 transition-all duration-500"
				>
					<!-- Coming Soon Overlay -->
					<div
						class="absolute inset-0 bg-background/20 backdrop-blur-[2px] z-10 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 cursor-pointer"
						role="button"
						tabindex="0"
						onclick={() =>
							toast.info('Coming Soon', { description: 'Pre-orders will open in 2026 Q1.' })}
						onkeydown={(e) =>
							e.key === 'Enter' &&
							toast.info('Coming Soon', { description: 'Pre-orders will open in 2026 Q1.' })}
					>
						<Badge class="bg-primary text-white font-bold text-xs px-4 py-1">PRE-ORDER IN Q1</Badge>
					</div>

					<Card.Header class="p-0">
						<div
							class="aspect-video bg-muted/30 flex items-center justify-center overflow-hidden relative"
						>
							<div class="text-6xl font-bold text-muted-foreground/10 select-none">
								{product.image}
							</div>
							<div class="absolute bottom-4 left-4">
								<Badge
									variant="secondary"
									class="bg-background/80 backdrop-blur-sm border-none text-sm capitalize font-bold"
									>{product.category}</Badge
								>
							</div>
						</div>
					</Card.Header>
					<Card.Content class="p-6 space-y-4">
						<div class="flex items-start justify-between">
							<h3 class="font-bold group-hover:text-primary transition-colors">
								{product.name}
							</h3>
							<div class="flex items-center gap-1 text-sm font-bold text-primary">
								<Star class="w-4 h-4 fill-primary" />
								{product.rating || '4.9'}
							</div>
						</div>
						<p class="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
						<div class="flex items-center justify-between pt-2">
							<span class="text-xl font-bold">{formatPrice(product.price)}</span>
							<Button
								variant="ghost"
								size="sm"
								class="text-xs font-bold capitalize tracking-wider text-primary hover:bg-primary/10"
								onclick={() => showDetails(product)}
							>
								Read Details
							</Button>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</div>

	<!-- Product Details Dialog -->
	{#if selectedProduct}
		<Dialog.Root bind:open={isDetailsOpen}>
			<Dialog.Content class="sm:max-w-[500px] border-primary/20">
				<Dialog.Header>
					<div class="flex items-center gap-4 mb-4">
						<div
							class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl"
						>
							{selectedProduct.image}
						</div>
						<div>
							<Dialog.Title class="text-2xl font-bold">{selectedProduct.name}</Dialog.Title>
							<Badge variant="outline" class="mt-1">{selectedProduct.category}</Badge>
						</div>
					</div>
				</Dialog.Header>
				<div class="space-y-6">
					<div>
						<h4 class="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">
							Product Description
						</h4>
						<p class="text-muted-foreground leading-relaxed">
							{selectedProduct.description}
						</p>
					</div>
					<div class="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
						<div>
							<p class="text-sm font-bold text-muted-foreground uppercase tracking-widest">Price</p>
							<p class="text-2xl font-bold">{formatPrice(selectedProduct.price)}</p>
						</div>
						<div class="text-right">
							<p class="text-sm font-bold text-muted-foreground uppercase tracking-widest">
								Availability
							</p>
							<p class="font-bold text-primary">Q1 2026</p>
						</div>
					</div>
					<Button
						class="w-full bg-primary font-bold text-lg rounded-2xl"
						onclick={() => (isDetailsOpen = false)}
					>
						Close Details
					</Button>
				</div>
			</Dialog.Content>
		</Dialog.Root>
	{/if}

	<!-- Trust Bottom -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border/40">
		<div class="flex items-center gap-4">
			<div class="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
				<ShieldCheck class="w-6 h-6 text-primary" />
			</div>
			<div>
				<h4 class="font-bold text-sm">Authentic Products</h4>
				<p class="text-xs text-muted-foreground">Certified medical devices only.</p>
			</div>
		</div>
		<div class="flex items-center gap-4">
			<div class="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
				<Clock class="w-6 h-6 text-primary" />
			</div>
			<div>
				<h4 class="font-bold text-sm">Fast Logistics</h4>
				<p class="text-xs text-muted-foreground">Doorstep delivery across Nigeria.</p>
			</div>
		</div>
		<div class="flex items-center gap-4">
			<div class="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
				<Heart class="w-6 h-6 text-primary" />
			</div>
			<div>
				<h4 class="font-bold text-sm">Chronic Care Ready</h4>
				<p class="text-xs text-muted-foreground">Subscribed refills for medications.</p>
			</div>
		</div>
	</div>

	<AddProductDialog bind:open={isAddOpen} onAdded={fetchProducts} />
</div>
