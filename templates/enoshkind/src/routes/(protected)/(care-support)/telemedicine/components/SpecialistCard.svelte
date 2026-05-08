<script lang="ts">
	import type { iDoctor } from '$lib/interface';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Eye, Stethoscope } from '@lucide/svelte';

	interface Props {
		doctor: iDoctor;
		onBook: (doctor: iDoctor) => void;
		onViewDetails: (doctor: iDoctor) => void;
	}

	let { doctor, onBook, onViewDetails }: Props = $props();
</script>

<Card.Root
	class="relative transition-all duration-500 border-border/40 overflow-hidden bg-card/40 backdrop-blur-xl rounded-2xl group active:scale-[0.98]"
>
	<div
		class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
	></div>
	<Card.Content class="p-4 space-y-4">
		<!-- Top-Down Profile Section -->
		<div class="flex flex-col items-center text-center space-y-4">
			<div class="relative">
				<Avatar.Root
					class="w-24 h-24 transition-all shadow-xl border-4 border-background group-hover:scale-105 duration-500"
				>
					{#if doctor.image}
						<Avatar.Image src={doctor.image} alt={doctor.name} class="object-cover" />
					{/if}
					<Avatar.Fallback class="bg-primary/10 text-primary font-bold text-2xl"
						>{doctor.name
							.split(' ')
							.map((n) => n[0])
							.join('')}</Avatar.Fallback
					>
				</Avatar.Root>
				{#if doctor.available}
					<div class="absolute -bottom-1 -right-1">
						<Badge
							variant="secondary"
							class="bg-emerald-500 text-white border-2 border-background font-bold px-2 py-0.5 rounded-full text-[10px] shadow-lg uppercase"
						>
							{doctor.available}
						</Badge>
					</div>
				{/if}
			</div>

			<div class="space-y-1">
				<h3 class="font-bold text-xl text-foreground tracking-tight">{doctor.name}</h3>
				<div
					class="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full text-xs text-primary font-bold uppercase tracking-wider"
				>
					<Stethoscope class="w-3 h-3" />
					{doctor.specialty}
				</div>
			</div>
		</div>

		<!-- Price Section (Simplified) -->
		<div
			class="flex flex-col items-center text-center py-4 bg-muted/20 rounded-2xl border border-border/20"
		>
			<span class="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]"
				>Consultation Fee</span
			>
			<div class="text-3xl font-bold text-primary tabular-nums">
				₦{(doctor.price / 100).toLocaleString()}
			</div>
		</div>

		<!-- CTA Section -->
		<div class="grid grid-cols-2 gap-3 pt-2">
			<Button
				variant="outline"
				class="rounded-xl border-border/40 font-bold bg-background/50 hover:bg-background transition-colors"
				onclick={() => onViewDetails(doctor)}
			>
				<Eye class="mr-2 h-4 w-4" />
				Details
			</Button>
			<Button
				class="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 font-bold"
				onclick={() => onBook(doctor)}
			>
				Book Now
			</Button>
		</div>
	</Card.Content>
</Card.Root>
