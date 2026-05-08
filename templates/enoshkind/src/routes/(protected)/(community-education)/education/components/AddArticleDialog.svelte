<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from 'svelte-sonner';
	import {
		Plus,
		X,
		Video,
		Type,
		Clock,
		FileText,
		Globe,
		Loader2,
		Save,
		Trash2
	} from '@lucide/svelte';
	import RichEditor from '$lib/components/ui/editor/rich-editor.svelte';

	let {
		open = $bindable(false),
		article = $bindable(null),
		onAdded
	} = $props<{
		open: boolean;
		article?: any | null;
		onAdded: () => void;
	}>();

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
		} else {
			form = {
				title: '',
				category: 'Nutrition',
				duration: '',
				image: '',
				premium: false,
				content: '',
				videoUrl: '',
				type: 'article'
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
				toast.success(article ? 'Content Updated' : 'Content Added');
				onAdded();
				open = false;
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
				onAdded();
				open = false;
			}
		} catch (e) {
			console.error(e);
			toast.error('Delete failed');
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[800px] p-0 bg-card/95 backdrop-blur-2xl border-border/40 overflow-hidden rounded-xl max-h-[90vh] flex flex-col"
	>
		<div class="bg-primary p-6 text-white relative shrink-0">
			<Dialog.Header>
				<Dialog.Title class="text-2xl font-bold"
					>{article ? 'Edit Content' : 'Add New Content'}</Dialog.Title
				>
				<Dialog.Description class="text-white/80 font-medium"
					>Publish health articles or video courses for the community.</Dialog.Description
				>
			</Dialog.Header>
		</div>

		<div class="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
			<div class="grid gap-6">
				<!-- Row 1: Title and Type -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="md:col-span-2 space-y-2">
						<Label
							for="title"
							class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1"
							>Title</Label
						>
						<Input
							id="title"
							bind:value={form.title}
							placeholder="e.g. Understanding Blood Sugar"
							class="rounded-xl bg-background/50 border-border/40 font-medium"
						/>
					</div>
					<div class="space-y-2">
						<Label class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1"
							>Type</Label
						>
						<select
							bind:value={form.type}
							class="w-full rounded-xl bg-background/50 border-border/40 px-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
						>
							<option value="article">Article</option>
							<option value="course">Video Course</option>
						</select>
					</div>
				</div>

				<!-- Row 2: Category, Duration, Image -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="space-y-2">
						<Label class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1"
							>Category</Label
						>
						<select
							bind:value={form.category}
							class="w-full rounded-xl bg-background/50 border-border/40 px-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
						>
							{#each categories as cat}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2">
						<Label
							for="duration"
							class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1"
							>Duration (min)</Label
						>
						<Input
							id="duration"
							bind:value={form.duration}
							placeholder="e.g. 5"
							class="rounded-xl bg-background/50 border-border/40 font-bold"
						/>
					</div>
					<div class="space-y-2">
						<Label
							for="image"
							class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1"
							>Icon Code</Label
						>
						<Input
							id="image"
							bind:value={form.image}
							placeholder="e.g. DIAB, DNA"
							class="rounded-xl bg-background/50 border-border/40 font-bold"
						/>
					</div>
				</div>

				<!-- Row 3: Video URL -->
				<div class="space-y-2">
					<Label
						for="video"
						class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1 flex items-center gap-2"
					>
						<Video class="w-3 h-3" />
						Video Link (Optional)
					</Label>
					<Input
						id="video"
						bind:value={form.videoUrl}
						placeholder="https://youtube.com/watch?v=..."
						class="rounded-xl bg-background/50 border-border/40 font-medium"
					/>
				</div>

				<!-- Row 4: Premium and Rich Content -->
				<div class="space-y-4">
					<Label class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1"
						>Body Content</Label
					>
					<div
						class="rounded-2xl border border-border/40 overflow-hidden bg-background/50 min-h-[300px]"
					>
						<RichEditor bind:value={form.content} class="min-h-[250px]" />
					</div>
				</div>

				<div
					class="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10"
				>
					<div class="flex items-center gap-3">
						<Globe class="w-5 h-5 text-primary" />
						<div>
							<Label class="font-bold text-sm">Premium Access</Label>
							<p class="text-sm text-muted-foreground font-bold capitalize tracking-tight">
								Requires Enoshkind Subscription
							</p>
						</div>
					</div>
					<Switch bind:checked={form.premium} />
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="p-6 md:p-8 shrink-0 bg-background/50 border-t border-border/20 flex gap-3">
			{#if article}
				<Button
					variant="ghost"
					class="rounded-xl text-destructive hover:bg-destructive/10"
					onclick={handleDelete}
					disabled={loading}
				>
					<Trash2 class="w-5 h-5" />
				</Button>
			{/if}
			<Button
				variant="outline"
				class="flex-1 rounded-xl border-border/40 font-bold"
				onclick={() => (open = false)}>Cancel</Button
			>
			<Button
				class="flex-[2] rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold"
				onclick={handleSubmit}
				disabled={loading}
			>
				{#if loading}
					<Loader2 class="w-5 h-5 mr-2 animate-spin" />
					Saving...
				{:else}
					<Save class="w-5 h-5 mr-2" />
					{article ? 'Update Content' : 'Publish Content'}
				{/if}
			</Button>
		</div>
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
</style>
