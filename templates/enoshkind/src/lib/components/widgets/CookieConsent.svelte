<script lang="ts">
	import * as CookieConsent from 'vanilla-cookieconsent';
	import { onMount } from 'svelte';
	import 'vanilla-cookieconsent/dist/cookieconsent.css';
	import config from '$lib/common/cookieconsent-config';

	onMount(() => {
		CookieConsent.run(config);
	});
</script>

<style>
	/* Extra styles if needed can be added here or in app.css */
</style>
