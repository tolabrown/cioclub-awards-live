<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		ChevronLeft,
		ChevronRight,
		Clock,
		Share2,
		Bookmark,
		ArrowLeft,
		Video,
		BookOpen,
		Sparkles
	} from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const article = $derived(data.article);
	const adjacent = $derived(data.adjacent);
	const isAdmin = $derived(page.data.user?.role === 'admin');
</script>

<div class="max-w-4xl mx-auto space-y-10 pb-20">
	<!-- Top Navigation -->
	<div class="flex items-center justify-between">
		<Button variant="ghost" class="group font-bold" href="/education">
			<ArrowLeft class="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
			Back to Hub
		</Button>
		<div class="flex items-center gap-2">
			{#if isAdmin}
				<Button variant="outline" class="font-bold" href={`/admin/education/manage/${article.id}`}>
					Edit Article
				</Button>
			{/if}
			<Button variant="ghost" size="icon">
				<Share2 class="w-4 h-4" />
			</Button>
		</div>
	</div>

	<!-- Article Header Section with Gradient Highlight -->
	<header class="space-y-8">
		<div class="space-y-4">
			<div class="flex items-center gap-3">
				<Badge
					class="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px] px-3"
				>
					{article.category}
				</Badge>
				<div
					class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest"
				>
					<Clock class="w-3.5 h-3.5" />
					{article.duration
						? article.duration.toLowerCase().includes('min')
							? article.duration
							: `${article.duration} min read`
						: 'N/A'}
				</div>
			</div>
			<h1 class="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
				{article.title}
			</h1>
		</div>

		<!-- Featured Image / Video -->
		<div
			class="relative rounded-xl overflow-hidden shadow-lg bg-muted/20 border border-border/40 aspect-video md:aspect-[21/9]"
		>
			{#if article.image && typeof article.image === 'object'}
				<img src={article.image.url} alt={article.title} class="w-full h-full object-cover" />
			{:else}
				<div
					class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-transparent"
				>
					<BookOpen class="w-16 h-16 text-primary/20 mb-4" />
					<span class="text-8xl font-bold text-primary/5 uppercase tracking-tighter select-none">
						{article.category.substring(0, 3)}
					</span>
				</div>
			{/if}

			{#if article.premium}
				<div class="absolute top-6 left-6 z-10">
					<Badge
						class="bg-amber-500 text-white border-none font-bold px-4 py-1.5 shadow-lg shadow-amber-500/20"
					>
						PREMIUM CONTENT
					</Badge>
				</div>
			{/if}
		</div>
	</header>

	<!-- Article Content -->
	<article
		class="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-strong:text-foreground"
	>
		<div class="text-lg leading-relaxed text-foreground/90 space-y-6">
			{@html article.content}
		</div>
	</article>

	<!-- Supplemental Media if exists -->
	{#if article.videoUrl}
		<div class="pt-10 border-t border-border/40">
			<div class="space-y-6">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-primary/10 rounded-lg text-primary">
						<Video class="w-5 h-5" />
					</div>
					<h3 class="text-xl font-bold">Watch Supplemental Content</h3>
				</div>
				<div
					class="aspect-video rounded-xl overflow-hidden shadow-lg bg-black border border-border/40"
				>
					<!-- Video placeholder/embed logic -->
					<iframe
						title="Supplemental Video"
						src={article.videoUrl.replace('watch?v=', 'embed/')}
						class="w-full h-full"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				</div>
			</div>
		</div>
	{/if}

	<!-- Next/Previous Article Navigation -->
	<div class="pt-12 border-t border-border/40">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Previous Article -->
			{#if adjacent.prev}
				<a
					href={`/education/${adjacent.prev.id}`}
					class="group flex flex-col p-6 rounded-xl border border-border/40 bg-card hover:bg-accent/5 transition-all shadow-md hover:shadow-lg"
				>
					<div
						class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2"
					>
						<ChevronLeft class="w-4 h-4 transition-transform group-hover:-translate-x-1" />
						Previous Publication
					</div>
					<span
						class="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors"
					>
						{adjacent.prev.title}
					</span>
				</a>
			{:else}
				<div
					class="p-6 rounded-xl border border-dashed border-border/40 bg-muted/5 flex items-center justify-center opacity-50"
				>
					<span class="text-xs font-bold text-muted-foreground uppercase tracking-widest"
						>End of Stream</span
					>
				</div>
			{/if}

			<!-- Next Article -->
			{#if adjacent.next}
				<a
					href={`/education/${adjacent.next.id}`}
					class="group flex flex-col p-6 rounded-xl border border-border/40 bg-card hover:bg-accent/5 transition-all shadow-md hover:shadow-lg text-right items-end"
				>
					<div
						class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2"
					>
						Next Publication
						<ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
					</div>
					<span
						class="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors"
					>
						{adjacent.next.title}
					</span>
				</a>
			{:else}
				<div
					class="p-6 rounded-xl border border-dashed border-border/40 bg-muted/5 flex items-center justify-center opacity-50"
				>
					<span class="text-xs font-bold text-muted-foreground uppercase tracking-widest"
						>No Further Content</span
					>
				</div>
			{/if}
		</div>
	</div>

	<!-- Bottom Hub CTA -->
	<div
		class="bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-xl p-8 text-center space-y-4 border border-primary/10"
	>
		<Sparkles class="w-8 h-8 text-primary mx-auto opacity-50" />
		<div class="space-y-2">
			<h4 class="text-xl font-bold">Continuous Health Learning</h4>
			<p class="text-muted-foreground font-medium text-sm">
				Stay ahead of clinical trends and wellness research with our weekly curated digests.
			</p>
		</div>
		<Button variant="default" class="font-bold mt-2" href="/education">
			Explore More Publications
		</Button>
	</div>
</div>
