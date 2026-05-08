<script lang="ts">
	import { page } from '$app/state';
	import { Constants } from '$lib/constants';
	import { Sun, Moon, Menu } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import type { User } from '$lib/auth';
	import { toggleMode, mode } from 'mode-watcher';
	import AuthDialog from '$lib/authentication/ui/user/auth-dialog.svelte';
	import BrandLink from '$lib/components/widgets/BrandLink.svelte';
	import CookiePreferencesBtn from '$lib/components/widgets/CookiePreferencesBtn.svelte';

	const user = page.data.user as User;

	const isActive = (path: string) => page.url.pathname === path;
</script>

<div class="bg-background sticky top-0 left-0 z-50">
	<header
		class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>
		<div class="container mx-auto px-4 h-16 flex items-center justify-between">
			<!-- Logo -->
			<BrandLink />

			<!-- Navigation -->
			<div class="flex items-center space-x-4">
				<nav class="hidden md:flex items-center space-x-4">
					{#if user}
						<Button
							href="/dashboard"
							variant={isActive('/dashboard') ? 'default' : 'ghost'}
							size="sm"
						>
							Dashboard
						</Button>
					{/if}
				</nav>

				<!-- Cookie Preferences -->
				<CookiePreferencesBtn class="hidden md:inline-flex" />

				<!-- Mode Toggle -->
				<Button variant="outline" size="icon" onclick={toggleMode}>
					{#if mode.current === 'dark'}
						<Sun class="h-5 w-5" />
					{:else}
						<Moon class="h-5 w-5" />
					{/if}
				</Button>

				<!-- Auth Dialog -->
				<AuthDialog />
			</div>
		</div>
	</header>
</div>
