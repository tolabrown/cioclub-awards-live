<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from 'svelte-sonner';
	import {
		ArrowLeft,
		Video,
		Globe,
		Loader2,
		Save,
		Trash2,
		FileText,
		Sparkles
	} from '@lucide/svelte';
	import RichEditor from '$lib/components/ui/editor/rich-editor.svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';

	let { data } = $props<{ data: { article: any | null } }>();
	const article = $derived(data.article);

	let loading = $state(false);
	let form = $state({
		title: '',
		category: 'Nutrition',
		duration: '',
		image: '',
		premium: false,
		content: '',
		videoUrl: '',
		type: 'article'
	});

	const categories = [
		'Nutrition',
		'Diabetes',
		'Hypertension',
		'Cancers',
		'Mental Health',
		'Fitness',
		'Genetics'
	];

	$effect(() => {
		if (article) {
			form = {
				title: article.title || '',
				category: article.category || 'Nutrition',
				duration: article.duration || '',
				image: article.image || '',
				premium: article.premium || false,
				content: article.content || '',
				videoUrl: article.videoUrl || '',
				type: article.type || 'article'
			};
		}
	});

	async function handleSubmit() {
		if (!form.title) return toast.error('Title is required');
		loading = true;
		try {
			const res = await fetch('/api/education', {
				method: article ? 'PATCH' : 'POST',
				body: JSON.stringify(article ? { id: article.id, ...form } : form)
			});
			if (res.ok) {
				toast.success(article ? 'Content Updated' : 'Content Published');
				goto('/education');
			}
		} catch (e) {
			toast.error('Failed to save content');
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		if (!article) return;
		if (!confirm('Are you sure you want to delete this content?')) return;

		loading = true;
		try {
			const res = await fetch(`/api/education?id=${article.id}`, { method: 'DELETE' });
			if (res.ok) {
				toast.success('Content deleted');
				goto('/education');
			}
		} catch (e) {
			console.error(e);
			toast.error('Delete failed');
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen pb-20 max-w-5xl mx-auto px-4 md:px-0">
	<!-- Top Navigation -->
	<div class="flex items-center justify-between py-8">
		<Button
			variant="ghost"
			class="group text-muted-foreground hover:text-primary rounded-2xl px-4 py-6 font-bold flex items-center gap-2"
			onclick={() => goto('/education')}
		>
			<ArrowLeft class="w-5 h-5 transition-transform group-hover:-translate-x-1" />
			Back to Health Hub
		</Button>

		{#if article}
			<Button
				variant="ghost"
				class="rounded-2xl text-destructive hover:bg-destructive/10"
				onclick={handleDelete}
				disabled={loading}
			>
				<Trash2 class="w-5 h-5" />
			</Button>
		{/if}
	</div>

	<!-- Hero Header -->
	<div class="space-y-4 mb-10 text-center md:text-left">
		<div class="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-2xl">
			<Sparkles class="w-4 h-4" />
			<span class="text-sm font-bold capitalize tracking-widest">
				{article ? 'Modification Mode' : 'Clinical Publishing'}
			</span>
		</div>
		<h1 class="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
			{article ? 'Refine' : 'Ignite'} Medical <span class="text-primary">Insights.</span>
		</h1>
		<p class="text-muted-foreground font-medium text-lg max-w-2xl">
			Craft world-class health education materials, nutritional protocols, and masterclass series
			for our global community.
		</p>
	</div>

	<!-- Main Form Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
		<!-- Primary Content -->
		<div class="lg:col-span-2 space-y-8">
			<Card.Root
				class="p-8 rounded-xl bg-card/40 backdrop-blur-xl border-border/40 shadow-2xl relative overflow-hidden"
			>
				<div class="space-y-8 relative z-10">
					<!-- Title Section -->
					<div class="space-y-4">
						<Label
							for="title"
							class="font-bold text-xs capitalize tracking-widest text-primary ml-1"
							>Masterclass Title</Label
						>
						<Input
							id="title"
							bind:value={form.title}
							placeholder="e.g. The Neurobiology of Deep Sleep"
							class="text-xl md:text-2xl rounded-3xl bg-background/50 border-border/40 font-bold px-8 focus:ring-primary/20 transition-all shadow-inner"
						/>
					</div>

					<!-- Content Editor -->
					<div class="space-y-4">
						<Label class="font-bold text-xs capitalize tracking-widest text-primary ml-1"
							>Publication Body</Label
						>
						<div
							class="rounded-xl border-2 border-primary/10 overflow-hidden bg-background/50 min-h-[500px] shadow-sm hover:border-primary/30 transition-all"
						>
							<RichEditor bind:value={form.content} class="min-h-[450px]" />
						</div>
					</div>
				</div>
			</Card.Root>
		</div>

		<!-- Sidebar Controls -->
		<div class="space-y-8">
			<Card.Root
				class="p-8 rounded-xl bg-indigo-950/5 dark:bg-card/40 backdrop-blur-xl border-border/40 space-y-8 shadow-xl"
			>
				<div class="space-y-6">
					<!-- Type & Category -->
					<div class="space-y-3">
						<Label class="font-bold text-sm capitalize tracking-widest text-muted-foreground ml-1"
							>Content Architecture</Label
						>
						<select
							bind:value={form.type}
							class="w-full rounded-2xl bg-background/50 border-border/40 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
						>
							<option value="article">Standard Article</option>
							<option value="course">Video Masterclass</option>
						</select>
						<select
							bind:value={form.category}
							class="w-full rounded-2xl bg-background/50 border-border/40 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
						>
							{#each categories as cat}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
					</div>

					<!-- Metrics -->
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-3">
							<Label
								for="duration"
								class="font-bold text-sm capitalize tracking-widest text-muted-foreground ml-1"
								>Read Time</Label
							>
							<Input
								id="duration"
								bind:value={form.duration}
								placeholder="Mins"
								class="rounded-2xl bg-background/50 border-border/40 font-bold text-center shadow-sm"
							/>
						</div>
						<div class="space-y-3">
							<Label
								for="image"
								class="font-bold text-sm capitalize tracking-widest text-muted-foreground ml-1"
								>Icon ID</Label
							>
							<Input
								id="image"
								bind:value={form.image}
								placeholder="e.g. DNA"
								class="rounded-2xl bg-background/50 border-border/40 font-bold text-center shadow-sm"
							/>
						</div>
					</div>

					<!-- Video Link -->
					<div class="space-y-3">
						<Label
							for="video"
							class="font-bold text-sm capitalize tracking-widest text-muted-foreground ml-1 flex items-center gap-2"
						>
							<Video class="w-3 h-3" />
							Live Link (Optional)
						</Label>
						<Input
							id="video"
							bind:value={form.videoUrl}
							placeholder="https://youtube.com/..."
							class="rounded-2xl bg-background/50 border-border/40 font-medium px-6 shadow-sm"
						/>
					</div>

					<!-- Premium Toggle -->
					<div
						class="flex items-center justify-between p-6 bg-primary/10 rounded-2xl border border-primary/20"
					>
						<div class="flex items-center gap-3">
							<Globe class="w-5 h-5 text-primary" />
							<div>
								<Label class="font-bold text-sm">Premium</Label>
								<p class="text-[9px] text-muted-foreground font-bold capitalize tracking-tight">
									Enoshkind Exclusive
								</p>
							</div>
						</div>
						<Switch bind:checked={form.premium} />
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="pt-4 space-y-4">
					<Button
						class="w-full h-16 rounded-2xl bg-primary text-white shadow-2xl shadow-primary/30 font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
						onclick={handleSubmit}
						disabled={loading}
					>
						{#if loading}
							<Loader2 class="w-5 h-5 mr-3 animate-spin" />
							Syncing...
						{:else}
							<Save class="w-5 h-5 mr-3" />
							{article ? 'Update Protocol' : 'Publish Protocol'}
						{/if}
					</Button>
					<Button
						variant="ghost"
						class="w-full rounded-2xl font-bold text-muted-foreground border border-border/40 hover:bg-muted"
						onclick={() => goto('/education')}
					>
						Discard Changes
					</Button>
				</div>
			</Card.Root>

			<!-- Tips Card -->
			<div class="p-8 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-4 shadow-sm">
				<h5
					class="text-sm font-bold text-emerald-600 capitalize tracking-widest flex items-center gap-2"
				>
					<Sparkles class="w-4 h-4" /> Editorial Tip
				</h5>
				<p class="text-xs text-emerald-900/60 dark:text-emerald-400/40 leading-relaxed font-medium">
					Clinical-grade articles with clear section headings and verified medical durations tend to
					receive 40% higher engagement from our global wellness community.
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.custom-scrollbar::-webkit-scrollbar) {
		width: 6px;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-track) {
		background: transparent;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-thumb) {
		background: hsl(var(--muted-foreground) / 0.2);
		border-radius: 10px;
	}
</style>
