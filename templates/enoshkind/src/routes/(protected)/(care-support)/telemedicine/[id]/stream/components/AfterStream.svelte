<script lang="ts">
	import { CheckCircle2, Calendar, ArrowLeft } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import type { StreamTimer } from '../stream-timer.svelte';

	interface Props {
		timer: StreamTimer;
	}

	let { timer }: Props = $props();

	function handleBookAnother() {
		goto('/telemedicine');
	}

	function handleBackToTelemedicine() {
		goto('/telemedicine');
	}
</script>

<div
	class="min-h-[calc(100vh-80px)] flex items-center justify-center p-4"
	in:fade={{ duration: 300 }}
>
	<div class="mx-auto w-full max-w-2xl">
		<!-- Main Card -->
		<div class="overflow-auto rounded-3xl border bg-card shadow-2xl transition-all hover:shadow-lg">
			<!-- Header -->
			<div class="bg-gradient-to-r from-green-500 to-green-600 p-6 sm:p-8 text-white">
				<div class="mb-4 flex items-center justify-center">
					<div
						class="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
					>
						<CheckCircle2 class="h-8 w-8 sm:h-10 sm:w-10" />
					</div>
				</div>
				<h1 class="text-center text-2xl sm:text-3xl font-bold">Consultation Completed</h1>
				<p class="mt-2 text-center text-base sm: text-white/90">
					Thank you for attending your video consultation
				</p>
			</div>

			<!-- Content -->
			<div class="space-y-6 sm:space-y-8 p-4 sm:p-6">
				<!-- Consultation Summary -->
				<div class="space-y-4">
					<h2 class=" sm:text-xl font-semibold">Consultation Summary</h2>

					<div class="flex items-start gap-4 rounded-xl bg-muted/50 p-4">
						<div class="mt-1 rounded-lg bg-green-500/10 p-2 shrink-0">
							<Calendar class="h-5 w-5 text-green-600" />
						</div>
						<div class="min-w-0">
							<p class="text-sm font-medium text-muted-foreground">Consultation Date</p>
							<p class="mt-1 text-base sm: font-semibold truncate">
								{timer.getFormattedStartTime()}
							</p>
						</div>
					</div>

					<div class="rounded-xl border border-muted bg-muted/20 p-4">
						<p class="text-sm text-muted-foreground">
							<strong>Duration:</strong>
							{timer.durationMinutes} minutes
						</p>
						<p class="mt-2 text-sm text-muted-foreground">
							<strong>Time:</strong>
							{timer.getFormattedStartTime()} - {timer.getFormattedEndTime()}
						</p>
					</div>
				</div>

				<!-- Next Steps -->
				<div class="space-y-4">
					<h2 class=" sm:text-xl font-semibold">What's Next?</h2>
					<div class="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
						<div class="flex items-start gap-3">
							<div class="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0"></div>
							<p class="flex-1 text-xs sm:text-sm text-muted-foreground">
								Your consultation notes and any prescriptions will be available in your account
								shortly.
							</p>
						</div>
						<div class="flex items-start gap-3">
							<div class="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0"></div>
							<p class="flex-1 text-xs sm:text-sm text-muted-foreground">
								If you have any follow-up questions, you can message your doctor through the
								platform.
							</p>
						</div>
						<div class="flex items-start gap-3">
							<div class="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0"></div>
							<p class="flex-1 text-xs sm:text-sm text-muted-foreground">
								Need another consultation? Book your next appointment below.
							</p>
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex flex-col gap-3 sm:flex-row">
					<Button onclick={handleBookAnother} class="flex-1">
						<Calendar class="mr-2 h-5 w-5" />
						Book Another Consultation
					</Button>
					<Button onclick={handleBackToTelemedicine} variant="outline" class="flex-1">
						<ArrowLeft class="mr-2 h-5 w-5" />
						Back to Telemedicine
					</Button>
				</div>

				<!-- Feedback Section -->
				<div class="rounded-xl border bg-muted/30 p-4 text-center">
					<p class="text-xs sm:text-sm text-muted-foreground">
						We hope you had a great experience. Your feedback helps us improve our services.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
