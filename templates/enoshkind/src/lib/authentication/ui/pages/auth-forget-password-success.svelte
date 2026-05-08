<script lang="ts">
	import ErrorComponent from '$lib/authentication/ui/error-component.svelte';
</script>

<ErrorComponent
	code={200}
	message="Email Sent"
	type="success"
	description="You have sent a password reset link to your email. Please check your inbox and click the link to reset your password."
	href="/auth/login"
	buttonText="Log me in"
/>
