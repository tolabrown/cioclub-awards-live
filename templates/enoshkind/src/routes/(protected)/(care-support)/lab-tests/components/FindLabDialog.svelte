<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { MapPin, Phone, Clock, ExternalLink, Navigation } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';

	let { open = $bindable(false) } = $props<{ open: boolean }>();

	const labs = [
		{
			name: 'EnoshKind Prime Lab (Lagos)',
			address: '15 Admiralty Way, Lekki Phase 1, Lagos',
			phone: '+234 801 234 5678',
			hours: 'Mon - Sat: 8:00 AM - 6:00 PM',
			verified: true,
			city: 'Lagos'
		},
		{
			name: 'SynLab Diagnostics Hub',
			address: 'Plot 4, Samuel Ladoke Akintola Blvd, Garki, Abuja',
			phone: '+234 802 333 4444',
			hours: 'Mon - Fri: 7:30 AM - 5:00 PM',
			verified: true,
			city: 'Abuja'
		},
		{
			name: 'EchoScan Center',
			address: '22 Trans-Amadi Layout, Port Harcourt',
			phone: '+234 803 999 0000',
			hours: 'Mon - Sat: 9:00 AM - 4:00 PM',
			verified: false,
			city: 'Port Harcourt'
		}
	];
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[550px] p-0 rounded-xl border-border/40 bg-card/95 backdrop-blur-2xl overflow-hidden shadow-2xl"
	>
		<div class="bg-primary p-8 text-white relative">
			<div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
			<Dialog.Header>
				<div class="flex items-center gap-3 mb-2">
					<div class="p-2 bg-white/20 rounded-xl">
						<Navigation class="w-6 h-6 text-white" />
					</div>
					<Dialog.Title class="text-2xl font-bold">Partner Laboratories</Dialog.Title>
				</div>
				<Dialog.Description class="text-white/80 font-medium">
					Visit any of our partner locations for professional sample collection.
				</Dialog.Description>
			</Dialog.Header>
		</div>

		<div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
			{#each labs as lab}
				<div
					class="p-5 rounded-2xl bg-background/50 border border-border/40 hover:border-primary/30 transition-all group space-y-4"
				>
					<div class="flex items-start justify-between">
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<h3 class="font-bold text-base">{lab.name}</h3>
								{#if lab.verified}
									<Badge
										class="bg-emerald-500/10 text-emerald-500 border-none h-5 text-[9px] font-bold capitalize"
										>Prime</Badge
									>
								{/if}
							</div>
							<div class="flex items-center gap-2 text-muted-foreground">
								<MapPin class="w-3.5 h-3.5 text-primary" />
								<span class="text-xs font-medium">{lab.address}</span>
							</div>
						</div>
						<div
							class="p-2 bg-primary/5 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors cursor-pointer"
						>
							<ExternalLink class="w-4 h-4" />
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 pt-2 border-t border-border/20">
						<div class="space-y-1">
							<p class="text-[9px] font-bold text-muted-foreground capitalize tracking-widest">
								Contact
							</p>
							<div class="flex items-center gap-2">
								<Phone class="w-3.5 h-3.5 text-primary" />
								<span class="text-xs font-bold">{lab.phone}</span>
							</div>
						</div>
						<div class="space-y-1">
							<p class="text-[9px] font-bold text-muted-foreground capitalize tracking-widest">
								Opening Hours
							</p>
							<div class="flex items-center gap-2">
								<Clock class="w-3.5 h-3.5 text-primary" />
								<span class="text-xs font-bold">{lab.hours}</span>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="p-6 pt-2">
			<Button
				variant="outline"
				class="w-full rounded-xl font-bold border-primary/20 hover:bg-primary/5"
				onclick={() => (open = false)}
			>
				Close Explorer
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.1);
		border-radius: 10px;
	}
</style>
