<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false), onAdded } = $props<{ open: boolean; onAdded: () => void }>();

	let loading = $state(false);
	let form = $state({
		name: '',
		category: 'Medical Devices',
		description: '',
		image: '',
		price: 0,
		rating: '5.00'
	});

	async function handleSubmit() {
		if (!form.name) return toast.error('Name is required');
		loading = true;
		try {
			// Convert price to kobo for DB
			const payload = { ...form, price: Math.round(form.price * 100) };
			const res = await fetch('/api/marketplace', {
				method: 'POST',
				body: JSON.stringify(payload)
			});
			if (res.ok) {
				toast.success('Product Added');
				onAdded();
				open = false;
				form = {
					name: '',
					category: 'Medical Devices',
					description: '',
					image: '',
					price: 0,
					rating: '5.00'
				};
			}
		} catch (e) {
			toast.error('Failed to add product');
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[500px] p-0 bg-card/95 backdrop-blur-2xl border-border/40 overflow-hidden rounded-xl"
	>
		<div class="bg-primary p-8 text-white relative">
			<Dialog.Header>
				<Dialog.Title class="text-2xl font-bold">Add New Product</Dialog.Title>
				<Dialog.Description class="text-white/80 font-medium"
					>Add a new item to the Enoshkind Marketplace.</Dialog.Description
				>
			</Dialog.Header>
		</div>

		<div class="p-8 space-y-6">
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="name" class="font-bold text-sm">Product Name</Label>
					<Input
						id="name"
						bind:value={form.name}
						placeholder="e.g. Smart Glucose Monitor"
						class="bg-background/50 border-border/40"
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label class="font-bold text-sm">Category</Label>
						<select
							bind:value={form.category}
							class="bg-background/50 border-border/40 px-3 text-sm font-medium outline-none"
						>
							<option value="Medical Devices">Medical Devices</option>
							<option value="Medications">Medications</option>
							<option value="Wellness">Wellness</option>
							<option value="Testing Kits">Testing Kits</option>
						</select>
					</div>
					<div class="grid gap-2">
						<Label for="price" class="font-bold text-sm">Price (₦)</Label>
						<Input
							id="price"
							type="number"
							bind:value={form.price}
							placeholder="0.00"
							class="bg-background/50 border-border/40"
						/>
					</div>
				</div>
				<div class="grid gap-2">
					<Label for="desc" class="font-bold text-sm">Description</Label>
					<Textarea
						id="desc"
						bind:value={form.description}
						placeholder="Product specifications and details..."
						class="bg-background/50 border-border/40 min-h-[80px]"
					/>
				</div>
				<div class="grid gap-2">
					<Label for="image" class="font-bold text-sm">Icon Code</Label>
					<Input
						id="image"
						bind:value={form.image}
						placeholder="e.g. SGM, BP, GK"
						class="bg-background/50 border-border/40"
					/>
				</div>
			</div>

			<div class="flex gap-3 pt-4">
				<Button
					variant="outline"
					class="flex-1 font-bold border-border/40"
					onclick={() => (open = false)}>Cancel</Button
				>
				<Button
					class="flex-1 bg-primary shadow-lg shadow-primary/20"
					onclick={handleSubmit}
					disabled={loading}
				>
					{loading ? 'Adding...' : 'Add Product'}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
