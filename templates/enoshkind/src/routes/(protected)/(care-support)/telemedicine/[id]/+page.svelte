<script lang="ts">
	import type { PageProps } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Video,
		Calendar,
		Clock,
		FileText,
		CreditCard,
		ArrowLeft,
		CheckCircle2,
		AlertCircle,
		User
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Loader2 } from '@lucide/svelte';

	let { data }: PageProps = $props();
	const consultation = $derived(data.consultation);

	let initiatingPayment = $state(false);

	const isPastDue = $derived.by(() => {
		if (!consultation || !consultation.appointmentDate) return false;
		const appointmentDateTime = new Date(consultation.appointmentDate);
		if (consultation.appointmentTime) {
			const [hours, minutes] = consultation.appointmentTime.split(':').map(Number);
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
				body: JSON.stringify({ consultationId: consultation.id })
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

	const formatDate = (date: Date | string | null) => {
		if (!date) return 'Not scheduled';
		return new Date(date).toLocaleDateString('en-NG', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const getTypeLabel = (type: string | null) => {
		const types: Record<string, string> = {
			general: 'General Consultation',
			specialist: 'Specialist Consultation',
			mental_health: 'Mental Health',
			emergency: 'Emergency Consultation',
			quick: 'Quick Consultation',
			standard: 'Standard Consultation',
			extended: 'Extended Consultation'
		};
		return types[type || ''] || 'Consultation';
	};
</script>

<svelte:head>
	<title>Consultation Details | Telemedicine</title>
</svelte:head>

<div class="min-h-screen p-4 md:p-6 max-w-4xl mx-auto">
	<!-- Back Button -->
	<Button href="/telemedicine" variant="ghost" size="icon" class="hover:bg-muted">
		<ArrowLeft class="w-4 h-4 mr-2" />
		Back to Telemedicine
	</Button>

	<!-- Header Card -->
	<Card.Root class="mb-6 bg-card/60 backdrop-blur-xl border-border/50 overflow-hidden">
		<div class="bg-gradient-to-r from-primary/20 to-blue-500/20 p-4 sm:p-6">
			<div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
				<div class="flex items-center gap-4">
					<div
						class="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0"
					>
						<Video class="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
					</div>
					<div class="min-w-0">
						<h1 class="text-xl sm:text-2xl font-bold truncate">
							{getTypeLabel(consultation.type)}
						</h1>
						<p class="text-muted-foreground text-sm sm:text-base">
							Consultation #{consultation.id.slice(0, 8)}
						</p>
					</div>
				</div>

				<div class="flex items-center gap-3 flex-wrap">
					<Badge
						variant={consultation.paid ? 'default' : 'destructive'}
						class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold"
					>
						{#if consultation.paid}
							<CheckCircle2 class="w-4 h-4 mr-1" />
							Paid
						{:else}
							<AlertCircle class="w-4 h-4 mr-1" />
							Unpaid
						{/if}
					</Badge>
					<Badge
						variant="secondary"
						class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold capitalize"
					>
						{consultation.status || 'pending'}
					</Badge>
				</div>
			</div>
		</div>

		<Card.Content class="p-4 sm:p-6 space-y-6">
			<!-- Appointment Info -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
				<div class="flex items-center gap-4">
					<div
						class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center shrink-0"
					>
						<Calendar class="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
					</div>
					<div class="min-w-0">
						<p class="text-xs sm:text-sm text-muted-foreground font-medium">Appointment Date</p>
						<p class="font-bold text-sm sm:text-base truncate">
							{formatDate(consultation.appointmentDate)}
						</p>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<div
						class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center shrink-0"
					>
						<Clock class="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
					</div>
					<div class="min-w-0">
						<p class="text-xs sm:text-sm text-muted-foreground font-medium">Appointment Time</p>
						<p class="font-bold text-sm sm:text-base">
							{consultation.appointmentTime || 'Not set'}
						</p>
					</div>
				</div>
			</div>

			<!-- Doctor Info (if assigned) -->
			{#if consultation.doctorId}
				<div class="border-t border-border/50 pt-6">
					<h3 class="text-base sm: font-bold mb-4">Assigned Doctor</h3>
					<div class="flex items-center gap-4">
						<div
							class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center shrink-0"
						>
							<User class="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
						</div>
						<div class="min-w-0">
							<p class="font-bold text-sm sm:text-base">Doctor Assigned</p>
							<p class="text-xs sm:text-sm text-muted-foreground">
								ID: {consultation.doctorId.slice(0, 8)}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Reason -->
			{#if consultation.reason}
				<div class="border-t border-border/50 pt-6">
					<h3 class="text-base sm: font-bold mb-4 flex items-center gap-2">
						<FileText class="w-5 h-5 text-primary" />
						Reason for Consultation
					</h3>
					<p class="text-muted-foreground text-sm sm:text-base">{consultation.reason}</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<div class="flex flex-col sm:flex-row gap-4 justify-center">
		{#if consultation.paid}
			<Button href="/telemedicine/{consultation.id}/stream" class="font-bold shadow-xl">
				<Video class="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
				Join Video Call
			</Button>
		{:else}
			<Button
				onclick={retryPayment}
				disabled={initiatingPayment || isPastDue}
				class="bg-primary font-bold shadow-lg shadow-primary/20 {isPastDue
					? 'bg-muted text-muted-foreground'
					: ''}"
			>
				{#if initiatingPayment}
					<Loader2 class="w-5 h-5 sm:w-6 sm:h-6 mr-2 animate-spin" />
					Processing...
				{:else if isPastDue}
					<Clock class="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
					Appointment Expired
				{:else}
					<CreditCard class="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
					Complete Payment - ₦{((consultation.totalFee || 0) / 100).toLocaleString()}
				{/if}
			</Button>
		{/if}
	</div>
</div>
