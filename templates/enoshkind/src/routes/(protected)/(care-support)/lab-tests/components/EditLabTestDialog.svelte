<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Loader2, Save, Beaker, Zap, Tag, DollarSign, Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { Switch } from '$lib/components/ui/switch';

	let { open = $bindable(false), test = $bindable(null) } = $props<{
		open: boolean;
		test: any | null;
	}>();

	let loading = $state(false);
	let formData = $state({
		name: '',
		category: '',
		price: '',
		popular: false,
		description: ''
	});

	$effect(() => {
		if (test) {
			formData = {
				name: test.name,
				category: test.category,
				price: (test.price / 100).toString(),
				popular: test.popular,
				description: test.description || ''
			};
		} else {
			formData = {
				name: '',
				category: '',
				price: '',
				popular: false,
				description: ''
			};
		}
	});

	async function handleSave() {
		loading = true;

		try {
			const res = await fetch('/api/lab-tests', {
				method: test ? 'PATCH' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: test?.id,
					...formData,
					price: Math.round(parseFloat(formData.price) * 100)
				})
			});

			const result = await res.json();
			if (result.success) {
				toast.success(test ? 'Test updated' : 'Test created');
				open = false;
				await invalidateAll();
			} else {
				toast.error('Operation failed', { description: result.message });
			}
		} catch (e) {
			console.error(e);
			toast.error('An error occurred');
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		if (!test) return;
		if (!confirm('Are you sure you want to delete this test?')) return;

		loading = true;
		try {
			const res = await fetch(`/api/lab-tests?id=${test.id}`, { method: 'DELETE' });
			if (res.ok) {
				toast.success('Test deleted');
				open = false;
				await invalidateAll();
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
		class="sm:max-w-[500px] rounded-3xl border-border/40 bg-background/80 backdrop-blur-3xl shadow-2xl"
	>
		<Dialog.Header>
			<div class="flex items-center gap-4 mb-2">
				<div class="p-3 bg-primary/10 rounded-2xl">
					<Beaker class="w-6 h-6 text-primary" />
				</div>
				<div>
					<Dialog.Title class="text-2xl font-bold"
						>{test ? 'Edit Lab Test' : 'Add New Lab Test'}</Dialog.Title
					>
					<Dialog.Description class="font-medium">
						Configure the parameters for this diagnostic package.
					</Dialog.Description>
				</div>
			</div>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label class="font-bold text-xs capitalize tracking-widest ml-1">Test Name</Label>
				<Input
					bind:value={formData.name}
					placeholder="e.g., Full Metabolic Panel"
					class="rounded-xl border-border/40"
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label class="font-bold text-xs capitalize tracking-widest ml-1">Category</Label>
					<Input
						bind:value={formData.category}
						placeholder="e.g., CHRONIC CARE"
						class="rounded-xl border-border/40"
					/>
				</div>
				<div class="space-y-2">
					<Label class="font-bold text-xs capitalize tracking-widest ml-1">Price (₦)</Label>
					<Input
						bind:value={formData.price}
						type="number"
						placeholder="25000"
						class="rounded-xl border-border/40"
					/>
				</div>
			</div>

			<div class="space-y-2">
				<Label class="font-bold text-xs capitalize tracking-widest ml-1">Description</Label>
				<Textarea
					bind:value={formData.description}
					placeholder="Describe what this test covers..."
					class="rounded-xl min-h-[100px] border-border/40"
				/>
			</div>

			<div
				class="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10"
			>
				<div class="flex items-center gap-3">
					<Zap class="w-5 h-5 text-amber-500" />
					<div>
						<p class="text-sm font-bold">Most Popular</p>
						<p class="text-sm text-muted-foreground font-medium capitalize tracking-wider">
							Highlight this test
						</p>
					</div>
				</div>
				<Switch bind:checked={formData.popular} />
			</div>
		</div>

		<Dialog.Footer class="flex sm:justify-between items-center gap-2">
			{#if test}
				<Button
					variant="ghost"
					class="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
					onclick={handleDelete}
					disabled={loading}
				>
					<Trash2 class="w-5 h-5" />
				</Button>
			{/if}
			<Button
				class="flex-1 text-base font-bold shadow-lg shadow-primary/20 rounded-xl transition-all active:scale-[0.98]"
				onclick={handleSave}
				disabled={loading || !formData.name || !formData.price}
			>
				{#if loading}
					<Loader2 class="w-5 h-5 mr-3 animate-spin" />
					Saving...
				{:else}
					<Save class="w-5 h-5 mr-2" />
					{test ? 'Update Package' : 'Publish Package'}
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
