<script lang="ts">
	import type { PageData } from './$types';
	import { StreamTimer } from './stream-timer.svelte';
	import BeforeStream from './components/BeforeStream.svelte';
	import Stream from './components/Stream.svelte';
	import AfterStream from './components/AfterStream.svelte';
	import { onMount, onDestroy } from 'svelte';

	let { data }: { data: PageData } = $props();

	let timer = $state<StreamTimer | null>(null);

	onMount(() => {
		timer = new StreamTimer(data.consultation, data.consultationDuration);
	});

	onDestroy(() => {
		timer?.destroy();
	});
</script>

<svelte:head>
	<title>Video Consultation | Telemedicine</title>
</svelte:head>

{#if timer}
	{#if timer.currentStatus === 'before'}
		<BeforeStream {timer} />
	{:else if timer.currentStatus === 'during'}
		<Stream
			streamConfig={data.stream}
			consultationDuration={data.consultationDuration}
			consultation={data.consultation}
			user={data.user}
			{timer}
		/>
	{:else}
		<AfterStream {timer} />
	{/if}
{:else}
	<div class="min-h-screen flex items-center justify-center">
		<div
			class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"
		></div>
	</div>
{/if}
