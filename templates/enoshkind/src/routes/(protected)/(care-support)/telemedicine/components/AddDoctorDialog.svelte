<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Plus, UserPlus, Loader2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false), onAdded } = $props<{
		open: boolean;
		onAdded: () => void;
	}>();

	let loading = $state(false);
	let form = $state({
		name: '',
		specialty: '',
		price: 15000, // Default in NGN
		bio: '',
		available: 'Today',
		rating: '5.00',
		reviews: 0
	});

	async function handleSubmit() {
		if (!form.name || !form.specialty || !form.price) {
			toast.error('Please fill in all required fields');
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/doctors', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...form,
					price: form.price * 100 // Convert to kobo
				})
			});

			const result = await res.json();
			if (result.success) {
				toast.success('Doctor added successfully');
				open = false;
				onAdded();
				// Reset form
				form = {
					name: '',
					specialty: '',
					price: 15000,
					bio: '',
					available: 'Today',
					rating: '5.00',
					reviews: 0
				};
			} else {
				toast.error(result.message || 'Failed to add doctor');
			}
		} catch (e) {
			toast.error('An error occurred');
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[500px] rounded-xl border-border/40 bg-card/60 backdrop-blur-2xl shadow-2xl p-8"
	>
		<Dialog.Header>
			<div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
				<UserPlus class="w-6 h-6 text-primary" />
			</div>
			<Dialog.Title class="text-2xl font-bold">Add New Specialist</Dialog.Title>
			<Dialog.Description class="font-medium">
				Enter the details of the new healthcare provider to list them in the hub.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-6 py-4">
			<div class="grid gap-2">
				<Label for="name" class="font-bold text-xs capitalize tracking-widest text-muted-foreground"
					>Full Name</Label
				>
				<Input
					id="name"
					bind:value={form.name}
					placeholder="Dr. Jane Doe"
					class="rounded-xl bg-background/50"
				/>
			</div>
			<div class="grid gap-2">
				<Label
					for="specialty"
					class="font-bold text-xs capitalize tracking-widest text-muted-foreground"
					>Specialty</Label
				>
				<Input
					id="specialty"
					bind:value={form.specialty}
					placeholder="e.g. Cardiologist"
					class="rounded-xl bg-background/50"
				/>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label
						for="price"
						class="font-bold text-xs capitalize tracking-widest text-muted-foreground"
						>Session Fee (₦)</Label
					>
					<Input
						id="price"
						type="number"
						bind:value={form.price}
						class="rounded-xl bg-background/50"
					/>
				</div>
				<div class="grid gap-2">
					<Label
						for="available"
						class="font-bold text-xs capitalize tracking-widest text-muted-foreground"
						>Availability</Label
					>
					<Input
						id="available"
						bind:value={form.available}
						placeholder="Today"
						class="rounded-xl bg-background/50"
					/>
				</div>
			</div>
			<div class="grid gap-2">
				<Label for="bio" class="font-bold text-xs capitalize tracking-widest text-muted-foreground"
					>Professional Bio</Label
				>
				<Textarea
					id="bio"
					bind:value={form.bio}
					placeholder="Describe the doctor's expertise..."
					class="min-h-[100px] rounded-xl bg-background/50"
				/>
			</div>
		</div>

		<Dialog.Footer class="pt-4">
			<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
			<Button class="shadow-lg" onclick={handleSubmit} disabled={loading}>
				{#if loading}
					<Loader2 class="w-4 h-4 mr-2 animate-spin" />
					Saving...
				{:else}
					<Plus class="w-4 h-4 mr-2" />
					Add Doctor
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
