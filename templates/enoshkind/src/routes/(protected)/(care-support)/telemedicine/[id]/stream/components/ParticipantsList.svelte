<script lang="ts">
	import type { StreamVideoParticipant } from '@stream-io/video-client';
	import { Mic, MicOff, Video, VideoOff, User } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';

	let {
		participants,
		getParticipantName
	}: {
		participants: StreamVideoParticipant[];
		getParticipantName: (p: StreamVideoParticipant) => string;
	} = $props();
</script>

<div class="space-y-4 py-4">
	<div class="flex items-center justify-between px-1">
		<h3 class="text-sm font-bold text-muted-foreground uppercase tracking-widest">
			Participants ({participants.length})
		</h3>
	</div>

	<div class="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
		{#each participants as participant (participant.sessionId)}
			<div
				class="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/20 transition-all hover:bg-muted/50"
			>
				<div class="flex items-center gap-3">
					<div
						class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20"
					>
						{#if participant.image}
							<img src={participant.image} alt="" class="w-full h-full rounded-full object-cover" />
						{:else}
							<User class="w-5 h-5 text-primary" />
						{/if}
					</div>
					<div class="flex flex-col">
						<span class="text-sm font-bold text-foreground">
							{getParticipantName(participant)}
							{#if participant.isLocalParticipant}
								<span class="text-[10px] text-muted-foreground font-medium ml-1">(You)</span>
							{/if}
						</span>
						<div class="flex items-center gap-2 mt-0.5">
							{#if participant.isSpeaking}
								<Badge
									variant="secondary"
									class="h-4 text-[9px] px-1.5 bg-emerald-500/10 text-emerald-500 border-none"
								>
									Speaking
								</Badge>
							{/if}
						</div>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<div
						class="flex items-center justify-center w-8 h-8 rounded-lg {participant.audioStream
							? 'bg-primary/10 text-primary'
							: 'bg-destructive/10 text-destructive'}"
					>
						{#if participant.audioStream}
							<Mic class="w-4 h-4" />
						{:else}
							<MicOff class="w-4 h-4" />
						{/if}
					</div>
					<div
						class="flex items-center justify-center w-8 h-8 rounded-lg {participant.videoStream
							? 'bg-primary/10 text-primary'
							: 'bg-destructive/10 text-destructive'}"
					>
						{#if participant.videoStream}
							<Video class="w-4 h-4" />
						{:else}
							<VideoOff class="w-4 h-4" />
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: hsl(var(--muted));
		border-radius: 10px;
	}
</style>
