<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Loader2, Building2, Save } from '@lucide/svelte';

	let { data, form } = $props();
	let submitting = $state(false);
</script>

<div class="container max-w-2xl py-12">
	<Card.Root class="border-border/50 bg-card/50 backdrop-blur-sm">
		<Card.Header>
			<div class="flex items-center gap-3 mb-2">
				<div class="p-2 rounded-lg bg-primary/10 text-primary">
					<Building2 class="w-6 h-6" />
				</div>
				<Card.Title class="text-2xl">Create Your Organization</Card.Title>
			</div>
			<Card.Description>
				Set up your corporate team to manage access and benefits for your IT leadership.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance={() => {
				submitting = true;
				return async ({ result }) => {
					if (result.type === 'success') {
						toast.success('Organization created successfully!');
						// Small delay to let the toast show before redirecting
						setTimeout(() => {
							goto(`/corporate/${result.data?.orgId || ''}`);
						}, 500);
					} else if (result.type === 'failure') {
						const message = result.data?.message as string || 'Failed to create organization';
						toast.error(message);
						submitting = false;
					} else {
						submitting = false;
					}
				};
			}} class="space-y-6">
				<div class="space-y-2">
					<Label for="name">Organization Name</Label>
					<Input 
						id="name" 
						name="name" 
						placeholder="e.g. Acme Corp IT" 
						required 
						disabled={submitting}
						class="bg-background/50"
					/>
					<p class="text-xs text-muted-foreground">
						This name will be visible to your team members and in reports.
					</p>
				</div>

				<div class="pt-4 flex justify-end">
					<Button type="submit" class="gap-2 min-w-[180px]" disabled={submitting}>
						{#if submitting}
							<Loader2 class="w-4 h-4 animate-spin" />
							Creating...
						{:else}
							<Save class="w-4 h-4" />
							Create Organization
						{/if}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
