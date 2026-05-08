<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Pill, Loader2, ArrowRight, Truck, ShieldCheck } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false), prescription } = $props<{
		open?: boolean;
		prescription: any | null;
	}>();

	let loading = $state(false);

	async function handleOrder() {
		if (!prescription) return;
		loading = true;

		try {
			const response = await fetch('/api/pharmacy-orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pharmacyName: 'City Central Pharmacy',
					totalAmount: 450000
				})
			});

			const result = await response.json();
			if (result.success && result.payment_url) {
				window.location.href = result.payment_url;
			} else {
				toast.error('Error', { description: result.message || 'Order failed' });
			}
		} catch (e) {
			console.error(e);
			toast.error('Error', { description: 'An error occurred' });
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="max-w-[500px] w-[95vw] border-border/40 bg-card/60 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden"
	>
		<Dialog.Header class="p-6">
			<Dialog.Title class="text-2xl font-bold flex items-center gap-3">
				<Pill class="w-6 h-6 text-primary" />
				Complete Order
			</Dialog.Title>
			<Dialog.Description class="font-medium">
				Review your medication order and delivery details.
			</Dialog.Description>
		</Dialog.Header>

		<ScrollArea class="max-h-[60vh] px-6">
			<div class="grid gap-6 py-4">
				{#if prescription}
					<div class="p-6 rounded-[1.5rem] bg-primary/5 border border-primary/20 space-y-4">
						<div class="flex justify-between items-start">
							<div>
								<h4 class="font-bold text-foreground">{prescription.medicationName}</h4>
								<p class="text-sm font-semibold text-primary">{prescription.dosage}</p>
							</div>
							<Pill class="w-5 h-5 text-primary" />
						</div>
						<div class="space-y-2 pt-4 border-t border-primary/10">
							<p class="text-sm font-bold text-muted-foreground capitalize tracking-wider">
								Instructions
							</p>
							<p class="text-sm font-medium">{prescription.instructions}</p>
						</div>
					</div>
				{/if}

				<div class="space-y-4">
					<div
						class="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40"
					>
						<Truck class="w-5 h-5 text-primary" />
						<div>
							<p class="text-sm font-bold">Express Delivery</p>
							<p class="text-sm text-muted-foreground">Estimated arrival: Today, 2:00 PM</p>
						</div>
					</div>

					<div
						class="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40"
					>
						<ShieldCheck class="w-5 h-5 text-emerald-500" />
						<div>
							<p class="text-sm font-bold">Verified Pharmacy</p>
							<p class="text-sm text-muted-foreground">Partnered with certified outlets</p>
						</div>
					</div>
				</div>

				<div class="flex justify-between items-center px-2 py-2">
					<span class="text-sm font-bold text-muted-foreground">Total (inc. delivery)</span>
					<span class="text-2xl font-bold text-primary">₦4,500</span>
				</div>
			</div>
		</ScrollArea>

		<Dialog.Footer class="p-6">
			<Button
				class="w-full rounded-2xl font-bold shadow-xl py-6"
				onclick={handleOrder}
				disabled={loading || !prescription}
			>
				{#if loading}
					<Loader2 class="mr-2 h-5 w-5 animate-spin" />
					Processing...
				{:else}
					Place Order
					<ArrowRight class="ml-2 w-5 h-5" />
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
