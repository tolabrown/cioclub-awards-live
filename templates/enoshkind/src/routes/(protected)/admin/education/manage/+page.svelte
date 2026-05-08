<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import { Switch } from '$lib/components/ui/switch';
	import RichEditor from '$lib/components/ui/editor/rich-editor.svelte';
	import {
		ChevronLeft,
		Save,
		Image as ImageIcon,
		Loader2,
		X,
		Video,
		BookOpen,
		FileText
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import type { ActionData, PageData } from './$types';
	import { deserialize, enhance } from '$app/forms';
	import { resizeImage } from '$lib/authentication/imageresize';
	import { Link } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isSubmitting = $state(false);
	let content = $state('');
	let bannerPreview = $state<string | null>(null);
	let imageId = $state<string | null>(null);
	let imageUrlInput = $state('');
	let isProcessingImage = $state(false);

	const categories = [
		'Nutrition',
		'Diabetes',
		'Hypertension',
		'Cancers',
		'Mental Health',
		'Fitness',
		'Genetics',
		'General'
	];

	const types = [
		{ value: 'article', label: 'Article', icon: BookOpen },
		{ value: 'video', label: 'Video Content', icon: Video },
		{ value: 'guide', label: 'Clinical Guide', icon: FileText }
	];

	async function uploadImageToServer(file: File) {
		isProcessingImage = true;
		try {
			const formData = new FormData();
			formData.append('image', file);

			const response = await fetch('?/uploadImage', {
				method: 'POST',
				body: formData
			});

			const result = deserialize(await response.text());

			if (result.type === 'success' && result.data?.file) {
				const uploadedFile = result.data.file as { id: string; url: string; directUrl?: string };
				imageId = uploadedFile.id;
				// Use directUrl if available, otherwise fallback to url (which we fixed in file.ts anyway)
				bannerPreview = uploadedFile.directUrl || uploadedFile.url;
				toast.success('Image uploaded successfully');
			} else {
				const error = result.type === 'failure' ? (result.data as any)?.message : 'Upload failed';
				toast.error(error || 'Upload failed');
			}
		} catch (error) {
			console.error('Upload error:', error);
			toast.error('Failed to upload image');
		} finally {
			isProcessingImage = false;
		}
	}

	async function processAndAddFile(file: File) {
		try {
			const resized = await resizeImage(file, {
				maxWidth: 1200,
				maxHeight: 1200,
				quality: 0.8,
				maxSizeKB: 200,
				format: 'webp'
			});
			await uploadImageToServer(resized);
		} catch (error: any) {
			console.error('Resizing error:', error);
			toast.error(`Failed to process ${file.name}`);
		}
	}

	async function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			await processAndAddFile(input.files[0]);
			input.value = '';
		}
	}

	async function handleImageUrl() {
		if (!imageUrlInput) return;

		isProcessingImage = true;
		try {
			const response = await fetch(imageUrlInput);
			if (!response.ok) throw new Error('Failed to fetch image');
			const blob = await response.blob();
			const fileName = imageUrlInput.split('/').pop() || 'image.webp';
			const file = new File([blob], fileName, { type: blob.type });

			await processAndAddFile(file);
			imageUrlInput = '';
		} catch (error) {
			console.error('URL Image error:', error);
			toast.error('Failed to load image from URL');
		} finally {
			isProcessingImage = false;
		}
	}

	function removeBanner() {
		imageId = null;
		bannerPreview = null;
	}

	$effect(() => {
		if (form?.message) {
			toast.error(form.message);
			isSubmitting = false;
		}
	});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="icon" class="rounded-xl" href="/admin/education">
				<ChevronLeft class="w-5 h-5" />
			</Button>
			<div>
				<h1
					class="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
				>
					Create Publication
				</h1>
				<p class="text-muted-foreground font-medium mt-1">
					Drafting new health intelligence content for the community.
				</p>
			</div>
		</div>
	</div>

	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result }) => {
				isSubmitting = false;
				if (result.type === 'redirect') {
					toast.success('Article created successfully');
					goto(result.location);
				} else if (result.type === 'failure') {
					toast.error((result.data as any)?.message || 'Failed to create article');
				}
			};
		}}
		class="grid grid-cols-1 lg:grid-cols-3 gap-4"
	>
		<!-- hidden input for rich text content -->
		<input type="hidden" name="content" value={content} />
		<input type="hidden" name="banner" value={imageId} />

		<div class="lg:col-span-2 space-y-8">
			<!-- Main Content Card -->
			<Card.Root class="border-border/40 bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden">
				<Card.Header>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="title" class="text-sm font-bold uppercase tracking-widest text-primary/60"
								>Article Title</Label
							>
							<Input
								id="title"
								name="title"
								placeholder="Enter a compelling title..."
								class="text-lg font-bold rounded-xl bg-background/50 border-border/40 focus:ring-primary/20"
								required
							/>
						</div>

						<div class="space-y-2">
							<Label
								for="content"
								class="text-sm font-bold uppercase tracking-widest text-primary/60">Content</Label
							>
							<div
								class="min-h-[400px] border border-border/40 rounded-xl overflow-hidden bg-background/50 shadow-inner"
							>
								<RichEditor bind:value={content} />
							</div>
						</div>
					</div>
				</Card.Header>
			</Card.Root>

			<!-- Video Link (Optional) -->
			<Card.Root class="border-border/40 bg-card/50 backdrop-blur-sm rounded-xl">
				<Card.Content class="p-6">
					<div class="space-y-4">
						<div class="flex items-center gap-3">
							<div class="p-2 bg-primary/10 rounded-lg">
								<Video class="w-5 h-5 text-primary" />
							</div>
							<h3 class="font-bold">Supplemental Media</h3>
						</div>
						<div class="space-y-2">
							<Label
								for="videoUrl"
								class="text-sm font-bold uppercase tracking-widest text-primary/60"
								>Embed Video URL</Label
							>
							<Input
								id="videoUrl"
								name="videoUrl"
								placeholder="YouTube or Vimeo link..."
								class="rounded-xl bg-background/50 border-border/40"
							/>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<div class="space-y-8">
			<!-- Settings Card -->
			<Card.Root class="border-border/40 bg-card/50 backdrop-blur-sm rounded-xl">
				<Card.Content class="space-y-4">
					<!-- Banner Upload -->
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<Label class="text-sm font-bold uppercase tracking-widest text-primary/60"
								>Cover Image</Label
							>
							{#if isProcessingImage}
								<div
									class="flex items-center gap-2 text-[10px] text-primary animate-pulse font-bold"
								>
									<Loader2 class="w-3 h-3 animate-spin" />
									PROCESSING
								</div>
							{/if}
						</div>
						<div
							class="aspect-video rounded-3xl border-2 border-dashed border-border/40 bg-background/30 flex flex-col items-center justify-center relative overflow-hidden group transition-all hover:bg-background/50 hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20"
						>
							{#if bannerPreview}
								<img
									src={bannerPreview}
									alt="Preview"
									class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
								<div
									class="absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center gap-2"
								>
									<button
										type="button"
										class="p-3 bg-destructive text-white rounded-full shadow-xl hover:scale-110 transition-transform"
										onclick={removeBanner}
									>
										<X class="w-5 h-5" />
									</button>
								</div>
							{:else}
								<label
									class="flex flex-col items-center gap-4 cursor-pointer p-8 text-center w-full h-full justify-center group/label"
								>
									<div
										class="p-5 bg-primary/10 rounded-2xl group-hover/label:bg-primary/20 transition-colors"
									>
										<ImageIcon class="w-10 h-10 text-primary" />
									</div>
									<div class="space-y-1">
										<p class="font-bold text-sm tracking-tight text-primary/80">
											Upload Publication Banner
										</p>
										<p
											class="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest"
										>
											WebP • Max 200KB
										</p>
									</div>
									<input type="file" accept="image/*" onchange={handleFileChange} class="hidden" />
								</label>
							{/if}
						</div>

						<!-- URL Input -->
						<div
							class="flex items-center gap-2 bg-background/50 p-2 rounded-2xl border border-border/40"
						>
							<div class="pl-2">
								<Link class="w-4 h-4 text-muted-foreground" />
							</div>
							<input
								type="text"
								placeholder="Paste image URL..."
								bind:value={imageUrlInput}
								onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), handleImageUrl())}
								class="bg-transparent border-none focus:ring-0 text-xs flex-1 h-8 outline-none"
							/>
							<Button
								variant="secondary"
								size="sm"
								class="rounded-xl text-[10px] font-bold"
								onclick={handleImageUrl}
								disabled={!imageUrlInput || isProcessingImage}
							>
								ADD URL
							</Button>
						</div>
					</div>

					<div class="space-y-6">
						<div class="space-y-2">
							<Label class="text-sm font-bold uppercase tracking-widest text-primary/60"
								>Article Category</Label
							>
							<select
								name="category"
								class="w-full px-4 rounded-xl bg-background/50 border-border/40 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
								required
							>
								{#each categories as cat}
									<option value={cat}>{cat}</option>
								{/each}
							</select>
						</div>

						<div class="space-y-2">
							<Label class="text-sm font-bold uppercase tracking-widest text-primary/60"
								>Content Format</Label
							>
							<select
								name="type"
								class="w-full px-4 rounded-xl bg-background/50 border-border/40 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
								required
							>
								{#each types as type}
									<option value={type.value}>{type.label}</option>
								{/each}
							</select>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label class="text-sm font-bold uppercase tracking-widest text-primary/60"
									>Read Time</Label
								>
								<Input
									name="duration"
									type="text"
									placeholder="e.g. 5 min read"
									class="rounded-xl bg-background/50 border-border/40"
								/>
							</div>
							<div class="space-y-4 pt-8">
								<div class="flex items-center justify-between">
									<Label class="font-bold text-sm">Premium</Label>
									<Switch name="premium" value="true" />
								</div>
							</div>
						</div>
					</div>

					<Button
						type="submit"
						class="w-full font-bold shadow-xl bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all rounded-xl"
						disabled={isSubmitting}
					>
						{#if isSubmitting}
							<Loader2 class="w-5 h-5 mr-3 animate-spin" />
							Publishing...
						{:else}
							<Save class="w-5 h-5 mr-3" />
							Save Publication
						{/if}
					</Button>
				</Card.Content>
			</Card.Root>
		</div>
	</form>
</div>

<style>
	:global(.editor-container) {
		min-height: 400px;
	}
</style>
