<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import type { Role, NavGroup } from "$lib/constants";
	import type { User } from "$lib/auth";
	import { cn } from "$lib/utils";
	import { buttonVariants } from "$lib/components/ui/button";
	import { page } from "$app/state";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";

	const user = page.data.user as User;

	let {
		groups,
	}: {
		groups: NavGroup[];
	} = $props();

	// Determine which group contains the active item
	const getActiveGroupName = () => {
		for (const group of groups) {
			for (const item of group.items) {
				if (item.isActive && item.roles.includes(user.role as Role)) {
					return group.groupName;
				}
			}
		}
		return null;
	};

	// Track expanded state per group - only active group is open by default
	// We initialize this directly to avoid undefined values during initial render
	let expandedGroups = $state<Record<string, boolean>>(
		groups.reduce(
			(acc, group) => {
				acc[group.groupName] = group.groupName === getActiveGroupName();
				return acc;
			},
			{} as Record<string, boolean>,
		),
	);

	// Filter items by user role
	const getVisibleItems = (items: NavGroup["items"]) => {
		return items.filter((item) => item.roles.includes(user.role as Role));
	};

	// Check if a group has any visible items for the current user
	const hasVisibleItems = (group: NavGroup) => {
		return getVisibleItems(group.items).length > 0;
	};

	// Toggle group expansion
	const toggleGroup = (groupName: string) => {
		expandedGroups[groupName] = !expandedGroups[groupName];
	};
</script>

{#each groups as group (group.groupName)}
	{#if hasVisibleItems(group)}
		<Collapsible.Root
			bind:open={expandedGroups[group.groupName]}
			class="group/collapsible"
		>
			<Sidebar.Group class="py-1">
				<Sidebar.GroupLabel
					class="cursor-pointer select-none py-4 transition-colors hover:text-sidebar-foreground"
					onclick={() => toggleGroup(group.groupName)}
				>
					<div class="flex w-full items-center gap-3">
						{#if group.icon}
							<group.icon class="size-4 shrink-0" />
						{/if}
						<span
							class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 group-hover/collapsible:text-sidebar-foreground"
						>
							{group.groupName}
						</span>
						<ChevronRight
							class="ml-auto size-4 shrink-0 transition-transform duration-200 {expandedGroups[
								group.groupName
							]
								? 'rotate-90'
								: ''}"
						/>
					</div>
				</Sidebar.GroupLabel>
				<Collapsible.Content>
					<Sidebar.Menu
						class="flex flex-col gap-0.5 transition-[padding] duration-200 group-data-[collapsible=icon]:pl-0 md:pl-4"
					>
						{#each getVisibleItems(group.items) as item (item.title)}
							<a class="cursor-pointer" href={item.url}>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton
										size="sm"
										class={cn(
											buttonVariants({
												variant: item.isActive ? "outline" : "ghost",
												size: "sm",
											}),
											"h-8 justify-start cursor-pointer transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
											item.isActive &&
												"bg-sidebar-accent font-medium text-sidebar-accent-foreground",
										)}
									>
										<item.icon class="size-4" />
										<span class="text-sm group-data-[collapsible=icon]:hidden"
											>{item.title}</span
										>
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							</a>
						{/each}
					</Sidebar.Menu>
				</Collapsible.Content>
			</Sidebar.Group>
		</Collapsible.Root>
	{/if}
{/each}
