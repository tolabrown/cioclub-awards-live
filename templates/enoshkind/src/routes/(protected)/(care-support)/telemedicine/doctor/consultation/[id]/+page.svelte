<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Video,
		User,
		FileText,
		CheckCircle2,
		AlertCircle,
		ClipboardList,
		ArrowLeft,
		Wallet,
		Loader2,
		CreditCard,
		Clock,
		Calendar
	} from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	const session = $derived(data.consultation);
	const isPastDue = $derived(data.isPastDue);

	let initiatingPayout = $state(false);

	async function initiatePayout() {
		initiatingPayout = true;
		try {
			const res = await fetch('/api/paystack/payout', {
				method: 'POST',
				body: JSON.stringify({ consultationId: session.id })
			});
			const result = await res.json();
			if (result.success) {
				toast.success('Payout Initiated', { description: 'The transfer is being processed.' });
				window.location.reload();
			} else {
				toast.error('Payout Failed', { description: result.message });
			}
		} catch (e) {
			toast.error('An error occurred during payout initiation');
		} finally {
			initiatingPayout = false;
		}
	}
</script>

<div class="max-w-6xl mx-auto space-y-6 md:space-y-10">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
		<Button
			variant="ghost"
			href="/telemedicine/doctor"
			class="rounded-full w-10 sm:w-12 p-0 border border-border/40 shrink-0 aspect-square"
		>
			<ArrowLeft class="w-5 h-5 sm:w-6 sm:h-6" />
		</Button>
		<div class="min-w-0">
			<h1 class="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
				Consultation Session
			</h1>
			<p class="text-sm text-muted-foreground">
				Reference: {session.id.slice(0, 8).toUpperCase()}
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
		<!-- Left Col: Status & Actions -->
		<div class="space-y-4 md:space-y-6">
			<Card class="border-border/40 shadow-xl overflow-hidden shrink-0">
				<CardHeader class="bg-primary/5 p-4 sm:p-6 md:p-8 border-b border-border/40">
					<CardTitle class=" md:text-xl font-bold">Booking Status</CardTitle>
				</CardHeader>
				<CardContent class="p-4 sm:p-6 md:p-8 space-y-4 md:space-y-6">
					<!-- Patient Info -->
					<div class="flex items-center gap-3 md:gap-4">
						<div
							class="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-muted/50 flex items-center justify-center border border-border/40 shrink-0"
						>
							<User class="w-5 h-5 md:w-7 md:h-7 text-primary" />
						</div>
						<div class="min-w-0">
							<p class="text-xs md:text-sm text-muted-foreground">Patient Name</p>
							<p class="text-base md: font-bold truncate">{session.user.name}</p>
						</div>
					</div>

					<!-- Payment Status -->
					{#if !session.paid}
						<div
							class="p-3 md:p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-medium text-xs md:text-sm flex gap-2 md:gap-3 items-start"
						>
							<CreditCard class="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5" />
							<div>
								<p class="font-bold">Payment Pending</p>
								<p class="text-[11px] md:text-xs opacity-80">
									{#if isPastDue}
										This booking has expired and can no longer be paid.
									{:else}
										Waiting for patient to complete payment.
									{/if}
								</p>
							</div>
						</div>
						{#if isPastDue}
							<div class="p-3 md:p-4 rounded-xl bg-muted border border-border/40 text-center">
								<p class="text-xs font-bold text-muted-foreground">Appointment Expired</p>
							</div>
						{/if}
					{:else}
						<!-- Status Actions -->
						<div class="space-y-3 md:space-y-4 pt-2 md:pt-4">
							{#if session.status === 'pending'}
								<div
									class="p-3 md:p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 font-medium text-xs md:text-sm flex gap-2 md:gap-3 items-start"
								>
									<AlertCircle class="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5" />
									<span>Please review and accept this booking to proceed with the video call.</span>
								</div>
								<form method="POST" action="?/accept" use:enhance>
									<Button
										class="w-full rounded-xl md:rounded-2xl font-bold text-sm md:text-base shadow-lg shadow-primary/30 gap-2"
									>
										<CheckCircle2 class="w-4 h-4 md:w-5 md:h-5" />
										Accept Booking
									</Button>
								</form>
							{:else if session.status === 'confirmed'}
								<div
									class="p-3 md:p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 font-medium text-xs md:text-sm flex gap-2 md:gap-3 items-start"
								>
									<CheckCircle2 class="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5" />
									<span>Booking confirmed. You can join the video room when the time is right.</span
									>
								</div>
								<Button
									href={`/telemedicine/${session.id}/stream`}
									class="w-full rounded-xl md:rounded-2xl font-bold text-sm md:text-base bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 gap-2"
								>
									<Video class="w-5 h-5 md:w-6 md:h-6" />
									Join Video Call
								</Button>
							{:else if session.status === 'completed'}
								<div
									class="p-3 md:p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs md:text-sm flex gap-2 md:gap-3 italic items-start"
								>
									<CheckCircle2 class="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5" />
									<span>This consultation has been successfully completed.</span>
								</div>

								{#if session.payoutStatus === 'none'}
									<Button
										onclick={initiatePayout}
										disabled={initiatingPayout}
										class="w-full rounded-xl md:rounded-2xl font-bold text-sm md:text-base bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30 gap-2"
									>
										{#if initiatingPayout}
											<Loader2 class="w-5 h-5 md:w-6 md:h-6 animate-spin" />
											Processing...
										{:else}
											<Wallet class="w-5 h-5 md:w-6 md:h-6" />
											Initiate Payout
										{/if}
									</Button>
								{:else}
									<div class="p-3 md:p-4 rounded-xl bg-muted border border-border/40 text-center">
										<p
											class="text-sm md:text-xs font-bold capitalize tracking-widest text-muted-foreground mb-1"
										>
											Payout Status
										</p>
										<p class="text-base md: font-bold capitalize text-primary">
											{session.payoutStatus}
										</p>
									</div>
								{/if}
							{/if}
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Booking Details Card -->
			<Card class="border-border/40 shadow-sm">
				<CardHeader class="p-4 sm:p-6">
					<CardTitle class="text-base md: font-bold flex items-center gap-2">
						<Calendar class="w-4 h-4 md:w-5 md:h-5 text-primary" />
						Booking Details
					</CardTitle>
				</CardHeader>
				<CardContent class="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 md:space-y-4">
					<div class="flex justify-between text-xs md:text-sm">
						<span class="text-muted-foreground font-medium">Date</span>
						<span class="font-bold">{new Date(session.appointmentDate).toLocaleDateString()}</span>
					</div>
					<div class="flex justify-between text-xs md:text-sm">
						<span class="text-muted-foreground font-medium flex items-center gap-1">
							<Clock class="w-3 h-3" /> Time
						</span>
						<span class="font-bold">{session.appointmentTime}</span>
					</div>
					<div class="h-px bg-border/40"></div>
					<div class="flex justify-between text-xs md:text-sm">
						<span class="text-muted-foreground font-medium">Consultation Fee</span>
						<span class="font-bold text-primary">
							₦{((session.totalFee ?? 0) / 100).toLocaleString()}
						</span>
					</div>
					<div class="flex justify-between text-xs md:text-sm">
						<span class="text-muted-foreground font-medium">Payment</span>
						<span class={session.paid ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
							{session.paid ? 'Paid' : 'Unpaid'}
						</span>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Right Col: Documentation -->
		<div class="lg:col-span-2">
			<Card
				class="border-border/40 shadow-xl rounded-2xl md:rounded-xl overflow-hidden min-h-[400px] md:min-h-[600px]"
			>
				<CardHeader class="p-4 sm:p-6 md:p-10 bg-muted/30 border-b border-border/40">
					<CardTitle class=" md:text-2xl font-bold flex items-center gap-2 md:gap-3">
						<ClipboardList class="text-primary w-5 h-5 md:w-7 md:h-7" />
						<span class="truncate">Consultation Notes</span>
					</CardTitle>
					<CardDescription class="text-xs md:text-sm">
						Document the session, referrals, and next steps for the patient.
					</CardDescription>
				</CardHeader>
				<CardContent class="p-4 sm:p-6 md:p-10">
					{#if session.status === 'completed'}
						<div class="space-y-6 md:space-y-8">
							<div class="space-y-2">
								<h3
									class="font-bold text-sm md:text-xs capitalize tracking-widest text-primary flex items-center gap-2"
								>
									<FileText class="w-3 h-3 md:w-4 md:h-4" />
									Consultation Summary
								</h3>
								<div
									class="p-4 md:p-6 rounded-xl md:rounded-2xl bg-muted/20 border border-border/40 italic leading-relaxed text-sm md:text-base"
								>
									{session.consultationNotes || 'No notes available.'}
								</div>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
								<div class="space-y-2">
									<h3 class="font-bold text-sm md:text-xs capitalize tracking-widest text-primary">
										Referral Details
									</h3>
									<div
										class="p-3 md:p-4 rounded-xl bg-muted/20 border border-border/40 min-h-[60px] md:min-h-[80px] text-sm"
									>
										{session.referralDetails || 'No referrals provided.'}
									</div>
								</div>
								<div class="space-y-2">
									<h3 class="font-bold text-sm md:text-xs capitalize tracking-widest text-primary">
										Next Steps
									</h3>
									<div
										class="p-3 md:p-4 rounded-xl bg-muted/20 border border-border/40 min-h-[60px] md:min-h-[80px] text-sm"
									>
										{session.nextSteps || 'None.'}
									</div>
								</div>
							</div>
						</div>
					{:else}
						<form
							method="POST"
							action="?/saveNotes"
							use:enhance={() => {
								return ({ result }) => {
									if (result.type === 'success') {
										toast.success('Consultation Documented');
										window.location.reload();
									}
								};
							}}
							class="space-y-6 md:space-y-8"
						>
							<div class="space-y-2 md:space-y-3">
								<Label class="font-bold text-sm md: ml-1">Session Notes</Label>
								<Textarea
									name="notes"
									required
									placeholder="Provide a detailed summary of the consultation..."
									class="min-h-[150px] md:min-h-[250px] rounded-xl md:rounded-[1.5rem] bg-background border-border/40 p-4 md:p-6 text-sm md:text-base font-medium shadow-inner resize-none focus:ring-primary/20"
								/>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
								<div class="space-y-2 md:space-y-3">
									<Label class="font-bold text-sm ml-1">Referral (Optional)</Label>
									<Input
										name="referral"
										placeholder="Specialist or clinic referral..."
										class="rounded-xl md:rounded-2xl bg-background border-border/40 px-4 md:px-6 font-medium shadow-inner text-sm"
									/>
								</div>
								<div class="space-y-2 md:space-y-3">
									<Label class="font-bold text-sm ml-1">Next Steps</Label>
									<Input
										name="nextSteps"
										placeholder="Follow-up advice, prescription, etc."
										class="rounded-xl md:rounded-2xl bg-background border-border/40 px-4 md:px-6 font-medium shadow-inner text-sm"
									/>
								</div>
							</div>

							<div class="pt-4 md:pt-6 border-t border-border/40 flex justify-end">
								<Button
									type="submit"
									class="w-full sm:w-auto px-6 md:px-10 rounded-xl md:rounded-2xl font-bold text-sm md: bg-primary shadow-lg shadow-primary/30 group gap-2 md:gap-3"
								>
									Complete Documentation
									<CheckCircle2
										class="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110"
									/>
								</Button>
							</div>
						</form>
					{/if}
				</CardContent>
			</Card>
		</div>
	</div>
</div>
