<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { CheckCircle2, XCircle, Loader2, ArrowRight, Video } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let status = $state<'loading' | 'success' | 'error'>('loading');
	let message = $state('Verifying your payment...');
	let consultationId = $state<string | null>(null);

	onMount(async () => {
		const reference = page.url.searchParams.get('reference');
		const type = page.url.searchParams.get('type') || 'consultation';

		if (!reference) {
			status = 'error';
			message = 'No reference found.';
			return;
		}

		let endpoint = '/api/consultations';
		if (type === 'lab') endpoint = '/api/lab-orders';
		if (type === 'pharmacy') endpoint = '/api/pharmacy-orders';

		try {
			const response = await fetch(endpoint, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reference })
			});

			const result = await response.json();
			if (result.success) {
				status = 'success';
				message = `Payment verified successfully! Your ${type === 'consultation' ? 'consultation' : type + ' order'} is confirmed.`;
				if (type === 'consultation') consultationId = result.consultationId || null;
				toast.success('Confirmed', {
					description: `Your ${type} has been successfully registered.`
				});
			} else {
				status = 'error';
				message = result.message || 'Verification failed.';
			}
		} catch (e) {
			status = 'error';
			message = 'An error occurred during verification.';
		}
	});
</script>

<div class="min-h-screen flex items-center justify-center p-4">
	<Card.Root
		class="w-full max-w-md rounded-xl border-border/40 bg-card/60 backdrop-blur-2xl shadow-2xl p-8 text-center overflow-hidden relative"
	>
		<div class="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>

		<div class="relative z-10 flex flex-col items-center gap-6">
			{#if status === 'loading'}
				<div
					class="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse"
				>
					<Loader2 class="w-10 h-10 text-primary animate-spin" />
				</div>
			{:else if status === 'success'}
				<div class="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
					<CheckCircle2 class="w-10 h-10 text-emerald-500" />
				</div>
			{:else}
				<div class="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center">
					<XCircle class="w-10 h-10 text-red-500" />
				</div>
			{/if}

			<div class="space-y-2">
				<h2 class="text-3xl font-bold">
					{status === 'loading' ? 'Verifying...' : status === 'success' ? 'Thank You!' : 'Oops!'}
				</h2>
				<p class="text-muted-foreground font-medium">{message}</p>
			</div>

			{#if status !== 'loading'}
				<div class="w-full space-y-3 mt-4">
					{#if status === 'success' && consultationId}
						<Button
							href="/telemedicine/{consultationId}/stream"
							class="w-full rounded-2xl  shadow-xl bg-emerald-600 hover:bg-emerald-700"
						>
							<Video class="mr-2 w-5 h-5" />
							Join Video Call
						</Button>
					{/if}
					<Button
						href="/telemedicine"
						variant={status === 'success' && consultationId ? 'outline' : 'default'}
						class="w-full rounded-2xl font-bold "
					>
						Return to Hub
						<ArrowRight class="ml-2 w-5 h-5" />
					</Button>
				</div>
			{:else}
				<div class="h-[72px] w-full"></div>
			{/if}
		</div>
	</Card.Root>
</div>
