<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Microscope, Plus, Loader2 } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false) } = $props<{ open: boolean }>();
	let loading = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[450px] border-border/40 bg-background/80 backdrop-blur-3xl shadow-2xl"
	>
		<Dialog.Header>
			<div class="flex items-center gap-4 mb-2">
				<div class="p-3 bg-emerald-500/10 rounded-xl">
					<Microscope class="w-6 h-6 text-emerald-500" />
				</div>
				<div>
					<Dialog.Title class="text-2xl font-bold">Custom Lab Test</Dialog.Title>
					<Dialog.Description class="font-medium">
						Can't find a specific test? Request a custom diagnostic setup.
					</Dialog.Description>
				</div>
			</div>
		</Dialog.Header>

		<form
			method="POST"
			action="?/addCustomTest"
			use:enhance={() => {
				loading = true;
				return ({ result }) => {
					loading = false;
					if (result.type === 'success') {
						toast.success('Custom test request submitted!');
						open = false;
					}
				};
			}}
			class="space-y-6 py-4"
		>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="customName" class="font-bold ml-1">Test Name</Label>
					<Input
						id="customName"
						name="customName"
						placeholder="e.g. Rare Vitamin Panel"
						required
						class="bg-background border-border/40 font-bold rounded-xl"
					/>
				</div>

				<div class="space-y-2">
					<Label for="reason" class="font-bold ml-1">Reason for request (optional)</Label>
					<Textarea
						id="reason"
						name="reason"
						placeholder="Describe why you need this test..."
						class="bg-background border-border/40 font-medium rounded-xl min-h-[100px] resize-none"
					/>
				</div>

				<div class="p-4 bg-primary/5 border border-primary/20 rounded-xl">
					<p class="text-sm font-bold text-primary capitalize tracking-widest leading-relaxed">
						Note: Custom tests require a manual review by our medical board before pricing and
						scheduling can be confirmed.
					</p>
				</div>
			</div>

			<Button
				type="submit"
				disabled={loading}
				class="w-full text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
			>
				{#if loading}
					<Loader2 class="w-5 h-5 mr-3 animate-spin" />
					Processing...
				{:else}
					Submit Request
				{/if}
			</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
