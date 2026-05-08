<script lang="ts">
	import { page } from '$app/state';
	import ErrorComponent from '$lib/components/widgets/ErrorComponent.svelte';

</script>

<ErrorComponent
	code={page.status}
	message={page.error?.message as string}
	description="But if you don't change your direction, and if you keep looking, you may end up where you are
			heading."
	href="/"
/>
