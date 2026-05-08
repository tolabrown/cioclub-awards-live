<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Loader2 } from '@lucide/svelte';

	let loading = false;
</script>

<div class="flex items-center justify-center min-h-[80vh]">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle class="text-2xl text-center">Complete Your Profile</CardTitle>
			<CardDescription class="text-center">
				Please provide a few more details to help us personalize your experience.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<label
						for="location"
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>Location</label
					>
					<Input id="location" name="location" placeholder="e.g. Lagos, Nigeria" required />
				</div>

				<div class="space-y-2">
					<label
						for="culturalBackground"
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>Cultural Background</label
					>
					<Input
						id="culturalBackground"
						name="culturalBackground"
						placeholder="E.g. Yoruba"
						required
					/>
				</div>

				<Button type="submit" class="w-full" disabled={loading}>
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Saving...
					{:else}
						Continue to Dashboard
					{/if}
				</Button>
			</form>
		</CardContent>
	</Card>
</div>
