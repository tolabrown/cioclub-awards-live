<script lang="ts">
	import { UserIcon } from '@lucide/svelte';
	import LoggedIn from '$lib/authentication/ui/user/logged-in.svelte';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';
	import type { User } from '$lib/auth';
  import { Constants } from '$lib/constants';

	let { class: className = "", ...restProps } = $props();

	const user = (page.data.user as User)
</script>
{#if user}
	<LoggedIn {user} {...restProps} />
{:else}
	<Button 
    href={`/auth/login?redirectTo=${Constants.AFTERAUTH}`} 
    variant="outline" 
    class="relative cursor-pointer rounded-xl p-0 size-9" 
    size="icon"
    {...restProps}
  >
		<UserIcon class="size-4" />
	</Button>
{/if}