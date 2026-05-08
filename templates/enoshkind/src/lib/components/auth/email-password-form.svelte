<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import LoadingSpinner from '$lib/components/auth/loading-spinner.svelte';
	import { EyeIcon, EyeOffIcon } from '@lucide/svelte';
	import { signIn } from '$lib/auth-client';
	import { toast } from 'svelte-sonner';
	import { getRedirectUrl } from '$lib/auth-utils';
	import type { ErrorCodes } from '$lib/auth';
	import { toggleMode, mode } from 'mode-watcher';
	import { Sun, Moon } from '@lucide/svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
	}

	let { class: className, ...restProps }: Props = $props();
	let isLoading = $state(false);
	let isSocialLoading = $state(false);
	let errors = $state<Record<string, string>>({});
	let showPassword = $state(false);

	const id = crypto.randomUUID();
	const callbackURL = getRedirectUrl();

	const validate = (field: string, type: 'email' | 'password'): string | null => {
		switch (type) {
			case 'email':
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!field.trim()) return 'Email is required';
				if (!emailRegex.test(field)) return 'Please enter a valid email address';
				return null;
			case 'password':
				if (!field) return 'Password is required';
				if (field.length < 6) return 'Password must be at least 6 characters long';
				return null;
		}
	};

	const onsubmit = async (evt: SubmitEvent) => {
		evt.preventDefault();

		// Reset errors
		errors = {};

		const form = evt.target as HTMLFormElement;
		const formData = new FormData(form);

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		// validate inputs
		const emailError = validate(email, 'email');
		const passwordError = validate(password, 'password');

		if (emailError) errors.email = emailError;
		if (passwordError) errors.password = passwordError;

		if (Object.keys(errors).length > 0) {
			isLoading = false;
			return;
		}

		await signIn.email(
			{ email, password, callbackURL },
			{
				onRequest: () => {
					isLoading = true;
				},
				onResponse: () => {
					isLoading = false;
				},
				onError: (ctx) => {
					const errorCode = ctx.error.code as ErrorCodes;

					switch (errorCode) {
						case 'EMAIL_NOT_VERIFIED':
							location.href = '/auth/verify?error=email_not_verified';
							break;

						default:
							console.log(ctx.error);
							toast.error('Error', {
								description: `Unable to sign in (${ctx.error.message})`
							});
							break;
					}
				},
				onSuccess: () => {
					toast.success('Successfully signed in');
				}
			}
		);
	};
</script>

<form {onsubmit} class="grid gap-3">
	{#if errors.general}
		<div class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
			{errors.general}
		</div>
	{/if}

	<!-- Email field -->
	<div class="grid gap-2">
		<Label for="email-{id}">Email</Label>
		<Input
			id="email-{id}"
			type="email"
			name="email"
			placeholder="you@example.com"
			required
			disabled={isLoading}
			class={cn(errors.email && 'border-red-500 focus-visible:ring-red-500')}
			autocomplete="email"
			spellcheck="false"
		/>
		{#if errors.email}
			<p class="text-sm text-red-500" role="alert" aria-live="polite">
				{errors.email}
			</p>
		{/if}
	</div>

	<!-- Password Field -->
	<div class="grid gap-2">
		<div class="flex w-full items-center justify-between">
			<Label for="password-{id}">Password</Label>
			<Button
				href="/auth/forget-password?redirectTo={encodeURIComponent(getRedirectUrl())}"
				class="h-fit px-0 text-muted-foreground"
				variant="link"
				size="sm"
				tabindex={isLoading ? -1 : 0}
			>
				Forgot password?
			</Button>
		</div>
		<div class="relative w-full">
			<Input
				id="password-{id}"
				name="password"
				type={showPassword ? 'text' : 'password'}
				placeholder="Your password..."
				required
				disabled={isLoading}
				class={cn(errors.password && 'border-red-500 pr-10 focus-visible:ring-red-500')}
				autocomplete="current-password"
			/>
			<Button
				onclick={() => (showPassword = !showPassword)}
				class="absolute right-0 bottom-0"
				variant="ghost"
				size="icon"
				type="button"
			>
				{#if showPassword}
					<EyeIcon />
				{:else}
					<EyeOffIcon />
				{/if}
			</Button>
		</div>
		{#if errors.password}
			<p class="text-sm text-red-500" role="alert" aria-live="polite">
				{errors.password}
			</p>
		{/if}
	</div>

	<!-- Submit button -->
	<Button
		type="submit"
		class="w-full"
		disabled={isLoading || isSocialLoading}
		aria-describedby={errors.general ? 'general-error' : undefined}
	>
		{#if isLoading}
			<LoadingSpinner class="text-white dark:text-background" />
			Signing in...
		{:else}
			Sign in
		{/if}
	</Button>
</form>

<div class="flex items-center justify-between gap-4">
	<Button variant="ghost" size="icon" onclick={toggleMode}>
		{#if mode.current === 'dark'}
			<Sun class="h-5 w-5" />
		{:else}
			<Moon class="h-5 w-5" />
		{/if}
	</Button>
	<div class="text-right text-sm">
		Don't have an account?
		<a
			href="/auth/register?redirectTo={encodeURIComponent(getRedirectUrl())}"
			class="rounded underline underline-offset-4 hover:no-underline focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
			tabindex={isLoading ? -1 : 0}
		>
			Register
		</a>
	</div>
</div>
