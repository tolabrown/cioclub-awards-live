<script lang="ts">
	import { Clock, Calendar, Video } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import type { StreamTimer } from '../stream-timer.svelte';

	interface Props {
		timer: StreamTimer;
	}

	let { timer }: Props = $props();

	// Format time component with leading zero
	function pad(num: number): string {
		return num.toString().padStart(2, '0');
	}
</script>

<div
	class="min-h-[calc(100vh-80px)] flex items-center justify-center p-4"
	in:fade={{ duration: 300 }}
>
	<div class="mx-auto w-full max-w-2xl">
		<!-- Main Card -->
		<div
			class="overflow-auto rounded-3xl border bg-card shadow-2xl transition-all hover:shadow-primary/20"
		>
			<!-- Header -->
			<div class="bg-gradient-to-r from-primary to-primary/80 p-6 sm:p-8 text-white">
				<div class="mb-4 flex items-center justify-center">
					<div
						class="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
					>
						<Video class="h-8 w-8 sm:h-10 sm:w-10" />
					</div>
				</div>
				<h1 class="text-center text-2xl sm:text-3xl font-bold">Consultation Scheduled</h1>
				<p class="mt-2 text-center text-base sm: text-white/90">
					Your video consultation will begin soon
				</p>
			</div>

			<!-- Content -->
			<div class="space-y-6 sm:space-y-8 p-4 sm:p-6">
				<!-- Appointment Details -->
				<div class="space-y-4">
					<div class="flex items-start gap-4 rounded-xl bg-muted/50 p-4">
						<div class="mt-1 rounded-lg bg-primary/10 p-2 shrink-0">
							<Calendar class="h-5 w-5 text-primary" />
						</div>
						<div class="min-w-0">
							<p class="text-sm font-medium text-muted-foreground">Scheduled For</p>
							<p class="mt-1 text-base sm: font-semibold truncate">
								{timer.getFormattedStartTime()}
							</p>
						</div>
					</div>

					<div class="flex items-start gap-4 rounded-xl bg-muted/50 p-4">
						<div class="mt-1 rounded-lg bg-primary/10 p-2 shrink-0">
							<Clock class="h-5 w-5 text-primary" />
						</div>
						<div class="min-w-0">
							<p class="text-sm font-medium text-muted-foreground">Duration</p>
							<p class="mt-1 text-base sm: font-semibold">
								{timer.durationMinutes} minutes
							</p>
						</div>
					</div>
				</div>

				<!-- Countdown Timer -->
				<div class="space-y-4">
					<h2 class="text-center  sm:text-xl font-semibold">Time Until Consultation</h2>
					<div class="grid grid-cols-4 gap-2 sm:gap-4">
						<!-- Days -->
						<div class="text-center">
							<div
								class="mx-auto flex size-12 sm:size-16 md:size-20 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-base sm:text-xl md:text-3xl font-bold text-white shadow-lg"
							>
								{pad(timer.timeRemaining.days)}
							</div>
							<p class="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">Days</p>
						</div>

						<!-- Hours -->
						<div class="text-center">
							<div
								class="mx-auto flex size-12 sm:size-16 md:size-20 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-base sm:text-xl md:text-3xl font-bold text-white shadow-lg"
							>
								{pad(timer.timeRemaining.hours)}
							</div>
							<p class="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">Hours</p>
						</div>

						<!-- Minutes -->
						<div class="text-center">
							<div
								class="mx-auto flex size-12 sm:size-16 md:size-20 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-base sm:text-xl md:text-3xl font-bold text-white shadow-lg"
							>
								{pad(timer.timeRemaining.minutes)}
							</div>
							<p class="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">Minutes</p>
						</div>

						<!-- Seconds -->
						<div class="text-center">
							<div
								class="mx-auto flex size-12 sm:size-16 md:size-20 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-base sm:text-xl md:text-3xl font-bold text-white shadow-lg"
							>
								{pad(timer.timeRemaining.seconds)}
							</div>
							<p class="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">Seconds</p>
						</div>
					</div>
				</div>

				<!-- Info Message -->
				<div class="rounded-xl border border-primary/20 bg-primary/5 p-4">
					<p class="text-center text-xs sm:text-sm text-muted-foreground">
						The video consultation will automatically become available at the scheduled time. Please
						ensure you have a stable internet connection and your camera and microphone are working.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
