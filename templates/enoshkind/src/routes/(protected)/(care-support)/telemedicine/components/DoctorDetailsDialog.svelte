<script lang="ts">
	import type { iDoctor } from '$lib/interface';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Avatar from '$lib/components/ui/avatar';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Star, Clock, ArrowRight, Stethoscope, Info } from '@lucide/svelte';

	let {
		open = $bindable(false),
		doctor,
		onBook
	} = $props<{
		open: boolean;
		doctor: iDoctor | null;
		onBook: (doctor: iDoctor) => void;
	}>();
</script>

{#if doctor}
	<Dialog.Root bind:open>
		<Dialog.Content
			class="max-w-[500px] w-full p-0 rounded-[2.5rem] border border-border/40 bg-card/60 backdrop-blur-3xl shadow-2xl overflow-hidden"
		>
			<ScrollArea class="max-h-[85vh]">
				<div class="space-y-8 p-6 md:p-10">
					<!-- Profile Section -->
					<div class="flex flex-col items-center text-center space-y-5">
						<div class="relative">
							<Avatar.Root
								class="w-24 h-24 md:w-28 md:h-28 shadow-2xl border-4 border-background ring-2 ring-primary/20 transition-transform duration-500 hover:scale-105"
							>
								{#if doctor.image}
									<Avatar.Image src={doctor.image} alt={doctor.name} class="object-cover" />
								{/if}
								<Avatar.Fallback class="bg-primary/10 text-primary font-bold text-3xl">
									{doctor.name
										.split(' ')
										.map((n: any) => n[0])
										.join('')}
								</Avatar.Fallback>
							</Avatar.Root>
							{#if doctor.available}
								<div class="absolute -bottom-1 -right-1">
									<Badge
										class="bg-emerald-500 text-white border-2 border-background font-bold px-3 py-1 rounded-full text-[10px] md:text-xs shadow-lg"
									>
										{doctor.available}
									</Badge>
								</div>
							{/if}
						</div>

						<div class="space-y-2">
							<h2
								class="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
							>
								{doctor.name}
							</h2>
							<div
								class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary font-bold text-xs md:text-sm capitalize"
							>
								<Stethoscope class="w-4 h-4" />
								{doctor.specialty}
							</div>
						</div>
					</div>

					<!-- Info Hub -->
					<div class="grid grid-cols-2 gap-4">
						<div
							class="p-4 md:p-5 rounded-3xl bg-muted/30 border border-border/20 space-y-2 group transition-colors hover:bg-muted/40 text-center"
						>
							<div class="flex items-center justify-center gap-1.5">
								<Star
									class="w-5 h-5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform"
								/>
								<span class="text-lg md:text-xl font-bold">{doctor.rating || '0.0'}</span>
							</div>
							<p
								class="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]"
							>
								{doctor.reviews || 0} Reviews
							</p>
						</div>
						<div
							class="p-4 md:p-5 rounded-3xl bg-muted/30 border border-border/20 space-y-2 group transition-colors hover:bg-muted/40 text-center"
						>
							<div class="flex items-center justify-center gap-1.5">
								<Clock class="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
								<span class="text-lg md:text-xl font-bold"
									>45<span class="text-sm font-normal">m</span></span
								>
							</div>
							<p
								class="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]"
							>
								Per Session
							</p>
						</div>
					</div>

					<!-- Biography Section -->
					<div class="space-y-4">
						<div
							class="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px] md:text-xs"
						>
							<Info class="w-4 h-4" />
							Biography
						</div>
						<div class="p-4 md:p-6 rounded-3xl bg-muted/20 border border-border/10">
							<p class="text-xs md:text-sm leading-relaxed text-muted-foreground font-medium">
								{doctor.bio ||
									`Dr. ${doctor.name.split(' ').pop()} is a dedicated ${doctor.specialty} with years of clinical experience.`}
							</p>
						</div>
					</div>

					<!-- Price & Booking -->
					<div class="space-y-4 pt-8 border-t border-border/20">
						<div class="flex flex-col md:flex-row items-center justify-between gap-6">
							<div class="space-y-0.5 text-center md:text-left">
								<p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
									Consultation Fee
								</p>
								<p class="text-2xl md:text-3xl font-bold text-primary">
									₦{(doctor.price / 100).toLocaleString()}
								</p>
							</div>
							<Button
								class="w-full md:w-auto rounded-xl px-10 py-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 group"
								onclick={() => {
									open = false;
									onBook(doctor);
								}}
							>
								Book Now
								<ArrowRight class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
							</Button>
						</div>
					</div>
				</div>
			</ScrollArea>
		</Dialog.Content>
	</Dialog.Root>
{/if}
