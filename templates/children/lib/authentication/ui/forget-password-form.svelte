<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { forgetPassword } from '$lib/auth-client';
	import LoadingSpinner from './loading-spinner.svelte';

	let isPending = $state(false);

	const onsubmit = async (evt: SubmitEvent) => {
		evt.preventDefault();
		const formData = new FormData(evt.target as HTMLFormElement);
		const email = String(formData.get('email'));

		if (!email) return toast.error('Please enter a valid email address.');

		try {
			// Simulate API call
			await forgetPassword({
				email,
				redirectTo: '/auth/reset-password',
				fetchOptions: {
					onRequest: () => {
						isPending = true;
					},
					onResponse: () => {
						isPending = false;
					},
					onError: (ctx) => {
						toast.error('Error Alert', {
							description: ctx.error.message || 'An unknown error occurred.'
						});
					},
					onSuccess: () => {
						toast.success('Success Alert', {
							description: 'Reset link sent to your email.'
						});
						location.href = '/auth/forget-password/success';
					}
				}
			});
		} catch (error) {
			toast.error('Failed to send verification email. Please try again.');
		}
	};
</script>

<form {onsubmit} class="w-full max-w-sm space-y-4">
	<div class="flex w-full flex-col gap-2">
		<Label for="email" class="font-medium">Email Address</Label>
		<Input
			id="email"
			name="email"
			type="email"
			placeholder="Enter your email"
			required
			class="w-full"
		/>
	</div>
	{#if isPending}
		<Button type="submit" disabled class="w-full">
			<LoadingSpinner class="text-white dark:text-background" />
			Sending...
		</Button>
	{:else}
		<Button type="submit" class="w-full">Send Reset Link</Button>
	{/if}
</form>
