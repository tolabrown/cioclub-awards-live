<script lang="ts">
	import ErrorComponent from '$lib/authentication/ui/error-component.svelte';
	import ResetPasswordForm from '../reset-password-form.svelte';
</script>

<ErrorComponent
	code={200}
	message="Reset Password"
	type="info"
	description="Please enter your new password. Make sure it is at least 8 characters long."
	href="/auth/login"
	buttonText="Log me in"
>
	<ResetPasswordForm />
</ErrorComponent>
