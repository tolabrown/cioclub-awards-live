<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import {
		Plus,
		Search,
		Pencil,
		Trash2,
		ExternalLink,
		BookOpen,
		Video,
		Clock,
		Loader2
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let isDeleting = $state<string | null>(null);

	async function handleDelete(id: string) {
		if (!confirm('Are you sure you want to delete this article?')) return;

		isDeleting = id;
		try {
			const res = await fetch(`/api/education?id=${id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				toast.success('Article deleted successfully');
				// Refresh data
				goto(page.url.pathname, { invalidateAll: true });
			} else {
				toast.error('Failed to delete article');
			}
		} catch (e) {
			toast.error('An error occurred');
		} finally {
			isDeleting = null;
		}
	}

	function handleEdit(id: string) {
		goto(`/admin/education/manage/${id}`);
	}

	function handleAdd() {
		goto('/admin/education/manage');
	}

	const filteredArticles = $derived(
		data.articles.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
	);
</script>

<div class="p-6 space-y-6 max-w-7xl mx-auto">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Education Repository</h1>
			<p class="text-muted-foreground">Manage health hub articles, guides, and video content.</p>
		</div>
		<Button onclick={handleAdd} class="rounded-xl shadow-lg shadow-primary/20">
			<Plus class="w-4 h-4 mr-2" />
			Create Article
		</Button>
	</div>

	<Card.Root class="border-border/40 bg-card/50 backdrop-blur-sm rounded-[1.5rem] overflow-hidden">
		<Card.Header class="pb-4">
			<div class="flex items-center gap-4">
				<div class="relative flex-1">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by title..."
						class="pl-10 rounded-xl"
						bind:value={searchQuery}
					/>
				</div>
				<div class="flex items-center gap-2">
					<Badge variant="outline" class="px-4 rounded-xl border-border/40 font-bold">
						{data.total} Total Articles
					</Badge>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header class="bg-muted/30">
					<Table.Row>
						<Table.Head class="w-[40%] font-bold">Article</Table.Head>
						<Table.Head class="font-bold">Category</Table.Head>
						<Table.Head class="font-bold">Type</Table.Head>
						<Table.Head class="font-bold">Duration</Table.Head>
						<Table.Head class="text-right font-bold space-x-2">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filteredArticles as article}
						<Table.Row class="group hover:bg-muted/20 transition-colors">
							<Table.Cell>
								<div class="flex items-center gap-3">
									<div
										class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0"
									>
										{#if article.image && typeof article.image === 'object'}
											<img src={article.image.url} alt="" class="w-full h-full object-cover" />
										{:else}
											<BookOpen class="w-6 h-6 text-primary" />
										{/if}
									</div>
									<div class="flex flex-col">
										<span class="font-bold line-clamp-1">{article.title}</span>
										<span class="text-xs text-muted-foreground line-clamp-1"
											>{new Date(article.createdAt).toLocaleDateString()}</span
										>
									</div>
								</div>
							</Table.Cell>
							<Table.Cell>
								<Badge variant="secondary" class="rounded-lg capitalize font-bold">
									{article.category}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								<div class="flex items-center gap-2 text-sm">
									{#if article.type === 'video'}
										<Video class="w-4 h-4 text-primary" />
										<span class="capitalize">Video</span>
									{:else}
										<BookOpen class="w-4 h-4 text-primary" />
										<span class="capitalize">Article</span>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<Clock class="w-3.5 h-3.5" />
									{article.duration
										? article.duration.toLowerCase().includes('min')
											? article.duration
											: `${article.duration} min`
										: 'N/A'}
								</div>
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex items-center justify-end gap-2">
									<Button
										variant="ghost"
										size="icon"
										class="rounded-xl hover:bg-primary/10 hover:text-primary"
										onclick={() => handleEdit(article.id)}
									>
										<Pencil class="w-4 h-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="rounded-xl hover:bg-destructive/10 hover:text-destructive"
										onclick={() => handleDelete(article.id)}
										disabled={isDeleting === article.id}
									>
										{#if isDeleting === article.id}
											<Loader2 class="w-4 h-4 animate-spin" />
										{:else}
											<Trash2 class="w-4 h-4" />
										{/if}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="rounded-xl hover:bg-accent"
										href={`/education?id=${article.id}`}
										target="_blank"
									>
										<ExternalLink class="w-4 h-4" />
									</Button>
								</div>
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={5} class="h-48 text-center">
								<div class="flex flex-col items-center gap-2 text-muted-foreground">
									<BookOpen class="w-8 h-8 opacity-20" />
									<p>No articles found</p>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
