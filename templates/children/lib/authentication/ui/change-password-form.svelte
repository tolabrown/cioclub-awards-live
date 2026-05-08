<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { changePassword } from '$lib/auth-client';
	import LoadingSpinner from '$lib/authentication/ui/loading-spinner.svelte';
	import { EyeIcon, EyeOffIcon } from '@lucide/svelte';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props()

	let isPending = $state(false);
	let showPassword = $state(false);
	let token = $derived(String(page.url.searchParams.get('token')));

	const onsubmit = async (evt: SubmitEvent) => {
		evt.preventDefault();
		const formData = new FormData(evt.target as HTMLFormElement);
		const password = String(formData.get('password'));
		const newPassword = String(formData.get('newPassword'));

		if (!password) return toast.error('Please enter your current password');
		if (!newPassword) return toast.error('Please enter your new password');

		try {
			// Simulate API call
			await changePassword({
				currentPassword: password,
        newPassword,
				revokeOtherSessions: true,
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
							description: 'Password reset successfully.'
						});
						location.href = '/auth/login';
					}
				}
			});
		} catch (error) {
			toast.error('Failed to send verification email. Please try again.');
		}
	};
</script>

<form {onsubmit} class={cn("w-full space-y-4", className)}>
	<div class="flex w-full flex-col gap-2">
		<Label for="password" class="font-medium">Current Password</Label>
		<div class="relative w-full">
			<Input
				id="password"
				name="password"
				type={showPassword ? 'text' : 'password'}
				placeholder="Enter your current password"
				required
				class="w-full pr-10"
			/>
			<Button
				onclick={() => (showPassword = !showPassword)}
				class="absolute right-0 bottom-0"
				variant="ghost"
				size="icon"
			>
				{#if showPassword}
					<EyeIcon />
				{:else}
					<EyeOffIcon />
				{/if}
			</Button>
		</div>
	</div>
	<div class="flex w-full flex-col gap-2">
		<Label for="newPassword" class="font-medium">New Password</Label>
		<div class="relative w-full">
			<Input
				id="newPassword"
				name="newPassword"
				type={showPassword ? 'text' : 'password'}
				placeholder="Enter your new password"
				required
				class="w-full pr-10"
			/>
			<Button
				onclick={() => (showPassword = !showPassword)}
				class="absolute right-0 bottom-0"
				variant="ghost"
				size="icon"
			>
				{#if showPassword}
					<EyeIcon />
				{:else}
					<EyeOffIcon />
				{/if}
			</Button>
		</div>
	</div>
	{#if isPending}
		<Button type="submit" disabled class="w-full">
			<LoadingSpinner class="text-white dark:text-background" />
			Changing...
		</Button>
	{:else}
		<Button type="submit" class="w-full">Change Password</Button>
	{/if}
</form>
