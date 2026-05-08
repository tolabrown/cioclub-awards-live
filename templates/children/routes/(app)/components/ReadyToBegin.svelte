<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { User } from '$lib/auth';
	import { ArrowRight, Heart } from '@lucide/svelte';
	import { getContext } from 'svelte';

	const user = getContext('me') as User | undefined;
</script>

<section class="py-20 bg-gradient-to-br from-[#f71002] via-[#fd6c02] to-pink-500 text-white relative overflow-hidden">
	<!-- Decorative elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-10 left-10 text-6xl opacity-20 animate-float">⭐</div>
		<div class="absolute bottom-10 right-10 text-7xl opacity-20 animate-float-delayed">❤️</div>
		<div class="absolute top-1/2 left-1/4 text-5xl opacity-20 animate-bounce-slow">✨</div>
	</div>
	
	<div class="mx-auto max-w-4xl padded text-center sm:px-6 lg:px-8 relative z-10">
		<div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full border-2 border-white/30 mx-auto backdrop-blur-sm mb-6">
			<Heart class="w-5 h-5 text-white animate-pulse" />
			<span class="text-sm font-semibold">Join Our Family</span>
		</div>
		<h2 class="mb-6 text-3xl font-bold md:text-4xl drop-shadow-lg">Ready to Begin Your Journey?</h2>
		<p class="mb-8 opacity-95 text-lg">
			Join hundreds of families who are raising Total Kingdom Children through our ministry at
			Remnant Christian Network Lagos.
		</p>
		<div class="flex flex-col justify-center gap-4 sm:flex-row">
			{#if user}
				<Button href="/children" size="lg" variant="secondary">
					View Children
					<ArrowRight class="ml-2 h-5 w-5" />
				</Button>
			{:else}
				<Button href="/auth/login?redirectTo=/children" size="lg" variant="secondary">
					Join Us Today
					<ArrowRight class="ml-2 h-5 w-5" />
				</Button>
			{/if}
		</div>
	</div>
</section>

<style>
	@keyframes float {
		0%, 100% { transform: translateY(0) translateX(0); }
		50% { transform: translateY(-20px) translateX(10px); }
	}
	
	@keyframes float-delayed {
		0%, 100% { transform: translateY(0) translateX(0); }
		50% { transform: translateY(-30px) translateX(-15px); }
	}
	
	@keyframes bounce-slow {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-15px); }
	}
	
	.animate-float {
		animation: float 6s ease-in-out infinite;
	}
	
	.animate-float-delayed {
		animation: float-delayed 8s ease-in-out infinite;
	}
	
	.animate-bounce-slow {
		animation: bounce-slow 3s ease-in-out infinite;
	}
</style>
