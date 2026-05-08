<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { toast } from "svelte-sonner";
	import { resetPassword } from "$lib/auth-client";
	import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";
	import { EyeIcon, EyeOffIcon } from "@lucide/svelte";
	import { page } from "$app/state";
	import { cn } from "$lib/utils";
	import { getAuthError } from "$lib/authentication/errors";
	interface Props {
		class?: string;
		action?: string;
	}
	let { class: className, action = "Reset Password" }: Props = $props();
	let isPending = $state(false);
	let showPassword = $state(false);
	let token = $derived(String(page.url.searchParams.get("token")));
	const onsubmit = async (evt: SubmitEvent) => {
		evt.preventDefault();
		const formData = new FormData(evt.target as HTMLFormElement);
		const password = String(formData.get("password"));
		const confirmPassword = String(formData.get("confirmPassword"));
		if (!password)
			return toast.error("Missing Password", {
				description: "Please enter your new password.",
			});
		if (password !== confirmPassword)
			return toast.error("Passwords Don't Match", {
				description: "Both password fields must be identical.",
			});
		try {
			await resetPassword({
				newPassword: password,
				token,
				fetchOptions: {
					onRequest: () => {
						isPending = true;
					},
					onResponse: () => {
						isPending = false;
					},
					onError: (ctx) => {
						const { title, description } = getAuthError(ctx.error);
						toast.error(title, { description });
					},
					onSuccess: () => {
						toast.success("Password Updated", {
							description: "Your password has been reset. Please sign in.",
						});
						location.href = "/auth/login";
					},
				},
			});
		} catch (error) {
			toast.error("Failed to reset password.");
		}
	};
</script>

<form {onsubmit} class={cn("w-full space-y-4", className)}>
	<div class="flex w-full flex-col gap-2">
		<Label for="password" class="font-medium">New Password</Label>
		<div class="relative w-full">
			<Input
				id="password"
				name="password"
				type={showPassword ? "text" : "password"}
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
				{#if showPassword}<EyeIcon />{:else}<EyeOffIcon />{/if}
			</Button>
		</div>
	</div>
	<div class="flex w-full flex-col gap-2">
		<Label for="confirmPassword" class="font-medium">Confirm Password</Label>
		<Input
			id="confirmPassword"
			name="confirmPassword"
			type="password"
			placeholder="Confirm your new password"
			required
			class="w-full pr-10"
		/>
	</div>
	{#if isPending}<Button type="submit" disabled class="w-full"
			><LoadingSpinner
				class="text-white dark:text-background"
			/>Changing...</Button
		>
	{:else}<Button type="submit" class="w-full">{action}</Button>{/if}
</form>
