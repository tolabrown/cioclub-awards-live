<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { User } from '$lib/auth';
	import { ArrowRight } from '@lucide/svelte';
	import { page } from '$app/state';

	const user = page.data.user as User;
</script>

<section class="py-24 bg-primary">
	<div class="container mx-auto px-4">
		<div class="max-w-3xl mx-auto text-center text-primary-foreground">
			<h2 class="font-bold mb-4">Ready for Better Health?</h2>

			<p class=" text-primary-foreground/80 mb-8 max-w-xl mx-auto">
				Join thousands of Nigerians managing their health with world-class AI intelligence.
			</p>

			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				{#if user}
					<Button href="/dashboard" variant="secondary" class="group">
						Go to Dashboard
						<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Button>
				{:else}
					<Button
						href="/dashboard"
						variant="secondary"
						class="font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
					>
						Start Your Journey Now
					</Button>
				{/if}
			</div>

			<p class="text-primary-foreground/60 mt-4">5-minute setup • Cancel anytime</p>
		</div>
	</div>
</section>
