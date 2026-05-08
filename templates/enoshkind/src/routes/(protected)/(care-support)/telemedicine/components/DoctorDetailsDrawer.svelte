<script lang="ts">
	import type { iDoctor } from '$lib/interface';
	import * as Drawer from '$lib/components/ui/drawer';
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
	<Drawer.Root bind:open>
		<Drawer.Content
			class="max-w-[500px] w-full p-0 rounded-t-[2rem] border-t border-border/40 bg-card/60 backdrop-blur-3xl shadow-2xl overflow-hidden"
		>
			<ScrollArea class="max-h-[80vh]">
				<div class="space-y-6 p-6">
					<!-- Profile Section -->
					<div class="flex flex-col items-center text-center space-y-4">
						<div class="relative">
							<Avatar.Root
								class="w-20 h-20 shadow-2xl border-4 border-background ring-2 ring-primary/20"
							>
								{#if doctor.image}
									<Avatar.Image src={doctor.image} alt={doctor.name} class="object-cover" />
								{/if}
								<Avatar.Fallback class="bg-primary/10 text-primary font-bold text-2xl">
									{doctor.name
										.split(' ')
										.map((n: any) => n[0])
										.join('')}
								</Avatar.Fallback>
							</Avatar.Root>
							{#if doctor.available}
								<div class="absolute -bottom-1 -right-1">
									<Badge
										class="bg-emerald-500 text-white border-2 border-background font-bold px-2 py-0.5 rounded-full text-[10px] shadow-lg"
									>
										{doctor.available}
									</Badge>
								</div>
							{/if}
						</div>

						<div class="space-y-2">
							<h2 class="text-xl font-bold tracking-tight">
								{doctor.name}
							</h2>
							<div
								class="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary font-bold text-xs capitalize"
							>
								<Stethoscope class="w-3 h-3" />
								{doctor.specialty}
							</div>
						</div>

						<!-- Price & Book Button - Immediately visible -->
						<div class="w-full pt-4 border-t border-border/20">
							<div class="flex items-center justify-between gap-4">
								<div class="text-left">
									<p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
										Consultation Fee
									</p>
									<p class="text-2xl font-bold text-primary">
										₦{(doctor.price / 100).toLocaleString()}
									</p>
								</div>
								<Button
									class="rounded-xl px-6 py-5 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95"
									onclick={() => {
										open = false;
										onBook(doctor);
									}}
								>
									Book Now
									<ArrowRight class="ml-2 w-4 h-4" />
								</Button>
							</div>
						</div>
					</div>

					<!-- Info Hub -->
					<div class="grid grid-cols-2 gap-3">
						<div class="p-4 rounded-2xl bg-muted/30 border border-border/20 text-center">
							<div class="flex items-center justify-center gap-1.5">
								<Star class="w-4 h-4 fill-amber-400 text-amber-400" />
								<span class="text-lg font-bold">{doctor.rating || '0.0'}</span>
							</div>
							<p class="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
								{doctor.reviews || 0} Reviews
							</p>
						</div>
						<div class="p-4 rounded-2xl bg-muted/30 border border-border/20 text-center">
							<div class="flex items-center justify-center gap-1.5">
								<Clock class="w-4 h-4 text-primary" />
								<span class="text-lg font-bold">45<span class="text-sm font-normal">m</span></span>
							</div>
							<p class="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
								Per Session
							</p>
						</div>
					</div>

					<!-- Biography Section -->
					<div class="space-y-3">
						<div
							class="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px]"
						>
							<Info class="w-3 h-3" />
							Biography
						</div>
						<div class="p-4 rounded-2xl bg-muted/20 border border-border/10">
							<p class="text-xs leading-relaxed text-muted-foreground font-medium">
								{doctor.bio ||
									`Dr. ${doctor.name.split(' ').pop()} is a dedicated ${doctor.specialty} with years of clinical experience.`}
							</p>
						</div>
					</div>
				</div>
			</ScrollArea>
		</Drawer.Content>
	</Drawer.Root>
{/if}
