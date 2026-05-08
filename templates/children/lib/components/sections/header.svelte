<script lang="ts">
	import { page } from '$app/state';
	import BrandLink from '$lib/components/widgets/BrandLink.svelte';
	import {
		Home,
		LucideLayoutDashboard,
	} from '@lucide/svelte';
	import ModeToggle from '$lib/components/widgets/ModeToggle.svelte';
	import { Button } from '../ui/button';
	import { getContext } from 'svelte';
	import type { User } from '$lib/auth'; 
	import { Role } from '$lib/constants';
	import AuthDialog from '$lib/authentication/ui/user/auth-dialog.svelte';

	const publicNavigation = [{ name: 'Home', href: '/', icon: Home,  roles: [Role.ADMIN, Role.EDITOR, Role.USER] }];

	const user = (getContext('me') as User) || undefined;

	const privateNavigation = [
		{ name: 'Home', href: '/', icon: Home, roles: [Role.ADMIN, Role.EDITOR, Role.USER] },
		{ name: 'Dashboard', href: '/dashboard', icon: LucideLayoutDashboard, roles: [Role.ADMIN, Role.EDITOR]},
	];

	const navigation = $derived(user ? privateNavigation : publicNavigation);

	let loading = $state(false);

	const isActive = (path: string) => page.url.pathname === path;

</script>

<div class="bg-background sticky top-0 left-0 z-[11]">
	<header class="bg-gradient-primary shadow-elevated border-b">
		<div class="center">
			<div class="flex h-16 items-center justify-between">
				<BrandLink />

				<div class="flex items-center space-x-4">
					<nav class="hidden space-x-4 md:flex">
						{#each navigation as { icon, href, name, roles }, i}
							{@const Icon = icon}
							{#if user && roles.includes(user.role as Role)}
								
							<Button {href} variant={isActive(href) ? 'default' : 'outline'} size="sm">
								<Icon class="mr-2 h-4 w-4" />
								{name}
							</Button>
							{/if}
						{/each}
					</nav>
					<ModeToggle />
					<AuthDialog />
				</div>
			</div>
		</div>
	</header>
</div>
