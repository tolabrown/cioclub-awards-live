<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Calendar as CalendarIcon, Loader2, ArrowRight, ShieldCheck } from '@lucide/svelte';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { format } from 'date-fns';
	import { getLocalTimeZone, type DateValue } from '@internationalized/date';
	import { cn } from '$lib/utils';
	import type { iDoctor } from '$lib/interface';
	import { page } from '$app/state';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	let { doctor, open = $bindable(false) } = $props<{
		doctor: iDoctor | null;
		open?: boolean;
	}>();

	let loading = $state(false);
	let date = $state<DateValue | undefined>(undefined);
	let time = $state('');
	let reason = $state('');
	let adminFee = $state(0);

	const isAdmin = $derived(page.data.user?.role === 'admin');
	const serviceCharge = $derived(doctor ? Math.round(doctor.price * 0.15) : 0);
	const totalFee = $derived(
		doctor ? doctor.price + serviceCharge + (isAdmin ? adminFee * 100 : 0) : 0
	);

	function generateTimeSlots(availability: any[], selectedDate: DateValue | undefined) {
		if (!selectedDate || !availability || availability.length === 0) return [];

		const dayOfWeek = selectedDate.toDate(getLocalTimeZone()).getDay();
		const daySlots = availability.filter((slot) => slot.dayOfWeek === dayOfWeek);

		if (daySlots.length === 0) return [];

		const slots: string[] = [];
		const interval = 45;

		daySlots.forEach((range) => {
			let [startH, startM] = range.startTime.split(':').map(Number);
			let [endH, endM] = range.endTime.split(':').map(Number);

			let currentMinutes = startH * 60 + startM;
			const endMinutes = endH * 60 + endM;

			while (currentMinutes <= endMinutes - interval) {
				const h = Math.floor(currentMinutes / 60);
				const m = currentMinutes % 60;
				const ampm = h >= 12 ? 'PM' : 'AM';
				const displayH = h % 12 || 12;
				slots.push(
					`${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`
				);
				currentMinutes += interval;
			}
		});

		return [...new Set(slots)].sort((a, b) => {
			const timeToMinutes = (t: string) => {
				const [time, ampm] = t.split(' ');
				let [h, m] = time.split(':').map(Number);
				if (ampm === 'PM' && h !== 12) h += 12;
				if (ampm === 'AM' && h === 12) h = 0;
				return h * 60 + m;
			};
			return timeToMinutes(a) - timeToMinutes(b);
		});
	}

	const availableSlots = $derived(generateTimeSlots(doctor?.availability || [], date));

	$effect(() => {
		if (time && !availableSlots.includes(time)) {
			time = '';
		}
	});

	async function handleBook() {
		if (!doctor || !date || !time) return;
		loading = true;

		try {
			const response = await fetch('/api/consultations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					doctorId: doctor.id,
					type: 'general',
					appointmentDate: date.toDate(getLocalTimeZone()).toISOString(),
					appointmentTime: time,
					reason,
					adminFee: isAdmin ? adminFee : 0
				})
			});

			const result = await response.json();
			if (result.success && result.payment_url) {
				window.location.href = result.payment_url;
			} else {
				alert(result.message || 'Booking failed');
			}
		} catch (e) {
			console.error(e);
			alert('An error occurred');
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="max-w-[500px] w-[95vw] border-border/40 bg-card/60 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden"
	>
		<Dialog.Header class="px-6 pt-6 pb-2">
			<Dialog.Title class="text-2xl font-bold">Book Consultation</Dialog.Title>
			<Dialog.Description class="font-medium">
				With <span class="text-primary font-bold">{doctor?.name}</span> • {doctor?.specialty}
			</Dialog.Description>
		</Dialog.Header>

		<ScrollArea class="max-h-[70vh] px-6">
			<div class="grid gap-6 py-4">
				<div class="grid gap-2">
					<Label class="font-bold capitalize text-sm tracking-widest text-muted-foreground"
						>Select Date</Label
					>
					<Popover.Root>
						<Popover.Trigger>
							<Button
								variant={'outline'}
								class={cn(
									'w-full justify-start text-left font-bold rounded-2xl border-border/50 bg-background/50',
									!date && 'text-muted-foreground'
								)}
							>
								<CalendarIcon class="mr-2 h-5 w-5 text-primary" />
								{date ? format(date.toDate(getLocalTimeZone()), 'PPP') : 'Pick a date'}
							</Button>
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0 rounded-2xl border-border/40 shadow-2xl">
							<Calendar type="single" bind:value={date} initialFocus />
						</Popover.Content>
					</Popover.Root>
				</div>

				<div class="grid gap-2">
					<Label class="font-bold capitalize text-sm tracking-widest text-muted-foreground"
						>Select Time Slot</Label
					>
					{#if !date}
						<div
							class="flex items-center justify-center p-8 rounded-2xl border border-dashed border-border/40 bg-muted/5 text-muted-foreground text-xs font-bold uppercase tracking-widest"
						>
							Pick a date first
						</div>
					{:else if availableSlots.length > 0}
						<div class="grid grid-cols-3 gap-2">
							{#each availableSlots as t}
								<Button
									variant={time === t ? 'default' : 'outline'}
									class="rounded-xl font-bold {time === t
										? 'shadow-lg shadow-primary/20'
										: 'border-border/40 bg-background/50 text-[10px] xs:text-xs'}"
									onclick={() => (time = t)}
								>
									{t}
								</Button>
							{/each}
						</div>
					{:else}
						<div
							class="flex items-center justify-center p-8 rounded-2xl border border-dashed border-border/40 bg-muted/5 text-muted-foreground text-xs font-bold uppercase tracking-widest"
						>
							No slots available for this day
						</div>
					{/if}
				</div>

				<div class="grid gap-2">
					<Label class="font-bold capitalize text-sm tracking-widest text-muted-foreground"
						>Reason for Visit</Label
					>
					<Textarea
						placeholder="Briefly describe your symptoms or reason for consultation..."
						bind:value={reason}
						class="rounded-2xl border-border/50 bg-background/50 min-h-[100px] font-medium"
					/>
				</div>

				{#if isAdmin}
					<div class="grid gap-2">
						<Label
							class="font-bold capitalize text-sm tracking-widest text-primary flex items-center gap-2"
						>
							Additional Admin Fee (₦)
							<Badge variant="outline" class="font-bold text-[10px] bg-primary/10 border-primary/20"
								>Admin Only</Badge
							>
						</Label>
						<Input
							type="number"
							placeholder="Enter additional amount in Naira..."
							bind:value={adminFee}
							class="rounded-2xl border-border/50 bg-background/50 font-bold"
						/>
					</div>
				{/if}

				<div class="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex gap-3">
					<ShieldCheck class="w-5 h-5 text-primary shrink-0" />
					<p class="text-[11px] text-muted-foreground font-medium">
						Your payment of <span class="text-foreground font-bold"
							>₦{(totalFee / 100).toLocaleString()}</span
						> is secured by Paystack.
					</p>
				</div>
			</div>
		</ScrollArea>

		<Dialog.Footer class="p-6">
			<Button
				class="w-full rounded-2xl font-bold shadow-xl py-6"
				onclick={handleBook}
				disabled={loading || !date || !time}
			>
				{#if loading}
					<Loader2 class="mr-2 h-5 w-5 animate-spin" />
					Processing...
				{:else}
					Proceed to Payment
					<ArrowRight class="ml-2 w-5 h-5" />
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
