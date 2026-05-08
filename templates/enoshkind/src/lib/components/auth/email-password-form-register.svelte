<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import LoadingSpinner from '$lib/components/auth/loading-spinner.svelte';
	import { EyeIcon, EyeOffIcon, Sun, Moon } from '@lucide/svelte';
	import { signUp } from '$lib/auth-client';
	import { toast } from 'svelte-sonner';
	import { getRedirectUrl } from '$lib/auth-utils';
	import { toggleMode, mode } from 'mode-watcher';
	import { Constants } from '$lib/constants';

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

	const validate = (field: string, type: 'email' | 'password' | 'name'): string | null => {
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
			case 'name':
				if (!field) return 'Name is required';
				if (field.length < 2) return 'Name must be at least 2 characters long';
				return null;
		}
	};

	const onsubmit = async (evt: SubmitEvent) => {
		evt.preventDefault();

		// Reset errors
		errors = {};

		const form = evt.target as HTMLFormElement;
		const formData = new FormData(form);

		const name = formData.get('name') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		// validate inputs
		const nameError = validate(name, 'name');
		const emailError = validate(email, 'email');
		const passwordError = validate(password, 'password');

		if (nameError) errors.name = nameError;
		if (emailError) errors.email = emailError;
		if (passwordError) errors.password = passwordError;

		if (Object.keys(errors).length > 0) {
			isLoading = false;
			return;
		}

		await signUp.email(
			{ name, email, password, callbackURL },
			{
				onRequest: () => {
					isLoading = true;
				},
				onResponse: () => {
					isLoading = false;
				},
				onError: (ctx) => {
					toast.error('Error', {
						description: `Unable to sign up (${ctx.error.message})`
					});
				},
				onSuccess: () => {
					toast.success('Successfully signed up');
					location.href = Constants.AFTERAUTH;
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

	<!-- Name field -->
	<div class="grid gap-2">
		<Label for="name-{id}">Full Name</Label>
		<Input
			id="name-{id}"
			type="text"
			name="name"
			placeholder="John Doe"
			required
			disabled={isLoading}
			class={cn(errors.name && 'border-red-500 focus-visible:ring-red-500')}
			autocomplete="name"
			spellcheck="false"
		/>
		{#if errors.name}
			<p class="text-sm text-red-500" role="alert" aria-live="polite">
				{errors.name}
			</p>
		{/if}
	</div>

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
		<Label for="password-{id}">Password</Label>
		<div class="relative w-full">
			<Input
				id="password-{id}"
				name="password"
				type={showPassword ? 'text' : 'password'}
				placeholder="Create a password..."
				required
				disabled={isLoading}
				class={cn(errors.password && 'border-red-500 pr-10 focus-visible:ring-red-500')}
				autocomplete="new-password"
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
			Creating account...
		{:else}
			Create Account
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
		Already have an account?
		<a
			href="/auth/login?redirectTo={encodeURIComponent(getRedirectUrl())}"
			class="rounded underline underline-offset-4 hover:no-underline focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
			tabindex={isLoading ? -1 : 0}
		>
			Sign in
		</a>
	</div>
</div>
