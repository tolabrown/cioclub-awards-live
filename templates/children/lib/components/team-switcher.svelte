<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";
    import { cn } from "$lib/utils";
	import { Home } from "@lucide/svelte";
    import { buttonVariants } from "./ui/button";

	// This should be `Component` after @lucide/svelte updates types
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let { teams }: { teams: { name: string; logo: any; plan: string }[] } =
		$props();
	const sidebar = useSidebar();

	let activeTeam = $state(teams[0]);
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<a href="/" class="w-full">
			<Sidebar.MenuButton
				size="lg"
				class="cursor-pointer h-16 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent"
			>
				<div
					class={cn("flex aspect-square size-10 items-center justify-center rounded-xl shadow-sm group-data-[collapsible=icon]:size-8", buttonVariants({ variant: "outline", size: "icon" }))}
				>
					<activeTeam.logo
						class="size-6 group-data-[collapsible=icon]:size-4"
						type="normal"
					/>
				</div>
				<div
					class="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden"
				>
					<span class="truncate font-bold text-base tracking-tight">
						{activeTeam.name}
					</span>
					<span class="truncate text-xs text-muted-foreground font-medium"
						>{activeTeam.plan}</span
					>
				</div>
				<div class="ml-auto group-data-[collapsible=icon]:hidden">
					<Home
						class="size-5 text-muted-foreground hover:text-sidebar-foreground transition-colors"
					/>
				</div>
			</Sidebar.MenuButton>
		</a>
	</Sidebar.MenuItem>
</Sidebar.Menu>
