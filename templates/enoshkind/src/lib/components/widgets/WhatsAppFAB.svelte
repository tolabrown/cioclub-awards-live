<script lang="ts">
	import WhatsApp from '$lib/components/icons/WhatsApp.svelte';
	import { cn } from '$lib/utils';
	import { MessageCircle } from '@lucide/svelte';
	import { page } from '$app/state';

	let { class: className } = $props<{ class?: string }>();

	const whatsappNumber = '+2347035278240';
	const message = 'Hello Enoshkind, I have an inquiry about your health services.';
	const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;

	const isTelemedicinePage = $derived(page.url.pathname.includes('/telemedicine'));
</script>

{#if !isTelemedicinePage}
	<div
		class={cn(
			'fixed bottom-8 right-8 z-[100] group hidden md:flex flex-col items-end gap-3',
			className
		)}
	>
		<!-- Inquiry Label -->
		<div
			class="bg-white px-4 py-2 rounded-xl shadow-2xl border border-primary/20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none"
		>
			<p class="text-xs font-bold text-primary whitespace-nowrap">Chat with an expert</p>
		</div>

		<!-- WhatsApp Button -->
		<a
			href={whatsappUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="relative flex items-center justify-center size-10 rounded-2xl shadow-[0_10px_40px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_50px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 group/btn"
			aria-label="Chat on WhatsApp"
		>
			<!-- Pulse Effect -->
			<span
				class="absolute inset-0 rounded-2xl bg-[#25D366] animate-ping opacity-20 group-hover:opacity-0"
			></span>

			<!-- WhatsApp Icon -->
			<WhatsApp class="w-8 h-8 fill-current" />

			<!-- Tooltip/Badge -->
			<div class="absolute -top-1 -right-1 flex h-4 w-4">
				<span
					class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
				></span>
				<span class="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"
				></span>
			</div>
		</a>
	</div>
{/if}
