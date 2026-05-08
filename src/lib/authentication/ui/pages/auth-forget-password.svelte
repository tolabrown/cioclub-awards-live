<script lang="ts">
	import ForgetPasswordForm from "$lib/authentication/ui/forget-password-form.svelte";
	import * as Card from "$lib/components/ui/card/index.js";
</script>

<div
	class="flex h-screen flex-col items-center justify-center gap-6 p-6 md:p-10"
>
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-2xl font-bold tracking-tight text-foreground"
				>Forgot Password</Card.Title
			>
			<Card.Description class="text-muted-foreground"
				>Enter your email to receive a password reset link</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<ForgetPasswordForm />
		</Card.Content>
	</Card.Root>
</div>
