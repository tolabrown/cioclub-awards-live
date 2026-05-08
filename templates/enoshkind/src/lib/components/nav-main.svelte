<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { NavGroup, Role } from '$lib/constants';
	import type { User } from '$lib/auth';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { ChevronRightIcon } from '@lucide/svelte';
	import { page } from '$app/state';

	let {
		items
	}: {
		items: NavGroup[];
	} = $props();

	const user = page.data.user as User;

	// Helper to check if a group has an active item
	function isGroupActive(group: NavGroup) {
		return group.items.some((item) => item.isActive);
	}
</script>

{#each items as group (group.title)}
	{@const isActive = isGroupActive(group)}
	<Collapsible.Root open={isActive} class="group/collapsible">
		<Sidebar.Group>
			<Sidebar.GroupLabel>
				{#snippet child({ props })}
					<Collapsible.Trigger
						{...props}
						class={cn(
							buttonVariants({ variant: 'ghost', size: 'sm' }),
							'w-full justify-between font-bold text-xs uppercase tracking-wider text-muted-foreground/70 hover:text-primary transition-colors group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center'
						)}
					>
						<div class="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
							{#if group.icon}
								<group.icon class="h-4 w-4" />
							{/if}
							<span>{group.title.toLowerCase()}</span>
						</div>

						<div class="hidden group-data-[collapsible=icon]:flex items-center justify-center">
							{#if group.icon}
								<group.icon class="h-5 w-5" />
							{/if}
						</div>

						<ChevronRightIcon
							class="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden"
						/>
					</Collapsible.Trigger>
				{/snippet}
			</Sidebar.GroupLabel>
			<Collapsible.Content>
				<Sidebar.Menu>
					{#each group.items as item (item.title)}
						{#if item.roles.includes(user.role as Role)}
							<a class="cursor-pointer" href={item.url}>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton
										class={cn(
											'cursor-pointer justify-start transition-all duration-300 h-11 px-4 rounded-xl font-bold gap-3',
											item.isActive
												? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:text-primary-foreground scale-[1.02]'
												: 'hover:bg-primary/5 hover:text-primary text-muted-foreground'
										)}
										isActive={item.isActive}
										tooltipContent={item.title}
									>
										{#if item.icon}
											<item.icon />
										{/if}
										<span>{item.title}</span>
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							</a>
						{/if}
					{:else}
						<div class="px-4 py-2 text-xs text-muted-foreground italic">No items available</div>
					{/each}
				</Sidebar.Menu>
			</Collapsible.Content>
		</Sidebar.Group>
	</Collapsible.Root>
{/each}
