<script lang="ts">
	import {
		ArrowLeft,
		Send,
		Bot,
		Settings,
		Moon,
		User,
		Sparkles,
		Loader2,
		ShieldCheck,
		Info
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Avatar from '$lib/components/ui/avatar';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { tick } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';

	// --- State ---
	let userInput = $state('');
	let isLoading = $state(false);
	let messages = $state([
		{
			role: 'assistant',
			content:
				"🌟 Welcome to your AI Health Assistant! I'm Dr. Enosh, your personal Nigerian health expert. How can I assist you today?"
		}
	]);

	let scrollViewport: HTMLDivElement | null = $state(null);

	// --- Chat Logic ---
	async function scrollToBottom() {
		await tick();
		if (scrollViewport) {
			scrollViewport.scrollTo({
				top: scrollViewport.scrollHeight,
				behavior: 'smooth'
			});
		}
	}

	async function handleSubmit(e?: Event) {
		if (e) e.preventDefault();
		if (!userInput.trim() || isLoading) return;

		const userMessage = userInput;
		userInput = '';
		messages.push({ role: 'user', content: userMessage });
		isLoading = true;

		await scrollToBottom();

		try {
			const WEBHOOK_URL = '/api/ai_buddy/stream';

			messages.push({ role: 'assistant', content: '' });
			const lastIdx = messages.length - 1;

			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: userMessage,
					email: (page.data.user as any)?.email
				})
			});

			if (!response.ok) {
				const errorMsg = await response.text();
				throw new Error(errorMsg || `Streaming failed (${response.status})`);
			}
			if (!response.body) throw new Error('No response body');

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (!line.trim()) continue;
					try {
						const message = JSON.parse(line);

						if (message.type === 'error') {
							throw new Error(message.message || 'Stream error');
						}

						if (message.type === 'n8n_chunk' && message.data) {
							const n8nData = JSON.parse(message.data);

							if (n8nData.type === 'item' && n8nData.content) {
								if (n8nData.content.startsWith('{') && n8nData.content.includes('"output"')) {
									try {
										const contentObj = JSON.parse(n8nData.content);
										if (contentObj.output) {
											messages[lastIdx].content = contentObj.output;
										}
									} catch {
										messages[lastIdx].content += n8nData.content;
									}
								} else {
									messages[lastIdx].content += n8nData.content;
								}
							} else if (n8nData.output) {
								messages[lastIdx].content = n8nData.output;
							}
						}

						// Clean content: remove markdown code block delimiters if present
						messages[lastIdx].content = messages[lastIdx].content
							.replace(/^```html\n?/i, '')
							.replace(/\n?```$/i, '')
							.trim();
					} catch (e) {
						console.warn('Error parsing stream line:', e);
					}
				}
				await scrollToBottom();
			}
		} catch (error) {
			console.error('Streaming error:', error);
			messages.push({
				role: 'assistant',
				content: `⚠️ **Error:** ${error instanceof Error ? error.message : 'Unknown error'}. Please check your connection or try again later.`
			});
		} finally {
			isLoading = false;
			await scrollToBottom();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="flex flex-col h-[calc(100vh-4rem)] w-full gap-4 overflow-hidden relative">
	<!-- Combined Header & Expert Profile Section -->
	<header
		class="flex items-center justify-between py-2 px-4 bg-card/20 backdrop-blur-md border border-border/40 rounded-xl shrink-0 shadow-sm transition-all duration-300"
	>
		<div class="flex items-center gap-4">
			<Button
				variant="ghost"
				size="icon"
				class="hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
				onclick={() => {
					messages = [];
					toast.info('Chat Cleared');
				}}
			>
				<ArrowLeft class="w-5 h-5" />
			</Button>
			<div class="hidden sm:block">
				<h1 class="text-xl font-bold tracking-tight flex items-center gap-2">
					AI Health Buddy
					<Sparkles class="w-5 h-5 text-primary animate-pulse" />
				</h1>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<div class="flex flex-col items-end mr-1 hidden xs:flex">
				<div class="flex items-center gap-2">
					<span class="text-sm font-bold">Dr. Enosh</span>
					<Badge
						variant="secondary"
						class="bg-green-500/10 text-green-500 border-none hover:bg-green-500/20 px-2 py-0 text-sm capitalize tracking-tighter"
						>Online</Badge
					>
				</div>
				<p class="text-sm text-muted-foreground font-medium">Expert Health Assistant</p>
			</div>
			<Avatar.Root class="w-10 h-10 border-2 border-primary/20 shadow-md">
				<Avatar.Fallback class="bg-primary/10 text-primary text-sm font-bold">AI</Avatar.Fallback>
			</Avatar.Root>
		</div>
	</header>

	<!-- Chat Area -->
	<div
		class="flex-1 overflow-hidden min-h-0 bg-card/5 rounded-xl border border-border/40 backdrop-blur-sm relative"
	>
		<ScrollArea class="h-full pr-4" bind:viewportRef={scrollViewport}>
			<div class="space-y-6 pb-20">
				<!-- Added padding bottom for buffer -->
				{#each messages as message, i}
					<div
						class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}"
						in:fly={{ y: 20, duration: 400 }}
					>
						<div
							class="flex gap-3 max-w-[90%] md:max-w-[85%] {message.role === 'user'
								? 'flex-row-reverse'
								: 'flex-row'}"
						>
							<Avatar.Root class="w-8 h-8 shrink-0 mt-1 border border-border/50">
								{#if message.role === 'assistant'}
									<Avatar.Fallback class="bg-primary/10 text-primary p-1"
										><Bot class="w-full h-full" /></Avatar.Fallback
									>
								{:else}
									<Avatar.Fallback class="bg-secondary/10 text-secondary p-1"
										><User class="w-full h-full" /></Avatar.Fallback
									>
								{/if}
							</Avatar.Root>

							<div class="space-y-1.5 {message.role === 'user' ? 'text-right' : 'text-left'}">
								<div
									class="p-4 rounded-xl text-sm md:text-[15px] leading-relaxed font-medium shadow-sm transition-all
									{message.role === 'user'
										? 'bg-primary text-primary-foreground rounded-tr-none whitespace-pre-wrap'
										: 'bg-card/80 border border-border/50 backdrop-blur-sm rounded-tl-none text-foreground prose prose-sm dark:prose-invert max-w-none'}"
								>
									{#if message.role === 'assistant'}
										{@html message.content}
									{:else}
										{message.content}
									{/if}
									{#if message.role === 'assistant' && !message.content && isLoading}
										<span class="flex items-center gap-1">
											<span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
											<span
												class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"
											></span>
											<span
												class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"
											></span>
										</span>
									{/if}
								</div>
								<span class="text-sm text-muted-foreground capitalize tracking-widest px-1">
									{message.role === 'assistant' ? 'Dr. Enosh' : 'You'} • Just now
								</span>
							</div>
						</div>
					</div>
				{/each}

				{#if isLoading && messages[messages.length - 1].role === 'user'}
					<div class="flex justify-start" in:fade>
						<div class="flex gap-3 max-w-[85%]">
							<Avatar.Root class="w-8 h-8 shrink-0 mt-1">
								<Avatar.Fallback class="bg-primary/10 text-primary p-1 animate-pulse">
									<Bot class="w-full h-full" />
								</Avatar.Fallback>
							</Avatar.Root>
							<div
								class="bg-card/80 border border-border/50 backdrop-blur-sm p-4 rounded-xl rounded-tl-none"
							>
								<div class="flex items-center gap-1.5">
									<span class="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
									<span
										class="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"
									></span>
									<span
										class="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"
									></span>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</ScrollArea>
	</div>

	<!-- Input Area - Sticky to bottom of this container -->
	<div class="shrink-0 space-y-3 pt-2">
		<form onsubmit={handleSubmit} class="relative group">
			<div
				class="absolute -inset-1 bg-linear-to-r from-primary/20 via-primary/5 to-primary/20 rounded-xl blur-lg opacity-25 group-focus-within:opacity-50 transition-opacity"
			></div>
			<div
				class="relative bg-card/60 backdrop-blur-xl border border-border/40 rounded-xl p-2 flex items-center gap-2 shadow-2xl"
			>
				<Textarea
					bind:value={userInput}
					placeholder="Ask me anything about your health..."
					class="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base md: py-3 md:py-4 px-4 font-medium min-h-[56px] max-h-[150px] resize-none"
					disabled={isLoading}
					onkeydown={handleKeyDown}
				/>
				<Button
					type="submit"
					size="icon"
					disabled={!userInput.trim() || isLoading}
					class="w-12 md:w-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 px-0"
				>
					{#if isLoading}
						<Loader2 class="w-6 h-6 animate-spin" />
					{:else}
						<Send class="w-6 h-6" />
					{/if}
				</Button>
			</div>
		</form>

		<!-- Footer Disclaimer -->
		<footer class="text-center pb-2">
			<p class="text-sm text-muted-foreground font-medium flex items-center justify-center gap-1.5">
				<ShieldCheck class="w-3 h-3 text-primary" />
				Powered by Enoshkind Health Intelligence • Consult a doctor for medical emergencies
			</p>
		</footer>
	</div>
</div>

<style>
	:global(.lucide) {
		stroke-width: 2.5px;
	}
</style>
