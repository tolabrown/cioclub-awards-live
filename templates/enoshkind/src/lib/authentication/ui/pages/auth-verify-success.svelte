<script lang="ts">
	import ErrorComponent from '$lib/authentication/ui/error-component.svelte';
</script>

<ErrorComponent
	code={200}
	message="Success"
	type="success"
	description="You have resent a verification email. Please check your inbox and click the link to verify your email."
	href="/auth/login"
	buttonText="Log me in"
/>
