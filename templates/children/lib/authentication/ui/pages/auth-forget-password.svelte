<script lang="ts">
	import ErrorComponent from '$lib/authentication/ui/error-component.svelte';
	import ForgetPasswordForm from '../forget-password-form.svelte';
</script>

<ErrorComponent
	code={200}
	message="Reset Password"
	type="info"
	description="Please enter your email address to receive a password reset link."
	href="/auth/login"
	buttonText="Log me in"
>
	<ForgetPasswordForm />
</ErrorComponent>
