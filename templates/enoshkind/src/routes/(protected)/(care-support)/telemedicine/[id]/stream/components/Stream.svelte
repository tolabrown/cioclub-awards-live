<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { StreamState, type StreamConfig } from '../stream.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Video,
		VideoOff,
		Mic,
		MicOff,
		MonitorUp,
		PhoneOff,
		Maximize,
		Minimize,
		Users,
		Clock,
		AlertCircle
	} from '@lucide/svelte';
	import type { StreamTimer } from '../stream-timer.svelte';
	import type { iConsultation } from '$lib/interface';
	import type { User } from 'better-auth';

	import * as Dialog from '$lib/components/ui/dialog';
	import ParticipantsList from './ParticipantsList.svelte';

	interface Props {
		streamConfig: StreamConfig;
		consultationDuration: number;
		consultation: iConsultation;
		user: User;
		timer: StreamTimer;
	}

	let { streamConfig, consultationDuration, consultation, user, timer }: Props = $props();

	let stream: StreamState | null = $state(null);
	let participantsContainer: HTMLDivElement | undefined = $state();
	let showParticipants = $state(false);

	// Format time
	const formatTime = (remaining: { hours: number; minutes: number; seconds: number }) => {
		const totalMinutes = remaining.hours * 60 + remaining.minutes;
		return `${totalMinutes.toString().padStart(2, '0')}:${remaining.seconds.toString().padStart(2, '0')}`;
	};

	onMount(async () => {
		stream = new StreamState(streamConfig);

		if (participantsContainer) {
			stream.setParticipantsContainer(participantsContainer);
		}

		await stream.initialize();
	});

	onDestroy(() => {
		stream?.destroy();
	});

	const handleLeave = async () => {
		await stream?.leaveCall();
		window.location.href = '/telemedicine';
	};
	const remaining = $derived(timer.timeRemainingInSession);
	const totalMinutes = $derived(remaining.hours * 60 + remaining.minutes);
	const isLowTime = $derived(totalMinutes < 5);
</script>

<svelte:head>
	<title>Video Consultation | Telemedicine</title>
</svelte:head>

<div class="h-[100dvh] w-full flex flex-col bg-background overflow-hidden">
	<!-- Header -->
	<header class="p-2 sm:p-4 shrink-0 z-20">
		<div
			class="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-3 sm:p-4 shadow-lg"
		>
			<div class="flex items-center justify-between gap-2">
				<div class="flex items-center gap-2 sm:gap-4 min-w-0">
					<div
						class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0"
					>
						<Video class="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
					</div>
					<div class="min-w-0">
						<h1 class="text-sm sm:text-lg font-bold text-foreground truncate">
							Video Consultation
						</h1>
						<p class="text-[10px] sm:text-xs text-muted-foreground truncate font-medium">
							{consultation.type || 'Consultation'}
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<!-- Timer -->
					<div
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border {isLowTime
							? 'bg-destructive/10 border-destructive/30 text-destructive'
							: 'bg-muted/30 border-border/50 text-foreground'}"
					>
						<Clock class="w-3.5 h-3.5" />
						<span class="font-mono text-sm font-bold leading-none">
							{formatTime(remaining)}
						</span>
					</div>

					<!-- Participants Toggle -->
					{#if stream}
						<Button
							variant="outline"
							class="rounded-xl px-2 h-9 sm:h-auto sm:px-3 bg-muted/30 border-border/50 hover:bg-muted/50"
							onclick={() => (showParticipants = true)}
						>
							<Users class="w-4 h-4 text-primary" />
							<span class="ml-1.5 text-sm font-bold">{stream.participants.length}</span>
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content Area -->
	<main class="flex-1 min-h-0 px-2 sm:px-4 relative overflow-hidden">
		{#if stream?.error}
			<div class="h-full flex items-center justify-center">
				<div class="bg-destructive/10 border border-destructive/20 rounded-xl p-6 max-w-md w-full">
					<div class="flex items-center gap-4">
						<AlertCircle class="w-8 h-8 text-destructive shrink-0" />
						<div>
							<h3 class="font-bold text-destructive">Connection Error</h3>
							<p class="text-destructive/80 text-sm mt-1">{stream.error}</p>
						</div>
					</div>
					<Button variant="outline" class="w-full mt-6" onclick={() => window.location.reload()}>
						Retry Connection
					</Button>
				</div>
			</div>
		{:else if stream?.connectionStatus === 'connecting'}
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<div
						class="w-12 h-12 border-4 border-primary border-t-transparent rounded-xl animate-spin mx-auto mb-4"
					></div>
					<p class="text-muted-foreground font-medium">Connecting to session...</p>
				</div>
			</div>
		{:else}
			<!-- Participants Grid -->
			<div
				bind:this={participantsContainer}
				class="grid gap-2 sm:gap-4 h-full w-full py-2 overflow-y-auto"
				style="grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));"
			>
				{#if stream}
					{#each stream.participants as participant (participant.sessionId)}
						<div
							id="participant-{participant.sessionId}"
							class="relative aspect-video bg-muted/20 rounded-xl overflow-hidden shadow-lg border border-border/30"
						>
							<!-- Participant UI is handled by StreamState.renderVideo/renderAudio -->
							<!-- Name Overlay -->
							<div
								class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-10"
							>
								<div class="flex items-center gap-2">
									<div
										class="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0"
									>
										{stream.getParticipantName(participant).charAt(0).toUpperCase()}
									</div>
									<span class="text-white font-bold text-xs sm:text-sm truncate">
										{stream.getParticipantName(participant)}
										{#if participant.isLocalParticipant}
											<span class="text-[10px] text-gray-400 font-normal ml-1">(You)</span>
										{/if}
									</span>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</main>

	<!-- Footer Controls -->
	<footer class="p-4 shrink-0 z-20">
		<div class="flex justify-center">
			<div
				class="bg-card/40 border border-border/50 backdrop-blur-xl rounded-xl p-2 sm:p-3 shadow-lg"
			>
				<div class="flex items-center gap-2 sm:gap-3">
					<Button
						variant={stream?.isVideoEnabled ? 'secondary' : 'destructive'}
						size="icon"
						class="rounded-xl w-10 h-10 sm:w-12 sm:h-12"
						onclick={() => stream?.toggleVideo()}
					>
						{#if stream?.isVideoEnabled}
							<Video class="w-4 h-4 sm:w-5 sm:h-5" />
						{:else}
							<VideoOff class="w-4 h-4 sm:w-5 sm:h-5" />
						{/if}
					</Button>

					<Button
						variant={stream?.isAudioEnabled ? 'secondary' : 'destructive'}
						size="icon"
						class="rounded-xl w-10 h-10 sm:w-12 sm:h-12"
						onclick={() => stream?.toggleAudio()}
					>
						{#if stream?.isAudioEnabled}
							<Mic class="w-4 h-4 sm:w-5 sm:h-5" />
						{:else}
							<MicOff class="w-4 h-4 sm:w-5 sm:h-5" />
						{/if}
					</Button>

					<Button
						variant={stream?.isScreenSharing ? 'default' : 'secondary'}
						size="icon"
						class="rounded-xl w-10 h-10 sm:w-12 sm:h-12"
						onclick={() => stream?.toggleScreenShare()}
					>
						<MonitorUp class="w-4 h-4 sm:w-5 sm:h-5" />
					</Button>

					<div class="w-px h-8 bg-border/50 mx-1"></div>

					<Button
						variant="destructive"
						size="icon"
						class="rounded-xl w-10 h-10 sm:w-12 sm:h-12 shadow-lg shadow-destructive/20"
						onclick={handleLeave}
					>
						<PhoneOff class="w-4 h-4 sm:w-5 sm:h-5" />
					</Button>
				</div>
			</div>
		</div>
	</footer>
</div>

<!-- Participants List Modal -->
{#if stream}
	<Dialog.Root bind:open={showParticipants}>
		<Dialog.Content class="max-w-md w-[95vw] sm:w-full rounded-xl">
			<Dialog.Header>
				<Dialog.Title class="text-xl font-bold">Call Participants</Dialog.Title>
				<Dialog.Description>View everyone currently in this consultation.</Dialog.Description>
			</Dialog.Header>
			<ParticipantsList
				participants={stream.participants}
				getParticipantName={(p) => stream?.getParticipantName(p) || ''}
			/>
		</Dialog.Content>
	</Dialog.Root>
{/if}
