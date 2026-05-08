<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Avatar from '$lib/components/ui/avatar';
	import {
		Users,
		MessageSquare,
		Heart,
		Share2,
		ArrowRight,
		CheckCircle2,
		Sparkles,
		Flame,
		Loader2,
		Plus,
		TrendingUp,
		ShieldCheck,
		MoreHorizontal,
		Trash2
	} from '@lucide/svelte';
	import AddCycleDialog from './components/AddCycleDialog.svelte';
	import CommunityRulesDialog from './components/CommunityRulesDialog.svelte';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { cn } from '$lib/utils';

	let { data } = $props();

	const communities = $derived(data.cycles || []);
	const memberships = $derived(data.memberships || []);

	function isMember(cycleId: string) {
		return memberships.some((m) => m.cycleId === cycleId);
	}

	let isAddOpen = $state(false);
	let isRulesOpen = $state(false);
	const isAdmin = $derived(page.data.user?.role === 'admin');

	let joiningId = $state<string | null>(null);

	async function handleRefetch() {
		await invalidateAll();
	}

	function handleShareCycle(community: any) {
		const url = `${window.location.origin}/community/${community.id}`;
		if (navigator.share) {
			navigator
				.share({
					title: community.name,
					text: `Check out the ${community.name} community cycle on Enoshkind!`,
					url: url
				})
				.catch(() => {});
		} else {
			navigator.clipboard.writeText(url);
			toast.success('Cycle link copied to clipboard');
		}
	}
</script>

<div class="space-y-10 w-full max-w-7xl mx-auto pb-12 overflow-hidden">
	<!-- Hero / High-Impact Banner -->
	<div
		class="relative overflow-hidden bg-linear-to-br from-indigo-950 via-indigo-900 to-indigo-950 p-4 md:p-8 text-white rounded-xl shadow-lg border border-indigo-500/10"
	>
		<div
			class="absolute -right-32 -top-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"
		></div>
		<div
			class="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-400/5 rounded-full blur-[80px]"
		></div>

		<div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
			<div class="space-y-6 max-w-2xl text-center lg:text-left">
				<Badge
					variant="outline"
					class="border-indigo-400/30 bg-indigo-500/10 text-indigo-300 font-bold capitalize tracking-[0.2em] px-4 py-1.5 min-w-[150px] justify-center"
				>
					Global Support
				</Badge>
				<h1 class="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
					Wellness is a <br /> <span class="text-indigo-400">Shared Experience.</span>
				</h1>
				<p
					class="text-indigo-100/70 text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto lg:mx-0"
				>
					Connect with specialized "Community Cycles" to find peer support, medical moderation, and
					collective wisdom for your health goals.
				</p>
				<div
					class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-4"
				>
					<Button
						variant="secondary"
						class="font-bold bg-white text-indigo-950 hover:bg-indigo-50 group shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
						onclick={() =>
							toast.info('Community Hub', {
								description: 'Syncing latest community activities...'
							})}
					>
						Explore All Cycles
						<ArrowRight class="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
					</Button>
					{#if isAdmin}
						<Button
							variant="outline"
							class="border-white/20 text-white font-bold rounded-xl bg-transparent"
							onclick={() => (isAddOpen = true)}
						>
							<Plus class="mr-2 w-4 h-4" />
							Create Cycle
						</Button>
					{:else}
						<Button
							variant="outline"
							class="border-white/20 text-white font-bold rounded-xl bg-transparent"
						>
							Start a New Cycle
						</Button>
					{/if}
				</div>
			</div>

			<div
				class="shrink-0 p-8 md:p-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-xl shadow-lg relative group hidden lg:block"
			>
				<Users
					class="w-32 h-32 text-indigo-300 opacity-60 transition-transform duration-700 group-hover:scale-110"
				/>
				<div class="absolute -top-4 -right-4 bg-primary p-4 rounded-xl shadow-lg animate-bounce">
					<Sparkles class="w-8 h-8 text-white" />
				</div>
			</div>
		</div>
	</div>

	<!-- Dynamic Stats Grid -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-6 p-2">
		<div
			class="p-6 bg-card/40 backdrop-blur-sm border border-border/40 rounded-xl text-center space-y-2 hover:bg-card/60 transition-colors shadow-sm"
		>
			<TrendingUp class="w-5 h-5 text-emerald-500 mx-auto" />
			<p class="text-3xl font-bold tracking-tight">{data.stats.members}</p>
			<p class="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-none">
				Global Members
			</p>
		</div>
		<div
			class="p-6 bg-card/40 backdrop-blur-sm border border-border/40 rounded-xl text-center space-y-2 hover:bg-card/60 transition-colors shadow-sm"
		>
			<Flame class="w-5 h-5 text-orange-500 mx-auto" />
			<p class="text-3xl font-bold tracking-tight">{data.stats.cycles}</p>
			<p class="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-none">
				Healthy Cycles
			</p>
		</div>
		<div
			class="p-6 bg-card/40 backdrop-blur-sm border border-border/40 rounded-xl text-center space-y-2 hover:bg-card/60 transition-colors shadow-sm"
		>
			<ShieldCheck class="w-5 h-5 text-primary mx-auto" />
			<p class="text-3xl font-bold tracking-tight">{data.stats.doctors}</p>
			<p class="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-none">
				Verified Doctors
			</p>
		</div>
		<div
			class="p-6 bg-card/40 backdrop-blur-sm border border-border/40 rounded-xl text-center space-y-2 hover:bg-card/60 transition-colors shadow-sm"
		>
			<MessageSquare class="w-5 h-5 text-indigo-500 mx-auto" />
			<p class="text-3xl font-bold tracking-tight">24/7</p>
			<p class="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-none">
				Live Discussions
			</p>
		</div>
	</div>

	<!-- Main Exploration Content -->
	<div class="space-y-8">
		<div class="flex items-center justify-between px-2">
			<h2 class="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
				<TrendingUp class="w-8 h-8 text-indigo-500" />
				Trending Cycles
			</h2>
			<Button
				variant="ghost"
				class="text-primary font-bold capitalize text-sm tracking-widest hover:bg-primary/5 px-6 rounded-xl"
				onclick={() =>
					toast.info('Community Hub', { description: 'Browsing all active circles...' })}
			>
				See Everything <ArrowRight class="ml-2 w-4 h-4" />
			</Button>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each communities as community}
				<Card.Root
					class="group hover:shadow-lg hover:-translate-y-1 transition-all duration-500 border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden rounded-xl"
				>
					<Card.Content class="space-y-4">
						<div class="flex items-start gap-5">
							<div class="relative shrink-0">
								<Avatar.Root
									class="w-16 h-16 border-2 border-primary/20 group-hover:border-primary transition-all duration-500 rounded-xl overflow-hidden"
								>
									<Avatar.Fallback class="bg-primary/5 text-primary text-2xl font-bold capitalize"
										>{community.image || community.name.substring(0, 2)}</Avatar.Fallback
									>
								</Avatar.Root>
								<div
									class="absolute -right-1 -bottom-1 w-6 h-6 bg-emerald-500 border-2 border-background rounded-full"
								></div>
							</div>
							<div class="space-y-1.5 min-w-0">
								<h3
									class="text-xl font-bold tracking-tight leading-tight group-hover:text-primary transition-colors truncate"
								>
									{community.name}
								</h3>
								<div class="flex items-center gap-2 flex-wrap">
									<Badge
										variant="secondary"
										class="bg-primary/5 text-primary border-none text-[9px] font-bold capitalize tracking-widest px-2.5 py-0.5"
										>{community.members} Members</Badge
									>
									<span
										class="text-[9px] text-muted-foreground font-bold capitalize tracking-widest"
										>{community.activity} Activity</span
									>
								</div>
							</div>
						</div>

						<p
							class="text-sm text-muted-foreground/80 font-medium leading-relaxed line-clamp-2 min-h-[40px]"
						>
							{community.description}
						</p>

						<div class="flex items-center gap-3 bg-muted/20 p-4 rounded-xl">
							<div class="flex -space-x-3 overflow-hidden">
								{#each [1, 2, 3] as i}
									<Avatar.Root
										class="inline-block h-8 w-8 ring-4 ring-background/50 rounded-xl overflow-hidden"
									>
										<Avatar.Image src="https://i.pravatar.cc/32?u={community.id}{i}" />
										<Avatar.Fallback class="bg-primary/10 text-sm font-bold">U{i}</Avatar.Fallback>
									</Avatar.Root>
								{/each}
								<div
									class="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white ring-4 ring-background/50"
								>
									<span class="text-[9px] font-bold">+24</span>
								</div>
							</div>
							<p class="text-sm text-muted-foreground font-bold capitalize tracking-widest">
								Active Peers
							</p>
						</div>

						<div
							class="pt-6 border-t border-border/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
						>
							<div class="flex items-center gap-5 text-muted-foreground">
								<button
									class={cn(
										buttonVariants({ variant: 'ghost', size: 'icon' }),
										'hover:text-red-500 transition-all active:scale-125 flex items-center gap-1 w-auto px-2'
									)}
									aria-label="Like"
								>
									<Heart class="w-5 h-5" />
									<span class="text-[10px] font-bold ml-1">{community.totalLikes || 0}</span>
								</button>
								<button
									class={cn(
										buttonVariants({ variant: 'ghost', size: 'icon' }),
										'hover:text-primary transition-all active:scale-125 flex items-center gap-1 w-auto px-2'
									)}
									aria-label="Comment"
								>
									<MessageSquare class="w-5 h-5" />
									<span class="text-[10px] font-bold ml-1">{community.totalComments || 0}</span>
								</button>
								<button
									class={cn(
										buttonVariants({ variant: 'ghost', size: 'icon' }),
										'hover:text-primary transition-all active:scale-125'
									)}
									aria-label="Share"
									onclick={() => handleShareCycle(community)}
								>
									<Share2 class="w-5 h-5" />
								</button>
								{#if community.userId === page.data.user?.id || isAdmin}
									<form
										action="?/deleteCycle"
										method="POST"
										use:enhance={() => {
											return async ({ result }) => {
												if (result.type === 'success') {
													toast.success('Cycle deleted successfully');
													handleRefetch();
												}
											};
										}}
									>
										<input type="hidden" name="id" value={community.id} />
										<button
											type="submit"
											class={cn(
												buttonVariants({ variant: 'ghost', size: 'icon' }),
												'hover:text-red-500 transition-all active:scale-125'
											)}
											aria-label="Delete Cycle"
										>
											<Trash2 class="w-5 h-5" />
										</button>
									</form>
								{/if}
							</div>
							<div class="w-full sm:w-auto">
								{#if isMember(community.id)}
									<Button
										variant="outline"
										class="w-full sm:w-auto font-bold text-sm capitalize tracking-widest border-primary shadow-sm hover:bg-primary/5 transition-all rounded-xl"
										href="/community/{community.id}"
									>
										Enter Room
									</Button>
								{:else}
									<form
										method="POST"
										action="?/joinCycle"
										class="w-full sm:w-auto"
										use:enhance={() => {
											joiningId = community.id;
											return ({ result }) => {
												joiningId = null;
												if (result.type === 'success') {
													toast.success(`Welcome to ${community.name}`);
													handleRefetch();
												}
											};
										}}
									>
										<input type="hidden" name="cycleId" value={community.id} />
										<Button
											type="submit"
											disabled={joiningId === community.id}
											class="w-full sm:w-auto font-bold text-sm capitalize tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all rounded-xl"
										>
											{#if joiningId === community.id}
												<Loader2 class="w-4 h-4 mr-2 animate-spin" />
												Joining...
											{:else}
												Join Circle
											{/if}
										</Button>
									</form>
								{/if}
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{:else}
				<div
					class="col-span-full py-24 text-center border-2 border-dashed border-border/40 rounded-xl bg-card/20 space-y-6"
				>
					<div
						class="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto shadow-inner"
					>
						<Users class="w-10 h-10 text-muted-foreground/30" />
					</div>
					<div class="space-y-1">
						<p class="text-xl font-bold text-muted-foreground">No active cycles found</p>
						<p class="text-sm text-muted-foreground/50 font-medium">
							Be the first to ignite a new community journey.
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Safety & Moderation Bar -->
	<div
		class="bg-indigo-50 dark:bg-indigo-600/20 border-2 border-indigo-100 dark:border-indigo-500/50 p-8 md:p-12 flex flex-col lg:flex-row items-center gap-10 rounded-xl relative overflow-hidden"
	>
		<div
			class="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none"
		></div>
		<div class="p-8 bg-white dark:bg-indigo-600/20 rounded-xl shadow-lg shrink-0">
			<ShieldCheck class="w-14 h-14 text-indigo-600" />
		</div>
		<div class="space-y-3 flex-1 text-center lg:text-left">
			<h3 class="text-2xl font-bold tracking-tight text-indigo-950 dark:text-indigo-100">
				Clinically Filtered Community
			</h3>
			<p
				class="text-base text-indigo-900/70 dark:text-indigo-200/70 font-medium leading-relaxed max-w-2xl"
			>
				Your safety is our priority. Every cycle is moderated by verified health ambassadors and
				medical professionals to ensure all shared advice is evidence-based and supportive.
			</p>
		</div>
		<Button
			variant="outline"
			class="shrink-0 h-10 px-10 border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-600 dark:text-indigo-400 font-bold capitalize text-sm tracking-widest rounded-xl shadow-sm"
			onclick={() => (isRulesOpen = true)}
		>
			Privacy Protocols
		</Button>
	</div>

	<AddCycleDialog bind:open={isAddOpen} onAdded={handleRefetch} />
	<CommunityRulesDialog bind:open={isRulesOpen} />
</div>

<style>
	:global(.no-scrollbar::-webkit-scrollbar) {
		display: none;
	}
	:global(.no-scrollbar) {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
