<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import {
		Calendar as CalendarIcon,
		Loader2,
		ArrowRight,
		ShieldCheck,
		Beaker,
		MapPin,
		Check
	} from '@lucide/svelte';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { Badge } from '$lib/components/ui/badge';
	import { format } from 'date-fns';
	import { getLocalTimeZone, type DateValue } from '@internationalized/date';
	import { cn } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false), selectedTest = $bindable(null) } = $props<{
		open: boolean;
		selectedTest: { name: string; price: string; id: string } | null;
	}>();

	let loading = $state(false);
	let date = $state<DateValue | undefined>(undefined);

	async function handleBook() {
		if (!selectedTest || !date) return;
		loading = true;

		try {
			const response = await fetch('/api/lab-orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					testType: selectedTest.id,
					scheduledCollection: date.toDate(getLocalTimeZone()).toISOString()
				})
			});

			const result = await response.json();
			if (result.success && result.payment_url) {
				toast.success('Redirecting to payment...');
				window.location.href = result.payment_url;
			} else {
				toast.error('Booking failed', { description: result.message || 'Please try again later' });
			}
		} catch (e) {
			console.error(e);
			toast.error('An error occurred during booking');
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[450px] rounded-3xl border-border/40 bg-background/80 backdrop-blur-3xl shadow-2xl"
	>
		<Dialog.Header>
			<div class="flex items-center gap-4 mb-2">
				<div class="p-3 bg-primary/10 rounded-2xl">
					<Beaker class="w-6 h-6 text-primary" />
				</div>
				<div>
					<Dialog.Title class="text-2xl font-bold">Complete Booking</Dialog.Title>
					<Dialog.Description class="font-medium">
						Secure your laboratory test appointment.
					</Dialog.Description>
				</div>
			</div>
		</Dialog.Header>

		<div class="space-y-6 py-4">
			{#if selectedTest}
				<div class="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-1">
					<div class="flex items-center justify-between">
						<span class="text-sm font-bold text-primary capitalize tracking-widest"
							>Selected Test</span
						>
						<Badge
							variant="outline"
							class="h-5 text-sm order-primary/20 bg-primary/10 text-primary font-bold"
							>Verified</Badge
						>
					</div>
					<h3 class="text-lg font-bold">{selectedTest.name}</h3>
					<p class="text-2xl font-bold text-primary">{selectedTest.price}</p>
				</div>
			{/if}

			<div class="space-y-3">
				<Label class="font-bold text-sm ml-1">Preferred Collection Date</Label>
				<Popover.Root>
					<Popover.Trigger>
						<Button
							variant="outline"
							class={cn(
								'w-full justify-start text-left font-bold rounded-xl border-border/40 bg-background/50 px-4',
								!date && 'text-muted-foreground'
							)}
						>
							<CalendarIcon class="mr-2 h-5 w-5 text-primary" />
							{date ? format(date.toDate(getLocalTimeZone()), 'PPP') : 'Select a date'}
						</Button>
					</Popover.Trigger>
					<Popover.Content
						class="w-auto p-0 rounded-2xl border-border/40 shadow-2xl overflow-hidden"
						align="start"
					>
						<Calendar type="single" bind:value={date} initialFocus />
					</Popover.Content>
				</Popover.Root>
			</div>

			<div class="space-y-4">
				<div class="flex items-start gap-3 p-4 bg-muted/30 rounded-2xl border border-border/20">
					<MapPin class="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
					<div class="space-y-1">
						<p class="text-xs font-bold capitalize tracking-wider">Home Collection</p>
						<p class="text-[11px] text-muted-foreground font-medium leading-relaxed">
							Tested medical professionals will visit your primary address for sample collection.
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2 px-1">
					<div class="p-1 bg-green-500/10 rounded-full">
						<ShieldCheck class="w-3 h-3 text-green-500" />
					</div>
					<p class="text-sm font-bold text-muted-foreground capitalize tracking-widest">
						Secure Paystack Checkout
					</p>
				</div>
			</div>
		</div>

		<Dialog.Footer class="sm:justify-start">
			<Button
				class="w-full text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl transition-all active:scale-[0.98]"
				onclick={handleBook}
				disabled={loading || !date}
			>
				{#if loading}
					<Loader2 class="w-5 h-5 mr-3 animate-spin" />
					Processing Booking...
				{:else}
					Proceed to Payment
					<ArrowRight class="ml-2 w-5 h-5" />
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
