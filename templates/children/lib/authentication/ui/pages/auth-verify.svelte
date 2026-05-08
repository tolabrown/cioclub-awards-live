<script lang="ts">
	import { page } from '$app/state';
	import ErrorComponent from '$lib/authentication/ui/error-component.svelte';
	import SendVerificationEmailForm from '$lib/authentication/ui/send-verification-email-form.svelte';

	const spError = $derived(page.url.searchParams.get('error'));

	// Determine status code based on error type
	const statusCode = $derived(() => {
		switch (spError) {
			case 'invalid_token':
			case 'token_expired':
				return 400; // Bad Request
			case 'email_not_verified':
				return 403; // Bad Request
			case 'already_verified':
				return 409; // Conflict
			case 'too_many_requests':
				return 429; // Too Many Requests
			case 'verification_failed':
				return 422; // Unprocessable Entity
			default:
				return spError ? 400 : 200; // Bad Request for unknown errors, OK for success
		}
	});

	// Determine message based on error type
	const message = $derived(() => {
		switch (spError) {
			case 'invalid_token':
				return 'Invalid Verification Link';
			case 'email_not_verified':
				return 'Email Not Verified';
			case 'token_expired':
				return 'Verification Link Expired';
			case 'already_verified':
				return 'Email Already Verified';
			case 'too_many_requests':
				return 'Too Many Requests';
			case 'verification_failed':
				return 'Verification Failed';
			default:
				return spError ? `Unknown Error: ${spError}` : 'Verify Your Email';
		}
	});

	// Determine description based on error type
	const description = $derived(() => {
		switch (spError) {
			case 'invalid_token':
				return 'The verification link is invalid. Please request a new one.';
			case 'email_not_verified':
				return 'Your email is not verified. Please check your inbox for the verification email or resend it below.';
			case 'token_expired':
				return 'The verification link has expired. Please request a new one.';
			case 'already_verified':
				return 'Your email is already verified. You can log in.';
			case 'too_many_requests':
				return 'Too many requests. Please try again later.';
			case 'verification_failed':
				return 'Verification failed. Please try again.';
			default:
				return spError
					? `An unknown error occurred: ${spError}`
					: 'A verification email has been sent to your email address. Please check your inbox and click the link to verify your email.';
		}
	});

	// Determine appropriate redirect href
	const redirectHref = $derived(() => {
		return spError === 'already_verified' ? '/auth/login' : '/auth/login';
	});
</script>

<ErrorComponent
	code={statusCode()}
	message={message()}
	description={description()}
	href={redirectHref()}
	buttonText="Log me in"
>
	<SendVerificationEmailForm />
</ErrorComponent>
