<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Clock,
		Calendar,
		User,
		MapPin,
		Beaker,
		Pill,
		Video,
		CheckCircle2,
		AlertCircle,
		FileText,
		ExternalLink,
		CreditCard
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Loader2 } from '@lucide/svelte';
	import { format } from 'date-fns';

	let {
		open = $bindable(false),
		item,
		type
	} = $props<{
		open: boolean;
		item: any;
		type: 'consultation' | 'lab' | 'pharmacy';
	}>();

	let initiatingPayment = $state(false);

	const isPastDue = $derived.by(() => {
		if (!item || type !== 'consultation' || !item.appointmentDate) return false;
		const appointmentDateTime = new Date(item.appointmentDate);
		if (item.appointmentTime) {
			const [hours, minutes] = item.appointmentTime.split(':').map(Number);
			appointmentDateTime.setHours(hours, minutes, 0, 0);
		}
		return new Date() > appointmentDateTime;
	});

	async function retryPayment() {
		initiatingPayment = true;
		try {
			const res = await fetch('/api/consultations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ consultationId: item.id })
			});
			const result = await res.json();
			if (result.success && result.payment_url) {
				window.location.href = result.payment_url;
			} else {
				toast.error('Payment Failed', {
					description: result.message || 'Could not initiate payment'
				});
			}
		} catch (e) {
			toast.error('An error occurred during payment initialization');
		} finally {
			initiatingPayment = false;
		}
	}

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'confirmed':
			case 'completed':
			case 'delivered':
				return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
			case 'pending':
			case 'order_placed':
				return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
			case 'cancelled':
				return 'text-red-500 bg-red-500/10 border-red-500/20';
			default:
				return 'text-primary bg-primary/10 border-primary/20';
		}
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[600px] rounded-xl border-border/40 bg-card/60 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden"
	>
		{#if item}
			<div class="space-y-4">
				<Dialog.Header class="space-y-4">
					<div class="flex items-center justify-between">
						<div class="w-14 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
							{#if type === 'consultation'}
								<Video class="w-7 h-7 text-primary" />
							{:else if type === 'lab'}
								<Beaker class="w-7 h-7 text-primary" />
							{:else}
								<Pill class="w-7 h-7 text-primary" />
							{/if}
						</div>
						<Badge
							class="h-8 px-4 rounded-full font-bold capitalize tracking-widest text-sm order {getStatusColor(
								item.status
							)}"
						>
							{item.status.replace('_', ' ')}
						</Badge>
					</div>
					<div class="space-y-1">
						<Dialog.Title class="text-3xl font-bold tracking-tight">
							{#if type === 'consultation'}
								{item.doctor?.name || 'Assigned Specialist'}
							{:else if type === 'lab'}
								{item.testType}
							{:else}
								{item.pharmacyName || 'Partner Pharmacy'}
							{/if}
						</Dialog.Title>
						<Dialog.Description
							class="text-base font-bold text-muted-foreground capitalize tracking-wider"
						>
							{#if type === 'consultation'}
								{item.type} Consultation
							{:else if type === 'lab'}
								Home Wellness Kit
							{:else}
								Digital Prescription Order
							{/if}
						</Dialog.Description>
					</div>
				</Dialog.Header>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
					<div class="space-y-4 p-6 bg-muted/20 rounded-xl border border-border/40">
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border/40"
							>
								<Calendar class="w-4 h-4 text-primary" />
							</div>
							<div>
								<p class="text-sm font-bold text-muted-foreground capitalize tracking-tighter">
									Scheduled Date
								</p>
								<p class="font-bold text-sm">
									{format(
										new Date(item.appointmentDate || item.scheduledCollection || item.createdAt),
										'MMMM dd, yyyy'
									)}
								</p>
							</div>
						</div>
						{#if item.appointmentTime}
							<div class="flex items-center gap-3">
								<div
									class="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border/40"
								>
									<Clock class="w-4 h-4 text-primary" />
								</div>
								<div>
									<p class="text-sm font-bold text-muted-foreground capitalize tracking-tighter">
										Session Time
									</p>
									<p class="font-bold text-sm">{item.appointmentTime}</p>
								</div>
							</div>
						{/if}
					</div>

					<div class="space-y-4 p-6 bg-primary/5 rounded-xl border border-primary/20">
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border/40"
							>
								<CreditCard class="w-4 h-4 text-primary" />
							</div>
							<div>
								<p class="text-sm font-bold text-muted-foreground capitalize tracking-tighter">
									Payment Status
								</p>
								<div class="flex items-center gap-2">
									<span class="font-bold text-sm">{item.paid ? 'Confirmed' : 'Pending'}</span>
									{#if item.paid}
										<CheckCircle2 class="w-4 h-4 text-emerald-500" />
									{:else}
										<AlertCircle class="w-4 h-4 text-amber-500" />
									{/if}
								</div>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border/40"
							>
								<FileText class="w-4 h-4 text-primary" />
							</div>
							<div>
								<p class="text-sm font-bold text-muted-foreground capitalize tracking-tighter">
									Reference ID
								</p>
								<p class="font-mono text-sm font-bold">#{item.id.slice(-8).toUpperCase()}</p>
							</div>
						</div>
					</div>
				</div>

				<div class="pt-6 border-t border-border/40 flex justify-between items-center">
					<Button variant="ghost" class="font-bold" onclick={() => (open = false)}>Close</Button>
					<div class="flex gap-3">
						{#if type === 'consultation' && !item.paid}
							<Button
								onclick={retryPayment}
								disabled={initiatingPayment || isPastDue}
								class="font-bold h-12 px-8 shadow-lg {isPastDue
									? 'bg-muted text-muted-foreground'
									: 'bg-primary shadow-primary/20'}"
							>
								{#if initiatingPayment}
									<Loader2 class="w-4 h-4 mr-2 animate-spin" />
									Processing...
								{:else if isPastDue}
									<Clock class="w-4 h-4 mr-2" />
									Expired
								{:else}
									<CreditCard class="w-4 h-4 mr-2" />
									Pay Now - ₦{((item.totalFee || 0) / 100).toLocaleString()}
								{/if}
							</Button>
						{:else if type === 'consultation' && item.paid}
							<Button href="/telemedicine/{item.id}/stream" class="shadow-lg">
								<Video class="w-4 h-4 mr-2" />
								Join Call
							</Button>
						{:else if type === 'lab' && item.status === 'completed'}
							<Button class="shadow-lg">
								<ExternalLink class="w-4 h-4 mr-2" />
								View Results
							</Button>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
