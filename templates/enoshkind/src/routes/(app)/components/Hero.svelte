<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { User } from '$lib/auth';
	import { ArrowRight, Play, CheckCircle, Star, Shield } from '@lucide/svelte';
	import { getStyle } from '@toolsntuts/utils';
	import { page } from '$app/state';

	const user = page.data.user as User;

	const desktop = getStyle('/hero_desktop.webp');
	const mobile = getStyle('/hero_mobile.webp');
</script>

<section
	class="relative aspect-340/640 w-full overflow-hidden sm:aspect-340/488 md:aspect-768/472 lg:aspect-1024/520 xl:aspect-1440/520"
>
	<!-- Background image - desktop -->
	<div class="absolute hidden size-full md:block" style={desktop}>
		<div class="size-full bg-black/60 dark:bg-background/70"></div>
	</div>

	<!-- Background image - mobile -->
	<div class="absolute size-full md:hidden" style={mobile}>
		<div class="size-full bg-black/60 dark:bg-background/70"></div>
	</div>

	<!-- Content -->
	<div
		class="absolute top-1/2 left-1/2 z-1 mx-auto flex h-full w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
	>
		<div class="flex flex-col gap-4 text-center">
			<!-- Trust badge -->
			<div
				class="rounded-lg inline-flex items-center gap-2 px-4 py-2 font-medium bg-primary/20 text-primary-foreground border border-primary-foreground/20 self-center"
			>
				<span class="relative flex h-2 w-2">
					<span
						class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"
					></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
				</span>
				🇳🇬 Trusted by 50,000+ Nigerians
			</div>

			<h1 class="animate-float text-4xl font-bold md:text-5xl text-primary-foreground">
				Take Charge of
				<span class="text-primary">Your Health</span>
				Journey
			</h1>
			<p class="mx-auto mb-4 max-w-3xl opacity-90 text-primary-foreground">
				Comprehensive support for chronic conditions with expert dietitian guidance, remote
				monitoring, and real-time AI health insights.
			</p>

			<!-- CTA buttons -->
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				{#if user}
					<Button
						href="/dashboard"
						class="w-full sm:w-auto font-bold shadow-lg shadow-primary/30 group px-8"
					>
						Go to Dashboard
						<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Button>
				{:else}
					<Button
						href="/dashboard"
						variant="outline"
						class="w-full sm:w-auto border-primary/20 hover:bg-primary/5 transition-all px-8"
					>
						Start Free Assessment
						<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Button>
				{/if}
				<!-- <Button
					variant="ghost"
					class="w-full sm:w-auto text-primary hover:bg-primary/5 transition-colors"
				>
					<Play class="mr-2 h-4 w-4" />
					Watch Demo
				</Button> -->
			</div>

			<!-- Trust indicators -->
			<div class="flex flex-wrap items-center justify-center gap-4 pt-4 text-primary-foreground/80">
				<div class="flex items-center gap-2">
					<Shield class="h-4 w-4 text-primary-foreground" />
					<span>HIPAA Compliant</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="flex">
						{#each [1, 2, 3, 4, 5] as _}
							<Star class="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
						{/each}
					</div>
					<span class="ml-1">4.9/5</span>
				</div>
			</div>
		</div>
	</div>
</section>
