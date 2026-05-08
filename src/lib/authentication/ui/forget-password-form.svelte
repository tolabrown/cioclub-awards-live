<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { toast } from "svelte-sonner";
	import { requestPasswordReset } from "$lib/auth-client";
	import { getAuthError } from "$lib/authentication/errors";
	import LoadingSpinner from "./loading-spinner.svelte";
	let isPending = $state(false);
	const onsubmit = async (evt: SubmitEvent) => {
		evt.preventDefault();
		const formData = new FormData(evt.target as HTMLFormElement);
		const email = String(formData.get("email"));
		if (!email) return toast.error("Please enter a valid email address.");
		try {
			await requestPasswordReset({
				email,
				redirectTo: "/auth/reset-password",
				fetchOptions: {
					onRequest: () => {
						isPending = true;
					},
					onResponse: () => {
						isPending = false;
					},
					onError: (ctx: any) => {
						const { title, description } = getAuthError(ctx.error);
						toast.error(title, { description });
					},
					onSuccess: () => {
						toast.success("Reset Link Sent", {
							description: "Check your inbox for a password reset link.",
						});
						location.href = "/auth/forget-password/success";
					},
				},
			});
		} catch (error) {
			toast.error("Failed to send reset email.");
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
			class="w-full rounded-xl h-12 bg-muted/50 border-border/50"
		/>
	</div>
	{#if isPending}<Button
			type="submit"
			disabled
			class="w-full h-12 font-bold shadow-md transition-all"
			><LoadingSpinner
				class="text-white dark:text-background"
			/>Sending...</Button
		>
	{:else}<Button
			type="submit"
			class="w-full h-12 font-bold shadow-md transition-all"
			>Send Reset Link</Button
		>{/if}
</form>
