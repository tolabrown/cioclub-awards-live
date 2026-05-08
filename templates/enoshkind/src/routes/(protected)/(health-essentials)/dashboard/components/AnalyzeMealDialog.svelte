<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Loader2, BrainCircuit, Sparkles, TrendingUp } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Badge } from '$lib/components/ui/badge';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let {
		open = $bindable(false),
		meal = {
			id: '',
			name: '',
			contents: [],
			image: '',
			calories: 0,
			protein: 0,
			carbs: 0,
			fats: 0
		},
		onSuccess
	} = $props<{
		open: boolean;
		meal: {
			id: string;
			name: string;
			contents: string[];
			image: string | { url: string };
			calories?: number;
			protein?: number;
			carbs?: number;
			fats?: number;
		};
		onSuccess?: () => void;
	}>();

	type Estimate = {
		calories: number;
		fats: number;
		carbs: number;
		protein: number;
	};

	let estimates = $state<Estimate[]>([]);
	let loading = $state(false);

	const maxEstimates = 3;
	const remaining = $derived(maxEstimates - estimates.length);

	// Check if meal already has macros saved in the database
	const hasSavedMacros = $derived(
		(meal.calories && meal.calories > 0) ||
			(meal.protein && meal.protein > 0) ||
			(meal.carbs && meal.carbs > 0) ||
			(meal.fats && meal.fats > 0)
	);

	const savedMacros = $derived(
		hasSavedMacros
			? {
					calories: meal.calories || 0,
					protein: meal.protein || 0,
					carbs: meal.carbs || 0,
					fats: meal.fats || 0
				}
			: null
	);

	const averages = $derived.by(() => {
		if (estimates.length === 0) return null;
		const sum = estimates.reduce(
			(acc, est) => ({
				calories: acc.calories + est.calories,
				fats: acc.fats + est.fats,
				carbs: acc.carbs + est.carbs,
				protein: acc.protein + est.protein
			}),
			{ calories: 0, fats: 0, carbs: 0, protein: 0 }
		);
		return {
			calories: Math.round(sum.calories / estimates.length),
			fats: Math.round(sum.fats / estimates.length),
			carbs: Math.round(sum.carbs / estimates.length),
			protein: Math.round(sum.protein / estimates.length)
		};
	});

	async function generateEstimate() {
		if (estimates.length >= maxEstimates) {
			toast.error('Maximum number of estimates reached');
			return;
		}

		loading = true;
		try {
			const imageUrl = typeof meal.image === 'string' ? meal.image : meal.image?.url;
			const res = await fetch('/api/health/meal-estimate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: meal.name,
					contents: meal.contents,
					image: imageUrl
				})
			});

			const data = await res.json();
			if (data.success && data.estimate) {
				estimates = [...estimates, data.estimate];
				toast.success('New estimate generated!');
			} else {
				toast.error(data.message || 'Failed to generate estimate');
			}
		} catch (error) {
			toast.error('Network error during estimation');
		} finally {
			loading = false;
		}
	}

	async function updateMealMacros() {
		if (!averages || !meal.id) return;

		loading = true;
		try {
			const formData = new FormData();
			formData.append('id', meal.id);
			formData.append('calories', averages.calories.toString());
			formData.append('protein', averages.protein.toString());
			formData.append('carbs', averages.carbs.toString());
			formData.append('fats', averages.fats.toString());

			const response = await fetch('?/updateMealMacros', {
				method: 'POST',
				body: formData
			});

			const result = deserialize(await response.text());

			if (result.type === 'success') {
				toast.success('Meal macros updated successfully!');
				await invalidateAll();
				onSuccess?.();
				open = false;
			} else {
				toast.error('Failed to update meal macros');
			}
		} catch (error) {
			toast.error('Error updating meal data');
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col border-border/40 bg-background/95 backdrop-blur-xl shadow-lg"
	>
		<Dialog.Header>
			<div class="flex items-center gap-4 mb-4">
				<div class="p-3 bg-primary/10 rounded-xl">
					<BrainCircuit class="w-7 h-7 text-primary" />
				</div>
				<div>
					<Dialog.Title class="text-2xl font-bold italic tracking-tight"
						>AI Meal Analysis</Dialog.Title
					>
					<Dialog.Description class="font-bold text-muted-foreground italic">
						Generating nutritional insights for <span class="text-foreground">{meal.name}</span>
					</Dialog.Description>
				</div>
			</div>
		</Dialog.Header>

		<ScrollArea class="h-[500px] w-full px-1">
			<div class="pr-5 py-6 px-2 space-y-6">
				<!-- Meal Preview info if needed -->
				<div class="grid grid-cols-2 gap-4">
					<div class="aspect-square rounded-xl overflow-hidden border border-border/40 bg-muted/20">
						{#if meal.image}
							<img
								src={typeof meal.image === 'string' ? meal.image : meal.image.url}
								alt={meal.name}
								class="w-full h-full object-cover"
							/>
						{/if}
					</div>
					<div class="space-y-3">
						<p class="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">
							Detected Contents
						</p>
						<div class="flex flex-wrap gap-2">
							{#each meal.contents as content}
								<Badge
									variant="secondary"
									class="font-bold py-1 bg-primary/5 text-primary border-primary/10"
								>
									{content}
								</Badge>
							{/each}
						</div>
					</div>
				</div>

				<!-- Estimates Table -->
				<div class="border border-border/40 rounded-xl overflow-hidden bg-card/40">
					<Table>
						<TableHeader class="bg-muted/30">
							<TableRow class="hover:bg-transparent border-border/40">
								<TableHead class="font-bold italic">Est.</TableHead>
								<TableHead class="text-right font-bold italic">Calories</TableHead>
								<TableHead class="text-right font-bold italic">Protein</TableHead>
								<TableHead class="text-right font-bold italic">Carbs</TableHead>
								<TableHead class="text-right font-bold italic">Fats</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each estimates as est, i}
								<TableRow class="border-border/40 hover:bg-primary/5 transition-colors">
									<TableCell class="font-bold text-muted-foreground">#{i + 1}</TableCell>
									<TableCell class="text-right font-bold">{est.calories} kcal</TableCell>
									<TableCell class="text-right font-bold">{est.protein}g</TableCell>
									<TableCell class="text-right font-bold">{est.carbs}g</TableCell>
									<TableCell class="text-right font-bold">{est.fats}g</TableCell>
								</TableRow>
							{/each}

							{#if hasSavedMacros && savedMacros}
								<TableRow
									class="bg-primary/10 hover:bg-primary/15 transition-colors border-t-2 border-primary/20"
								>
									<TableCell class="font-bold text-primary italic">SAVED</TableCell>
									<TableCell class="text-right font-bold text-primary"
										>{savedMacros.calories} kcal</TableCell
									>
									<TableCell class="text-right font-bold text-primary"
										>{savedMacros.protein}g</TableCell
									>
									<TableCell class="text-right font-bold text-primary"
										>{savedMacros.carbs}g</TableCell
									>
									<TableCell class="text-right font-bold text-primary"
										>{savedMacros.fats}g</TableCell
									>
								</TableRow>
							{:else if estimates.length === 0}
								<TableRow>
									<TableCell
										colspan={5}
										class="text-center py-12 text-muted-foreground italic font-medium"
									>
										No estimates generated yet
									</TableCell>
								</TableRow>
							{/if}

							{#if averages}
								<TableRow
									class="bg-primary/10 hover:bg-primary/15 transition-colors border-t-2 border-primary/20"
								>
									<TableCell class="font-bold text-primary italic">AVG</TableCell>
									<TableCell class="text-right font-bold text-primary"
										>{averages.calories} kcal</TableCell
									>
									<TableCell class="text-right font-bold text-primary"
										>{averages.protein}g</TableCell
									>
									<TableCell class="text-right font-bold text-primary">{averages.carbs}g</TableCell>
									<TableCell class="text-right font-bold text-primary">{averages.fats}g</TableCell>
								</TableRow>
							{/if}
						</TableBody>
					</Table>
				</div>

				<!-- Counter and Button -->
				{#if hasSavedMacros}
					<div class="space-y-4 pt-2">
						<div class="flex items-center gap-2 px-2">
							<TrendingUp class="w-4 h-4 text-primary" />
							<p class="text-xs font-bold text-primary uppercase tracking-widest">Macros Updated</p>
						</div>
						<p class="text-sm text-muted-foreground italic px-2">
							This meal's nutritional data has already been estimated and saved.
						</p>
					</div>
				{:else}
					<div class="space-y-4 pt-2">
						<div class="flex items-center justify-between px-2">
							<p
								class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground italic"
							>
								AI Power Estimates
							</p>
							<div class="flex gap-1.5 items-center">
								{#each Array(maxEstimates) as _, i}
									<div
										class="w-2 h-2 rounded-full transition-all duration-500 {i < estimates.length
											? 'bg-primary'
											: 'bg-muted border border-border/40'}"
									></div>
								{/each}
							</div>
						</div>

						<Button
							variant="default"
							onclick={remaining === 0 ? updateMealMacros : generateEstimate}
							disabled={loading}
							class="w-full shadow-lg shadow-primary/20 font-bold italic tracking-tight transition-all active:scale-[0.98]"
						>
							{#if loading}
								<Loader2 class="w-5 h-5 mr-3 animate-spin" />
								{remaining === 0 ? 'UPDATING...' : 'ANALYZING...'}
							{:else if remaining === 0}
								<TrendingUp class="w-5 h-5 mr-3" /> UPDATE MEAL ENTRY
							{:else}
								<Sparkles class="w-5 h-5 mr-3" /> RUN AI ESTIMATOR
							{/if}
						</Button>

						{#if remaining > 0}
							<p class="text-center text-[11px] text-muted-foreground font-bold italic">
								You have <span class="text-primary">{remaining}</span> analysis {remaining === 1
									? 'run'
									: 'runs'} remaining for this session.
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</ScrollArea>
	</Dialog.Content>
</Dialog.Root>
