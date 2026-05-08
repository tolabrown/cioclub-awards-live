<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { Clock, Plus, Trash2, Save, CalendarDays, Loader2 } from '@lucide/svelte';

	let loading = $state(false);
	let saving = $state(false);
	let availability = $state<any[]>([]);
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	onMount(async () => {
		loading = true;
		try {
			const res = await fetch('/api/doctors/availability');
			const data = await res.json();
			if (data.success) {
				availability = data.data;
			}
		} catch (e) {
			toast.error('Failed to load availability');
		} finally {
			loading = false;
		}
	});

	function addSlot(dayIndex: number) {
		availability = [...availability, { dayOfWeek: dayIndex, startTime: '09:00', endTime: '17:00' }];
	}

	function removeSlot(index: number) {
		availability = availability.filter((_, i) => i !== index);
	}

	async function saveAvailability() {
		saving = true;
		try {
			const res = await fetch('/api/doctors/availability', {
				method: 'POST',
				body: JSON.stringify({ slots: availability })
			});
			const data = await res.json();
			if (data.success) {
				toast.success('Availability Updated');
			} else {
				toast.error('Failed to save', { description: data.message });
			}
		} catch (e) {
			toast.error('An error occurred');
		} finally {
			saving = false;
		}
	}
</script>

<div class="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
	<div class="max-w-5xl mx-auto py-10 lg:py-16">
		<div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
			<div class="space-y-3">
				<div
					class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold capitalize tracking-widest"
				>
					<Clock class="w-4 h-4" />
					Practice Management
				</div>
				<h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-primary">
					Weekly Availability
				</h1>
				<p class="text-muted-foreground max-w-xl">
					Define your clinical hours for virtual consultations. Changes are applied instantly to
					your public profile.
				</p>
			</div>

			<Button
				onclick={saveAvailability}
				disabled={saving}
				class="h-9 px-10 gap-3 shadow-lg shadow-primary/20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all group shrink-0 rounded-xl"
			>
				{#if saving}
					<Loader2 class="w-5 h-5 animate-spin" />
					Syncing...
				{:else}
					<Save class="w-5 h-5 transition-transform group-hover:scale-110" />
					Save Schedule
				{/if}
			</Button>
		</div>

		{#if loading}
			<div class="flex flex-col items-center justify-center py-32 gap-6 animate-in fade-in">
				<div class="relative">
					<div class="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
						<Loader2 class="w-10 h-10 animate-spin text-primary" />
					</div>
					<div
						class="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-xl animate-ping opacity-50"
					></div>
				</div>
				<p class="text-muted-foreground font-bold text-xl tracking-tight">
					Crunching your schedule...
				</p>
			</div>
		{:else}
			<div class="grid gap-8">
				{#each days as day, i}
					{@const daySlots = availability.filter((s) => s.dayOfWeek === i)}
					<Card
						class="border-border/40 shadow-lg overflow-hidden bg-background/80 backdrop-blur-xl group hover:shadow-lg transition-all duration-500 rounded-xl"
					>
						<CardHeader
							class="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gradient-to-br from-primary/5 to-transparent border-b border-border/40 gap-4"
						>
							<div class="flex items-center gap-4">
								<div class="w-1.5 h-8 bg-primary rounded-xl"></div>
								<CardTitle
									class="text-2xl font-bold group-hover:text-primary transition-colors tracking-tight"
									>{day}</CardTitle
								>
							</div>
							<Button
								variant="outline"
								size="sm"
								class="h-10 px-5 gap-2 bg-background border-primary/20 text-primary hover:bg-primary hover:text-white font-bold transition-all shadow-sm w-full sm:w-auto rounded-xl"
								onclick={() => addSlot(i)}
							>
								<Plus class="w-4 h-4" />
								New Slot
							</Button>
						</CardHeader>
						<CardContent>
							{#if daySlots.length === 0}
								<div
									class="text-center py-12 border-2 border-dashed border-border/20 bg-muted/5 rounded-xl"
								>
									<p class="text-muted-foreground text-base font-medium italic">
										No slots defined. You'll be marked as <span
											class="text-primary font-bold not-italic">unavailable</span
										> for this day.
									</p>
								</div>
							{:else}
								<div class="grid grid-cols-1 gap-4">
									{#each availability as slot, idx}
										{#if slot.dayOfWeek === i}
											<div
												class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-in fade-in zoom-in-95 duration-300 bg-muted/30 sm:bg-transparent p-5 sm:p-0 rounded-xl border border-border/20 sm:border-none"
											>
												<div
													class="flex-1 flex flex-col sm:flex-row items-start sm:items-center sm:justify-center gap-4 sm:gap-8 bg-background border-2 border-border/40 p-4 sm:p-5 shadow-inner focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5 transition-all group/input rounded-xl"
												>
													<div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
														<Clock
															class="w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors hidden sm:block"
														/>
														<div class="flex flex-col items-start">
															<span class="text-[10px] uppercase font-bold text-muted-foreground/60"
																>Start</span
															>
															<input
																type="time"
																bind:value={slot.startTime}
																class="bg-transparent border-none outline-none text-2xl font-bold text-left sm:text-center cursor-pointer"
															/>
														</div>
													</div>

													<!-- Separator: only visible on desktop -->
													<div
														class="hidden sm:block w-4 h-0.5 bg-muted-foreground/30 rounded-full shrink-0"
													></div>

													<div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
														<div class="flex flex-col items-start">
															<span class="text-[10px] uppercase font-bold text-muted-foreground/60"
																>End</span
															>
															<input
																type="time"
																bind:value={slot.endTime}
																class="bg-transparent border-none outline-none text-2xl font-bold text-left sm:text-center cursor-pointer"
															/>
														</div>
													</div>
												</div>
												<Button
													variant="ghost"
													size="icon"
													class="h-9 sm:h-16 w-full sm:w-16 text-destructive hover:bg-destructive/10 transition-all shrink-0 flex items-center justify-center gap-2 sm:gap-0 font-bold rounded-xl"
													onclick={() => removeSlot(idx)}
												>
													<Trash2 class="w-5 h-5 sm:w-6 h-6" />
													<span class="sm:hidden">Remove Slot</span>
												</Button>
											</div>
										{/if}
									{/each}
								</div>
							{/if}
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		background:
			radial-gradient(circle at top left, var(--primary-muted), transparent 40%),
			radial-gradient(circle at bottom right, var(--primary-muted), transparent 40%);
	}
</style>
