<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Bookmark,
		Share2,
		Clock,
		Video,
		X,
		Maximize2,
		ArrowRight,
		Loader2
	} from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let { open = $bindable(false), article } = $props<{
		open: boolean;
		article: any | null;
	}>();

	function getYoutubeId(url: string) {
		if (!url) return null;
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	}

	const youtubeId = $derived(article?.videoUrl ? getYoutubeId(article.videoUrl) : null);
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[900px] p-0 bg-background/95 backdrop-blur-2xl border-border/40 overflow-hidden rounded-xl max-h-[90vh] flex flex-col"
	>
		{#if article}
			<!-- Hero / Video Section -->
			<div class="relative shrink-0">
				{#if youtubeId}
					<div class="aspect-video w-full bg-black">
						<iframe
							width="100%"
							height="100%"
							src="https://www.youtube.com/embed/{youtubeId}"
							title="YouTube video player"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowfullscreen
						></iframe>
					</div>
				{:else}
					<div
						class="h-48 md:h-64 bg-linear-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center relative overflow-hidden"
					>
						<div class="absolute inset-0 opacity-10 pointer-events-none">
							<div
								class="absolute -right-10 -top-10 w-64 h-64 bg-primary rounded-full blur-3xl"
							></div>
							<div
								class="absolute -left-10 -bottom-10 w-48 h-48 bg-primary rounded-full blur-3xl"
							></div>
						</div>
						<div
							class="text-8xl font-bold text-primary/5 capitalize tracking-tighter select-none w-full h-full flex items-center justify-center"
						>
							{#if article.image && typeof article.image === 'object'}
								<img
									src={article.image.url}
									alt={article.title}
									class="w-full h-full object-cover"
								/>
							{:else}
								{article.category.substring(0, 3)}
							{/if}
						</div>
					</div>
				{/if}

				<Button
					variant="ghost"
					size="icon"
					class="absolute top-4 right-4 bg-background/20 hover:bg-background/40 text-white rounded-full backdrop-blur-md"
					onclick={() => (open = false)}
				>
					<X class="w-5 h-5" />
				</Button>
			</div>

			<div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8">
				<!-- Meta Info -->
				<div class="space-y-4">
					<div class="flex flex-wrap items-center gap-2">
						<Badge
							variant="secondary"
							class="bg-primary/5 text-primary border-none text-sm font-bold capitalize tracking-widest px-3"
						>
							{article.category}
						</Badge>
						{#if article.premium}
							<Badge
								class="bg-amber-500 text-white border-none font-bold text-sm capitalize tracking-widest px-3"
							>
								Premium
							</Badge>
						{/if}
						{#if article.videoUrl}
							<Badge
								variant="outline"
								class="border-primary/20 text-primary text-sm font-bold capitalize tracking-widest px-3 flex items-center gap-1.5"
							>
								<Video class="w-3 h-3" />
								Video Course
							</Badge>
						{/if}
					</div>

					<h2
						class="text-3xl md:text-5xl font-bold tracking-tight leading-tight text-slate-900 dark:text-white"
					>
						{article.title}
					</h2>

					<div
						class="flex items-center gap-6 text-sm text-muted-foreground font-bold border-b border-border/20 pb-6"
					>
						<div class="flex items-center gap-2">
							<Clock class="w-4 h-4" />
							{article.duration} min read
						</div>
						<div class="flex items-center gap-2">
							<Share2 class="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
							Share
						</div>
						<div class="flex items-center gap-2">
							<Bookmark class="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
							Save
						</div>
					</div>
				</div>

				<!-- Content Body -->
				<div
					class="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-lg prose-p:leading-relaxed"
				>
					{@html article.content}
				</div>

				<!-- Footer Recommendations -->
				<div
					class="pt-10 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-6"
				>
					<div class="space-y-1 text-center sm:text-left">
						<p class="text-sm font-bold text-primary capitalize tracking-widest">Next Topic</p>
						<p class="text-lg font-bold">Advanced Nutrition for Heart Health</p>
					</div>
					<Button class="bg-primary font-bold shadow-lg shadow-primary/20">
						Continue Reading
						<ArrowRight class="ml-2 w-5 h-5" />
					</Button>
				</div>
			</div>
		{:else}
			<div class="p-20 text-center space-y-4">
				<Loader2 class="w-10 h-10 animate-spin text-primary mx-auto" />
				<p class="font-bold text-muted-foreground">Loading expert insights...</p>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: hsl(var(--muted-foreground) / 0.2);
		border-radius: 10px;
	}

	:global(.prose img) {
		border-radius: 1.5rem;
		box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
	}
</style>
