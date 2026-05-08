<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { Home, LayoutDashboard, Menu, LayoutGrid, Cookie as CookieIcon } from '@lucide/svelte';
	import * as CookieConsent from 'vanilla-cookieconsent';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { getNavigation, Role } from '$lib/constants';
	import { cn } from '$lib/utils';
	import WhatsApp from '$lib/components/icons/WhatsApp.svelte';

	const user = $derived(page.data.user);
	const isDoctor = $derived(page.data.isDoctor || false);
	const navigation = $derived(getNavigation(page.url.pathname, isDoctor));

	const whatsappNumber = '+2347035278240';
	const message = 'Hello Enoshkind, I have an inquiry about your health services.';
	const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;

	let Drawer: any = $state(null);
	onMount(async () => {
		const module = await import('$lib/components/ui/drawer');
		Drawer = module;
	});

	function isItemActive(url: string) {
		return page.url.pathname === url;
	}

	function isGroupVisible(group: any) {
		const role = user?.role as Role;
		if (!role) return false;
		return group.items.some((item: any) => item.roles.includes(role));
	}
</script>

<div
	class="fixed bottom-0 left-0 right-0 z-50 h-20 bg-background/60 backdrop-blur-2xl border-t border-border/40 md:hidden flex items-center justify-around px-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
>
	<!-- WhatsApp -->
	<a
		href={whatsappUrl}
		target="_blank"
		rel="noopener noreferrer"
		class="flex flex-col items-center justify-center gap-1.5 w-full text-muted-foreground hover:text-[#25D366] transition-all transform active:scale-90"
	>
		<div class="p-2 rounded-xl bg-muted/20 group-hover:bg-[#25D366]/10 transition-colors">
			<WhatsApp class="size-5 fill-current" />
		</div>
		<span class="text-[9px] font-bold uppercase tracking-widest opacity-80">Support</span>
	</a>

	<!-- Home -->
	<a
		href="/"
		class={cn(
			'flex flex-col items-center justify-center gap-1.5 w-full transition-all transform active:scale-90',
			isItemActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
		)}
	>
		<div
			class={cn(
				'p-2 rounded-xl transition-colors',
				isItemActive('/') ? 'bg-primary/10' : 'bg-muted/20'
			)}
		>
			<Home class="size-5" />
		</div>
		<span class="text-[9px] font-bold uppercase tracking-widest opacity-80">Home</span>
	</a>

	<!-- Dashboard -->
	<a
		href="/dashboard"
		class={cn(
			'flex flex-col items-center justify-center gap-1.5 w-full transition-all transform active:scale-90',
			isItemActive('/dashboard') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
		)}
	>
		<div
			class={cn(
				'p-2 rounded-xl transition-colors',
				isItemActive('/dashboard') ? 'bg-primary/10' : 'bg-muted/20'
			)}
		>
			<LayoutDashboard class="size-5" />
		</div>
		<span class="text-[9px] font-bold uppercase tracking-widest opacity-80">App</span>
	</a>

	<!-- More -->
	{#if Drawer}
		<Drawer.Root>
			<Drawer.Trigger
				class="flex flex-col items-center justify-center gap-1.5 w-full text-muted-foreground hover:text-primary transition-all transform active:scale-90 outline-none cursor-pointer"
			>
				<div class="p-2 rounded-xl bg-muted/20 transition-colors">
					<LayoutGrid class="size-5" />
				</div>
				<span class="text-[9px] font-bold uppercase tracking-widest opacity-80">More</span>
			</Drawer.Trigger>
			<Drawer.Content
				class="max-h-[85vh] bg-card/95 backdrop-blur-3xl border-t border-border/40 p-0 rounded-t-[2rem] shadow-2xl"
			>
				<div class="p-6 pb-2">
					<div class="flex items-center justify-between mb-6">
						<div>
							<h2 class="text-2xl font-bold tracking-tight">Navigation</h2>
							<p class="text-sm font-medium text-muted-foreground">Logically grouped features</p>
						</div>
						<div class="p-3 bg-primary/10 rounded-2xl">
							<LayoutGrid class="size-6 text-primary" />
						</div>
					</div>
				</div>

				<ScrollArea class="h-[55vh] px-6 pb-10">
					<div class="space-y-8 pr-4">
						{#each navigation.navMain as group}
							{#if isGroupVisible(group)}
								<div class="space-y-4">
									<div class="flex items-center gap-3 px-2">
										{#if group.icon}
											<group.icon class="size-3.5 text-primary opacity-60" />
										{/if}
										<h3
											class="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]"
										>
											{group.title}
										</h3>
									</div>
									<div class="grid grid-cols-2 gap-3">
										{#each group.items as item}
											{#if user && item.roles.includes(user.role as Role)}
												<a
													href={item.url}
													class={cn(
														'flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300 active:scale-[0.98]',
														item.isActive
															? 'bg-primary/10 border-primary/20 text-primary shadow-lg shadow-primary/5'
															: 'bg-muted/10 border-border/5 text-muted-foreground hover:bg-muted/20'
													)}
												>
													<div
														class={cn(
															'p-2 rounded-lg w-fit shadow-sm',
															item.isActive ? 'bg-primary/20' : 'bg-card'
														)}
													>
														<item.icon class="size-4" />
													</div>
													<span class="text-[11px] font-bold leading-tight tracking-tight"
														>{item.title}</span
													>
												</a>
											{/if}
										{/each}
									</div>
								</div>
							{/if}
						{/each}

						<!-- Preferences Section -->
						<div class="space-y-4">
							<div class="flex items-center gap-3 px-2">
								<CookieIcon class="size-3.5 text-primary opacity-60" />
								<h3 class="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
									Preferences
								</h3>
							</div>
							<div class="grid grid-cols-1">
								<button
									onclick={() => CookieConsent.showPreferences()}
									class="flex items-center gap-3 p-4 rounded-xl border bg-muted/10 border-border/5 text-muted-foreground hover:bg-muted/20 active:scale-[0.98] transition-all text-left w-full cursor-pointer"
								>
									<div class="p-2 rounded-lg bg-card shadow-sm">
										<CookieIcon class="size-4" />
									</div>
									<span class="text-[11px] font-bold leading-tight tracking-tight"
										>Cookie Preferences</span
									>
								</button>
							</div>
						</div>
					</div>
				</ScrollArea>
			</Drawer.Content>
		</Drawer.Root>
	{:else}
		<!-- Placeholder for SSR -->
		<div
			class="flex flex-col items-center justify-center gap-1.5 w-full text-muted-foreground transition-all"
		>
			<div class="p-2 rounded-xl bg-muted/20">
				<LayoutGrid class="size-5" />
			</div>
			<span class="text-[9px] font-bold uppercase tracking-widest opacity-80">More</span>
		</div>
	{/if}
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
