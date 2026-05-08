<script lang="ts">
	import type { iDoctor } from '$lib/interface';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Avatar from '$lib/components/ui/avatar';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Star, Clock, ArrowRight } from '@lucide/svelte';

	interface Props {
		doctors: iDoctor[];
		onBook: (doctor: iDoctor) => void;
	}

	let { doctors, onBook }: Props = $props();
</script>

<div
	class="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden shadow-xl"
>
	<Table>
		<TableHeader class="bg-muted/50">
			<TableRow class="hover:bg-transparent border-border/50">
				<TableHead class="font-bold text-sm capitalize tracking-widest text-primary py-6"
					>Specialist</TableHead
				>
				<TableHead class="font-bold text-sm capitalize tracking-widest text-primary"
					>Specialty</TableHead
				>
				<TableHead class="font-bold text-sm capitalize tracking-widest text-primary"
					>Availability</TableHead
				>
				<TableHead class="font-bold text-sm capitalize tracking-widest text-primary"
					>Rating</TableHead
				>
				<TableHead class="font-bold text-sm capitalize tracking-widest text-primary text-right"
					>Fee</TableHead
				>
				<TableHead class="font-bold text-sm capitalize tracking-widest text-primary text-right"
					>Action</TableHead
				>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#if doctors.length === 0}
				<TableRow>
					<TableCell colspan={6} class="h-32 text-center text-muted-foreground font-medium">
						No specialists found matching your search.
					</TableCell>
				</TableRow>
			{:else}
				{#each doctors as doctor}
					<TableRow class="border-border/30 transition-colors">
						<TableCell>
							<div class="flex items-center gap-4">
								<Avatar.Root class="w-12 h-12 shadow-sm border border-border/50">
									<Avatar.Fallback class="bg-primary/10 text-primary font-bold">
										{doctor.name
											.split(' ')
											.map((n) => n[0])
											.join('')}
									</Avatar.Fallback>
								</Avatar.Root>
								<span class="font-bold text-base text-foreground/90">{doctor.name}</span>
							</div>
						</TableCell>
						<TableCell>
							<Badge
								variant="secondary"
								class="bg-primary/5 text-primary border-none font-bold text-sm capitalize"
							>
								{doctor.specialty}
							</Badge>
						</TableCell>
						<TableCell>
							{#if doctor.available}
								<Badge
									variant="outline"
									class="border-emerald-500/20 text-emerald-500 bg-emerald-500/5 font-bold text-sm capitalize"
								>
									{doctor.available}
								</Badge>
							{:else}
								<span class="text-muted-foreground text-xs italic">Not set</span>
							{/if}
						</TableCell>
						<TableCell>
							<div class="flex items-center gap-1.5">
								<Star class="w-4 h-4 fill-amber-400 text-amber-400" />
								<span class="font-bold">{doctor.rating || '0.0'}</span>
								<span class="text-sm text-muted-foreground font-medium capitalize"
									>({doctor.reviews || 0})</span
								>
							</div>
						</TableCell>
						<TableCell class="text-right">
							<span class=" font-bold text-primary">
								₦{(doctor.price / 100).toLocaleString()}
							</span>
						</TableCell>
						<TableCell class="text-right">
							<Button
								size="sm"
								class="rounded-xl font-bold bg-primary shadow-sm"
								onclick={() => onBook(doctor)}
							>
								Book Now
								<ArrowRight class="ml-2 w-4 h-4" />
							</Button>
						</TableCell>
					</TableRow>
				{/each}
			{/if}
		</TableBody>
	</Table>
</div>
