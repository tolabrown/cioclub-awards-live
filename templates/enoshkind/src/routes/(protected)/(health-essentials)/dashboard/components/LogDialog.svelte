<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import {
		Droplets,
		UtensilsCrossed,
		Dumbbell,
		Heart,
		Weight,
		Smile,
		Save,
		Loader2
	} from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { resizeImage } from '$lib/authentication/imageresize';
	import { Camera, Link, X as CloseIcon, Plus } from '@lucide/svelte';

	let {
		open = $bindable(false),
		type = $bindable('Water'),
		onSuccess
	} = $props<{
		open: boolean;
		type: string;
		onSuccess?: () => void;
	}>();

	let loading = $state(false);

	const icons: Record<string, any> = {
		Water: Droplets,
		Meal: UtensilsCrossed,
		Workout: Dumbbell,
		Vitals: Heart,
		Weight: Weight,
		Mood: Smile
	};

	const colors: Record<string, string> = {
		Water: 'text-blue-500',
		Meal: 'text-green-500',
		Workout: 'text-orange-500',
		Vitals: 'text-red-500',
		Weight: 'text-purple-500',
		Mood: 'text-yellow-500'
	};

	let mealImageId = $state<string | null>(null);
	let mealImagePreview = $state<string | null>(null);
	let isProcessingImage = $state(false);
	let imageUrlInput = $state('');
	let mealContents = $state<string[]>([]);
	let contentInput = $state('');

	function addContent() {
		if (contentInput.trim() && !mealContents.includes(contentInput.trim())) {
			mealContents.push(contentInput.trim());
			contentInput = '';
		}
	}

	function removeContent(item: string) {
		mealContents = mealContents.filter((i) => i !== item);
	}

	async function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || !input.files[0]) return;

		isProcessingImage = true;
		try {
			const file = input.files[0];
			const resized = await resizeImage(file, {
				maxWidth: 800,
				maxHeight: 800,
				quality: 0.8,
				maxSizeKB: 200,
				format: 'webp'
			});

			const formData = new FormData();
			formData.append('image', resized);

			const res = await fetch('/api/health/meal-image', {
				method: 'POST',
				body: formData
			});

			const data = await res.json();

			if (data.success && data.file) {
				mealImageId = data.file.id;
				mealImagePreview = data.file.url;
				toast.success('Image uploaded');
			} else {
				toast.error(data.message || 'Upload failed');
			}
		} catch (error) {
			console.error(error);
			toast.error('Image processing failed');
		} finally {
			isProcessingImage = false;
		}
	}

	async function handleImageUrl() {
		if (!imageUrlInput) return;
		isProcessingImage = true;
		try {
			const response = await fetch(imageUrlInput);
			if (!response.ok) throw new Error('Failed to fetch image');
			const blob = await response.blob();
			const file = new File([blob], 'image.webp', { type: blob.type });

			const resized = await resizeImage(file, {
				maxWidth: 800,
				maxHeight: 800,
				quality: 0.8,
				maxSizeKB: 200,
				format: 'webp'
			});

			const formData = new FormData();
			formData.append('image', resized);

			const res = await fetch('/api/health/meal-image', {
				method: 'POST',
				body: formData
			});

			const data = await res.json();

			if (data.success && data.file) {
				mealImageId = data.file.id;
				mealImagePreview = data.file.url;
				imageUrlInput = '';
				toast.success('Image loaded');
			} else {
				toast.error(data.message || 'Failed to load image');
			}
		} catch (error) {
			toast.error('URL Image error');
		} finally {
			isProcessingImage = false;
		}
	}

	function removeImage() {
		mealImageId = null;
		mealImagePreview = null;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col border-border/40 bg-background/80 backdrop-blur-xl shadow-lg"
	>
		<Dialog.Header>
			<div class="flex items-center gap-4 mb-2">
				<div class="p-3 bg-transparent border border-border/40">
					{#if icons[type]}
						{@const Icon = icons[type]}
						<Icon class="w-6 h-6 {colors[type]}" />
					{/if}
				</div>
				<div>
					<Dialog.Title class="text-2xl font-bold">Log {type}</Dialog.Title>
					<Dialog.Description class="font-medium"
						>Track your {type.toLowerCase()} for better health insights.</Dialog.Description
					>
				</div>
			</div>
		</Dialog.Header>

		<ScrollArea class="h-[550px] w-full px-1">
			<div class="pr-5 py-4">
				{#if type === 'Water'}
					<form
						method="POST"
						action="?/logWater"
						use:enhance={() => {
							loading = true;
							return ({ result }) => {
								loading = false;
								if (result.type === 'success') {
									toast.success('Water logged successfully!');
									open = false;
									onSuccess?.();
								}
							};
						}}
						class="space-y-6 py-4"
					>
						<div class="space-y-2">
							<Label for="amount" class="font-bold ml-1">Amount (ml)</Label>
							<div class="flex items-center gap-3">
								<Input
									id="amount"
									name="amount"
									type="number"
									value="250"
									class="bg-background border-border/40 font-bold"
								/>
								<span class="font-bold text-muted-foreground italic">ml</span>
							</div>
						</div>
						<div class="grid grid-cols-3 gap-2">
							{#each [250, 500, 750] as amt}
								<Button
									type="button"
									variant="outline"
									class="font-semibold"
									onclick={() => {
										const input = document.getElementById('amount') as HTMLInputElement;
										if (input) input.value = amt.toString();
									}}>{amt}ml</Button
								>
							{/each}
						</div>
						<Button type="submit" disabled={loading} class="w-full shadow-sm">
							{#if loading}<Loader2 class="w-4 h-4 mr-2 animate-spin" />LOGGING...{:else}Log Water{/if}
						</Button>
					</form>
				{:else if type === 'Meal'}
					<form
						method="POST"
						action="?/logMeal"
						use:enhance={() => {
							loading = true;
							return ({ result }) => {
								loading = false;
								if (result.type === 'success') {
									toast.success('Meal logged!');
									mealImageId = null;
									mealImagePreview = null;
									mealContents = [];
									open = false;
									onSuccess?.();
								}
							};
						}}
						class="space-y-6 py-4"
					>
						<input type="hidden" name="imageId" value={mealImageId} />

						<!-- Image Upload Section -->
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<Label
									class="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
									>Meal Image</Label
								>
								{#if isProcessingImage}
									<div
										class="flex items-center gap-1.5 text-[10px] text-primary animate-pulse font-bold"
									>
										<Loader2 class="w-3 h-3 animate-spin" />
										SAVING...
									</div>
								{/if}
							</div>

							<div
								class="aspect-video rounded-xl border-2 border-dashed border-border/40 bg-muted/20 flex flex-col items-center justify-center relative overflow-hidden group transition-all"
							>
								{#if mealImagePreview}
									<img src={mealImagePreview} alt="Meal" class="w-full h-full object-cover" />
									<div
										class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
									>
										<Button
											variant="destructive"
											size="icon"
											class="rounded-full h-10 w-10"
											onclick={removeImage}
										>
											<CloseIcon class="w-5 h-5" />
										</Button>
									</div>
								{:else}
									<label
										class="flex flex-col items-center gap-3 cursor-pointer p-6 text-center w-full h-full justify-center"
									>
										<div class="p-4 bg-primary/10 rounded-xl">
											<Camera class="w-8 h-8 text-primary" />
										</div>
										<div class="space-y-1">
											<p class="font-bold text-sm">Upload Photo</p>
											<p
												class="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider"
											>
												WEBP • MAX 200KB
											</p>
										</div>
										<input
											type="file"
											accept="image/*"
											class="hidden"
											onchange={handleFileChange}
										/>
									</label>
								{/if}
							</div>

							<!-- URL Option -->
							<div
								class="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-border/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
							>
								<div class="pl-2">
									<Link class="w-3.5 h-3.5 text-muted-foreground" />
								</div>
								<input
									type="text"
									placeholder="Paste image URL..."
									bind:value={imageUrlInput}
									onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), handleImageUrl())}
									class="bg-transparent border-none focus:ring-0 text-xs flex-1 h-8 outline-none font-medium"
								/>
								<Button
									variant="ghost"
									size="sm"
									class="rounded-lg text-[10px] font-bold h-8 px-3"
									onclick={handleImageUrl}
									disabled={!imageUrlInput || isProcessingImage}
								>
									ADD
								</Button>
							</div>
						</div>

						<div class="space-y-2">
							<Label for="name" class="font-semibold ml-1">Meal Name</Label>
							<Input
								id="name"
								name="name"
								placeholder="e.g. Grilled Chicken Salad"
								required
								class="rounded-xl bg-background border-border/40 font-semibold"
							/>
						</div>

						<div class="space-y-3">
							<Label class="font-semibold ml-1">Meal Contents</Label>
							<div
								class="flex flex-wrap gap-2 p-2 min-h-12 bg-muted/20 border border-border/40 rounded-xl mb-2"
							>
								{#each mealContents as item}
									<Badge
										variant="secondary"
										class="pl-3 pr-1 py-1 gap-1 group bg-primary/10 text-primary border-primary/20"
									>
										{item}
										<button
											type="button"
											onclick={() => removeContent(item)}
											class="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
										>
											<CloseIcon class="w-3 h-3" />
										</button>
									</Badge>
								{:else}
									<p class="text-[10px] text-muted-foreground/60 italic self-center ml-2">
										Add ingredients or items in this meal
									</p>
								{/each}
							</div>
							<div class="flex gap-2">
								<Input
									placeholder="e.g. Brown Rice"
									bind:value={contentInput}
									onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addContent())}
									class="rounded-xl bg-background border-border/40 font-medium"
								/>
								<Button
									type="button"
									variant="outline"
									size="icon"
									class="rounded-xl shrink-0"
									onclick={addContent}
									disabled={!contentInput.trim()}
								>
									<Plus class="w-4 h-4" />
								</Button>
							</div>
							<input type="hidden" name="contents" value={JSON.stringify(mealContents)} />
						</div>

						<div class="space-y-2">
							<Label for="type" class="font-semibold ml-1">Meal Type</Label>
							<select
								id="type"
								name="type"
								class="w-full bg-background border border-border/40 font-semibold px-3 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
							>
								<option>Breakfast</option>
								<option>Lunch</option>
								<option>Dinner</option>
								<option>Snack</option>
							</select>
						</div>

						<Button
							type="submit"
							variant="default"
							disabled={loading || isProcessingImage}
							class="w-full shadow-lg font-bold"
						>
							{#if loading}<Loader2 class="w-4 h-4 mr-2 animate-spin" />LOGGING...{:else}Log Meal{/if}
						</Button>
					</form>
				{:else if type === 'Workout'}
					<form
						method="POST"
						action="?/logWorkout"
						use:enhance={() => {
							loading = true;
							return ({ result }) => {
								loading = false;
								if (result.type === 'success') {
									toast.success('Workout logged!');
									open = false;
									onSuccess?.();
								}
							};
						}}
						class="space-y-6 py-4"
					>
						<div class="space-y-2">
							<Label for="type" class="font-semibold ml-1">Activity Type</Label>
							<Input
								id="type"
								name="type"
								placeholder="e.g. Running, Yoga"
								required
								class="bg-background border-border/40 font-semibold"
							/>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="duration" class="font-semibold ml-1">Duration (min)</Label>
								<Input
									id="duration"
									name="duration"
									type="number"
									placeholder="30"
									required
									class="bg-background border-border/40 font-semibold"
								/>
							</div>
							<div class="space-y-2">
								<Label for="calories" class="font-semibold ml-1">Calories Burned</Label>
								<Input
									id="calories"
									name="calories"
									type="number"
									placeholder="200"
									class="bg-background border-border/40 font-semibold"
								/>
							</div>
						</div>
						<Button type="submit" disabled={loading} class="w-full shadow-sm">
							{#if loading}<Loader2 class="w-4 h-4 mr-2 animate-spin" />LOGGING...{:else}Log Workout{/if}
						</Button>
					</form>
				{:else if type === 'Weight'}
					<form
						method="POST"
						action="?/logWeight"
						use:enhance={() => {
							loading = true;
							return ({ result }) => {
								loading = false;
								if (result.type === 'success') {
									toast.success('Weight updated!');
									open = false;
									onSuccess?.();
								}
							};
						}}
						class="space-y-6 py-4"
					>
						<div class="space-y-2">
							<Label for="weight" class="font-semibold ml-1">Current Weight (kg)</Label>
							<Input
								id="weight"
								name="weight"
								type="number"
								step="0.1"
								placeholder="75.0"
								required
								class="rounded-xl bg-background border-border/40 font-semibold"
							/>
						</div>
						<Button type="submit" disabled={loading} class="w-full shadow-sm">
							{#if loading}<Loader2 class="w-4 h-4 mr-2 animate-spin" />LOGGING...{:else}Update
								Weight{/if}
						</Button>
					</form>
				{:else if type === 'Mood'}
					<form
						method="POST"
						action="?/logMood"
						use:enhance={() => {
							loading = true;
							return ({ result }) => {
								loading = false;
								if (result.type === 'success') {
									toast.success('Mood logged!');
									open = false;
									onSuccess?.();
								}
							};
						}}
						class="space-y-6 py-4"
					>
						<div class="space-y-4">
							<Label class="font-semibold ml-1">How do you feel?</Label>
							<div class="grid grid-cols-5 gap-2">
								{#each ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Excellent'] as mood}
									<label class="flex flex-col items-center gap-2 cursor-pointer group">
										<input type="radio" name="mood" value={mood} required class="sr-only peer" />
										<div
											class="w-10 h-10 rounded-full border border-border/40 flex items-center justify-center peer-checked:bg-primary/20 peer-checked:border-primary transition-all"
										>
											{#if mood === 'Very Sad'}😞{:else if mood === 'Sad'}🙁{:else if mood === 'Neutral'}😐{:else if mood === 'Happy'}🙂{:else}🤩{/if}
										</div>
										<span
											class="text-sm capitalize font-bold text-muted-foreground peer-checked:text-primary"
											>{mood.split(' ')[0]}</span
										>
									</label>
								{/each}
							</div>
						</div>
						<div class="space-y-4">
							<Label class="font-semibold ml-1">Energy Level</Label>
							<div class="grid grid-cols-3 gap-2">
								{#each ['Low', 'Normal', 'High'] as energy}
									<label class="cursor-pointer">
										<input
											type="radio"
											name="energy"
											value={energy}
											required
											class="sr-only peer"
										/>
										<div
											class="py-2 text-center border border-border/40 peer-checked:bg-primary/20 peer-checked:border-primary font-bold text-xs transition-all"
										>
											{energy}
										</div>
									</label>
								{/each}
							</div>
						</div>
						<Button type="submit" variant="default" disabled={loading} class="w-full shadow-sm">
							{#if loading}<Loader2 class="w-4 h-4 mr-2 animate-spin" />LOGGING...{:else}Save Entry{/if}
						</Button>
					</form>
				{:else if type === 'Vitals'}
					<form
						method="POST"
						action="?/logVitals"
						use:enhance={() => {
							loading = true;
							return ({ result }) => {
								loading = false;
								if (result.type === 'success') {
									toast.success('Vitals updated successfully!');
									open = false;
									onSuccess?.();
								}
							};
						}}
						class="space-y-6 py-4"
					>
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="systolic" class="font-bold ml-1">Systolic</Label>
								<Input
									id="systolic"
									name="systolic"
									placeholder="120"
									required
									class="bg-background border-border/40 font-bold"
								/>
							</div>
							<div class="space-y-2">
								<Label for="diastolic" class="font-bold ml-1">Diastolic</Label>
								<Input
									id="diastolic"
									name="diastolic"
									placeholder="80"
									required
									class="bg-background border-border/40 font-bold"
								/>
							</div>
						</div>
						<div class="space-y-2">
							<Label for="heartRate" class="font-bold ml-1">Heart Rate (bpm)</Label>
							<Input
								id="heartRate"
								name="heartRate"
								placeholder="72"
								required
								class="rounded-xl bg-background border-border/40 font-bold"
							/>
						</div>
						<Button type="submit" disabled={loading} class="w-full shadow-sm">
							{#if loading}<Loader2 class="w-4 h-4 mr-2 animate-spin" />LOGGING...{:else}Save Vitals{/if}
						</Button>
					</form>
				{:else}
					<div class="py-8 text-center space-y-4">
						<div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
							<Save class="w-8 h-8 text-muted-foreground" />
						</div>
						<p class="font-bold text-muted-foreground italic">
							Coming Soon: Extended {type} Logging
						</p>
						<Button variant="ghost" onclick={() => (open = false)}>Close</Button>
					</div>
				{/if}
			</div>
		</ScrollArea>
	</Dialog.Content>
</Dialog.Root>
