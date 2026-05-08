<script lang="ts">
	import {Card, CardContent} from '$lib/components/ui/card';
	import type { Component } from 'svelte';
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';

	interface Props {
		title: string;
		value: number;
		trend?: number;
		icon?: Component;
		iconColor?: string;
		description?: string;
		prefix?: string;
		suffix?: string;
	}

	let {
		title,
		value,
		trend,
		icon: Icon,
		iconColor = 'text-primary',
		description,
		prefix = '',
		suffix = ''
	}: Props = $props();

	// Animated counter
	let displayValue = spring(0, {
		stiffness: 0.1,
		damping: 0.5
	});

	onMount(() => {
		displayValue.set(value);
	});

	$effect(() => {
		displayValue.set(value);
	});

	const trendColor = $derived(
		trend !== undefined
			? trend >= 0
				? 'text-green-600 dark:text-green-500'
				: 'text-red-600 dark:text-red-500'
			: ''
	);
	const trendBg = $derived(
		trend !== undefined
			? trend >= 0
				? 'bg-green-500/10 dark:bg-green-500/20'
				: 'bg-red-500/10 dark:bg-red-500/20'
			: ''
	);
</script>

<Card
	class="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
>
	<div
		class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
	></div>

	<CardContent class="relative px-4">
		<div class="flex items-start justify-between">
			<div class="flex-1">
				<p class="mb-1 text-sm font-medium text-muted-foreground">{title}</p>
				<div class="flex items-baseline gap-2">
					<h3 class="text-3xl font-bold tracking-tight">
						{prefix}{Math.round($displayValue).toLocaleString()}{suffix}
					</h3>
					{#if trend !== undefined}
						<span
							class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium {trendBg} {trendColor}"
						>
							{#if trend >= 0}
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 10l7-7m0 0l7 7m-7-7v18"
									/>
								</svg>
							{:else}
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 14l-7 7m0 0l-7-7m7 7V3"
									/>
								</svg>
							{/if}
							{Math.abs(trend)}%
						</span>
					{/if}
				</div>
				{#if description}
					<p class="mt-2 text-xs text-muted-foreground">{description}</p>
				{/if}
			</div>

			{#if Icon}
				<div
					class="flex-shrink-0 rounded-lg bg-primary/10 p-3 {iconColor} transition-transform duration-300 group-hover:scale-110"
				>
					<Icon class="h-6 w-6" />
				</div>
			{/if}
		</div>
	</CardContent>
</Card>
