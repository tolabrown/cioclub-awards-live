<script lang="ts">
	import { Cookie as CookieIcon } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as CookieConsent from 'vanilla-cookieconsent';
	import { cn } from '$lib/utils';

	let { class: className } = $props<{ class?: string }>();
</script>

<Button
	variant="outline"
	size="icon"
	onclick={() => CookieConsent.showPreferences()}
	class={cn('cursor-pointer', className)}
	title="Cookie Preferences"
>
	<CookieIcon class="size-4" />
	<span class="sr-only">Cookie Preferences</span>
</Button>
