<script lang="ts">
	import { signIn } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import LoadingSpinner from './loading-spinner.svelte';
	import { StarIcon } from '@lucide/svelte';
	import { getRedirectUrl } from '$lib/authentication/client';

	let isPending = $state(false);

	const callbackURL = getRedirectUrl();

	const onsubmit = async (evt: SubmitEvent) => {
		evt.preventDefault();

		isPending = true;
		const form = evt.target as HTMLFormElement;
		const formData = new FormData(form);
		const email = formData.get('email') as string;
		// Call your magic link function here, e.g., await sendMagicLink(email);
		await signIn.magicLink({
			email,
			name: email.split('@')[0],
			callbackURL,
			fetchOptions: {
				onRequest: () => {
          isPending = true
        },
				onResponse: () => {
          isPending = false
        },
				onError: (ctx) => {
					toast.error('Error Alert', {
						description: ctx.error.statusText || 'An error occurred while sending the magic link.'
					});
				},
				onSuccess: () => {
					toast.success('Check your email for the magic link');
          form.reset()
				}
			}
		});
		isPending = false;
	};
</script>

<form {onsubmit} class="flex flex-col gap-2">
	<Label for="email" class="sr-only">Email</Label>
	<div class="flex flex-col items-center gap-2 md:flex-row">
		<Input
			id="email"
			name="email"
			type="email"
			placeholder="Enter your email"
			required
		/>
		<Button type="submit" class="w-full whitespace-nowrap md:w-fit" disabled={isPending}>
			{#if isPending}
				<LoadingSpinner />
				Loading...
			{:else}
				<StarIcon />
				Send Magic Link
			{/if}
		</Button>
	</div>
</form>
